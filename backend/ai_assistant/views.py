from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import AIConversation, AIMessage, DocumentChunk
from .serializers import AIConversationSerializer, AIMessageSerializer, AIRequestSerializer
from .services import OllamaService
from .rag_service import RAGService
import logging

# Thiết lập logging
logger = logging.getLogger(__name__)

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
            # Tạo cuộc hội thoại mới nếu không tìm thấy
            conversation = AIConversation.objects.create(user=request.user)
            logger.info(f"Tạo cuộc hội thoại mới với ID {conversation.id} vì không tìm thấy ID {conversation_id}")
    else:
        # Tạo cuộc hội thoại mới nếu không có conversation_id
        conversation = AIConversation.objects.create(user=request.user)
        logger.info(f"Tạo cuộc hội thoại mới với ID {conversation.id}")
    
    # Lưu tin nhắn của người dùng
    user_ai_message = AIMessage.objects.create(
        conversation=conversation,
        role='user',
        content=user_message
    )
    
    # Gọi Ollama API với conversation_id để đảm bảo lịch sử hội thoại được sử dụng
    ollama_service = OllamaService()
    ai_response = ollama_service.generate_response(user_message, conversation.id)
    
    # Lưu phản hồi của AI
    ai_message = AIMessage.objects.create(
        conversation=conversation,
        role='assistant',
        content=ai_response
    )
    
    # Log để debug
    logger.info(f"Trả về phản hồi: conversation_id={conversation.id}, message_id={ai_message.id}")
    
    return Response({
        'conversation_id': conversation.id,
        'message': {
            'id': ai_message.id,
            'role': ai_message.role,
            'content': ai_message.content,
            'timestamp': ai_message.timestamp
        }
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat(request):
    user_message = request.data.get('message', '')
    conversation_id = request.data.get('conversation_id')
    
    # Log để debug
    logger.info(f"Nhận yêu cầu chat: message={user_message[:30]}..., conversation_id={conversation_id}")
    
    # Xử lý conversation
    if conversation_id:
        try:
            conversation = AIConversation.objects.get(id=conversation_id, user=request.user)
        except AIConversation.DoesNotExist:
            # Nếu conversation_id không tồn tại hoặc không thuộc về user này
            conversation = AIConversation.objects.create(user=request.user)
            conversation_id = conversation.id
            logger.info(f"Tạo cuộc hội thoại mới với ID {conversation_id}")
    else:
        conversation = AIConversation.objects.create(user=request.user)
        conversation_id = conversation.id
        logger.info(f"Tạo cuộc hội thoại mới với ID {conversation_id}")
    
    # Lưu tin nhắn người dùng
    user_ai_message = AIMessage.objects.create(
        conversation=conversation,
        role='user',
        content=user_message
    )
    
    # Gọi service để tạo phản hồi
    ollama_service = OllamaService()
    ai_response = ollama_service.generate_response(user_message, conversation_id)
    
    # Kiểm tra phản hồi trống
    if not ai_response or ai_response.strip() == '':
        ai_response = "Xin lỗi, tôi không thể trả lời câu hỏi này. Vui lòng thử câu hỏi khác."
        logger.warning(f"Phát hiện phản hồi trống, thay thế bằng thông báo mặc định")
    
    # Lưu phản hồi của AI
    ai_message = AIMessage.objects.create(
        conversation=conversation,
        role='assistant',
        content=ai_response
    )
    
    # Log để debug
    logger.info(f"Trả về phản hồi: conversation_id={conversation_id}, message_id={ai_message.id}, content_length={len(ai_response)}")
    
    return Response({
        'conversation_id': conversation_id,
        'message': {
            'id': ai_message.id,
            'role': ai_message.role,
            'content': ai_response,
            'timestamp': ai_message.timestamp
        }
    })
