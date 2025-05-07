from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated # Comment hoặc xóa dòng này
from django.shortcuts import get_object_or_404

from .models import Artist, Album, Song, Playlist, Favorite
from .serializers import (
    ArtistSerializer, AlbumSerializer, SongSerializer,
    PlaylistSerializer, FavoriteSerializer
)
from django.contrib.auth import get_user_model
from django.http import FileResponse, HttpResponse
from django.views.decorators.http import require_GET
from rest_framework.decorators import action
User = get_user_model()
@require_GET
def serve_video(request, video_path):
    # Đường dẫn đầy đủ tới file
    full_path = os.path.join(settings.MEDIA_ROOT, video_path)
    
    if not os.path.exists(full_path):
        return HttpResponse(status=404)

    response = FileResponse(open(full_path, 'rb'))
    response['Content-Type'] = 'video/mp4'
    response['Content-Disposition'] = f'attachment; filename="{os.path.basename(full_path)}"'
    return response
class ArtistViewSet(viewsets.ModelViewSet):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer
    filterset_fields = ['name']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer
    filterset_fields = ['title', 'artist__name']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    filterset_fields = ['title', 'artists__name', 'album__title']

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.plays_count += 1
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class PlaylistViewSet(viewsets.ModelViewSet):
    serializer_class = PlaylistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Kiểm tra xem request có phải từ admin frontend không
        is_admin_frontend = self.request.headers.get('X-Admin-Frontend') == 'true'
        
        # Nếu là admin và request từ admin frontend
        if user.user_type == 'admin' and is_admin_frontend:
            return Playlist.objects.all()
        # Nếu là user thường hoặc admin truy cập từ frontend thông thường
        return Playlist.objects.filter(user=user)

    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>[^/.]+)')
    def by_user(self, request, user_id=None):
        user = request.user
        is_admin_frontend = self.request.headers.get('X-Admin-Frontend') == 'true'

        if not user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=401)

        # Chỉ admin từ admin frontend mới có thể xem playlist của người khác
        if user.user_type == 'admin' and is_admin_frontend:
            playlists = Playlist.objects.filter(user__id=user_id)
        else:
            # User thường chỉ có thể xem playlist của chính mình
            if str(user.id) != user_id:
                return Response({'detail': 'Permission denied.'}, status=403)
            playlists = Playlist.objects.filter(user__id=user_id)

        serializer = self.get_serializer(playlists, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=self.request.user) # Vẫn giữ việc gán user khi tạo
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class FavoriteView(generics.RetrieveUpdateAPIView):
    serializer_class = FavoriteSerializer
    # permission_classes = [IsAuthenticated] # Comment hoặc xóa dòng này

    def get_object(self):
        if Favorite.objects.exists():
            return Favorite.objects.first()
        else:
            return Favorite.objects.create()