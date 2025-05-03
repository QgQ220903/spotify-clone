import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/",
});

// Thêm interceptor để tự động gắn token vào header
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Thêm interceptor để xử lý khi token hết hạn
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const response = await axios.post(
          `${API.defaults.baseURL}token/refresh/`,
          {
            refresh: refreshToken,
          }
        );

        localStorage.setItem("access_token", response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return API(originalRequest);
      } catch (error) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
