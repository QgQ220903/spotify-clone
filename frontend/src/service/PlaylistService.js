// src/services/albumService.js
import axios from "axios";
import axiosInstance from "../api/axiosInstance";

// src/service/albumService.js
export const createPlaylistAPI = async (obj) => {
  try { const accessToken = localStorage.getItem('accessToken');

    const response = await axiosInstance.post("/music/playlists/",obj, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return response;
  } catch (error) {
    console.error("Error fetching all albums:", error);
    return [];
  }
};

export const putPlaylistAPI = async (id, obj) => {
  try {
    const accessToken = localStorage.getItem('accessToken');

    const response = await axios.put(`http://127.0.0.1:8000/api/music/playlists/${id}/`, obj, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return response;
  } catch (error) {
    console.error("Error updating playlist:", error);
    return null;
  }
};
// src/service/songService.js
export const fetchAllPlaylist = async () => {
  try {
    const accessToken = localStorage.getItem('accessToken');

    const response = await axiosInstance.get("/music/playlists/?user_id="+localStorage.getItem('userId'), {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    // Kiểm tra cả response.data.results và response.data
    return response;
  } catch (error) {
    console.error("Error fetching all songs:", error);
    return [];
  }
};




export const getAllSongs = async () => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axiosInstance.get("music/songs/", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response;
  } catch (error) {

    console.error("Error fetching all songs:", error);
    return [];
  }
};

export const fetchAllPlaylistById = async (id) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axiosInstance.get("/music/playlists/"+id+'/', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response;
  } catch (error) {
  console.error("Error fetching all songs:", error);
    return [];
  }
};


export const deletePlaylistAPI = async (id) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axiosInstance.delete("/music/playlists/"+id+'/', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response;
  } catch (error) {
  console.error("Error fetching all songs:", error);
    return [];
  }
};


export const updatePlaylistAPI = async (id,obj) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axiosInstance.put("/music/playlists/"+id+'/',obj, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response;
  } catch (error) {
  console.error("Error fetching all songs:", error);
    return [];
  }
};

