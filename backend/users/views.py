from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import Friend
from .serializers import FriendSerializer, UserSearchSerializer

User = get_user_model()

class FriendViewSet(viewsets.ModelViewSet):
    serializer_class = FriendSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Friend.objects.filter(
            Q(user=user) | Q(friend=user)
        ).select_related('user', 'friend')

    @action(detail=False, methods=['get'])
    def list_friends(self, request):
        """Danh sách bạn bè đã chấp nhận (không trùng lặp)"""
        user = request.user
        # Lấy tất cả bạn bè mà user là người gửi hoặc người nhận
        friends = Friend.objects.filter(
            Q(user=user, status='accepted') | Q(friend=user, status='accepted')
        ).select_related('user', 'friend')
        
        # Tạo danh sách bạn bè không trùng lặp
        friend_ids = set()
        unique_friends = []
        
        for friend in friends:
            # Xác định đối tượng là bạn bè (không phải chính user)
            friend_user = friend.user if friend.friend == user else friend.friend
            if friend_user.id not in friend_ids:
                friend_ids.add(friend_user.id)
                unique_friends.append({
                    'id': friend.id,
                    'friend': friend_user,
                    'status': friend.status,
                    'created_at': friend.created_at
                })
        
        serializer = self.get_serializer(unique_friends, many=True)
        return Response({
            'count': len(unique_friends),
            'results': serializer.data
        })

    @action(detail=False, methods=['get'])
    def get_requests(self, request):
        # Chỉ lấy những lời mời mà người dùng hiện tại là người nhận (friend)
        requests = Friend.objects.filter(
            friend=request.user,  # Người nhận là user hiện tại
            status='pending'
        ).select_related('user')  # Lấy thông tin người gửi (user)
        
        serializer = self.get_serializer(requests, many=True)
        return Response({
            'count': requests.count(),
            'results': serializer.data
        })

    @action(detail=False, methods=['get'])
    def search_users(self, request):
        query = request.query_params.get('q', '')
        if len(query) < 2:
            return Response(
                {'message': 'Nhập ít nhất 2 ký tự'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        users = User.objects.filter(
            Q(username__icontains=query) | 
            Q(email__icontains=query)
        ).exclude(id=request.user.id)[:10]
        
        serializer = UserSearchSerializer(users, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def send_request(self, request):
      friend_id = request.data.get('friend_id')
      if not friend_id:
          return Response(
              {'message': 'Thiếu friend_id'}, 
              status=status.HTTP_400_BAD_REQUEST
          )
      
      try:
          friend = User.objects.get(id=friend_id)
      except User.DoesNotExist:
          return Response(
              {'message': 'Người dùng không tồn tại'}, 
              status=status.HTTP_404_NOT_FOUND
          )
      
      if friend_id == request.user.id:
          return Response(
              {'message': 'Không thể kết bạn với chính mình'}, 
              status=status.HTTP_400_BAD_REQUEST
          )
      
      # Kiểm tra đã tồn tại kết bạn hoặc lời mời chưa
      existing = Friend.objects.filter(
          (Q(user=request.user, friend=friend) | 
          Q(friend=request.user, user=friend))
      ).first()
      
      if existing:
          if existing.status == 'accepted':
              return Response(
                  {'message': 'Đã là bạn bè'}, 
                  status=status.HTTP_400_BAD_REQUEST
              )
          return Response(
              {'message': 'Đã gửi lời mời kết bạn trước đó'}, 
              status=status.HTTP_400_BAD_REQUEST
          )
      
      friend_request = Friend.objects.create(
          user=request.user,
          friend=friend,
          status='pending'
      )
      
      # Thêm thông tin friend_details vào response
      serializer = self.get_serializer(friend_request)
      return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def accept_request(self, request, pk=None):
        try:
            friend_request = Friend.objects.get(id=pk)
        except Friend.DoesNotExist:
            return Response(
                {'message': 'Lời mời không tồn tại'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if friend_request.friend != request.user:
            return Response(
                {'message': 'Không có quyền chấp nhận lời mời này'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if friend_request.status != 'pending':
            return Response(
                {'message': 'Lời mời đã được xử lý trước đó'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        friend_request.status = 'accepted'
        friend_request.save()
        
        # Tạo bản ghi đối xứng để cả 2 đều là bạn của nhau
        Friend.objects.get_or_create(
            user=request.user,
            friend=friend_request.user,
            defaults={'status': 'accepted'}
        )
        
        serializer = self.get_serializer(friend_request)
        return Response(serializer.data)