// src/services/albumService.js
import axios from 'axios';

// Hàm lấy toàn bộ danh sách album
export const fetchAllAlbums = async () => {
    try {
        const response = await axios.get('http://127.0.0.1:8000/api/music/albums/');
        return response.data.results || [];
    } catch (error) {
        console.error('Error fetching all albums:', error);
        return [];
    }
};


// Hàm lấy album theo ID
export const fetchAlbumById = async (id) => {
    try {
        const response = await axios.get(`http://127.0.0.1:8000/api/music/albums/${id}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching album by id:', error);
        return null;
    }
};
