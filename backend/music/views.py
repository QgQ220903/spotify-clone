from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated 
from django.shortcuts import get_object_or_404
<<<<<<< HEAD

=======
from rest_framework.decorators import action
from accounts.permissions import permissions
>>>>>>> duc-playlist
from .models import Artist, Album, Song, Playlist, Favorite
from .serializers import (
    ArtistSerializer, AlbumSerializer, SongSerializer,
    PlaylistSerializer, FavoriteSerializer
)
from django.contrib.auth import get_user_model
from django.http import FileResponse, HttpResponse
from django.views.decorators.http import require_GET
User = get_user_model()
@require_GET
def serve_video(request, video_path):
    # Đường dẫn đầy đủ tới file
    full_path = os.path.join(settings.MEDIA_ROOT, video_path)
    
    if not os.path.exists(full_path):
        return HttpResponse(status=404)

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
    queryset = Playlist.objects.all()

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        if user_id:
            return self.queryset.filter(user_id=user_id)
        return self.queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Xác định user từ request hoặc từ dữ liệu gửi lên
        user = request.user if request.user.is_authenticated else None
        user_id = request.data.get('user')
        
        if not user and not user_id:
            return Response(
                {"detail": "User is required. Either authenticate or provide 'user' in request data."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Nếu có user từ authentication thì ưu tiên dùng
        if user:
            serializer.save(user=user)
        else:
            serializer.save(user_id=user_id)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=['get'], url_path='by-user')
    def get_by_user(self, request):
        """
        API lấy tất cả playlist của một user cụ thể
        URL: /api/playlists/by-user/?user_id=<user_id>
        """
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(

                {"detail": "user_id parameter is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        playlists = Playlist.objects.filter(user_id=user_id)
        serializer = self.get_serializer(playlists, many=True)
        return Response(serializer.data)

class FavoriteView(generics.RetrieveUpdateAPIView):
    serializer_class = FavoriteSerializer
    # permission_classes = [IsAuthenticated] # Comment hoặc xóa dòng này

    def get_object(self):
        if Favorite.objects.exists():
            return Favorite.objects.first()
        else:
            return Favorite.objects.create()