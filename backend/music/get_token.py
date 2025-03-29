import requests
import base64
import os

# Điền CLIENT_ID và CLIENT_SECRET của bạn ở đây
CLIENT_ID = "5a8ef43d06c74114aba05b3a744317fb"
CLIENT_SECRET = "9bc567f5e55d4c0ebdf07d723a1d6c9c"

def get_spotify_token():
    """Lấy access token từ Spotify API."""
    url = "https://accounts.spotify.com/api/token"
    credentials = f"{CLIENT_ID}:{CLIENT_SECRET}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()

    headers = {
        "Authorization": f"Basic {encoded_credentials}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {"grant_type": "client_credentials"}

    response = requests.post(url, headers=headers, data=data)

    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print("Lỗi lấy Access Token:", response.json())
        return None
