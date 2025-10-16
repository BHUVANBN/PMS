import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Card, CardContent, Stack, Chip, TextField, MenuItem, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import dayjs from 'dayjs';
import { useAuth } from '../contexts/AuthContext';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [all, setAll] = useState([]);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const storageKey = user?._id ? `notifications_history_${user._id}` : '';

  useEffect(() => {
    if (!storageKey) return;
    try {
      const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
      setAll(Array.isArray(data) ? data : []);
    } catch {
      setAll([]);
    }
  }, [storageKey]);

  const items = useMemo(() => {
    let list = all;
    if (filter === 'unread') list = list.filter(x => !x.read);
    if (filter === 'today') list = list.filter(x => dayjs().isSame(dayjs(x.time, 'HH:mm'), 'day'));
    if (query.trim()) list = list.filter(x => `${x.title} ${x.message}`.toLowerCase().includes(query.toLowerCase()));
    return list;
  }, [all, filter, query]);

  const markAllRead = () => {
    const updated = all.map(x => ({ ...x, read: true }));
    setAll(updated);
    try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch {}
  };

  const clearAll = () => {
    setAll([]);
    try { localStorage.setItem(storageKey, JSON.stringify([])); } catch {}
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Notifications</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={markAllRead}>Mark all read</Button>
          <Button variant="text" color="error" onClick={clearAll}>Clear</Button>
        </Stack>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <TextField
              select
              label="Filter"
              size="small"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="unread">Unread</MenuItem>
              <MenuItem value="today">Today</MenuItem>
            </TextField>
            <TextField
              label="Search"
              size="small"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              fullWidth
            />
            <Stack direction="row" spacing={1}>
              <Chip label={`Total: ${all.length}`} />
              <Chip label={`Unread: ${all.filter(x => !x.read).length}`} color="warning" variant="outlined" />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="body1" color="text.secondary">No notifications</Typography>
        </Box>
      ) : (
        <Card>
          <List dense>
            {items.map((n, idx) => (
              <React.Fragment key={`${n.id}-${idx}`}>
                <ListItem alignItems="flex-start" sx={{ bgcolor: n.read ? 'transparent' : 'action.hover' }}>
                  <ListItemText
                    primary={
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{n.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{n.time}</Typography>
                      </Stack>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">{n.message}</Typography>
                    }
                  />
                </ListItem>
                {idx < items.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Card>
      )}
    </Box>
  );
}
