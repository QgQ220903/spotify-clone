import axiosInstance from "../api/axiosInstance";

let ws = null;

const connectWebSocket = () => {
  const token = localStorage.getItem("accessToken");
  if (!ws || ws.readyState === WebSocket.CLOSED) {
    // Thêm token vào URL WebSocket
    ws = new WebSocket(`ws://localhost:8000/ws/chat/?token=${token}`);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Xử lý tin nhắn mới nhận được
      if (typeof ChatService.onMessageReceived === "function") {
        ChatService.onMessageReceived(data);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      // Thử kết nối lại sau 5 giây
      setTimeout(connectWebSocket, 5000);
    };
  }
};

// Thêm vào ChatService
export const ChatService = {
  // Lấy danh sách cuộc trò chuyện
  getConversations: async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.get(
        "/chat/messages/conversations/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách cuộc trò chuyện:", error);
      return [];
    }
  },

  // Lấy tin nhắn của một cuộc trò chuyện
  getMessages: async (userId) => {
    try {
      const currentUserId = parseInt(localStorage.getItem("userId"));
      const token = localStorage.getItem("accessToken"); // Thêm dòng này
      const response = await axiosInstance.get("/chat/messages/", {
        headers: {
          Authorization: `Bearer ${token}`, // Thêm header Authorization
        },
        params: {
          user: userId,
          current_user: currentUserId,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn:", error);
      return { results: [] };
    }
  },

  // Gửi tin nhắn mới
  sendMessage: async (receiverId, content) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.post(
        "/chat/messages/",
        {
          receiver: receiverId,
          content: content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      throw error;
    }
  },

  // Đánh dấu tin nhắn đã đọc
  markAsRead: async (messageId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.patch(
        `/chat/messages/${messageId}/`,
        {
          is_read: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
      throw error;
    }
  },
  connectWebSocket,

  sendMessageWebSocket: (receiverId, content) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          receiver_id: receiverId,
          message: content,
        })
      );
    }
  },

  // Callback để xử lý tin nhắn mới
  onMessageReceived: null,
};
