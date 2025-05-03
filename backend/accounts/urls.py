from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

from django.urls import path
from .views import (
    UserCreateView,

    UserDetailView,
    FollowUserView,
    CustomTokenObtainPairView,
    AdminUserListView,
    AdminUserDetailView,
    SetUserTypeView
)

urlpatterns = [
    # User endpoints
    path('register/', UserCreateView.as_view(), name='register'),
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('token/', CustomTokenView.as_view(), name='token_obtain_pair'),
    path('follow/<int:user_id>/', FollowUserView.as_view(), name='follow-user'),
    
    # Admin endpoints
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/<int:user_id>/set-type/', SetUserTypeView.as_view(), name='set-user-type'),
]