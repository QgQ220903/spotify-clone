from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FriendViewSet

router = DefaultRouter()
router.register('friends', FriendViewSet, basename='friend')

urlpatterns = [
    path('', include(router.urls)),
    # Thêm các endpoint mới
    path('friends/requests/', FriendViewSet.as_view({'get': 'get_requests'}), name='friend-requests'),
    path('friends/list/', FriendViewSet.as_view({'get': 'list_friends'}), name='friend-list'),
    path('friends/search/', FriendViewSet.as_view({'get': 'search_users'}), name='friend-search'),
    path('friends/send_request/', FriendViewSet.as_view({'post': 'send_request'}), name='send-request'),
    path('friends/<int:pk>/accept/', FriendViewSet.as_view({'post': 'accept_request'}), name='accept-request'),
    path('friends/get_requests/', FriendViewSet.as_view({'get': 'get_requests'}), name='friend-get-requests'),

]