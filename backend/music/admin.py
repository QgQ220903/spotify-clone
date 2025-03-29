from django.contrib import admin
from .models import Song, Video, Album, Playlist, PlaylistSong

admin.site.register(Song)
admin.site.register(Video)
admin.site.register(Album)
admin.site.register(Playlist)
admin.site.register(PlaylistSong)