// src/services/AlbumService.js
import axios from "./api";
const AlbumService = {
  getAll: () => axios.get("music/albums/"),
  create: (data) => axios.post("music/albums/", data),
  update: (id, data) => axios.put(`music/albums/${id}/`, data),
  delete: (id) => axios.delete(`music/albums/${id}/`),
};

export default AlbumService;
