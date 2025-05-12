import React, { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography, IconButton, Avatar, InputAdornment,
  Pagination
} from '@mui/material';
import { Add, Delete, Edit, Search } from '@mui/icons-material';
import ArtistService from '../../services/ArtistService';

// Define Spotify-like light green color
const spotifyGreenLight = '#1DB954';
const spotifyGreen = '#1DB954';
const spotifyBlack = '#191414';
const spotifyWhite = '#FFFFFF';
const spotifyGray = '#b3b3b3';

const Artists = () => {
  const [artists, setArtists] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', image: null });
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchArtists = async () => {
    try {
      const res = await ArtistService.getAll(page);
      setArtists(res.data.results);
      // Tính tổng số trang dựa trên count từ API
      setTotalPages(Math.ceil(res.data.count / 10)); // Giả sử mỗi trang có 10 items
    } catch (err) {
      console.error('Failed to fetch artists', err);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, [page]); // Thêm page vào dependencies

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  useEffect(() => {
    // Filter artists based on searchTerm
    const results = artists.filter(artist =>
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.bio.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredArtists(results);
  }, [searchTerm, artists]);

  const handleOpen = (artist = null) => {
    if (artist) {
      setForm({ name: artist.name, bio: artist.bio, image: null });
      setPreview(artist.image || null);
      setEditingId(artist.id);
    } else {
      setForm({ name: '', bio: '', image: null });
      setPreview(null);
      setEditingId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ name: '', bio: '', image: null });
    setPreview(null);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      setForm(prev => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    } else if (name === 'searchTerm') {
      setSearchTerm(value);
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('bio', form.bio);
    if (form.image) formData.append('image', form.image);

    try {
      if (editingId) {
        await ArtistService.update(editingId, formData);
      } else {
        await ArtistService.create(formData);
      }
      fetchArtists();
      handleClose();
    } catch (err) {
      console.error('Error saving artist:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this artist?')) return;
    try {
      await ArtistService.delete(id);
      fetchArtists();
    } catch (err) {
      console.error('Error deleting artist:', err);
    }
  };

  return (
    <Box p={4} sx={{ backgroundColor: spotifyWhite, minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: spotifyGreen }}>Artists</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{ backgroundColor: spotifyGreenLight, color: spotifyWhite, '&:hover': { backgroundColor: '#178c42' } }}>
          Add Artist
        </Button>
      </Box>

      <TextField
        fullWidth
        label="Search artists"
        name="searchTerm"
        value={searchTerm}
        onChange={handleChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: spotifyBlack }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <TableContainer sx={{ backgroundColor: spotifyWhite }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#e0e0e0' }}>
            <TableRow>
              <TableCell sx={{ color: spotifyBlack }}>Avatar</TableCell>
              <TableCell sx={{ color: spotifyBlack }}>Name</TableCell>
              <TableCell sx={{ color: spotifyBlack }}>Bio</TableCell>
              <TableCell align="right" sx={{ color: spotifyBlack }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredArtists.map((artist) => (
              <TableRow key={artist.id}>
                <TableCell>
                  <Avatar src={artist.image} alt={artist.name} />
                </TableCell>
                <TableCell sx={{ color: spotifyBlack }}>{artist.name}</TableCell>
                <TableCell sx={{ color: spotifyBlack }}>{artist.bio}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(artist)} sx={{ color: spotifyBlack }}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(artist.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredArtists.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', color: spotifyBlack }}>
                  No artists found matching the search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Thêm phân trang */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          sx={{
            '& .MuiPaginationItem-root': {
              color: spotifyBlack,
            },
            '& .Mui-selected': {
              backgroundColor: spotifyGreenLight,
              color: spotifyWhite,
              '&:hover': {
                backgroundColor: '#178c42',
              },
            },
          }}
        />
      </Box>

      {/* Dialog for Create/Edit */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: spotifyBlack, backgroundColor: '#f0f0f0' }}>{editingId ? 'Edit Artist' : 'Add Artist'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Bio"
            name="bio"
            multiline
            rows={4}
            value={form.bio}
            onChange={handleChange}
          />
          <Button component="label" variant="outlined" sx={{ mt: 2, color: spotifyBlack, borderColor: spotifyBlack, '&:hover': { borderColor: spotifyGreenLight, color: spotifyGreenLight } }}>
            Upload Image
            <input type="file" name="image" accept="image/*" hidden onChange={handleChange} />
          </Button>
          {preview && (
            <Box mt={2}>
              <Typography variant="body2" sx={{ color: spotifyBlack }}>Preview:</Typography>
              <img src={preview} alt="preview" height="100" style={{ borderRadius: '4px' }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#f0f0f0' }}>
          <Button onClick={handleClose} sx={{ color: spotifyBlack, '&:hover': { color: spotifyGreenLight } }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ backgroundColor: spotifyGreenLight, color: spotifyWhite, '&:hover': { backgroundColor: '#178c42' } }}>
            {editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Artists;