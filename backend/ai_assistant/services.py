import requests
import json
import os
import re
import time
import logging
import numpy as np
from django.conf import settings
from urllib3.util.retry import Retry
from requests.adapters import HTTPAdapter
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
from .rag_service import RAGService
from .models import AIConversation, AIMessage

# Thiết lập logging
logger = logging.getLogger(__name__)

class RateLimiter:
    """Lớp kiểm soát tốc độ gọi API"""
    def __init__(self, calls_per_minute=30):
        self.calls_per_minute = calls_per_minute
        self.call_timestamps = []
        
    def wait_if_needed(self):
        """Đợi nếu đã vượt quá giới hạn gọi API"""
        current_time = time.time()
        # Xóa các timestamp cũ hơn 1 phút
        self.call_timestamps = [ts for ts in self.call_timestamps if current_time - ts < 60]
        
        if len(self.call_timestamps) >= self.calls_per_minute:
            # Tính thời gian cần đợi
            oldest_timestamp = min(self.call_timestamps)
            wait_time = 60 - (current_time - oldest_timestamp)
            if wait_time > 0:
                logger.info(f"Rate limit reached. Waiting {wait_time:.2f} seconds")
                time.sleep(wait_time)
        
        # Thêm timestamp hiện tại
        self.call_timestamps.append(time.time())

class OllamaService:
    def __init__(self):
        self.base_url = os.getenv('OLLAMA_API_URL', 'http://localhost:11434')
        self.model = os.getenv('OLLAMA_MODEL', 'phi:2.7b')
        self.rag_service = RAGService()
        
        # Tăng thời gian timeout cho máy chủ chậm
        self.connect_timeout = int(os.getenv('OLLAMA_CONNECT_TIMEOUT', '30'))
        self.read_timeout = int(os.getenv('OLLAMA_READ_TIMEOUT', '120'))
        self.max_retries = int(os.getenv('OLLAMA_MAX_RETRIES', '3'))
        
        # Cấu hình session với retry
        self.session = requests.Session()
        retry_strategy = Retry(
            total=self.max_retries,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        self.session.mount('http://', HTTPAdapter(max_retries=retry_strategy))
        
        # Giảm số lượng người dùng đồng thời để không làm quá tải máy chủ
        self.executor = ThreadPoolExecutor(max_workers=3)
        
        # Thêm rate limiter
        self.rate_limiter = RateLimiter(calls_per_minute=int(os.getenv('OLLAMA_RATE_LIMIT', '30')))
        
        # Cấu hình mô hình để tăng tốc độ phản hồi
        self.default_params = {
            "model": self.model,
            "stream": False,
            "options": {
                "num_ctx": 512,
                "num_thread": 4,
                "temperature": 1,
                "top_p": 0.9,
                "num_predict": 128,
                "stop": ["Người dùng:"]
            }
        }
        
        # Cấu hình cho câu trả lời nhanh
        self.fast_params = {
            "model": self.model,
            "stream": False,
            "options": {
                "num_ctx": 512,
                "num_thread": 4,
                "temperature": 0.5,
                "top_p": 0.8,
                "num_predict": 128,
                "stop": ["Người dùng:"]
            }
        }
        
        # Từ khóa liên quan đến dự án và bài hát
        self.project_keywords = [
            'spotify', 'nhạc', 'bài hát', 'album', 'nghệ sĩ', 'playlist', 'phát nhạc',
            'nghe nhạc', 'âm nhạc', 'ca sĩ', 'thể loại', 'ứng dụng', 'phát trực tuyến',
            'streaming', 'bài', 'phát', 'nghe', 'thư viện', 'yêu thích', 'danh sách',
            'ca khúc', 'sáng tác', 'tác giả', 'nhạc sĩ', 'lời bài hát'
        ]
        
        # Kiểm tra trạng thái máy chủ khi khởi tạo
        self._check_server_status()
    
    def _check_server_status(self):
        """Kiểm tra xem máy chủ Ollama có đang hoạt động không"""
        try:
            response = self.session.get(
                f"{self.base_url}/api/tags",
                timeout=(self.connect_timeout, 5)
            )
            if response.status_code != 200:
                logger.warning(f"Cảnh báo: Máy chủ Ollama có thể không hoạt động bình thường. Mã trạng thái: {response.status_code}")
            else:
                logger.info("Máy chủ Ollama đang hoạt động bình thường")
        except Exception as e:
            logger.error(f"Không thể kết nối đến máy chủ Ollama: {str(e)}")
    
    def _is_song_query(self, message):
        """Kiểm tra có phải câu hỏi về bài hát không"""
        song_keywords = ['bài hát', 'bài', 'ca khúc', 'sáng tác', 'tác giả', 'nhạc sĩ', 'lời bài hát']
        return any(keyword in message.lower() for keyword in song_keywords)

    def _format_response(self, song_info, query):
        """Định dạng câu trả lời dựa trên ngữ cảnh và ý định"""
        if not song_info:
            return "Xin lỗi, tôi không tìm thấy thông tin về bài hát này."
        
        # Trích xuất thông tin
        title = song_info.get('title', '')
        artists = song_info.get('artists', [])
        artist_names = [a.get('name', '') for a in artists]
        album = song_info.get('album', 'chưa xác định')
        release_year = song_info.get('release_year', 'chưa xác định')
        
        # Lấy ý định từ kết quả tìm kiếm
        intent = song_info.get('intent', 'general')
        
        # Tạo danh sách các mẫu câu trả lời cho mỗi ý định
        response_templates = {
            "composer": [
                f"Bài hát {title} được sáng tác bởi {', '.join(artist_names)}.",
                f"{', '.join(artist_names)} là người sáng tác bài hát {title}.",
                f"Tác giả của bài hát {title} là {', '.join(artist_names)}."
            ],
            "singer": [
                f"Bài hát {title} được trình bày bởi {', '.join(artist_names)}.",
                f"{', '.join(artist_names)} là người thể hiện bài hát {title}.",
                f"Ca sĩ hát bài {title} là {', '.join(artist_names)}."
            ],
            "album": [
                f"Bài hát {title} nằm trong album {album}.",
                f"{title} là một bài hát trong album {album} của {', '.join(artist_names)}.",
                f"Album {album} có bài hát {title} của {', '.join(artist_names)}."
            ],
            "year": [
                f"Bài hát {title} được phát hành vào năm {release_year}.",
                f"{title} ra mắt năm {release_year}, được trình bày bởi {', '.join(artist_names)}.",
                f"Năm {release_year}, {', '.join(artist_names)} đã phát hành bài hát {title}."
            ],
            "general": [
                f"Bài hát {title} được trình bày bởi {', '.join(artist_names)}, thuộc album {album}, phát hành năm {release_year}.",
                f"{title} là một bài hát của {', '.join(artist_names)}, nằm trong album {album} ({release_year}).",
                f"Thông tin về bài hát {title}: Ca sĩ: {', '.join(artist_names)}, Album: {album}, Năm phát hành: {release_year}."
            ]
        }
        
        # Chọn ngẫu nhiên một mẫu câu trả lời dựa trên ý định
        import random
        templates = response_templates.get(intent, response_templates["general"])
        response = random.choice(templates)
        
        # Thêm thông tin bổ sung nếu có
        if intent == "composer" and "singer" not in query.lower():
            if random.random() > 0.5:
                response += f" {', '.join(artist_names)} cũng là người trình bày bài hát này."
    
        return response
    
    def _format_song_response(self, song_info):
        """Định dạng câu trả lời về bài hát"""
        artists = ", ".join([a['name'] for a in song_info['artists']])
        response = f"Thông tin bài hát {song_info['song_title']}:\n"
        response += f"- Nghệ sĩ: {artists}\n"
        if song_info.get('album'):
            response += f"- Album: {song_info['album']}\n"
        if song_info.get('release_year'):
            response += f"- Năm phát hành: {song_info['release_year']}\n"
        if song_info.get('lyrics'):
            response += f"- Lời bài hát: {song_info['lyrics'][:100]}...\n"
        return response
    
    def _is_project_related(self, message):
        """Kiểm tra xem tin nhắn có liên quan đến dự án không"""
        message_lower = message.lower()
        
        # Kiểm tra từ khóa liên quan đến dự án
        for keyword in self.project_keywords:
            if keyword in message_lower:
                return True
        
        # Kiểm tra các pattern phổ biến liên quan đến dự án
        project_patterns = [
            r'(làm thế nào|cách) (để|mà) (nghe|phát|tìm|thêm)',
            r'(tìm|tìm kiếm) (bài hát|album|nghệ sĩ)',
            r'(thông tin|chi tiết) về (bài hát|album|nghệ sĩ)',
            r'(tính năng|chức năng) (nào|gì)',
            r'(sử dụng|dùng) (ứng dụng|app)'
        ]
        
        for pattern in project_patterns:
            if re.search(pattern, message_lower):
                return True
        
        return False
    
    def _is_simple_question(self, message):
        """Kiểm tra xem có phải câu hỏi đơn giản không"""
        simple_patterns = [
            r'xin chào|chào bạn|hi|hello',
            r'bạn là ai|bạn tên gì',
            r'cảm ơn|thank',
            r'có thể làm gì|giúp được gì',
            r'spotify là gì',
            r'nghe nhạc như thế nào|phát nhạc thế nào'
        ]
        
        message_lower = message.lower()
        for pattern in simple_patterns:
            if re.search(pattern, message_lower):
                return True
        
        # Câu hỏi ngắn (dưới 20 ký tự) cũng được coi là đơn giản
        if len(message.strip()) < 20:
            return True
        
        return False
    
    def _get_quick_response(self, message):
        """Trả về câu trả lời nhanh cho các câu hỏi đơn giản"""
        message_lower = message.lower()
        
        # Các câu trả lời nhanh cho câu hỏi phổ biến
        if re.search(r'xin chào|chào bạn|hi|hello', message_lower):
            return "Xin chào! Tôi là trợ lý AI của Spotify Clone. Tôi có thể giúp gì cho bạn về âm nhạc hôm nay?"
        
        if re.search(r'bạn là ai|bạn tên gì', message_lower):
            return "Tôi là trợ lý AI của Spotify Clone, được thiết kế để giúp bạn tìm kiếm thông tin về âm nhạc, nghệ sĩ, album và hỗ trợ sử dụng ứng dụng."
        
        if re.search(r'cảm ơn|thank', message_lower):
            return "Không có gì! Rất vui khi được giúp đỡ bạn. Nếu có bất kỳ câu hỏi nào khác, đừng ngần ngại hỏi nhé."
        
        if re.search(r'có thể làm gì|giúp được gì', message_lower):
            return "Tôi có thể giúp bạn:\n- Tìm kiếm thông tin về bài hát, album và nghệ sĩ\n- Gợi ý nhạc dựa trên sở thích của bạn\n- Hướng dẫn sử dụng các tính năng của ứng dụng\n- Trả lời các câu hỏi về âm nhạc"
        
        if re.search(r'spotify là gì', message_lower):
            return "Spotify Clone là ứng dụng nghe nhạc trực tuyến cho phép bạn tìm kiếm, phát và chia sẻ hàng triệu bài hát. Bạn có thể tạo playlist, theo dõi nghệ sĩ yêu thích và khám phá nhạc mới."
        
        if re.search(r'nghe nhạc như thế nào|phát nhạc thế nào', message_lower):
            return "Để nghe nhạc trên ứng dụng, bạn có thể:\n1. Tìm kiếm bài hát hoặc nghệ sĩ bạn muốn nghe\n2. Nhấp vào bài hát để phát\n3. Sử dụng các nút điều khiển phát nhạc ở thanh player bên dưới\n4. Tạo playlist để lưu các bài hát yêu thích"
        
        return None
    
    @lru_cache(maxsize=100)
    def _cached_search(self, query_hash):
        """Cache kết quả tìm kiếm để tránh truy vấn cơ sở dữ liệu trùng lặp"""
        logger.debug(f"Tìm kiếm RAG cho query: {query_hash[:30]}...")
        return self.rag_service.search(query_hash)
    
    def _simplify_prompt(self, user_message, context, is_project_related):
        """Đơn giản hóa prompt để giảm thời gian xử lý"""
        max_context_length = 1500 if is_project_related else 500
        
        if context and len(context) > max_context_length:
            context_parts = context.split("\n")
            simplified_context = []
            current_length = 0
            
            for part in context_parts:
                if current_length + len(part) <= max_context_length:
                    simplified_context.append(part)
                    current_length += len(part) + 1
                else:
                    break
            
            context = "\n".join(simplified_context)
            context += "\n[Đã cắt bớt nội dung để tối ưu hóa]"
            logger.debug(f"Context đã được cắt ngắn từ {len(context)} ký tự")
        
        if is_project_related:
            return f"""Bạn là trợ lý AI về âm nhạc trong ứng dụng Spotify Clone.

{context}

Người dùng hỏi: {user_message}

Trả lời chi tiết và hữu ích về các thông tin liên quan đến ứng dụng và âm nhạc. Đảm bảo câu trả lời của bạn liên quan trực tiếp đến câu hỏi hiện tại của người dùng."""
        else:
            return f"""Bạn là trợ lý AI về âm nhạc.

Người dùng hỏi: {user_message}

Trả lời ngắn gọn, súc tích. Đây là câu hỏi không liên quan trực tiếp đến ứng dụng âm nhạc, nên hãy trả lời nhanh chóng và tự nhiên. Đảm bảo câu trả lời của bạn liên quan trực tiếp đến câu hỏi hiện tại của người dùng."""
    
    def _check_server_status_before_call(self):
        """Kiểm tra máy chủ Ollama trước khi gọi API"""
        try:
            response = self.session.get(
                f"{self.base_url}/api/tags",
                timeout=(5, 5)
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Lỗi khi kiểm tra trạng thái máy chủ: {str(e)}")
            return False
    
    def _validate_response_relevance(self, query, response):
        """Kiểm tra mức độ liên quan của câu trả lời"""
        query_embed = self.rag_service.model.encode(query)
        resp_embed = self.rag_service.model.encode(response)
        
        cos_sim = np.dot(query_embed, resp_embed) / (
            np.linalg.norm(query_embed) * np.linalg.norm(resp_embed)
        )
        
        return cos_sim > 0.5
    
    def _call_ollama(self, prompt, params=None):
        """Gọi API Ollama với prompt và tham số đã cho"""
        if params is None:
            params = self.default_params
        
        response = self.session.post(
            f"{self.base_url}/api/generate",
            json={**params, "prompt": prompt},
            timeout=(self.connect_timeout, self.read_timeout))
        
        if response.status_code == 200:
            return response.json().get('response', '')
        return None
    
    def _create_prompt_with_history(self, user_message, context, is_project_related, conversation_history):
        """Tạo prompt với lịch sử hội thoại"""
        max_context_length = 1500 if is_project_related else 500
        
        if context and len(context) > max_context_length:
            context_parts = context.split("\n")
            simplified_context = []
            current_length = 0
            
            for part in context_parts:
                if current_length + len(part) <= max_context_length:
                    simplified_context.append(part)
                    current_length += len(part) + 1
                else:
                    break
            
            context = "\n".join(simplified_context)
            context += "\n[Đã cắt bớt nội dung để tối ưu hóa]"
            logger.debug(f"Context đã được cắt ngắn từ {len(context)} ký tự")
        
        history_text = ""
        if conversation_history:
            history_parts = []
            for msg in conversation_history:
                role = "Người dùng" if msg["role"] == "user" else "Trợ lý"
                history_parts.append(f"{role}: {msg['content']}")
            history_text = "\n\n".join(history_parts)
            history_text = f"\nLịch sử hội thoại:\n{history_text}\n"
        
        is_vietnamese = any(ord(c) > 127 for c in user_message)
        
        if is_project_related:
            prompt = f"""Bạn là trợ lý AI về âm nhạc trong ứng dụng Spotify Clone.

{context}
{history_text}
Người dùng hỏi: {user_message}

Trả lời chi tiết và hữu ích về các thông tin liên quan đến ứng dụng và âm nhạc. Đảm bảo câu trả lời của bạn liên quan trực tiếp đến câu hỏi hiện tại của người dùng."""
        else:
            prompt = f"""Bạn là trợ lý AI về âm nhạc.
{history_text}
Người dùng hỏi: {user_message}

Trả lời ngắn gọn, súc tích. Đảm bảo câu trả lời của bạn liên quan trực tiếp đến câu hỏi hiện tại của người dùng."""
        
        if is_vietnamese:
            prompt += "\n\nLưu ý: Câu hỏi của người dùng là tiếng Việt. Hãy trả lời bằng tiếng Việt rõ ràng, đầy đủ dấu."
        
        return prompt
    
    def _is_irrelevant_response(self, response, query):
        """Kiểm tra xem phản hồi có liên quan đến câu hỏi không"""
        irrelevant_patterns = [
            r"tôi không có thông tin|tôi không biết|tôi không có dữ liệu|tôi không thể trả lời",
            r"tôi không hiểu|tôi không chắc|tôi không rõ",
            r"xin lỗi, tôi không thể|rất tiếc, tôi không thể",
            r"không có trong cơ sở dữ liệu|không có trong dữ liệu của tôi"
        ]
        
        if len(query) > 50 and len(response) < 20:
            return True
        
        for pattern in irrelevant_patterns:
            if re.search(pattern, response.lower()):
                music_keywords = ['bài hát', 'album', 'nghệ sĩ', 'ca sĩ', 'nhạc', 'playlist']
                for keyword in music_keywords:
                    if keyword in query.lower():
                        return True
        
        return False
    
    def generate_response(self, user_message, conversation_id=None):
        """Tạo phản hồi từ Ollama API với xử lý lỗi cải tiến"""
        start_time = time.time()
        logger.info(f"Nhận yêu cầu từ người dùng: {user_message[:50]}... (conversation_id: {conversation_id})")
        
        try:
            # Kiểm tra nếu là câu hỏi về bài hát
            if self._is_song_query(user_message):
                song_info = self.rag_service.search_song_info(user_message)
                if song_info:
                    logger.info(f"Trả lời câu hỏi về bài hát: {song_info.get('song_title', '')}")
                    return self._format_song_response(song_info)
            
            # Phần xử lý thông thường
            if not self._check_server_status_before_call():
                logger.error("Máy chủ AI không khả dụng")
                return "Máy chủ AI hiện không khả dụng. Vui lòng thử lại sau."
            
            self.rate_limiter.wait_if_needed()
            
            if self._is_simple_question(user_message):
                quick_response = self._get_quick_response(user_message)
                if quick_response:
                    logger.info(f"Trả lời nhanh cho câu hỏi đơn giản: {user_message[:30]}...")
                    return quick_response
            
            conversation_history = []
            if conversation_id:
                try:
                    conversation = AIConversation.objects.get(id=conversation_id)
                    messages = AIMessage.objects.filter(conversation=conversation).order_by('timestamp')
                    recent_messages = messages.order_by('-timestamp')[:10]
                    
                    for msg in reversed(list(recent_messages)):
                        conversation_history.append({
                            "role": msg.role,
                            "content": msg.content
                        })
                    
                    logger.debug(f"Đã lấy {len(conversation_history)} tin nhắn từ lịch sử hội thoại")
                except AIConversation.DoesNotExist:
                    logger.warning(f"Không tìm thấy cuộc hội thoại với ID {conversation_id}")
                except Exception as e:
                    logger.error(f"Lỗi khi lấy lịch sử hội thoại: {str(e)}")
            
            user_message = user_message.strip()
            if len(user_message) > 200:
                user_message = user_message[:200] + "..."
                logger.debug("Tin nhắn đã được cắt ngắn")
            
            is_project_related = self._is_project_related(user_message)
            logger.debug(f"Tin nhắn liên quan đến dự án: {is_project_related}")
            
            relevant_docs = []
            if is_project_related:
                try:
                    logger.debug("Bắt đầu tìm kiếm RAG")
                    future = self.executor.submit(self._cached_search, user_message.lower())
                    relevant_docs = future.result(timeout=self.connect_timeout)
                    logger.debug(f"Tìm thấy {len(relevant_docs)} tài liệu liên quan")
                except TimeoutError:
                    logger.warning("Tìm kiếm RAG hết thời gian chờ")
            
            context = ""
            if relevant_docs:
                context_parts = ["Thông tin liên quan:"]
                for doc in relevant_docs:
                    context_parts.append(f"- {doc['content']}")
                context = "\n".join(context_parts)
                logger.debug(f"Đã tạo context với {len(context)} ký tự")
            
            prompt = self._create_prompt_with_history(user_message, context, is_project_related, conversation_history)
            
            params = self.default_params if is_project_related else self.fast_params
            
            logger.debug("Gửi yêu cầu đến Ollama API")
            ai_response = self._call_ollama(prompt, params)
            
            if not ai_response or ai_response.strip() == '':
                logger.warning("Nhận được phản hồi trống từ Ollama API")
                return "Xin lỗi, tôi không thể trả lời câu hỏi này. Vui lòng thử câu hỏi khác."
            
            if self._is_irrelevant_response(ai_response, user_message):
                logger.warning("Phản hồi không liên quan đến câu hỏi")
                relevant_docs = self.rag_service.search(user_message)
                if relevant_docs:
                    context = "\n".join([d['content'] for d in relevant_docs])
                    prompt = f"Context: {context}\nQuestion: {user_message}\nAnswer:"
                    ai_response = self._call_ollama(prompt) or ai_response
            
            logger.info(f"Nhận phản hồi từ Ollama API: {len(ai_response)} ký tự")
            logger.debug(f"Thời gian xử lý: {time.time() - start_time:.2f} giây")
            return ai_response
                
        except requests.exceptions.ReadTimeout:
            error_msg = "Rất tiếc, máy chủ AI đang xử lý chậm. Vui lòng đặt câu hỏi ngắn gọn hơn hoặc thử lại sau."
            logger.error(f"ReadTimeout sau {time.time() - start_time:.2f} giây")
            return error_msg
        except requests.exceptions.ConnectTimeout:
            error_msg = "Không thể kết nối đến máy chủ AI. Vui lòng kiểm tra xem máy chủ Ollama có đang chạy không."
            logger.error(f"ConnectTimeout sau {time.time() - start_time:.2f} giây")
            return error_msg
        except Exception as e:
            error_msg = f"Đã xảy ra lỗi: {str(e)}"
            logger.exception("Lỗi không xác định khi tạo phản hồi")
            return error_msg