import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/",
});

// Tự động thêm token vào header mỗi khi gọi API
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý khi token hết hạn
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa thử refresh token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Gọi API refresh token
        const refreshToken = localStorage.getItem("refresh_token");
        const response = await axios.post(
          `${originalRequest.baseURL}token/refresh/`,
          {
            refresh: refreshToken,
          }
        );

        // Lưu token mới
        localStorage.setItem("access_token", response.data.access);

        // Thử lại request ban đầu với token mới
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return API(originalRequest);
      } catch (refreshError) {
        // Nếu refresh thất bại, xóa token và chuyển về trang login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
