// src/services/albumService.js
import axios from "axios";

// src/service/albumService.js
export const fetchAllAlbums = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:8000/api/music/albums/");
    // Kiểm tra cả response.data.results và response.data
    return response.data.results || response.data || [];
  } catch (error) {
    console.error("Error fetching all albums:", error);
    return [];
  }
};

// src/service/songService.js
export const fetchAllSongs = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:8000/api/music/songs/");
    // Kiểm tra cả response.data.results và response.data
    return response.data.results || response.data || [];
  } catch (error) {
    console.error("Error fetching all songs:", error);
    return [];
  }
};
