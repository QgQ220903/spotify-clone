from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
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
    filterset_fields = ['name']

class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer
    filterset_fields = ['title', 'artist__name']

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



class PlaylistViewSet(viewsets.ModelViewSet):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer
    
    def get_queryset(self):
        return Playlist.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class FavoriteView(generics.RetrieveUpdateAPIView):
    serializer_class = FavoriteSerializer
    
    def get_object(self):
        user = self.request.user
        favorite, created = Favorite.objects.get_or_create(user=user)
        return favorite
    
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