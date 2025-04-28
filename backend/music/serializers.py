from rest_framework import serializers
from .models import Artist, Album, Song, Playlist, Favorite
from accounts.serializers import UserSerializer

class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = '__all__'

class AlbumSerializer(serializers.ModelSerializer):
    artist = serializers.PrimaryKeyRelatedField(queryset=Artist.objects.all())

    class Meta:
        model = Album
        fields = '__all__'

class SongSerializer(serializers.ModelSerializer):
    artists = serializers.PrimaryKeyRelatedField(queryset=Artist.objects.all(), many=True)
    album = serializers.PrimaryKeyRelatedField(queryset=Album.objects.all(), allow_null=True)
    audio_file_url = serializers.SerializerMethodField()

    class Meta:
        model = Song
        fields = '__all__'
    def get_audio_file_url(self, obj):
        request = self.context.get('request')
        if obj.audio_file and hasattr(obj.audio_file, 'url'):
            return request.build_absolute_uri(obj.audio_file.url)
        return None

class PlaylistSerializer(serializers.ModelSerializer):
    songs = serializers.PrimaryKeyRelatedField(queryset=Song.objects.all(), many=True, required=False)
    class Meta:
        model = Playlist
        fields = '__all__'
        read_only_fields = ('user',)

class FavoriteSerializer(serializers.ModelSerializer):
    songs = serializers.PrimaryKeyRelatedField(queryset=Song.objects.all(), many=True, required=False)
    albums = serializers.PrimaryKeyRelatedField(queryset=Album.objects.all(), many=True, required=False)

    class Meta:
        model = Favorite
        fields = '__all__'
        read_only_fields = ('user',)