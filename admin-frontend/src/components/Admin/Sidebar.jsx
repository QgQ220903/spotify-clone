import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider
} from '@mui/material';
import {
  HomeOutlined,
  PersonOutline,
  LibraryMusicOutlined,
  AlbumOutlined,
  FavoriteBorderOutlined,
} from '@mui/icons-material';

const drawerWidth = 240;

const navItems = [
  { to: '/', icon: <HomeOutlined />, label: 'Home' },
  { to: '/users', icon: <PersonOutline />, label: 'Users' },
  { to: '/songs', icon: <LibraryMusicOutlined />, label: 'Songs' },
  { to: '/albums', icon: <AlbumOutlined />, label: 'Albums' },
  { to: '/artists', icon: <FavoriteBorderOutlined />, label: 'Artists' },
];

const Sidebar = () => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#fff',
          color: '#333',
          borderRight: '1px solid #e0e0e0',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <img
          src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png"
          alt="Spotify Logo"
          style={{ height: 32 }}
        />
        <Typography variant="h6" sx={{ color: '#1DB954', marginLeft: 1, fontWeight: 700 }}>
          Admin
        </Typography>
      </Box>

      <List>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {({ isActive }) => (
              <ListItem disablePadding>
                <ListItemButton
                  sx={{
                    backgroundColor: isActive ? '#E8F5E9' : 'transparent',
                    '&:hover': {
                      backgroundColor: '#F1F8E9',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#1DB954' : '#666' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActive ? '600' : '400',
                      color: isActive ? '#1DB954' : 'inherit',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )}
          </NavLink>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <Box sx={{ padding: 2, fontSize: 12, color: '#999' }}>
        <Typography variant="body2">Spotify Admin Panel</Typography>
        <Typography variant="caption">© {new Date().getFullYear()} Spotify AB</Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
