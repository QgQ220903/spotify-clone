from django.db import models
from django.contrib.auth.models import User

# Model bài hát
class Song(models.Model):
    spotify_id = models.CharField(max_length=255, unique=True)  # ID của bài hát trên Spotify
    title = models.CharField(max_length=255)
    artist = models.CharField(max_length=255)
    audio_preview_url = models.URLField(null=True, blank=True)  # Chỉ có trường này, không có 'audio_file'
    cover_image = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    def __str__(self):
        return self.title

# Model video âm nhạc (Spotify không hỗ trợ video, nên có thể dùng YouTube API nếu cần)
class Video(models.Model):
    title = models.CharField(max_length=255)
    artist = models.CharField(max_length=255)
    video_url = models.URLField()  # Lưu URL của video từ YouTube hoặc nền tảng khác
    thumbnail = models.URLField(null=True, blank=True)  # URL ảnh bìa video
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

# Model album
class Album(models.Model):
    spotify_id = models.CharField(max_length=255, unique=True, null=True, blank=True)  # Cho phép null
    name = models.CharField(max_length=255)
    artist = models.CharField(max_length=255)
    cover_image = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.name
    
class Playlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Playlist thuộc về một User
    name = models.CharField(max_length=255)  # Tên playlist
    description = models.TextField(null=True, blank=True)  # Mô tả playlist
    cover_image = models.URLField(null=True, blank=True)  # Ảnh bìa playlist
    created_at = models.DateTimeField(auto_now_add=True)  # Ngày tạo

    def __str__(self):
        return f"{self.name} ({self.user.username})"

class PlaylistSong(models.Model):
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name="songs")  # Liên kết playlist
    song = models.ForeignKey(Song, on_delete=models.CASCADE)  # Liên kết bài hát
    added_at = models.DateTimeField(auto_now_add=True)  # Ngày thêm bài hát vào playlist

    class Meta:
        unique_together = ("playlist", "song")  # Đảm bảo không có bài hát trùng trong một playlist

    def __str__(self):
        return f"{self.song.title} trong {self.playlist.name}"

