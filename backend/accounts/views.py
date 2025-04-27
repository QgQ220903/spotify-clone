from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from .serializers import UserSerializer, CustomTokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

class UserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class FollowUserView(generics.GenericAPIView):
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
    serializer_class = CustomTokenObtainPairSerializer