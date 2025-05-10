import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/users"; // Thay đổi theo URL backend của bạn

export const FriendService = {
  searchUsers: async (query) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${API_BASE_URL}/friends/search_users/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { q: query },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tìm kiếm người dùng:", error);
      return [];
    }
  },

  sendFriendRequest: async (friendId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${API_BASE_URL}/friends/send_request/`,
        { friend_id: friendId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi gửi lời mời kết bạn:", error);
      throw error;
    }
  },

  getFriendRequests: async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${API_BASE_URL}/friends/get_requests/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy lời mời kết bạn:", error);
      return { count: 0, results: [] };
    }
  },

  acceptFriendRequest: async (requestId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${API_BASE_URL}/friends/${requestId}/accept_request/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi chấp nhận lời mời kết bạn:", error);
      throw error;
    }
  },

  checkFriendship: async (userId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${API_BASE_URL}/friends/check/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { user_id: userId },
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái bạn bè:", error);
      return { is_friend: false };
    }
  },

  getFriends: async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${API_BASE_URL}/friends/list_friends/`,
        {
          // Sửa endpoint
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data; // Trả về trực tiếp response.data
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bạn bè:", error);
      return { count: 0, results: [] }; // Giữ cấu trúc giống backend
    }
  },
};
