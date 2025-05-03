import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  Avatar,
  Paper,
  LinearProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  InputAdornment,
  Alert,
  Snackbar,
  styled
} from '@mui/material';
import { Add, Edit, Delete, Search, Person } from '@mui/icons-material';
import UserService from '../../services/UserService';

const spotifyGreen = '#1DB954';
const spotifyBlack = '#191414';
const spotifyWhite = '#FFFFFF';
const spotifyGray = '#b3b3b3';

const SpotifyButton = styled(Button)({
  background: spotifyGreen,
  color: 'white',
  borderRadius: 50,
  padding: '8px 24px',
  textTransform: 'none',
  fontWeight: 'bold',
  '&:hover': {
    background: '#1ED760',
  },
});

const SpotifyTable = styled(Table)({
  '& .MuiTableCell-root': {
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
  },
});

const SpotifyDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: '#f8f8f8',
    backgroundImage: 'none',
    borderRadius: 12,
  },
  '& .MuiInputBase-root': {
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#ddd',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: spotifyGreen,
    },
  },
}));

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    user_type: 'listener',
    bio: ''
  });
  const [stats, setStats] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        UserService.getAll(),
        UserService.getStats()
      ]);
      setUsers(usersRes);
      setStats(statsRes);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = (user = null) => {
    if (user) {
      setForm({
        username: user.username,
        email: user.email,
        password: '',
        user_type: user.user_type,
        bio: user.bio || ''
      });
      setEditingUser(user);
    } else {
      setForm({
        username: '',
        email: '',
        password: '',
        user_type: 'listener',
        bio: ''
      });
      setEditingUser(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await UserService.update(editingUser.id, form);
        setSuccess('User updated successfully');
      } else {
        await UserService.create(form);
        setSuccess('User created successfully');
      }
      fetchData();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving user');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await UserService.delete(id);
        setSuccess('User deleted successfully');
        fetchData();
      } catch (err) {
        setError('Failed to delete user');
        console.error(err);
      }
    }
  };

  const handleSetUserType = async (userId, userType) => {
    try {
      await UserService.setUserType(userId, userType);
      setSuccess('User type updated successfully');
      fetchData();
    } catch (err) {
      setError('Failed to update user type');
      console.error(err);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ backgroundColor: spotifyWhite, minHeight: '100vh', p: 4 }}>
      {/* Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>

      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: spotifyGreen }}>
            User Management
          </Typography>
          {stats && (
            <Typography variant="body2" sx={{ color: spotifyGray }}>
              {stats.total_users} users • {stats.admin_users} admins • {stats.active_users} active
            </Typography>
          )}
        </Box>
        <SpotifyButton startIcon={<Add />} onClick={() => handleOpen()}>
          Add User
        </SpotifyButton>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        variant="outlined"
        label="Search users"
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

      {/* User Table */}
      {loading ? (
        <LinearProgress sx={{
          backgroundColor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: spotifyGreen
          }
        }} />
      ) : (
        <Paper sx={{
          backgroundColor: 'white',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}>
          <TableContainer>
            <SpotifyTable>
              <TableHead sx={{ backgroundColor: '#f1f1f1' }}>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Bio</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(29, 185, 84, 0.05)'
                      }
                    }}
                  >
                    <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          mr: 2,
                          bgcolor: '#282828',
                          '& .MuiAvatar-img': {
                            objectFit: 'cover'
                          }
                        }}
                        src={user.profile_pic}
                      >
                        <Person />
                      </Avatar>
                      {user.username}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={user.user_type}
                          onChange={(e) => handleSetUserType(user.id, e.target.value)}
                          sx={{
                            '& .MuiSelect-select': {
                              py: 1,
                              fontSize: '0.875rem'
                            }
                          }}
                        >
                          <MenuItem value="listener">Listener</MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      {user.bio ? `${user.bio.substring(0, 30)}${user.bio.length > 30 ? '...' : ''}` : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleOpen(user)}
                        sx={{
                          color: '#666',
                          '&:hover': {
                            color: spotifyGreen,
                            backgroundColor: 'rgba(29, 185, 84, 0.1)'
                          }
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(user.id)}
                        sx={{
                          color: '#666',
                          '&:hover': {
                            color: '#ff4444',
                            backgroundColor: 'rgba(255, 68, 68, 0.1)'
                          }
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No users found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </SpotifyTable>
          </TableContainer>
        </Paper>
      )}

      {/* Add/Edit User Dialog */}
      <SpotifyDialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required={!editingUser}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>User Type</InputLabel>
            <Select
              name="user_type"
              value={form.user_type}
              label="User Type"
              onChange={handleChange}
              required
            >
              <MenuItem value="listener">Listener</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Bio"
            name="bio"
            multiline
            rows={3}
            value={form.bio}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleClose}
            sx={{
              color: '#666',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)'
              }
            }}
          >
            Cancel
          </Button>
          <SpotifyButton onClick={handleSubmit}>
            {editingUser ? 'Save Changes' : 'Create User'}
          </SpotifyButton>
        </DialogActions>
      </SpotifyDialog>
    </Box>
  );
};

export default UserList;