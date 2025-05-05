from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ai_chat, AIConversationViewSet

router = DefaultRouter()
router.register(r'conversations', AIConversationViewSet, basename='ai-conversation')

urlpatterns = [
    path('chat/', ai_chat, name='ai-chat'),
    path('', include(router.urls)),
]