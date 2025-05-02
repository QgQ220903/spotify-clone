import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api/", // Thay đổi theo domain thực tế nếu khác
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
