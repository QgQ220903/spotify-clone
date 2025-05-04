import API from "./api";

const AuthService = {
  login: async (username, password) => {
    try {
      const response = await API.post("auth/token/", { username, password });
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  getCurrentUser: async () => {
    try {
      const response = await API.get("me/");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  isAdmin: () => {
    const token = localStorage.getItem("access_token");
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.is_admin;
    } catch (error) {
      return false;
    }
  },
};

export default AuthService;
