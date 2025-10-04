import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AppBar as MuiAppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box, 
  Avatar, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  useTheme
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Logout, 
  Person, 
  Settings, 
  Dashboard as DashboardIcon 
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import StandupHistoryDialog from '../standup/StandupHistoryDialog.jsx';
import { ENABLE_STANDUP_BEFORE_LOGOUT } from '../../config/featureFlags.js';

const AppBar = ({ onMenuClick }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    const role = user?.role?.toLowerCase?.();
    if (ENABLE_STANDUP_BEFORE_LOGOUT && role && role !== 'admin') {
      // Navigate to full-screen standup page
      navigate('/standup-logout');
    } else {
      // Admins logout directly
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      } finally {
        handleClose();
      }
    }
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleSettings = () => {
    navigate('/settings');
    handleClose();
  };

  const handleDashboard = () => {
    navigate('/');
    handleClose();
  };

  return (
    <MuiAppBar 
      position="fixed"
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Project Management System
        </Typography>
        
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
              {user.firstName} {user.lastName}
            </Typography>
            <IconButton
              onClick={handleMenu}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36,
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText
                }}
              >
                {user.firstName?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
        )}
      </Toolbar>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleDashboard}>
          <ListItemIcon>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Dashboard</ListItemText>
        </MenuItem>
        {(user?.role?.toLowerCase?.() === 'admin' || user?.role?.toLowerCase?.() === 'hr') && (
          <MenuItem onClick={() => navigate(user?.role?.toLowerCase?.() === 'admin' ? '/admin/standups' : '/hr/standups')}>
            <ListItemIcon>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>All Standups</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => setHistoryOpen(true)}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>My Standups</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
      <StandupHistoryDialog open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </MuiAppBar>
  );
};

export default AppBar;
