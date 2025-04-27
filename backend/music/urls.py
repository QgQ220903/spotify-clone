from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    ArtistViewSet, AlbumViewSet, SongViewSet, 
     PlaylistViewSet, FavoriteView
)

router = DefaultRouter()
router.register(r'artists', ArtistViewSet)
router.register(r'albums', AlbumViewSet)
router.register(r'songs', SongViewSet)
router.register(r'playlists', PlaylistViewSet)

urlpatterns = [
    path('favorites/', FavoriteView.as_view(), name='favorites'),
] + router.urls