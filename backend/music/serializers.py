from rest_framework import serializers
from .models import Artist, Album, Song, Playlist, Favorite
from accounts.serializers import UserSerializer

class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = '__all__'

class AlbumSerializer(serializers.ModelSerializer):
    # Thay đổi từ PrimaryKeyRelatedField sang ArtistSerializer
    artist = ArtistSerializer(read_only=True)
    
    # Thêm trường write_only để xử lý khi tạo/update
    artist_id = serializers.PrimaryKeyRelatedField(
        queryset=Artist.objects.all(),
        source='artist',
        write_only=True
    )
    
    class Meta:
        model = Album
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True}  # Tự động gán user khi tạo
        }

class SongSerializer(serializers.ModelSerializer):
    artists = ArtistSerializer(many=True, read_only=True)
    artists_ids = serializers.PrimaryKeyRelatedField(
        queryset=Artist.objects.all(), 
        many=True,
        source='artists',
        write_only=True
    )
    album = AlbumSerializer(read_only=True)
    album_id = serializers.PrimaryKeyRelatedField(
        queryset=Album.objects.all(),
        source='album',
        write_only=True,
        allow_null=True
    )
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
    # Khi đọc -> Trả đầy đủ thông tin bài hát
    songs = SongSerializer(many=True, read_only=True)

    # Khi ghi -> Chấp nhận mảng ID bài hát
    song_ids = serializers.PrimaryKeyRelatedField(
        queryset=Song.objects.all(),
        many=True,
        required=False,
        write_only=True,
        source='songs'
    )

    class Meta:
        model = Playlist
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True}
        }

    def create(self, validated_data):
        songs_data = validated_data.pop('songs', [])
        playlist = Playlist.objects.create(**validated_data)
        playlist.songs.set(songs_data)
        return playlist

    def update(self, instance, validated_data):
        songs_data = validated_data.pop('songs', None)
        instance = super().update(instance, validated_data)
        if songs_data is not None:
            instance.songs.set(songs_data)
        return instance

class FavoriteSerializer(serializers.ModelSerializer):
    songs = serializers.PrimaryKeyRelatedField(queryset=Song.objects.all(), many=True, required=False)
    albums = serializers.PrimaryKeyRelatedField(queryset=Album.objects.all(), many=True, required=False)

    class Meta:
        model = Favorite
        fields = '__all__'
        read_only_fields = ('user',)