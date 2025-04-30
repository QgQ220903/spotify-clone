import axios from 'axios';

// Hàm lấy toàn bộ danh sách bài nhạc
export const fetchAllSongs = async () => {
    try {
        const response = await axios.get('http://127.0.0.1:8000/api/music/songs/');
        return response.data.results || [];  // Sửa: luôn đảm bảo trả về mảng
    } catch (error) {
        console.error('Error fetching all songs:', error);
        return [];
    }
};

// Hàm lấy bài nhạc theo ID
export const fetchSongById = async (id) => {
    try {
        const response = await axios.get(`http://127.0.0.1:8000/api/music/songs/${id}/`);
        return response.data;  // Sửa: API trả 1 object, không cần `.results`
    } catch (error) {
        console.error('Error fetching song by id:', error);
        return null;
    }
};




