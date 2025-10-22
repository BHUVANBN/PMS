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
  useTheme,
  Badge,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Logout, 
  Person, 
  Settings, 
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/useThemeMode';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';
import StandupHistoryDialog from '../standup/StandupHistoryDialog.jsx';
import { ENABLE_STANDUP_BEFORE_LOGOUT } from '../../config/featureFlags.js';
import { calendarAPI, meetingAPI, employeeAPI, subscribeToEvents } from '../../services/api';
import dayjs from 'dayjs';

const AppBar = ({ onMenuClick, drawerWidth = 0 }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { mode, setMode } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  // sound is always enabled via vibration cue for new notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  // Helper to show browser/system notification
  const notifySystem = React.useCallback((title, body, path, tag) => {
    try {
      if (!('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;
      const n = new Notification(title || 'Notification', {
        body: body || '',
        tag: tag || undefined,
      });
      n.onclick = () => {
        try { window.focus?.(); } catch (err) { console.debug('window focus failed', err); }
        try { if (path) window.location.href = path; } catch (err) { console.debug('redirect failed', err); }
        try { n.close?.(); } catch (err) { console.debug('notification close failed', err); }
      };
    } catch (err) { console.debug('system notification failed', err); }
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
  };

  // removed toast/sound preference toggles as per request

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

  React.useEffect(() => {
    if (!user?._id) return;
    const debug = (() => { try { return localStorage.getItem('notif_debug') === '1'; } catch { return false; } })();
    const storageKey = `seen_event_reminders_${user._id}`;
    const getSeen = () => {
      try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; }
    };
    const setSeen = (ids) => {
      try { localStorage.setItem(storageKey, JSON.stringify(ids.slice(-500))); } catch (e) { console.debug('setSeen failed', e); }
    };

    const parseDateTime = (event) => {
      // handle eventDate (date-only) + startTime (HH:mm) or ISO strings
      const datePart = event.eventDate ? dayjs(event.eventDate) : (event.startTime ? dayjs(event.startTime) : dayjs());
      let hh = 0, mm = 0;
      if (event.startTime && typeof event.startTime === 'string' && event.startTime.includes(':')) {
        const parts = event.startTime.split(':');
        hh = parseInt(parts[0], 10) || 0; mm = parseInt(parts[1], 10) || 0;
      } else if (dayjs(event.startTime).isValid()) {
        hh = dayjs(event.startTime).hour(); mm = dayjs(event.startTime).minute();
      }
      return datePart.hour(hh).minute(mm).second(0).millisecond(0);
    };

    let timer;
    let docsTimer;
    let unsubscribe;
    let retryTimer;
    let retryDelay = 2000; // 2s -> 30s backoff

    const processEvents = async () => {
      try {
        const res = await calendarAPI.getAllEvents();
        const events = Array.isArray(res?.events) ? res.events : [];
        const seen = new Set(getSeen());
        const now = dayjs();
        if (debug) console.debug('[notif] fetched calendar events:', events.length);
        // For HR, include org-wide events as returned by server. For others, filter to attendee/creator.
        const mine = (user?.role === 'hr') ? events : events.filter(ev => {
          const isAttendee = (ev.attendees || []).some(a => (a?._id || a) === user._id);
          const isCreator = (ev.createdBy?._id || ev.createdBy) === user._id;
          return isAttendee || isCreator;
        });
        if (debug) console.debug('[notif] relevant calendar events for user:', mine.length);
        const due = [];
        for (const ev of mine) {
          if (ev.reminder === false) continue;
          let remindMins = Number(ev.reminderTime || 15);
          // Enforce 5-minute reminders for meeting and personal events
          if ((ev.eventType || ev.type) === 'meeting' || ev.isPersonal === true) {
            remindMins = 5;
          }
          const start = parseDateTime(ev);
          const remindAt = start.subtract(remindMins, 'minute');
          if (now.isAfter(remindAt) && now.isBefore(start.add(1, 'hour'))) {
            const key = `rem_${ev._id}_${remindMins}`;
            if (!seen.has(key)) {
              due.push({
                id: key,
                title: 'Reminder',
                message: `${ev.title || 'Event'} in ${Math.max(0, Math.round(start.diff(now, 'minute', true)))} min`,
                time: now.format('HH:mm'),
                read: false,
                path: '/calendar',
              });
              seen.add(key);
            }
          }
        }

        // New review events notification (not time-based reminder, but creation awareness)
        try {
          const reviewKey = `seen_review_events_${user._id}`;
          const getSeenReviews = () => { try { return JSON.parse(localStorage.getItem(reviewKey) || '[]'); } catch { return []; } };
          const setSeenReviews = (ids) => { try { localStorage.setItem(reviewKey, JSON.stringify(ids.slice(-500))); } catch (err) { console.debug('setSeenReviews failed', err); }
          };
          const seenReviews = new Set(getSeenReviews());
          const reviews = events.filter(ev => (ev.eventType || ev.type) === 'review');
          for (const ev of reviews) {
            // Only notify relevant users (unless HR sees all)
            if (user?.role !== 'hr') {
              const isAttendee = (ev.attendees || []).some(a => (a?._id || a) === user._id);
              const isCreator = (ev.createdBy?._id || ev.createdBy) === user._id;
              if (!isAttendee && !isCreator) continue;
            }
            const key = `rev_${ev._id}`;
            if (!seenReviews.has(key)) {
              due.push({
                id: key,
                title: 'New review scheduled',
                message: `${ev.title || 'Review'} on ${dayjs(ev.eventDate).format('MMM D')} at ${ev.startTime || ''}`,
                time: now.format('HH:mm'),
                read: false,
                path: '/calendar',
              });
              seenReviews.add(key);
            }
          }
          setSeenReviews(Array.from(seenReviews));
        } catch (err) { console.debug('reviews notify failed', err); }
        // Meetings support: default 5-minute reminder
        try {
          const mres = await meetingAPI.getUserMeetings();
          const meetings = Array.isArray(mres?.meetings) ? mres.meetings : (Array.isArray(mres?.data) ? mres.data : []);
          if (debug) console.debug('[notif] fetched user meetings:', meetings.length);
          for (const mt of meetings) {
            const start = dayjs(mt.startTime);
            const remindMins = 5;
            const remindAt = start.subtract(remindMins, 'minute');
            if (now.isAfter(remindAt) && now.isBefore(start.add(1, 'hour'))) {
              const key = `meet_${mt._id}_${remindMins}`;
              if (!seen.has(key)) {
                due.push({
                  id: key,
                  title: 'Meeting reminder',
                  message: `${mt.title || 'Meeting'} in ${Math.max(0, Math.round(start.diff(now, 'minute', true)))} min`,
                  time: now.format('HH:mm'),
                  read: false,
                  path: '/meetings',
                });
                seen.add(key);
              }
            }
          }
        } catch (err) { console.debug('meetings fetch failed', err); }
        if (debug) console.debug('[notif] due notifications to enqueue:', due.length);
        if (due.length) {
          setNotifications(prev => [...due, ...prev].slice(0, 50));
          setSeen(Array.from(seen));
          // Persist to history per-user
          try {
            const hKey = `notifications_history_${user._id}`;
            const existing = JSON.parse(localStorage.getItem(hKey) || '[]');
            const updated = [...due, ...existing].slice(0, 200);
            localStorage.setItem(hKey, JSON.stringify(updated));
          } catch (e) { console.debug('history persist failed', e); }
          // Sound/vibration cue only (no toasts)
          try { if (navigator?.vibrate) navigator.vibrate(120); } catch (err) { console.debug('vibrate failed', err); }
          try {
            const first = due[0];
            if (first) {
              setSnackbarMsg(`${first.title}: ${first.message}`);
              setSnackbarOpen(true);
              // Browser/system notification with click-through
              notifySystem(first.title, first.message, first.path || '/calendar', first.id);
            }
          } catch (err) { console.debug('snackbar set failed', err); }
        }
      } catch (e) { console.debug('processEvents failed', e); }
    };

    // Process HR/Manager/Admin uploaded documents for current employee (My HR Docs)
    const processDocs = async () => {
      try {
        const dres = await employeeAPI.getMyHRDocs();
        const list = Array.isArray(dres?.data) ? dres.data : (Array.isArray(dres) ? dres : []);
        const now = dayjs();
        const dkey = `seen_hr_docs_${user._id}`;
        const getSeenDocs = () => { try { return JSON.parse(localStorage.getItem(dkey) || '[]'); } catch { return []; } };
        const setSeenDocs = (ids) => { try { localStorage.setItem(dkey, JSON.stringify(ids.slice(-500))); } catch (err) { console.debug('setSeenDocs failed', err); }
        };
        const seenDocs = new Set(getSeenDocs());
        const incoming = [];
        for (const doc of list) {
          const pid = doc?.file?.publicId || doc?.file?.url || doc?.name || JSON.stringify(doc);
          const key = `doc_${pid}`;
          if (!seenDocs.has(key)) {
            incoming.push({
              id: key,
              title: 'New document',
              message: `${doc?.name || 'File'} uploaded by HR/Manager/Admin`,
              time: now.format('HH:mm'),
              read: false,
              path: '/documents',
            });
            seenDocs.add(key);
          }
        }
        if (incoming.length) {
          setNotifications(prev => [...incoming, ...prev].slice(0, 50));
          try {
            const hKey = `notifications_history_${user._id}`;
            const existing = JSON.parse(localStorage.getItem(hKey) || '[]');
            const updated = [...incoming, ...existing].slice(0, 200);
            localStorage.setItem(hKey, JSON.stringify(updated));
          } catch (err) { console.debug('docs history persist failed', err); }
          try { if (navigator?.vibrate) navigator.vibrate(120); } catch (err) { console.debug('vibrate failed', err); }
          try {
            const first = incoming[0];
            if (first) {
              setSnackbarMsg(`${first.title}: ${first.message}`);
              setSnackbarOpen(true);
              // Browser/system notification with click-through to documents
              notifySystem(first.title, first.message, first.path || '/documents', first.id);
            }
          } catch (err) { console.debug('snackbar set failed', err); }
        }
        setSeenDocs(Array.from(seenDocs));
      } catch (err) { console.debug('processDocs failed', err); }
    };

    const ensurePermission = () => {
      try {
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }
      } catch (e) { console.debug('Notification permission request failed', e); }
    };

    ensurePermission();
    // Preload from persisted history so bell shows items immediately
    try {
      const hKey = `notifications_history_${user._id}`;
      const existing = JSON.parse(localStorage.getItem(hKey) || '[]');
      if (Array.isArray(existing) && existing.length) {
        setNotifications(existing.slice(0, 50));
      }
    } catch (e) { console.debug('preload history failed', e); }

    processEvents();
    processDocs();
    timer = setInterval(processEvents, 10000);
    docsTimer = setInterval(processDocs, 30000);

    const connect = () => {
      try {
        unsubscribe = subscribeToEvents(
          { userId: user._id },
          (payload) => {
            try {
              retryDelay = 2000;
              const type = payload?.type || '';
              // For any calendar-related updates, refresh timers
              if (type.startsWith('calendar.')) {
                processEvents();
                return;
              }
              // Standup-related notifications
              if (type.startsWith('standup.')) {
                const now = dayjs();
                const title = type === 'standup.commented' ? 'Standup comment' : type === 'standup.attachment_added' ? 'Standup attachment' : 'Standup update';
                const msg = payload?.data?.by ? `${title} by ${payload.data.by}` : title;
                const path = (user?.role === 'hr' || user?.role === 'admin' || user?.role === 'manager') ? '/hr/standups' : '/notifications';
                const item = { id: `${type}_${now.valueOf()}`, title, message: msg, time: now.format('HH:mm'), read: false, path };
                setNotifications(prev => [item, ...prev].slice(0, 50));
                try {
                  const hKey = `notifications_history_${user._id}`;
                  const existing = JSON.parse(localStorage.getItem(hKey) || '[]');
                  const updated = [item, ...existing].slice(0, 200);
                  localStorage.setItem(hKey, JSON.stringify(updated));
                } catch (e) { console.debug('history persist failed', e); }
                try { if (navigator?.vibrate) navigator.vibrate(120); } catch (err) { console.debug('vibrate failed', err); }
                notifySystem(item.title, item.message, item.path, item.id);
                return;
              }
            } catch (e) { console.debug('sse onmessage handling failed', e); }
          },
          () => {
            try { if (typeof unsubscribe === 'function') unsubscribe(); } catch (err) { console.debug('unsubscribe noop', err); }
            if (retryTimer) clearTimeout(retryTimer);
            retryTimer = setTimeout(connect, retryDelay);
            retryDelay = Math.min(retryDelay * 2, 30000);
          }
        );
      } catch (e) {
        console.debug('subscribeToEvents failed', e);
        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 30000);
      }
    };
    connect();

    return () => {
      if (timer) clearInterval(timer);
      if (docsTimer) clearInterval(docsTimer);
      if (retryTimer) clearTimeout(retryTimer);
      try { if (typeof unsubscribe === 'function') unsubscribe(); } catch (e) { console.debug('unsubscribe failed', e); }
    };
  }, [user?._id, user?.role, notifySystem]);

  return (
    <MuiAppBar 
      position="fixed"
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        // Rounded, glass-like bar that does not overlap the sidebar
        top: 8,
        left: { xs: 8, sm: `calc(${drawerWidth}px + 8px)` },
        right: 8,
        width: { xs: 'auto', sm: `calc(100% - ${drawerWidth}px - 16px)` },
        borderRadius: 1,
        backgroundColor: (theme) => theme.palette.background.paper,
        color: (theme) => theme.palette.text.primary,
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
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
            <Tooltip title={`Theme: ${mode === 'dark' ? 'dark' : 'light'}`}> 
              <IconButton
                color="inherit"
                onClick={() => {
                  const next = mode === 'light' ? 'dark' : 'light';
                  setMode(next);
                }}
                sx={{ mr: 1 }}
              >
                {mode === 'dark' ? <Brightness4Icon /> : <Brightness7Icon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton color="inherit" onClick={handleNotificationMenuOpen} sx={{ mr: 1 }}>
                {(() => { const c = notifications.filter(n => !n.read).length; const d = c > 9 ? '9+' : c; return (
                <Badge badgeContent={d} color="error">
                  <NotificationsIcon />
                </Badge>
                ); })()}
              </IconButton>
            </Tooltip>
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
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'auto',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            minWidth: 320,
            maxHeight: 400,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {`Notifications (${notifications.filter(n => !n.read).length})`}
          </Typography>
        </Box>
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <ListItemText>No notifications</ListItemText>
          </MenuItem>
        ) : (
          notifications.map(n => (
            <MenuItem key={n.id} onClick={() => { handleNotificationMenuClose(); navigate(n.path || '/calendar'); }} sx={{ alignItems: 'flex-start', whiteSpace: 'normal' }}>
              <ListItemText primary={n.title} secondary={`${n.message} • ${n.time}`} />
            </MenuItem>
          ))
        )}
        <MenuItem onClick={() => { handleNotificationMenuClose(); navigate('/notifications'); }}>
          <ListItemText sx={{ textAlign: 'center' }}>View all notifications</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleNotificationMenuClose}>
          <ListItemText sx={{ textAlign: 'center' }}>Close</ListItemText>
        </MenuItem>
      </Menu>
      <StandupHistoryDialog open={historyOpen} onClose={() => setHistoryOpen(false)} />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="info" onClose={() => setSnackbarOpen(false)} sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </MuiAppBar>
  );
};

export default AppBar;
