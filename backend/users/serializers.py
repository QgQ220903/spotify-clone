from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Friend

User = get_user_model()

class UserSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class FriendSerializer(serializers.ModelSerializer):
    friend_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Friend
        fields = ['id', 'friend_info', 'status', 'created_at']
    
    def get_friend_info(self, obj):
        # obj ở đây có thể là Friend model hoặc dict từ view
        if isinstance(obj, dict):
            friend = obj['friend']
            return {
                'id': friend.id,
                'username': friend.username,
                'email': friend.email
            }
        else:
            friend = obj.user if obj.friend == self.context['request'].user else obj.friend
            return {
                'id': friend.id,
                'username': friend.username,
                'email': friend.email
            }