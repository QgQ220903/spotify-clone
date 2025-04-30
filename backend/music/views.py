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

User = get_user_model()

class ArtistViewSet(viewsets.ModelViewSet):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer
    # permission_classes = [IsAuthenticatedOrReadOnly] # Comment hoặc xóa dòng này
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
    # permission_classes = [IsAuthenticatedOrReadOnly] # Comment hoặc xóa dòng này
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
    # permission_classes = [IsAuthenticatedOrReadOnly] # Comment hoặc xóa dòng này
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
    # permission_classes = [IsAuthenticated] # Comment hoặc xóa dòng này

    def get_queryset(self):
        return Playlist.objects.all() # Thay đổi để trả về tất cả playlist

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
        # user = self.request.user # Comment dòng này
        # favorite, created = Favorite.objects.get_or_create(user=user) # Comment dòng này
        # return favorite # Comment dòng này
        # Thay thế bằng cách trả về favorite đầu tiên hoặc tạo mới nếu không có
        if Favorite.objects.exists():
            return Favorite.objects.first()
        else:
            return Favorite.objects.create()

    def post(self, request, *args, **kwargs):
        favorite = self.get_object()
        data = request.data

        if 'song_id' in data:
            song = get_object_or_404(Song, id=data['song_id'])
            if song in favorite.songs.all():
                favorite.songs.remove(song)
                return Response({'status': 'removed'})
            else:
                favorite.songs.add(song)
                return Response({'status': 'added'})

        elif 'album_id' in data:
            album = get_object_or_404(Album, id=data['album_id'])
            if album in favorite.albums.all():
                favorite.albums.remove(album)
                return Response({'status': 'removed'})
            else:
                favorite.albums.add(album)
                return Response({'status': 'added'})

        return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)