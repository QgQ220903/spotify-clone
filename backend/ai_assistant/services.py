import requests
import json

class OllamaService:
    def __init__(self, base_url="http://localhost:11434"):
        self.base_url = base_url
        
    def generate_response(self, prompt, model="llama2"):
        """
        Gửi prompt đến Ollama API và nhận phản hồi
        """
        url = f"{self.base_url}/api/generate"
        
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False
        }
        
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            return response.json()["response"]
        except requests.exceptions.RequestException as e:
            print(f"Lỗi khi gọi Ollama API: {e}")
            return "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này."