from rest_framework import serializers
from .models import AIConversation, AIMessage

class AIMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIMessage
        fields = ['id', 'role', 'content', 'timestamp']

class AIConversationSerializer(serializers.ModelSerializer):
    messages = AIMessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = AIConversation
        fields = ['id', 'user', 'created_at', 'updated_at', 'messages']
        read_only_fields = ['user']

class AIRequestSerializer(serializers.Serializer):
    message = serializers.CharField(required=True)
    conversation_id = serializers.IntegerField(required=False, allow_null=True)