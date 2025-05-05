from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import AIConversation, AIMessage
from .serializers import AIConversationSerializer, AIMessageSerializer, AIRequestSerializer
from .services import OllamaService

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_chat(request):
    """
    API endpoint để chat với AI
    """
    serializer = AIRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    user_message = serializer.validated_data['message']
    conversation_id = serializer.validated_data.get('conversation_id')
    
    # Lấy hoặc tạo cuộc trò chuyện
    if conversation_id:
        try:
            conversation = AIConversation.objects.get(id=conversation_id, user=request.user)
        except AIConversation.DoesNotExist:
            return Response({"error": "Không tìm thấy cuộc trò chuyện"}, status=status.HTTP_404_NOT_FOUND)
    else:
        conversation = AIConversation.objects.create(user=request.user)
    
    # Lưu tin nhắn của người dùng
    AIMessage.objects.create(
        conversation=conversation,
        role='user',
        content=user_message
    )
    
    # Gọi Ollama API
    ollama_service = OllamaService()
    ai_response = ollama_service.generate_response(user_message)
    
    # Lưu phản hồi của AI
    ai_message = AIMessage.objects.create(
        conversation=conversation,
        role='assistant',
        content=ai_response
    )
    
    return Response({
        "conversation_id": conversation.id,
        "message": AIMessageSerializer(ai_message).data
    })

class AIConversationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet để xem lịch sử trò chuyện
    """
    serializer_class = AIConversationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return AIConversation.objects.filter(user=self.request.user)
