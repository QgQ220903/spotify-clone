import API from "./api";

const UserService = {
  getAll: async () => {
    const response = await API.get("auth/admin/users/");
    return response.data;
  },

  getStats: async () => {
    const response = await API.get("auth/admin/stats/");
    return response.data;
  },

  // ✅ Tạo user
  create: async (userData) => {
    const response = await API.post("auth/admin/users/", userData);
    return response.data;
  },

  // ✅ Sửa user
  update: async (userId, userData) => {
    const response = await API.put(`auth/admin/users/${userId}/`, userData);
    return response.data;
  },

  // ✅ Xóa user
  delete: async (userId) => {
    const response = await API.delete(`auth/admin/users/${userId}/`);
    return response.data;
  },

  // ✅ Cập nhật user_type (tuỳ chọn – bạn đang dùng riêng cái này)
  setUserType: async (userId, userType) => {
    const response = await API.patch(`auth/admin/users/${userId}/`, {
      user_type: userType,
    });
    return response.data;
  },
};

export default UserService;
