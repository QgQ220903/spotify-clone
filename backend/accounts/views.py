from rest_framework.decorators import api_view, permission_classes
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from .serializers import UserSerializer, AdminUserSerializer, CustomTokenObtainPairSerializer
from .permissions import IsAdminUser
from django.contrib.auth import get_user_model
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from rest_framework.permissions import IsAuthenticated, IsAdminUser

User = get_user_model()

# Giữ nguyên các view hiện có của bạn
class UserCreateView(generics.CreateAPIView):
    """View for user registration"""
    queryset = User.objects.all()
    serializer_class = UserSerializer  # Sử dụng UserSerializer thay vì AdminUserSerializer
    permission_classes = [permissions.AllowAny]

class UserDetailView(generics.RetrieveUpdateAPIView):
    """View for retrieving and updating user profile"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class FollowUserView(generics.GenericAPIView):
    """View for following/unfollowing users"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        user_to_follow = get_object_or_404(User, id=user_id)
        user = request.user
        
        if user == user_to_follow:
            return Response({'error': 'You cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)
        
        if user_to_follow in user.following.all():
            user.following.remove(user_to_follow)
            return Response({'status': 'unfollowed'})
        else:
            user.following.add(user_to_follow)
            return Response({'status': 'followed'})

class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT token view with user type information"""
    serializer_class = CustomTokenObtainPairSerializer

class AdminUserListView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer  # nên dùng AdminUserSerializer để admin có quyền tạo đúng
    permission_classes = [IsAuthenticated, IsAdminUser]
    
class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class SetUserTypeView(APIView):
    """View for admin to set user type"""
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def post(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        user_type = request.data.get('user_type')
        
        if user_type not in [choice[0] for choice in User.USER_TYPE_CHOICES]:
            return Response(
                {'error': f'Invalid user type. Choose from {[choice[0] for choice in User.USER_TYPE_CHOICES]}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.user_type = user_type
        user.save()
        
        return Response({'status': 'success', 'user_type': user.user_type})

# Thêm các API mới cho admin frontend
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def generate_admin_token(request):
    """Tạo token JWT tạm thời cho admin frontend"""
    payload = {
        'user_id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,  # Thay 'email' bằng trường email của bạn trong User mode
        'is_admin': True,
        'exp': datetime.utcnow() + timedelta(minutes=5),
        'admin_access': True
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return Response({'token': token})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_admin_token(request):
    """Xác thực token admin (sẽ được admin frontend gọi)"""
    # Middleware đã xác thực token trước khi vào view này
    return Response({'valid': True, 'user': {
        'id': request.user.id,
        'username': request.user.username,
        'is_admin': request.user.user_type == 'admin'
    }})

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_dashboard_stats(request):
    """Lấy thống kê cho dashboard admin"""
    stats = {
        'total_users': User.objects.count(),
        'active_users': User.objects.filter(is_active=True).count(),
        'admin_users': User.objects.filter(user_type='admin').count(),
    }
    return Response(stats)