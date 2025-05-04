from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ArtistViewSet, AlbumViewSet, SongViewSet,
    PlaylistViewSet, FavoriteView
)

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArtistViewSet, AlbumViewSet, SongViewSet, PlaylistViewSet, FavoriteView
from rest_framework.authtoken.views import obtain_auth_token

router = DefaultRouter()
router.register(r'artists', ArtistViewSet, basename='artist')
router.register(r'albums', AlbumViewSet, basename='album')
router.register(r'songs', SongViewSet, basename='song')
router.register(r'playlists', PlaylistViewSet, obtain_auth_token)

urlpatterns = [
    path('', include(router.urls)),
    path('favorites/', FavoriteView.as_view(), name='favorites')
]