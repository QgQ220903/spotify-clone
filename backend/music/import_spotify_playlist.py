import os
import django
import requests
import sys

# Thêm đường dẫn đến `backend` để import module đúng
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Khởi tạo Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "spotify_clone.settings")
django.setup()

# Import model và hàm lấy token
from music.models import Song, Playlist, PlaylistSong
from music.get_token import get_spotify_token

# Lấy token từ Spotify
ACCESS_TOKEN = get_spotify_token()

def get_playlist_tracks(playlist_id):
    """Lấy danh sách bài hát từ playlist trên Spotify."""
    url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()["items"]
    else:
        print("Lỗi khi lấy danh sách bài hát từ playlist:", response.json())
        return []

def get_playlist_details(playlist_id):
    """Lấy thông tin playlist từ Spotify và lưu vào database."""
    url = f"https://api.spotify.com/v1/playlists/{playlist_id}"
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}

    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        
        # Kiểm tra xem playlist đã tồn tại chưa
        playlist, created = Playlist.objects.get_or_create(
            spotify_id=playlist_id,
            defaults={
                "name": data["name"],
                "description": data.get("description", ""),
                "cover_image": data["images"][0]["url"] if data["images"] else None
            }
        )

        if created:
            print(f"📜 Đã thêm playlist: {playlist.name}")
        else:
            print(f"✅ Playlist đã tồn tại: {playlist.name}")

        # Lấy danh sách bài hát từ playlist
        tracks = get_playlist_tracks(playlist_id)
        
        for item in tracks:
            track = item.get("track")
            if not track:
                continue

            spotify_id = track.get("id", "").strip()
            if not spotify_id:  # Nếu ID rỗng, bỏ qua bài hát này
                print(f"⚠️ Bỏ qua bài hát không có ID: {track.get('name', 'Unknown')}")
                continue

            song, song_created = Song.objects.get_or_create(
                spotify_id=spotify_id,
                defaults={
                    "title": track["name"],
                    "artist": ", ".join(artist["name"] for artist in track["artists"]),
                    "audio_preview_url": track.get("preview_url"),
                    "cover_image": track["album"]["images"][0]["url"] if track["album"]["images"] else None
                }
            )

            if song_created:
                print(f"🎵 Đã thêm bài hát: {song.title} - {song.artist}")
            else:
                print(f"✅ Bài hát đã tồn tại: {song.title} - {song.artist}")

            # Kiểm tra xem bài hát đã có trong playlist chưa
            playlist_song, playlist_song_created = PlaylistSong.objects.get_or_create(
                playlist=playlist,
                song=song
            )

            if playlist_song_created:
                print(f"➕ Đã thêm vào playlist: {song.title}")
            else:
                print(f"⚡ Bài hát đã có trong playlist: {song.title}")

    else:
        print("Lỗi khi lấy dữ liệu playlist:", response.json())

if __name__ == "__main__":
    # Thay thế bằng playlist_id thật
    playlist_id = "37i9dQZF1DXcBWIGoYBM5M"
    get_playlist_details(playlist_id)
