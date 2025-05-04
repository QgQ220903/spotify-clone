import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography, IconButton, InputAdornment, MenuItem,
  Select, FormControl, InputLabel, OutlinedInput, Chip
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import SongService from '../../services/SongService';
import ArtistService from '../../services/ArtistService';
import AlbumService from '../../services/AlbumService';

const spotifyGreen = '#1DB954';
const spotifyBlack = '#191414';
const spotifyWhite = '#FFFFFF';
const spotifyGray = '#b3b3b3';


const SongList = () => {
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [form, setForm] = useState({
    title: '',
    album: '',
    artists: [],
    duration: '',
    audio_file: null,
    video_file: null,
    thumbnail: null,
    plays_count: 0,
  });

  const fetchData = async () => {
    const [songRes, artistRes, albumRes] = await Promise.all([
      SongService.getAll(),
      ArtistService.getAll(),
      AlbumService.getAll()
    ]);
    setSongs(songRes.data.results);
    setArtists(artistRes.data.results);
    setAlbums(albumRes.data.results);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = (song = null) => {
    if (song) {
      setForm({
        title: song.title,
        album: song.album?.id || '', // nếu album là object thì lấy id
        artists: song.artists?.map(artist => artist.id) || [],
        duration: song.duration,
        audio_file: null,
        video_file: null,
        thumbnail: null,
        plays_count: song.plays_count || 0,
      });
      setEditingSong(song);
    } else {
      setForm({
        title: '',
        album: '',
        artists: [],
        duration: '',
        audio_file: null,
        video_file: null,
        thumbnail: null,
        plays_count: 0,
      });
      setEditingSong(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingSong(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setForm(prev => ({ ...prev, [name]: files[0] }));
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('duration', form.duration);
    formData.append('plays_count', form.plays_count);
    if (form.album) formData.append('album_id', form.album);
    console.log(artists)
    form.artists.forEach(id => formData.append('artists_ids', id));
    if (form.audio_file) formData.append('audio_file', form.audio_file);
    if (form.video_file) formData.append('video_file', form.video_file);
    if (form.thumbnail) formData.append('thumbnail', form.thumbnail);

    try {
      if (editingSong) {
        await SongService.update(editingSong.id, formData);
      } else {
        await SongService.create(formData);
      }
      fetchData();
      handleClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xoá bài hát này?')) {
      await SongService.delete(id);
      fetchData();
    }
  };
  console.log(songs);
  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box p={4} sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: spotifyGreen }}>Songs</Typography>
          {/* <Typography variant="body2" color="textSecondary">Thêm, sửa, xoá bài hát</Typography> */}
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{ backgroundColor: '#1DB954' }}>
          Thêm bài hát
        </Button>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        label="Tìm kiếm bài hát"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <TableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: '#e0e0e0' }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Nghệ sĩ</TableCell>
              <TableCell>Thời lượng</TableCell>
              <TableCell>Lượt nghe</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSongs.map((song, index) => (
              <TableRow key={song.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{song.title}</TableCell>
                <TableCell>{song.artists.map(a => a.name).join(', ')}</TableCell>
                <TableCell>{song.duration}</TableCell>
                <TableCell>{song.plays_count.toLocaleString()}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(song)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(song.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredSongs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">Không tìm thấy bài hát</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editingSong ? 'Sửa bài hát' : 'Thêm bài hát'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="normal" label="Tên bài hát" name="title" value={form.title} onChange={handleChange} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Nghệ sĩ</InputLabel>
            <Select
              multiple
              name="artists"
              value={form.artists}
              onChange={handleChange}
              input={<OutlinedInput label="Nghệ sĩ" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((id) => {
                    const artist = artists.find(a => a.id === id);
                    return <Chip key={id} label={artist?.name || id} />;
                  })}
                </Box>
              )}
            >
              {artists.map((artist) => (
                <MenuItem key={artist.id} value={artist.id}>
                  {artist.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Album</InputLabel>
            <Select name="album" value={form.album} onChange={handleChange} displayEmpty>
              <MenuItem value=""></MenuItem>
              {albums.map(album => (
                <MenuItem key={album.id} value={album.id}>{album.title}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField fullWidth margin="normal" label="Thời lượng (HH:MM:SS)" name="duration" value={form.duration} onChange={handleChange} />
          <TextField fullWidth margin="normal" label="Lượt nghe" name="plays_count" type="number" value={form.plays_count} onChange={handleChange} />

          <Typography mt={2}>Tập tin:</Typography>
          <Button component="label" fullWidth>
            File âm thanh
            <input type="file" name="audio_file" hidden onChange={handleFileChange} />
          </Button>
          <Button component="label" fullWidth>
            File video (tuỳ chọn)
            <input type="file" name="video_file" hidden onChange={handleFileChange} />
          </Button>
          <Button component="label" fullWidth>
            Hình đại diện (tuỳ chọn)
            <input type="file" name="thumbnail" hidden onChange={handleFileChange} />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Huỷ</Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ backgroundColor: '#1DB954' }}>
            {editingSong ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SongList;
