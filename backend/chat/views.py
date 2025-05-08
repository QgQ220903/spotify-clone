from django.db import models
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Message
from .serializers import MessageSerializer

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        current_user = self.request.query_params.get('current_user')
        other_user = self.request.query_params.get('user')
        
        if current_user and other_user:
            return Message.objects.filter(
                (models.Q(sender=current_user) & models.Q(receiver=other_user)) |
                (models.Q(sender=other_user) & models.Q(receiver=current_user))
            ).order_by('-timestamp')
            
        return Message.objects.filter(
            models.Q(sender=user) | models.Q(receiver=user)
        ).order_by('-timestamp')

    @action(detail=False, methods=['get'])
    def conversations(self, request):
        user = request.user
        messages = Message.objects.filter(
            models.Q(sender=user) | models.Q(receiver=user)
        ).order_by('-timestamp')
        
        conversations = []
        seen_users = set()
        
        for message in messages:
            other_user = message.receiver if message.sender == user else message.sender
            if other_user.id not in seen_users:
                seen_users.add(other_user.id)
                conversations.append({
                    'user': other_user.id,
                    'username': other_user.username,
                    'last_message': message.content,
                    'timestamp': message.timestamp,
                    'unread': Message.objects.filter(
                        sender=other_user,
                        receiver=user,
                        is_read=False
                    ).count()
                })
        
        return Response(conversations)
from django.shortcuts import render

# Create your views here.
