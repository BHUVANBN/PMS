import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import AppBar from '../components/layout/AppBar';
import Sidebar from '../components/layout/Sidebar';

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerWidth = 240;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar onMenuClick={handleDrawerToggle} />
      <Sidebar 
        mobileOpen={mobileOpen} 
        onClose={handleDrawerToggle}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
          position: 'relative',
          margin: 0,
          padding: 0,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Box sx={{ 
          mt: { xs: 8, sm: 9 },
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 },
          maxWidth: '100%',
          overflow: 'auto',
          minHeight: 'calc(100vh - 72px)',
          margin: 0,
          marginLeft: 0,
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
