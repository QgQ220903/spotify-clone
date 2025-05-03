from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from .serializers import UserSerializer, AdminUserSerializer, CustomTokenObtainPairSerializer
from .permissions import IsAdminUser
from django.contrib.auth import get_user_model

User = get_user_model()


class UserCreateView(generics.CreateAPIView):
    """View for user registration"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
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


# Admin views
class AdminUserListView(generics.ListAPIView):
    """View for admin to list all users"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View for admin to manage individual users"""
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]


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