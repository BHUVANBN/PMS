import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  Box,
  Typography,
  Chip
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const CommandPalette = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;
      if (cmdKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const actions = useMemo(() => {
    const role = (user?.role || '').toLowerCase();

    const base = [
      { title: 'Profile', subtitle: 'View and edit your profile', path: '/profile', role: 'any' },
      { title: 'Settings', subtitle: 'Application preferences', path: '/settings', role: 'any' },
      { title: 'Notifications', subtitle: 'View notifications', path: '/notifications', role: 'any' },
      { title: 'Projects', subtitle: 'Browse projects', path: '/projects', role: 'any' },
      { title: 'Reports', subtitle: 'View reports', path: '/reports', role: 'any' },
      { title: 'Calendar', subtitle: 'Team calendar', path: '/calendar', role: 'any' },
    ];

    const hr = [
      { title: 'HR Dashboard', subtitle: 'Overview and stats', path: '/hr/dashboard', role: 'hr' },
      { title: 'Employee List', subtitle: 'Manage employees', path: '/hr/employees', role: 'hr' },
      { title: 'Add Employee', subtitle: 'Create employee record', path: '/hr/employees/new', role: 'hr' },
      { title: 'Onboarding Submissions', subtitle: 'Review onboarding', path: '/hr/onboarding-public', role: 'hr' },
      { title: 'Standups', subtitle: 'Team standups', path: '/hr/standups', role: 'hr' },
    ];

    const admin = [
      { title: 'Admin Dashboard', subtitle: 'System overview', path: '/admin/dashboard', role: 'admin' },
      { title: 'Users', subtitle: 'User management', path: '/admin/users', role: 'admin' },
    ];

    const manager = [
      { title: 'Manager Dashboard', subtitle: 'Team overview', path: '/manager/dashboard', role: 'manager' },
      { title: 'Projects', subtitle: 'Manage projects', path: '/manager/projects', role: 'manager' },
      { title: 'Team', subtitle: 'Team management', path: '/manager/team', role: 'manager' },
    ];

    const roleActions = role === 'hr' ? hr : role === 'admin' ? admin : role === 'manager' ? manager : [];
    return [...roleActions, ...base];
  }, [user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(a =>
      a.title.toLowerCase().includes(q) || (a.subtitle || '').toLowerCase().includes(q)
    );
  }, [actions, query]);

  const handleSelect = (action) => {
    if (action?.path) {
      navigate(action.path);
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Search commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{ sx: { borderRadius: 2 } }}
          />
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip size="small" label="Ctrl/Cmd + K" />
            <Typography variant="caption" color="text.secondary">
              Open command palette
            </Typography>
          </Box>
        </Box>
        <List sx={{ maxHeight: 400, overflowY: 'auto', p: 0 }}>
          {filtered.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">No results</Typography>
            </Box>
          ) : (
            filtered.map((action, idx) => (
              <ListItemButton key={idx} onClick={() => handleSelect(action)}>
                <ListItemText
                  primary={action.title}
                  secondary={action.subtitle}
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItemButton>
            ))
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;
