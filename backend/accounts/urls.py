from django.urls import path
from .views import (
    UserCreateView,
    UserDetailView,
    FollowUserView,
    CustomTokenObtainPairView,
    AdminUserListView,
    AdminUserDetailView,
    SetUserTypeView,
    generate_admin_token,
    verify_admin_token,
    admin_dashboard_stats
)

urlpatterns = [
    # User endpoints
    path('register/', UserCreateView.as_view(), name='register'),
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('follow/<int:user_id>/', FollowUserView.as_view(), name='follow-user'),
    
    # Admin endpoints (hiện có)
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/<int:user_id>/set-type/', SetUserTypeView.as_view(), name='set-user-type'),
    
    # Admin endpoints mới (cho admin frontend)
    path('admin/generate-token/', generate_admin_token, name='generate-admin-token'),
    path('admin/verify-token/', verify_admin_token, name='verify-admin-token'),
    path('admin/stats/', admin_dashboard_stats, name='admin-dashboard-stats'),
]