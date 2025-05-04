import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Avatar, Grid, TextField, InputAdornment,
  Icon, styled, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { Album as AlbumIcon, Search, Edit, Delete, Add } from '@mui/icons-material';
import AlbumService from '../../services/AlbumService';
import ArtistService from '../../services/ArtistService';

const spotifyGreen = '#1DB954';
const spotifyBlack = '#191414';
const spotifyWhite = '#FFFFFF';
const spotifyGray = '#b3b3b3';

const AlbumCard = styled(Box)(({ theme }) => ({
  backgroundColor: spotifyWhite,
  borderRadius: 8,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const Albums = () => {
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAlbums, setFilteredAlbums] = useState([]);
  const [apiError, setApiError] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAlbum, setCurrentAlbum] = useState(null);

  const [form, setForm] = useState({
    title: '',
    release_date: '',
    artist: '',
    cover_image: null,
  });

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const res = await AlbumService.getAll();
      const data = res.data;
      setAlbums(data.results || []);
    } catch (error) {
      console.error('Fetch error:', error);
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtists = async () => {
    try {
      const res = await ArtistService.getAll();
      setArtists(res.data.results || []);
    } catch (e) {
      console.error('Fetch artists failed');
    }
  };

  useEffect(() => {
    fetchAlbums();
    fetchArtists();
  }, []);

  useEffect(() => {
    const results = albums.filter(album =>
      album.title?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      album.artist?.name?.toLowerCase()?.includes(searchTerm.toLowerCase())
    );
    setFilteredAlbums(results);
  }, [searchTerm, albums]);

  const openAddDialog = () => {
    setIsEditing(false);
    setForm({ title: '', release_date: '', artist: '', cover_image: null });
    setOpenDialog(true);
  };

  const openEditDialog = (album) => {
    setIsEditing(true);
    setCurrentAlbum(album);
    setForm({
      title: album.title,
      release_date: album.release_date,
      artist: album.artist?.id,
      cover_image: null,
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this album?')) {
      try {
        await AlbumService.delete(id);
        fetchAlbums();
      } catch (e) {
        alert('Delete failed');
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('release_date', form.release_date);
    formData.append('artist_id', parseInt(form.artist));
    if (form.cover_image) {
      formData.append('cover_image', form.cover_image);
    }
    console.log([...formData.entries()]);

    try {
      if (isEditing && currentAlbum) {
        await AlbumService.update(currentAlbum.id, formData);
      } else {
        await AlbumService.create(formData);
      }
      setOpenDialog(false);
      fetchAlbums();
    } catch (error) {
      console.error('Submit failed', error);
      alert('Submit failed');
    }
  };

  return (
    <Box sx={{ background: spotifyWhite, minHeight: '100vh', p: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <AlbumIcon sx={{ mr: 1, color: spotifyGreen, fontSize: 30 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: spotifyGreen }}>Albums</Typography>
        </Box>
        <Button
          startIcon={<Add />}
          variant="contained"
          sx={{ backgroundColor: spotifyGreen, '&:hover': { backgroundColor: '#17a44d' } }}
          onClick={openAddDialog}
        >
          Add Album
        </Button>
      </Box>

      <TextField
        fullWidth
        label="Search albums or artists"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: spotifyGray }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {loading ? (
        <Typography color={spotifyGray}>Loading albums...</Typography>
      ) : apiError ? (
        <Typography color="error">{apiError}</Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredAlbums.length > 0 ? (
            filteredAlbums.map((album) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={album.id}>
                <AlbumCard>
                  <Avatar
                    src={album.cover_image}
                    alt={album.title}
                    sx={{ width: 120, height: 120, mb: 1, backgroundColor: spotifyGray }}
                  >
                    <AlbumIcon sx={{ fontSize: 60, color: spotifyWhite }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: spotifyBlack, mb: 0.5 }}>
                    {album.title}
                  </Typography>
                  <Typography variant="subtitle2" color={spotifyGray}>
                    {album.artist?.name || 'Unknown Artist'}
                  </Typography>
                  <Typography variant="caption" color={spotifyGray}>
                    Released: {album.release_date}
                  </Typography>

                  <Box display="flex" gap={1} mt={2}>
                    <Button size="small" onClick={() => openEditDialog(album)} startIcon={<Edit />} sx={{ color: spotifyGreen }}>
                      Edit
                    </Button>
                    <Button size="small" color="error" onClick={() => handleDelete(album.id)} startIcon={<Delete />}>
                      Delete
                    </Button>
                  </Box>
                </AlbumCard>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography color={spotifyGray} textAlign="center">
                {searchTerm ? 'No albums found matching your search.' : 'No albums available.'}
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>{isEditing ? 'Edit Album' : 'Add Album'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="dense" label="Title" name="title" value={form.title} onChange={handleFormChange} />
          <TextField
            fullWidth margin="dense" name="release_date"
            label="Release Date" type="date" InputLabelProps={{ shrink: true }}
            value={form.release_date} onChange={handleFormChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Artist</InputLabel>
            <Select name="artist" value={form.artist} onChange={handleFormChange} label="Artist">
              {artists.map((artist) => (
                <MenuItem key={artist.id} value={artist.id}>{artist.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth margin="dense" name="cover_image" type="file"
            inputProps={{ accept: 'image/*' }} onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: spotifyGreen, '&:hover': { backgroundColor: '#17a44d' } }}
            onClick={handleSubmit}
          >
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Albums;
