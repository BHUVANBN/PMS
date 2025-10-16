import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, useTheme } from '@mui/material';
import AppBar from '../components/layout/AppBar';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { calendarAPI } from '../services/api';
import useViewportSize from '../utils/useViewportSize';

const MainLayout = () => {
  const theme = useTheme();
  const { metrics } = useViewportSize();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerWidth = metrics.left;
  const { user } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Lightweight calendar notifications for attendees
  useEffect(() => {
    let timer;
    const key = user?._id ? `seen_calendar_events_${user._id}` : 'seen_calendar_events';
    const getSeen = () => {
      try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
    };
    const setSeen = (ids) => {
      try { localStorage.setItem(key, JSON.stringify(ids.slice(-200))); } catch { /* ignore */ }
    };

    const fetchAndNotify = async () => {
      try {
        if (!user) return;
        const res = await calendarAPI.getAllEvents();
        const events = Array.isArray(res?.events) ? res.events : [];
        const seen = new Set(getSeen());
        const upcoming = events.filter(ev => {
          // Non-HR users already filtered server-side; HR may see all
          // Only notify if current user is attendee or creator
          const isAttendee = (ev.attendees || []).some(a => (a?._id || a) === user._id);
          const isCreator = (ev.createdBy?._id || ev.createdBy) === user._id;
          if (!isAttendee && !isCreator) return false;
          // New event not seen before
          return !seen.has(ev._id);
        });
        if (upcoming.length > 0) {
          upcoming.slice(0, 3).forEach(ev => {
            toast.success(`New event: "${ev.title}" on ${new Date(ev.eventDate).toLocaleDateString()} ${ev.startTime ? `at ${ev.startTime}` : ''}`);
            seen.add(ev._id);
          });
          setSeen(Array.from(seen));
        }
      } catch { /* ignore */ }
    };

    fetchAndNotify();
    timer = setInterval(fetchAndNotify, 30000);
    return () => { if (timer) clearInterval(timer); };
  }, [user]);

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
          backgroundColor: 'transparent',
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
