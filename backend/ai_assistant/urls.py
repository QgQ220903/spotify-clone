from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'conversations', views.AIConversationViewSet, basename='conversation')

urlpatterns = [
    path('', include(router.urls)),
    path('chat/', views.ai_chat, name='ai_chat'),
    path('update-rag-index/', views.update_rag_index, name='update_rag_index'),
]