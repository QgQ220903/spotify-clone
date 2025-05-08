from rest_framework import serializers
from .models import Message
from accounts.serializers import UserSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender_detail = UserSerializer(source='sender', read_only=True)
    receiver_detail = UserSerializer(source='receiver', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'sender_detail', 
                 'receiver_detail', 'content', 'timestamp', 'is_read']
        read_only_fields = ['sender', 'timestamp']

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)