// src/services/albumService.js
import axios from "axios";
import axiosInstance from "../api/axiosInstance";

// src/service/albumService.js
export const createPlaylistAPI = async (obj) => {
  try {
    const response = await axiosInstance.post("/music/playlist/add",obj);
    return response;
  } catch (error) {
    console.error("Error fetching all albums:", error);
    return [];
  }
};

// src/service/songService.js
export const fetchAllPlaylist = async () => {
  try {
    const response = await axiosInstance.get("/music/playlists/?user_id="+localStorage.getItem('userId'));
    // Kiểm tra cả response.data.results và response.data
    return response;
  } catch (error) {
    console.error("Error fetching all songs:", error);
    return [];
  }
};
