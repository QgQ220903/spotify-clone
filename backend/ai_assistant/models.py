from django.db import models
from accounts.models import CustomUser

class AIConversation(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='ai_conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Conversation {self.id} - {self.user.username}"

class AIMessage(models.Model):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('assistant', 'Assistant'),
    )
    
    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."

# Thêm model mới cho RAG
class DocumentChunk(models.Model):
    """Lưu trữ các đoạn văn bản nhỏ từ dữ liệu của ứng dụng"""
    content = models.TextField()
    source_type = models.CharField(max_length=50)  # song, artist, album, etc.
    source_id = models.IntegerField()
    embedding = models.JSONField(null=True, blank=True)  # Lưu vector embedding
    created_at = models.DateTimeField(auto_now_add=True)
    # Thêm trường mới để cải thiện tìm kiếm
    keywords = models.TextField(blank=True, help_text="Từ khóa để cải thiện tìm kiếm")
    relevance_score = models.FloatField(default=1.0, help_text="Điểm liên quan để ưu tiên kết quả")
    last_accessed = models.DateTimeField(auto_now=True, help_text="Thời gian truy cập gần nhất")
    
    # Thêm các chỉ mục để tăng tốc truy vấn
    class Meta:
        indexes = [
            models.Index(fields=['source_type', 'source_id']),
            models.Index(fields=['last_accessed']),
        ]
    
    def __str__(self):
        return f"{self.source_type}:{self.source_id} - {self.content[:30]}..."
    
    def serialize_embedding(self):
        """Chuyển đổi embedding từ numpy array sang list để lưu vào database"""
        if isinstance(self.embedding, np.ndarray):
            return self.embedding.tolist()
        return self.embedding
    
    def deserialize_embedding(self):
        """Chuyển đổi embedding từ list sang numpy array để sử dụng"""
        if self.embedding and isinstance(self.embedding, list):
            return np.array(self.embedding, dtype=np.float32)
        return None
    
    def save(self, *args, **kwargs):
        # Đảm bảo embedding được lưu đúng định dạng
        if hasattr(self, 'embedding') and self.embedding is not None:
            self.embedding = self.serialize_embedding()
        super().save(*args, **kwargs)