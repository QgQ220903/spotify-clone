import axios from 'axios';

export const fetchAllSongs = async () => {
    try {
        const response = await axios.get('http://127.0.0.1:8000/api/music/songs/');
        return response.data.results.map(song => ({
            ...song,
            video_file: song.video_file || null
        }));
    } catch (error) {
        console.error('Error fetching all songs:', error);
        return [];
    }
};

export const fetchSongById = async (id) => {
    try {
        const response = await axios.get(`http://127.0.0.1:8000/api/music/songs/${id}/`);
        return {
            ...response.data,
            video_file: response.data.video_file || null
        };
    } catch (error) {
        console.error('Error fetching song by id:', error);
        return null;
    }
};