import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Stack,
  Divider,
  Box,
  CircularProgress
} from '@mui/material';
import { calendarAPI } from '../../services/api';
import dayjs from 'dayjs';

const Field = ({ label, value }) => (
  <Box sx={{ mb: 1 }}>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{value || '-'}</Typography>
  </Box>
);

export default function CalendarEventHistoryDialog({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!open) return;
      try {
        setLoading(true);
        setError('');
        const res = await calendarAPI.getAllEvents();
        const list = res?.events || res?.data?.events || res || [];
        setItems(Array.isArray(list) ? list : []);
      } catch (e) {
        setError(e.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>My Calendar Events</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No events found.</Typography>
        ) : (
          <Stack spacing={2}>
            {items.map((ev) => (
              <Box key={ev._id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} justifyContent="space-between">
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {dayjs(ev.eventDate).format('MMM D, YYYY')} • {ev.isAllDay ? 'All Day' : `${ev.startTime} - ${ev.endTime}`}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {ev.eventType && <Chip label={`Type: ${ev.eventType}`} size="small" color="primary" variant="outlined" />}
                    {ev.location && <Chip label={ev.location} size="small" variant="outlined" />}
                  </Stack>
                </Stack>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Field label="Title" value={ev.title} />
                  <Field label="Meet Link" value={ev.meetLink} />
                  <Field label="Description" value={ev.description} />
                  <Field label="Attendees" value={(ev.attendees || []).map(a => `${a.firstName || ''} ${a.lastName || ''} (${a.email || ''})`).filter(Boolean).join(', ')} />
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
