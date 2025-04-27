import {jwtDecode} from "jwt-decode";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export async function checkAndRefreshToken() {
    const accessToken = localStorage.getItem("access");
    const refreshToken = localStorage.getItem("refresh");

    if (!accessToken) return false;

    try {
        const decoded = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;

        if (decoded.exp > currentTime) {
            // access token còn hạn
            return true;
        }

        // Nếu hết hạn và có refresh token thì gọi refresh
        if (refreshToken) {
            const response = await axios.post(`${API_URL}/token/refresh/`, {
                refresh: refreshToken,
            });

            if (response.status === 200) {
                const newAccessToken = response.data.access;
                const newRefreshToken = response.data.refresh;

                localStorage.setItem("access", newAccessToken);
                localStorage.setItem("refresh", newRefreshToken);

                return true;
            }
        }

        return false; // refresh token không có hoặc lỗi
    } catch (error) {
        console.error("Token error:", error);
        return false;
    }
}
