import axiosInstance from "../api/axiosInstance";

// Tạo playlist mới
export const createPlaylist = async (playlistData) => {
  try {
    const response = await axiosInstance.post("/music/playlists/", {
      ...playlistData,
      user: localStorage.getItem("userId"),
      is_public: true,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo playlist:", error);
    throw error;
  }
};

// Lấy tất cả playlist của người dùng hiện tại
export const getUserPlaylists = async () => {
  try {
    // Lấy token từ localStorage
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("Không tìm thấy token xác thực");
    }

    // Lấy userId từ localStorage
    const userId = localStorage.getItem("userId");
    if (!userId) {
      throw new Error("Không tìm thấy userId");
    }

    // Thêm token vào header
    const response = await axiosInstance.get(`/music/playlists/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error("Token hết hạn hoặc không hợp lệ");
      // Có thể thêm logic refresh token ở đây
      localStorage.removeItem("accessToken"); // Xóa token không hợp lệ
    }
    console.error("Lỗi khi lấy danh sách playlist:", error);
    return []; // Trả về mảng rỗng khi có lỗi
  }
};

// Cập nhật playlist
export const updatePlaylist = async (playlistId, updateData) => {
  try {
    const response = await axiosInstance.patch(
      `/music/playlists/${playlistId}/`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật playlist:", error);
    throw error;
  }
};

// Xóa playlist
export const deletePlaylist = async (playlistId) => {
  try {
    await axiosInstance.delete(`/music/playlists/${playlistId}/`);
    return true;
  } catch (error) {
    console.error("Lỗi khi xóa playlist:", error);
    throw error;
  }
};

// Thêm bài hát vào playlist
export const addSongToPlaylist = async (playlistId, songId) => {
  try {
    const playlist = await axiosInstance.get(`/music/playlists/${playlistId}/`);
    const updatedSongs = [...playlist.data.songs, songId];
    const response = await axiosInstance.patch(
      `/music/playlists/${playlistId}/`,
      {
        songs: updatedSongs,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm bài hát vào playlist:", error);
    throw error;
  }
};

// Xóa bài hát khỏi playlist
export const removeSongFromPlaylist = async (playlistId, songId) => {
  try {
    const playlist = await axiosInstance.get(`/music/playlists/${playlistId}/`);
    const updatedSongs = playlist.data.songs.filter((id) => id !== songId);
    const response = await axiosInstance.patch(
      `/music/playlists/${playlistId}/`,
      {
        songs: updatedSongs,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa bài hát khỏi playlist:", error);
    throw error;
  }
};
