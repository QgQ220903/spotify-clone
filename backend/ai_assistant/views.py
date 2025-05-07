from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import AIConversation, AIMessage, DocumentChunk
from .serializers import AIConversationSerializer, AIMessageSerializer, AIRequestSerializer
from .services import OllamaService
from .rag_service import RAGService

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

@api_view(['POST'])
@permission_classes([IsAdminUser])
def update_rag_index(request):
    """
    API endpoint để cập nhật RAG index (chỉ admin)
    """
    try:
        # Xóa tất cả document chunks hiện tại
        DocumentChunk.objects.all().delete()
        
        # Tạo lại index
        rag_service = RAGService()
        rag_service.create_document_chunks()
        
        return Response({"message": "RAG index đã được cập nhật thành công"})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
