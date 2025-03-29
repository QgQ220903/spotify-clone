from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SongViewSet, VideoViewSet, AlbumViewSet, PlaylistViewSet, PlaylistSongViewSet

router = DefaultRouter()
router.register(r'songs', SongViewSet)
router.register(r'videos', VideoViewSet)
router.register(r'albums', AlbumViewSet)
router.register(r'playlists', PlaylistViewSet)  # Thêm API Playlist
router.register(r'playlist-songs', PlaylistSongViewSet)  # Thêm API PlaylistSong

urlpatterns = [
    path('', include(router.urls)),
]
