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
    
    def __str__(self):
        return f"{self.source_type}:{self.source_id} - {self.content[:30]}..."
