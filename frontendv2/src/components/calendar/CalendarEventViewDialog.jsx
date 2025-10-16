import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography, Chip, Stack, Divider } from '@mui/material';

export default function CalendarEventViewDialog({ open, onClose, event, canEdit = false, onEdit }) {
  if (!open || !event) return null;

  const safe = (v) => (v === undefined || v === null || v === '' ? '—' : v);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Event Details</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>{safe(event.title)}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">{safe(event.description)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Date</Typography>
            <Typography variant="body2">{safe(event.date)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Time</Typography>
            <Typography variant="body2">{safe(event.time)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Type</Typography>
            <Stack direction="row" spacing={1}>
              <Chip size="small" label={safe(event.type)} />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Location</Typography>
            <Typography variant="body2">{safe(event.location)}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2">Attendees</Typography>
            <Typography variant="body2" color="text.secondary">
              {Array.isArray(event.attendees) && event.attendees.length > 0 ? event.attendees.join(', ') : '—'}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        {canEdit && (
          <Button onClick={onEdit} variant="outlined">Edit</Button>
        )}
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
}
