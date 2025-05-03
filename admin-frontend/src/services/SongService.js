// src/services/SongService.js
import axios from "./api";

const SongService = {
  getAll: () => axios.get("music/songs/"),
  create: (data) =>
    axios.post("music/songs/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    axios.put(`music/songs/${id}/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => axios.delete(`music/songs/${id}/`),
};

export default SongService;
