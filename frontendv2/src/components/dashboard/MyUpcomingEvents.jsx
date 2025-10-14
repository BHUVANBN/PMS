import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Box, Link as MuiLink, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, Stack } from '@mui/material';
import { calendarAPI, subscribeToEvents } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d;
};

const isWithinRange = (dateStr, from, to) => {
  try {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d >= from && d <= to;
  } catch {
    return false;
  }
};

export default function MyUpcomingEvents({ title = 'My Upcoming Events', days = 60 }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let mounted = true;
    let timer;
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await calendarAPI.getAllEvents();
        const list = Array.isArray(res?.events) ? res.events : [];
        const start = daysFromNow(0);
        const end = daysFromNow(days);
        const myId = String(user?._id || '');
        const mine = list
          .filter((ev) => {
            const isMine = (ev.attendees || []).some((a) => String(a?._id || a) === myId) || String(ev.createdBy?._id || ev.createdBy) === myId;
            return isMine && isWithinRange(ev.eventDate, start, end);
          })
          .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
        if (mounted) setEvents(mine);
      } catch {
        if (mounted) setEvents([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (user) fetchEvents();
    // Polling fallback every 30s (kanban-style resilience)
    timer = setInterval(() => { if (user) fetchEvents(); }, 30000);
    // Realtime subscription
    let unsubscribe;
    let unsubscribeBroadcast;
    try {
      if (user?._id) {
        unsubscribe = subscribeToEvents({ userId: user._id }, (msg) => {
          const type = msg?.type || '';
          if (type.startsWith('calendar.')) {
            fetchEvents();
          }
        });
      }
      // Always also listen to broadcast as a fallback
      unsubscribeBroadcast = subscribeToEvents({}, (msg) => {
        const type = msg?.type || '';
        if (type.startsWith('calendar.')) {
          fetchEvents();
        }
      });
    } catch {
      // ignore SSE subscription errors
    }
    return () => {
      mounted = false;
      try { clearInterval(timer); } catch { /* ignore */ }
      try { if (typeof unsubscribe === 'function') unsubscribe(); } catch {
        // ignore close errors
      }
      try { if (typeof unsubscribeBroadcast === 'function') unsubscribeBroadcast(); } catch { /* ignore */ }
    };
  }, [user, days]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
        {loading ? (
          <Typography variant="body2" color="text.secondary">Loading events...</Typography>
        ) : events.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No upcoming events</Typography>
        ) : (
          <List dense>
            {events.map((ev) => (
              <ListItem key={ev._id} sx={{ px: 0 }} button onClick={() => setSelected(ev)}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{ev.title}</Typography>
                      <Chip size="small" label={(ev.eventType || 'event').toString().toUpperCase()} />
                    </Box>
                  }
                  secondary={
                    <Box component="span" sx={{ color: 'text.secondary' }}>
                      {new Date(ev.eventDate).toLocaleDateString()} {ev.startTime ? `• ${ev.startTime}` : ''}
                      {ev.location ? ` • ${ev.location}` : ''}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>{selected.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {new Date(selected.eventDate).toLocaleDateString()} {selected.startTime ? `• ${selected.startTime}` : ''} {selected.endTime ? `- ${selected.endTime}` : ''}
              </Typography>
              {selected.description && (
                <Typography variant="body1" sx={{ mb: 2 }}>{selected.description}</Typography>
              )}
              <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                {selected.location && (
                  <Chip label={`Location: ${selected.location}`} variant="outlined" />
                )}
                {Array.isArray(selected.attendees) && selected.attendees.length > 0 && (
                  <Chip label={`Attendees: ${selected.attendees.length}`} variant="outlined" />
                )}
                {selected.eventType && (
                  <Chip label={`Type: ${selected.eventType}`} variant="outlined" />
                )}
              </Stack>
              {selected.meetLink && (
                <MuiLink href={selected.meetLink} target="_blank" rel="noopener" underline="hover">
                  Join Meeting
                </MuiLink>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
