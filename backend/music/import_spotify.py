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
from music.models import Song, Album
from music.get_token import get_spotify_token

# Lấy token từ Spotify
ACCESS_TOKEN = get_spotify_token()

def get_album_tracks(album_id):
    """Lấy danh sách bài hát từ album trên Spotify."""
    url = f"https://api.spotify.com/v1/albums/{album_id}/tracks"
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()["items"]
    else:
        print("Lỗi khi lấy danh sách bài hát:", response.json())
        return []

def get_album_details(album_id):
    """Lấy thông tin album từ Spotify và lưu vào database."""
    url = f"https://api.spotify.com/v1/albums/{album_id}"
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}

    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        
        # Kiểm tra xem album đã tồn tại chưa
        album, created = Album.objects.get_or_create(
            name=data["name"],
            defaults={
                "artist": ", ".join(artist["name"] for artist in data["artists"]),
                "cover_image": data["images"][0]["url"] if data["images"] else None
            }
        )

        if created:
            print(f"📀 Đã thêm album: {album.name} - {album.artist}")
        
        # Lấy danh sách bài hát từ album
        tracks = get_album_tracks(album_id)
        
        for track in tracks:
          spotify_id = track.get("id", "").strip()  # Lấy ID của bài hát từ API
    
          if not spotify_id:  # Nếu ID rỗng, bỏ qua bài hát này
            print(f"⚠️ Bỏ qua bài hát không có ID: {track['name']}")
            continue

          song, created = Song.objects.get_or_create(
            spotify_id=spotify_id,  # Sử dụng ID hợp lệ
            defaults={
              "title": track["name"],
              "artist": ", ".join(artist["name"] for artist in track["artists"]),
              "audio_preview_url": track.get("preview_url"),
              "cover_image": album.cover_image
            }
          )

          if created:
              print(f"🎵 Đã thêm bài hát: {song.title} - {song.artist}")
          else:
              print(f"✅ Bài hát đã tồn tại: {song.title} - {song.artist}")


    else:
        print("Lỗi khi lấy dữ liệu album:", response.json())

if __name__ == "__main__":
    # Thay thế bằng album_id thật
    album_id = "2XtzfMtGt1hyKu5BW4PKGi"
    get_album_details(album_id)