import API from "./api";

const UserService = {
  getAll: async () => {
    try {
      const response = await API.get("auth/admin/users/");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await API.get(`auth/admin/users/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  create: async (userData) => {
    try {
      const response = await API.post("auth/register/", userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, userData) => {
    try {
      const response = await API.put(`auth/admin/users/${id}/`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await API.delete(`auth/admin/users/${id}/`);
    } catch (error) {
      throw error;
    }
  },

  setUserType: async (userId, userType) => {
    try {
      const response = await API.post(`auth/admin/users/${userId}/set-type/`, {
        user_type: userType,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await API.get("auth/admin/stats/");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default UserService;
