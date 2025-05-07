import requests
import json
import os
from django.conf import settings
from .rag_service import RAGService

class OllamaService:
    def __init__(self):
        self.base_url = os.getenv('OLLAMA_API_URL', 'http://localhost:11434')
        self.model = os.getenv('OLLAMA_MODEL', 'phi')
        self.rag_service = RAGService()
    
    def generate_response(self, user_message):
        # Tìm kiếm thông tin liên quan từ cơ sở dữ liệu
        relevant_docs = self.rag_service.search(user_message)
        
        # Tạo context từ các tài liệu liên quan
        context = ""
        if relevant_docs:
            context = "Thông tin liên quan:\n"
            for doc in relevant_docs:
                context += f"- {doc['content']}\n"
        
        # Tạo prompt với context
        prompt = f"""Bạn là trợ lý AI của ứng dụng Spotify Clone.
        
{context}

Người dùng hỏi: {user_message}

Hãy trả lời dựa trên thông tin được cung cấp. Nếu không có thông tin liên quan, hãy trả lời dựa trên kiến thức chung về âm nhạc và Spotify."""
        
        try:
            # Gọi API Ollama
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('response', 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn.')
            else:
                return f"Lỗi khi gọi API: {response.status_code}"
        except Exception as e:
            return f"Đã xảy ra lỗi: {str(e)}"