// src/services/ArtistService.js
import axios from "./api";

const ArtistService = {
  getAll: () => axios.get("music/artists/"),
  create: (data) => axios.post("music/artists/", data),
  update: (id, data) => axios.put(`music/artists/${id}/`, data),
  delete: (id) => axios.delete(`music/artists/${id}/`),
};

export default ArtistService;
