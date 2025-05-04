import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Typography,
  Box,
  Button
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';

const Navbar = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleLogout = () => {
    handleCloseMenu();
    navigate('/login');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0',
        color: '#333',
        zIndex: 1201, // ensure above drawer/sidebar
      }}
    >
      <Toolbar sx={{ justifyContent: 'flex-end', minHeight: 64, px: 3 }}>
        {/* Profile Dropdown */}
        <Button
          onClick={handleOpenMenu}
          sx={{
            textTransform: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 0.5,
            borderRadius: 2,
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#1DB954', fontWeight: 500 }}>
            AU
          </Avatar>
          <ArrowDropDownIcon
            sx={{
              transition: 'transform 0.2s',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              color: '#666',
            }}
          />
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleCloseMenu}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            elevation: 4,
            sx: { width: 240, mt: 1 },
          }}
        >
          <MenuItem disabled>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ width: 40, height: 40, bgcolor: '#1DB954' }}>AU</Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Admin User
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  admin@example.com
                </Typography>
              </Box>
            </Box>
          </MenuItem>

          <Divider sx={{ my: 1 }} />

          <MenuItem onClick={handleCloseMenu}>
            <SettingsIcon fontSize="small" sx={{ mr: 1, color: '#666' }} />
            Settings
          </MenuItem>

          <Divider sx={{ my: 1 }} />

          <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
            Log out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
