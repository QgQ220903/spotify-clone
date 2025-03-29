from rest_framework import serializers
from .models import Song, Video, Album, Playlist, PlaylistSong

class SongSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = '__all__'

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = '__all__'

class AlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = '__all__'

# Serializer cho playlist
class PlaylistSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # Hiển thị tên user thay vì ID
    song_count = serializers.SerializerMethodField()  # Số lượng bài hát trong playlist

    class Meta:
        model = Playlist
        fields = ['id', 'user', 'name', 'description', 'cover_image', 'created_at', 'song_count']

    def get_song_count(self, obj):
        return obj.songs.count()  # Đếm số bài hát trong playlist

# Serializer cho bài hát trong playlist
class PlaylistSongSerializer(serializers.ModelSerializer):
    song = SongSerializer()  # Lồng serializer của Song để hiển thị chi tiết bài hát

    class Meta:
        model = PlaylistSong
        fields = ['id', 'playlist', 'song', 'added_at']
