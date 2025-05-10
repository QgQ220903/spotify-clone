import os
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from django.conf import settings
from django.db.models import Q, F
from .models import DocumentChunk
from music.models import Song, Artist, Album
import logging
import time
import pickle
import json
from pathlib import Path
from functools import lru_cache
from django.db import transaction
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
import re

logger = logging.getLogger(__name__)

class RAGService:
    _instance = None
    INDEX_PATH = Path(settings.BASE_DIR) / "enhanced_rag_index"
    VECTOR_DIMENSION = 384  # MiniLM-L6-v2 dimension
    SEARCH_TIMEOUT = 2.0  # Giới hạn thời gian tìm kiếm (giây)

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        if not hasattr(self, 'model'):
            self.INDEX_PATH.mkdir(exist_ok=True, parents=True)
            self.model = SentenceTransformer('paraphrase-MiniLM-L6-v2', device='cpu')
            self.index = None
            self.document_ids = []
            self._initialize_index()

    def _initialize_index(self):
        """Khởi tạo index với cơ chế fallback"""
        try:
            start_time = time.time()
            
            # Thử tải index từ file trước
            if not self._load_index_from_file():
                # Nếu không thành công, tạo mới từ database
                self._build_index_from_database()
                
            logger.info(f"Khởi tạo index hoàn tất trong {time.time() - start_time:.2f}s")
        except Exception as e:
            logger.error(f"Lỗi khởi tạo index: {str(e)}")
            # Fallback: tạo index rỗng
            self.index = faiss.IndexFlatL2(self.VECTOR_DIMENSION)
            self.document_ids = []

    def _load_index_from_file(self):
        """Tải index từ file với cơ chế phục hồi"""
        index_file = self.INDEX_PATH / "faiss_index.bin"
        ids_file = self.INDEX_PATH / "document_ids.pkl"
        
        if index_file.exists() and ids_file.exists():
            try:
                # Sử dụng index nén để tiết kiệm bộ nhớ
                self.index = faiss.read_index(str(index_file))
                with open(ids_file, 'rb') as f:
                    self.document_ids = pickle.load(f)
                
                logger.info(f"Đã tải index từ file với {len(self.document_ids)} documents")
                return True
            except Exception as e:
                logger.error(f"Lỗi khi tải index từ file: {str(e)}")
                # Xóa file lỗi để tránh ảnh hưởng lần sau
                index_file.unlink(missing_ok=True)
                ids_file.unlink(missing_ok=True)
        return False

    def _build_index_from_database(self):
        """Xây dựng index từ database với xử lý lỗi"""
        try:
            start_time = time.time()
            total_docs = DocumentChunk.objects.count()
            
            if total_docs == 0:
                self._create_document_chunks()
                total_docs = DocumentChunk.objects.count()
                if total_docs == 0:
                    logger.warning("Không có dữ liệu để xây dựng index")
                    return

            # Sử dụng index nén để tiết kiệm bộ nhớ
            quantizer = faiss.IndexFlatL2(self.VECTOR_DIMENSION)
            self.index = faiss.IndexIVFFlat(quantizer, self.VECTOR_DIMENSION, min(100, total_docs//2))
            self.document_ids = []

            # Huấn luyện index với một phần dữ liệu
            sample_size = min(1000, total_docs)
            sample_embeddings = []
            for doc in DocumentChunk.objects.order_by('?')[:sample_size]:
                if doc.embedding:
                    sample_embeddings.append(np.array(doc.embedding, dtype=np.float32))
            
            if sample_embeddings:
                self.index.train(np.array(sample_embeddings))

            # Thêm toàn bộ dữ liệu vào index
            batch_size = 500
            embeddings_batch = []
            
            for i in range(0, total_docs, batch_size):
                docs_batch = DocumentChunk.objects.all()[i:i+batch_size]
                
                for doc in docs_batch:
                    if doc.embedding:
                        embeddings_batch.append(np.array(doc.embedding, dtype=np.float32))
                        self.document_ids.append(doc.id)
                
                if embeddings_batch:
                    self.index.add(np.array(embeddings_batch))
                    embeddings_batch = []
                
                logger.info(f"Đã xử lý {min(i+batch_size, total_docs)}/{total_docs} documents")

            # Lưu index để sử dụng lần sau
            self._save_index()
            logger.info(f"Xây dựng index hoàn tất với {len(self.document_ids)} documents trong {time.time() - start_time:.2f}s")
        except Exception as e:
            logger.error(f"Lỗi khi xây dựng index: {str(e)}")
            # Fallback: tạo index rỗng
            self.index = faiss.IndexFlatL2(self.VECTOR_DIMENSION)
            self.document_ids = []

    def _save_index(self):
        """Lưu index với cơ chế atomic"""
        if not self.index or not self.document_ids:
            return

        try:
            # Lưu vào file tạm trước
            temp_index_path = self.INDEX_PATH / "faiss_index.tmp"
            temp_ids_path = self.INDEX_PATH / "document_ids.tmp"
            
            faiss.write_index(self.index, str(temp_index_path))
            with open(temp_ids_path, 'wb') as f:
                pickle.dump(self.document_ids, f)
            
            # Sau khi lưu thành công, đổi tên file
            final_index_path = self.INDEX_PATH / "faiss_index.bin"
            final_ids_path = self.INDEX_PATH / "document_ids.pkl"
            
            temp_index_path.replace(final_index_path)
            temp_ids_path.replace(final_ids_path)
            
            logger.info("Đã lưu index thành công")
        except Exception as e:
            logger.error(f"Lỗi khi lưu index: {str(e)}")

    @transaction.atomic
    def _create_document_chunks(self):
        """Tạo các document chunks từ dữ liệu của ứng dụng"""
        start_time = time.time()
        logger.info("Bắt đầu tạo document chunks từ dữ liệu ứng dụng")
        
        # Xử lý song, artist và album song song với ThreadPoolExecutor
        with ThreadPoolExecutor(max_workers=3) as executor:
            executor.submit(self._process_songs)
            executor.submit(self._process_artists)
            executor.submit(self._process_albums)
        
        logger.info(f"Đã tạo document chunks trong {time.time() - start_time:.2f}s")
    
    def create_document_chunks(self):
        """Phương thức công khai để tạo document chunks"""
        return self._create_document_chunks()
        
    def _process_songs(self, batch_size=200):
        """Xử lý và tạo document chunks cho songs với metadata chi tiết"""
        songs = Song.objects.select_related('album').prefetch_related('artists').all()
        chunks_to_create = []
        
        for i, song in enumerate(songs):
            # Tạo metadata chi tiết
            metadata = {
                'type': 'song',
                'title': song.title,
                'artists': [{'name': a.name, 'id': a.id} for a in song.artists.all()],
                'album': song.album.title if song.album else None,
                'release_year': song.release_date.year if song.release_date else None,
                'duration': song.duration,
                'genres': [g.name for g in song.genres.all()]
            }
            
            content = f"""
            Bài hát: {song.title}
            Nghệ sĩ: {', '.join([a.name for a in song.artists.all()])}
            Album: {song.album.title if song.album else 'Không có album'}
            Thể loại: {', '.join([g.name for g in song.genres.all()])}
            Năm phát hành: {song.release_date.year if song.release_date else 'Không rõ'}
            """
            
            # Từ khóa chi tiết
            keywords = [
                song.title.lower(),
                *[a.name.lower() for a in song.artists.all()],
                *[g.name.lower() for g in song.genres.all()]
            ]
            if song.album:
                keywords.append(song.album.title.lower())
            
            # Tạo embedding từ cả content và metadata
            embedding_content = f"{content} {json.dumps(metadata)}"
            embedding = self.model.encode(embedding_content).tolist()
            
            chunk = DocumentChunk(
                content=content,
                source_type='song',
                source_id=song.id,
                keywords=", ".join(keywords),
                relevance_score=1.0,
                embedding=embedding,
                metadata=metadata  # Lưu metadata dạng JSON
            )
            chunks_to_create.append(chunk)
            
            if len(chunks_to_create) >= batch_size or i == len(songs) - 1:
                DocumentChunk.objects.bulk_create(chunks_to_create)
                chunks_to_create = []
                logger.info(f"Đã tạo {i+1} song document chunks")

    def _process_artists(self, batch_size=200):
        """Xử lý và tạo document chunks cho artists với metadata chi tiết"""
        from music.models import Artist
        
        artists = Artist.objects.all()
        chunks_to_create = []
        
        for i, artist in enumerate(artists):
            # Tạo metadata chi tiết
            metadata = {
                'type': 'artist',
                'name': artist.name,
                'id': artist.id,
            }
            
            content = f"""
            Nghệ sĩ: {artist.name}
            Thông tin: {artist.bio if hasattr(artist, 'bio') else 'Không có thông tin'}
            """
            
            # Từ khóa chi tiết
            keywords = [
                artist.name.lower(),
            ]
            
            # Tạo embedding từ cả content và metadata
            embedding_content = f"{content} {json.dumps(metadata)}"
            embedding = self.model.encode(embedding_content).tolist()
            
            chunk = DocumentChunk(
                content=content,
                source_type='artist',
                source_id=artist.id,
                keywords=", ".join(keywords),
                relevance_score=1.0,
                embedding=embedding,
                metadata=metadata  # Lưu metadata dạng JSON
            )
            chunks_to_create.append(chunk)
            
            if len(chunks_to_create) >= batch_size or i == len(artists) - 1:
                DocumentChunk.objects.bulk_create(chunks_to_create)
                chunks_to_create = []
                logger.info(f"Đã tạo {i+1} artist document chunks")
    
    def _process_albums(self, batch_size=200):
        """Xử lý và tạo document chunks cho albums với metadata chi tiết"""
        from music.models import Album
        
        albums = Album.objects.select_related('artist').all()
        chunks_to_create = []
        
        for i, album in enumerate(albums):
            # Tạo metadata chi tiết
            metadata = {
                'type': 'album',
                'title': album.title,
                'artist': {'name': album.artist.name, 'id': album.artist.id} if album.artist else None,
                'release_year': album.release_date.year if hasattr(album, 'release_date') and album.release_date else None,
            }
            
            content = f"""
            Album: {album.title}
            Nghệ sĩ: {album.artist.name if album.artist else 'Không rõ nghệ sĩ'}
            Năm phát hành: {album.release_date.year if hasattr(album, 'release_date') and album.release_date else 'Không rõ'}
            """
            
            # Từ khóa chi tiết
            keywords = [
                album.title.lower(),
            ]
            if album.artist:
                keywords.append(album.artist.name.lower())
            
            # Tạo embedding từ cả content và metadata
            embedding_content = f"{content} {json.dumps(metadata)}"
            embedding = self.model.encode(embedding_content).tolist()
            
            chunk = DocumentChunk(
                content=content,
                source_type='album',
                source_id=album.id,
                keywords=", ".join(keywords),
                relevance_score=1.0,
                embedding=embedding,
                metadata=metadata  # Lưu metadata dạng JSON
            )
            chunks_to_create.append(chunk)
            
            if len(chunks_to_create) >= batch_size or i == len(albums) - 1:
                DocumentChunk.objects.bulk_create(chunks_to_create)
                chunks_to_create = []
                logger.info(f"Đã tạo {i+1} album document chunks")

    def search(self, query, top_k=5, timeout=SEARCH_TIMEOUT):
        """Tìm kiếm thông tin tổng quát với timeout"""
        try:
            with ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(self._vector_search, query, top_k)
                try:
                    return future.result(timeout=timeout)
                except FutureTimeoutError:
                    logger.warning(f"Tìm kiếm '{query}' quá thời gian")
                    return self._fallback_search(query)
        except Exception as e:
            logger.error(f"Lỗi khi tìm kiếm: {str(e)}")
            return []

    def search_song_info(self, song_query, timeout=SEARCH_TIMEOUT):
        """Tìm kiếm thông tin bài hát với phương pháp ngữ nghĩa"""
        try:
            # Phân tích ngữ nghĩa câu hỏi
            query_embedding = self.model.encode(song_query)
            
            # Xác định ý định của câu hỏi
            intent_examples = {
                "composer": "ai sáng tác bài hát này",
                "singer": "ai hát bài này",
                "album": "bài hát này thuộc album nào",
                "year": "bài hát này ra mắt năm nào",
                "general": "thông tin về bài hát"
            }
            
            intent_embeddings = {intent: self.model.encode(example) for intent, example in intent_examples.items()}
            intent_scores = {intent: np.dot(query_embedding, emb) / (np.linalg.norm(query_embedding) * np.linalg.norm(emb)) 
                            for intent, emb in intent_embeddings.items()}
            
            # Xác định ý định chính
            primary_intent = max(intent_scores.items(), key=lambda x: x[1])[0]
            
            # Trích xuất tên bài hát
            song_name = self._extract_song_name(song_query)
            if not song_name:
                return None
                
            # Thử tìm trong cache
            cache_key = f"song:{song_name.lower()}"
            cached_result = self._get_cached_result(cache_key)
            if cached_result:
                # Thêm thông tin về ý định vào kết quả
                cached_result['intent'] = primary_intent
                return cached_result
                
            # Tìm kiếm với timeout
            with ThreadPoolExecutor(max_workers=1) as executor:
                # Truyền thêm ý định để tối ưu tìm kiếm
                future = executor.submit(self._search_song, song_name, primary_intent)
                try:
                    result = future.result(timeout=timeout)
                    if result:
                        # Thêm thông tin về ý định vào kết quả
                        result['intent'] = primary_intent
                        self._cache_result(cache_key, result)
                    return result
                except FutureTimeoutError:
                    logger.warning(f"Tìm kiếm bài hát '{song_name}' quá thời gian")
                    # Fallback với ý định
                    return self._fallback_search_song(song_name, primary_intent)
        except Exception as e:
            logger.error(f"Lỗi khi tìm kiếm bài hát: {str(e)}")
            return None

    def _extract_song_name(self, query):
        """Trích xuất tên bài hát từ câu hỏi bằng phương pháp ngữ nghĩa"""
        # Tạo embedding cho câu hỏi
        query_embedding = self.model.encode(query)
        
        # Danh sách các mẫu câu hỏi phổ biến và embedding tương ứng
        intent_examples = [
            "ai sáng tác bài", 
            "bài hát này của ai",
            "thông tin về bài hát",
            "ai là tác giả",
            "bài hát nào",
            "ca sĩ nào hát bài"
        ]
        intent_embeddings = [self.model.encode(ex) for ex in intent_examples]
        
        # Tính độ tương đồng với các mẫu câu
        similarities = [np.dot(query_embedding, intent_emb) / (np.linalg.norm(query_embedding) * np.linalg.norm(intent_emb)) 
                       for intent_emb in intent_embeddings]
        
        # Nếu có ý định hỏi về bài hát (độ tương đồng cao)
        if max(similarities) > 0.6:
            # Trích xuất tên bài hát bằng cách loại bỏ các từ khóa phổ biến
            common_phrases = [
                "ai sáng tác", "ai là tác giả", "thông tin về", "bài hát",
                "ca sĩ", "nghệ sĩ", "album", "của ai", "do ai"
            ]
            
            # Loại bỏ dần các cụm từ phổ biến
            cleaned_query = query.lower()
            for phrase in common_phrases:
                cleaned_query = cleaned_query.replace(phrase, " ")
            
            # Loại bỏ dấu câu và khoảng trắng thừa
            cleaned_query = re.sub(r'[?.,!]', '', cleaned_query)
            cleaned_query = re.sub(r'\s+', ' ', cleaned_query).strip()
            
            # Nếu còn lại ít nhất 2 từ, đó có thể là tên bài hát
            if len(cleaned_query.split()) >= 1:
                return cleaned_query
        
        # Nếu không xác định được rõ ràng, trả về toàn bộ câu hỏi
        return query.strip()

    def _search_song(self, song_name, intent=None):
        """Tìm kiếm bài hát với ý định cụ thể"""
        # Tìm kiếm vector
        vector_results = self._vector_search(song_name, top_k=5)
        
        # Tìm kiếm metadata với trọng số dựa trên ý định
        query_filters = Q(source_type='song')
        
        # Thêm các bộ lọc dựa trên ý định - sửa để không dùng metadata
        if intent == "composer" or intent == "singer":
            # Ưu tiên tìm kiếm theo nghệ sĩ
            query_filters &= (
                Q(content__icontains=song_name) | 
                Q(keywords__icontains=song_name)
            )
        elif intent == "album":
            # Ưu tiên tìm kiếm theo album
            query_filters &= (
                Q(content__icontains=song_name) | 
                Q(keywords__icontains=song_name)
            )
        else:
            # Tìm kiếm tổng quát
            query_filters &= (
                Q(content__icontains=song_name) | 
                Q(keywords__icontains=song_name)
            )
        
        metadata_results = DocumentChunk.objects.filter(query_filters).order_by('-relevance_score')[:5]
        
        # Kết hợp và sắp xếp kết quả
        combined_results = []
        seen_ids = set()
        
        for result in vector_results:
            if result['source_id'] not in seen_ids:
                combined_results.append(result)
                seen_ids.add(result['source_id'])
        
        for doc in metadata_results:
            if doc.source_id not in seen_ids:
                combined_results.append({
                    'content': doc.content,
                    'source_type': doc.source_type,
                    'source_id': doc.source_id,
                    'score': 0
                })
                seen_ids.add(doc.source_id)
        
        # Lấy thông tin chi tiết từ database
        detailed_results = []
        for result in combined_results[:5]:
            try:
                doc = DocumentChunk.objects.get(source_id=result['source_id'], source_type='song')
                if doc.metadata and isinstance(doc.metadata, dict):
                    detailed_results.append(doc.metadata)
                else:
                    song = Song.objects.get(id=result['source_id'])
                    detailed_results.append({
                        'type': 'song',
                        'title': song.title,
                        'artists': [{'name': a.name, 'id': a.id} for a in song.artists.all()],
                        'album': song.album.title if song.album else None,
                        'release_year': song.release_date.year if song.release_date else None,
                        'source': doc.content
                    })
            except (Song.DoesNotExist, DocumentChunk.DoesNotExist):
                continue
        
        return detailed_results[0] if detailed_results else None

    def _fallback_search_song(self, song_name, intent=None):
        """Tìm kiếm fallback với ý định cụ thể"""
        try:
            # Xây dựng truy vấn dựa trên ý định
            query = Q(title__icontains=song_name)
            
            # Mở rộng truy vấn dựa trên ý định
            if intent == "composer" or intent == "singer":
                # Thêm tìm kiếm theo nghệ sĩ
                query |= Q(artists__name__icontains=song_name)
            elif intent == "album":
                # Thêm tìm kiếm theo album
                query |= Q(album__title__icontains=song_name)
            else:
                # Tìm kiếm tổng quát
                query |= Q(lyrics__icontains=song_name)
            
            # Tìm kiếm trực tiếp trong database
            songs = Song.objects.filter(query).select_related('album').prefetch_related('artists')[:3]
            
            if not songs:
                return None
                
            song = songs[0]
            return {
                'type': 'song',
                'title': song.title,
                'artists': [{'name': a.name, 'id': a.id} for a in song.artists.all()],
                'album': song.album.title if song.album else None,
                'release_year': song.release_date.year if song.release_date else None,
                'intent': intent,  # Thêm ý định vào kết quả
                'source': f"Tìm kiếm trực tiếp: {song.title}"
            }
        except Exception as e:
            logger.error(f"Lỗi fallback search: {str(e)}")
            return None

    def _vector_search(self, query, top_k=5):
        """Tìm kiếm vector với xử lý lỗi"""
        if not self.index or len(self.document_ids) == 0:
            return []
            
        try:
            query_embedding = self.model.encode(query)
            query_embedding = np.array([query_embedding], dtype=np.float32)
            
            distances, indices = self.index.search(query_embedding, top_k)
            
            results = []
            doc_ids = [self.document_ids[i] for i in indices[0] if 0 <= i < len(self.document_ids)]
            
            if doc_ids:
                docs = DocumentChunk.objects.in_bulk(doc_ids)
                for i, idx in enumerate(indices[0]):
                    if 0 <= idx < len(self.document_ids):
                        doc_id = self.document_ids[idx]
                        if doc_id in docs:
                            doc = docs[doc_id]
                            results.append({
                                'content': doc.content,
                                'source_type': doc.source_type,
                                'source_id': doc.source_id,
                                'score': float(distances[0][i])
                            })
            
            return results
        except Exception as e:
            logger.error(f"Lỗi vector search: {str(e)}")
            return []

    def _fallback_search(self, query):
        """Tìm kiếm fallback không dùng vector khi timeout"""
        try:
            # Tìm kiếm trực tiếp trong database
            results = DocumentChunk.objects.filter(
                Q(content__icontains=query) | 
                Q(keywords__icontains=query)
            ).order_by('-relevance_score')[:5]
            
            return [{
                'content': doc.content,
                'source_type': doc.source_type,
                'source_id': doc.source_id,
                'score': 0
            } for doc in results]
        except Exception as e:
            logger.error(f"Lỗi fallback search: {str(e)}")
            return []

    def _get_cached_result(self, key):
        """Lấy kết quả từ cache"""
        cache_file = self.INDEX_PATH / f"cache_{hash(key) % 100}.pkl"
        if not cache_file.exists():
            return None
            
        try:
            with open(cache_file, 'rb') as f:
                cache_data = pickle.load(f)
                if key in cache_data and time.time() < cache_data[key]['expiry']:
                    return cache_data[key]['data']
        except Exception:
            pass
        return None

    def _cache_result(self, key, data, ttl=3600):
        """Lưu kết quả vào cache"""
        cache_file = self.INDEX_PATH / f"cache_{hash(key) % 100}.pkl"
        
        try:
            cache_data = {}
            if cache_file.exists():
                with open(cache_file, 'rb') as f:
                    cache_data = pickle.load(f)
            
            cache_data[key] = {
                'data': data,
                'expiry': time.time() + ttl
            }
            
            with open(cache_file, 'wb') as f:
                pickle.dump(cache_data, f)
        except Exception as e:
            logger.error(f"Lỗi khi lưu cache: {str(e)}")

    def warmup_cache(self, common_queries=None):
        """Làm nóng cache với các truy vấn phổ biến"""
        common_queries = common_queries or [
            "Bài Nơi này có anh",
            "Bài Chạy ngay đi",
            "Bài Lạc trôi"
        ]
        
        logger.info("Bắt đầu làm nóng cache...")
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=3) as executor:
            futures = []
            for query in common_queries:
                futures.append(executor.submit(self.search_song_info, query))
            
            for future in futures:
                try:
                    future.result(timeout=self.SEARCH_TIMEOUT * 2)
                except Exception:
                    pass
                    
        logger.info(f"Hoàn thành làm nóng cache trong {time.time() - start_time:.2f}s")

# Khởi tạo service
rag_service = RAGService.get_instance()