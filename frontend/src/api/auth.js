// src/api/auth.js
import axiosInstance from "./axiosInstance";

export const getCurrentUser = async () => {
  const token = localStorage.getItem("accessToken");
  const res = await axiosInstance.get("me/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
