from django.db import models
from accounts.models import CustomUser

class Artist(models.Model):
    name = models.CharField(max_length=255)
    bio = models.TextField(blank=True)
    image = models.ImageField(upload_to='artists/', blank=True, null=True)

    def __str__(self):
        return self.name

class Album(models.Model):
    title = models.CharField(max_length=255)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name='albums')
    release_date = models.DateField()
    cover_image = models.ImageField(upload_to='albums/', blank=True, null=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='albums', null=True, blank=True)

    def __str__(self):
        return f"{self.title} - {self.artist.name}"

class Song(models.Model):
    title = models.CharField(max_length=255)
    album = models.ForeignKey(Album, on_delete=models.CASCADE, related_name='songs', null=True, blank=True)
    artists = models.ManyToManyField(Artist, related_name='songs')
    duration = models.DurationField()
    audio_file = models.FileField(upload_to='songs/audio/')
    video_file = models.FileField(upload_to='songs/video/', blank=True, null=True)
    thumbnail = models.ImageField(upload_to='songs/thumbnails/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    plays_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title

class Playlist(models.Model):
    name = models.CharField(max_length=255)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='playlists')
    songs = models.ManyToManyField(Song, related_name='playlists', blank=True)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Favorite(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='favorites')
    songs = models.ManyToManyField(Song, related_name='favorited_by', blank=True)
    albums = models.ManyToManyField(Album, related_name='favorited_by', blank=True)

    def __str__(self):
        return f"{self.user.username}'s favorites"
