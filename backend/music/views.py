from rest_framework import viewsets, permissions
from .models import Song, Video, Album, Playlist, PlaylistSong
from .serializers import SongSerializer, VideoSerializer, AlbumSerializer, PlaylistSerializer, PlaylistSongSerializer

class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer
    permission_classes = [permissions.IsAuthenticated]

class PlaylistViewSet(viewsets.ModelViewSet):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated]  # Chỉ người dùng đăng nhập mới có thể thao tác Playlist

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)  # Tự động gán playlist cho user tạo nó

class PlaylistSongViewSet(viewsets.ModelViewSet):
    queryset = PlaylistSong.objects.all()
    serializer_class = PlaylistSongSerializer
    permission_classes = [permissions.IsAuthenticated]  # Chỉ user đăng nhập mới có thể thêm bài hát vào playlist
