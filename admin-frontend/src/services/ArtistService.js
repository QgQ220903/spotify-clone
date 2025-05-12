// src/services/ArtistService.js
import axios from "./api";

const ArtistService = {
  getAll: (page = 1) => axios.get(`music/artists/?page=${page}`),
  create: (data) => axios.post("music/artists/", data),
  update: (id, data) => axios.put(`music/artists/${id}/`, data),
  delete: (id) => axios.delete(`music/artists/${id}/`),
  search: (term) => axios.get(`music/artists/?search=${term}`),
};

export default ArtistService;
