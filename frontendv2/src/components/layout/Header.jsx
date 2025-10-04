import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings,
  Logout,
  Person,
  Dashboard,
  Help,
  Brightness4,
  Brightness7,
  FullscreenExit,
  Fullscreen
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { ENABLE_STANDUP_BEFORE_LOGOUT } from '../../config/featureFlags.js';
import StandupHistoryDialog from '../standup/StandupHistoryDialog.jsx';
import { useNavigate } from 'react-router-dom';

const Header = ({ 
  onMenuClick, 
  title = 'Project Management System',
  showSearch = true,
  onThemeToggle,
  darkMode = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [historyOpen, setHistoryOpen] = useState(false);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = async () => {
    const role = user?.role?.toLowerCase?.();
    if (ENABLE_STANDUP_BEFORE_LOGOUT && role && role !== 'admin') {
      navigate('/standup-logout');
    } else {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      } finally {
        handleProfileMenuClose();
      }
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleProfileMenuClose();
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    handleProfileMenuClose();
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
    handleProfileMenuClose();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      // Implement global search functionality
      console.log('Searching for:', searchValue);
    }
  };

  const getRoleColor = (role) => {
    const roleColors = {
      admin: 'error',
      hr: 'info',
      manager: 'warning',
      developer: 'success',
      tester: 'secondary',
      sales: 'primary',
      marketing: 'primary',
      intern: 'default'
    };
    return roleColors[role?.toLowerCase()] || 'default';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Mock notifications - in real app, fetch from API
  const notifications = [
    { id: 1, title: 'New task assigned', message: 'You have been assigned to Task #123', time: '5 min ago', read: false },
    { id: 2, title: 'Meeting reminder', message: 'Team standup in 15 minutes', time: '10 min ago', read: false },
    { id: 3, title: 'Project update', message: 'Project Alpha milestone completed', time: '1 hour ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
      }}
    >
      <Toolbar>
        {/* Menu Button */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Title */}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ 
            display: { xs: 'none', sm: 'block' },
            fontWeight: 600,
            color: theme.palette.primary.main
          }}
        >
          {title}
        </Typography>

        {/* Search Bar */}
        {showSearch && !isMobile && (
          <Box sx={{ flexGrow: 1, mx: 3, maxWidth: 400 }}>
            <TextField
              size="small"
              placeholder="Search projects, tasks, people..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleSearch}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: theme.palette.action.hover,
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  }
                }
              }}
            />
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* Right side actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Search icon for mobile */}
          {showSearch && isMobile && (
            <IconButton color="inherit">
              <SearchIcon />
            </IconButton>
          )}

          {/* Theme toggle */}
          {onThemeToggle && (
            <Tooltip title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}>
              <IconButton color="inherit" onClick={onThemeToggle}>
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>
          )}

          {/* Fullscreen toggle */}
          <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
            <IconButton color="inherit" onClick={toggleFullscreen}>
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={handleNotificationMenuOpen}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isMobile && user && (
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {user.name || user.username}
                </Typography>
                <Chip
                  label={user.role}
                  size="small"
                  color={getRoleColor(user.role)}
                  variant="outlined"
                  sx={{ height: 16, fontSize: '0.7rem' }}
                />
              </Box>
            )}
            
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ p: 0 }}
              >
                <Avatar
                  sx={{ 
                    width: 32, 
                    height: 32,
                    backgroundColor: theme.palette.primary.main
                  }}
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    getInitials(user?.name || user?.username)
                  )}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          onClick={handleProfileMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              minWidth: 200,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {/* User Info */}
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user?.name || user?.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
            <Chip
              label={user?.role}
              size="small"
              color={getRoleColor(user?.role)}
              sx={{ mt: 0.5 }}
            />
          </Box>
          
          <Divider />
          
          <MenuItem onClick={handleDashboardClick}>
            <ListItemIcon>
              <Dashboard fontSize="small" />
            </ListItemIcon>
            <ListItemText>Dashboard</ListItemText>
          </MenuItem>
          {(user?.role?.toLowerCase?.() === 'admin' || user?.role?.toLowerCase?.() === 'hr') && (
            <MenuItem onClick={() => navigate(user?.role?.toLowerCase?.() === 'admin' ? '/admin/standups' : '/hr/standups')}>
              <ListItemIcon>
                <Dashboard fontSize="small" />
              </ListItemIcon>
              <ListItemText>All Standups</ListItemText>
            </MenuItem>
          )}
          
          <MenuItem onClick={handleProfileClick}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText>My Profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => setHistoryOpen(true)}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText>My Standups</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={handleSettingsClick}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={() => navigate('/help')}>
            <ListItemIcon>
              <Help fontSize="small" />
            </ListItemIcon>
            <ListItemText>Help & Support</ListItemText>
          </MenuItem>
          
          <Divider />
          
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>

        {/* Standup History Dialog */}
        <StandupHistoryDialog open={historyOpen} onClose={() => setHistoryOpen(false)} />


        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleNotificationMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              minWidth: 320,
              maxHeight: 400,
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6">Notifications</Typography>
          </Box>
          
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={handleNotificationMenuClose}
                sx={{
                  whiteSpace: 'normal',
                  alignItems: 'flex-start',
                  py: 1.5,
                  borderLeft: notification.read ? 'none' : '3px solid',
                  borderColor: 'primary.main',
                  backgroundColor: notification.read ? 'transparent' : 'action.hover'
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                    {notification.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {notification.time}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
          
          <Divider />
          <MenuItem onClick={() => navigate('/notifications')}>
            <Typography variant="body2" color="primary" sx={{ width: '100%', textAlign: 'center' }}>
              View all notifications
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
