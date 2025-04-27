from django.urls import path
from .views import (
    UserCreateView, UserDetailView, 
    FollowUserView, CustomTokenObtainPairView
)

urlpatterns = [
    path('register/', UserCreateView.as_view(), name='register'),
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('follow/<int:user_id>/', FollowUserView.as_view(), name='follow-user'),
]