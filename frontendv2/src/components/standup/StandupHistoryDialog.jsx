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
import { standupAPI } from '../../services/api';

const Field = ({ label, value }) => (
  <Box sx={{ mb: 1 }}>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{value || '-'}
    </Typography>
  </Box>
);

export default function StandupHistoryDialog({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!open) return;
      try {
        setLoading(true);
        setError('');
        const res = await standupAPI.myStandups();
        const list = res?.items || res?.data?.items || res || [];
        setItems(Array.isArray(list) ? list : []);
      } catch (e) {
        setError(e.message || 'Failed to load standups');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>My Standups</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No standups found.</Typography>
        ) : (
          <Stack spacing={2}>
            {items.map((s) => (
              <Box key={s._id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} justifyContent="space-between">
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {new Date(s.dateTime || s.date).toLocaleString()}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {s.status && <Chip label={`Status: ${s.status}`} size="small" color="primary" variant="outlined" />}
                    {s.priority && <Chip label={`Priority: ${s.priority}`} size="small" variant="outlined" />}
                    {typeof s.working_hours === 'number' && <Chip label={`${s.working_hours} hrs`} size="small" variant="outlined" />}
                  </Stack>
                </Stack>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Field label="Tasks Done" value={s.tasks_done} />
                  <Field label="Activity Type" value={s.activity_type} />
                  <Field label="Links" value={s.links} />
                  <Field label="Progress" value={s.progress} />
                  <Field label="Blockers" value={s.blockers} />
                  <Field label="Collaboration" value={s.collaboration} />
                  <Field label="Next Steps" value={s.next_steps} />
                </Box>

                {(Array.isArray(s.comments) && s.comments.length > 0) && (
                  <>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Reviews</Typography>
                    <Stack spacing={1}>
                      {s.comments.map((c, idx) => (
                        <Box key={idx} sx={{ p: 1.5, border: '1px dashed', borderColor: 'divider', borderRadius: 1.5 }}>
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.name || 'Manager/HR'}</Typography>
                            <Typography variant="caption" color="text.secondary">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>{c.comment}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </>
                )}

                {(Array.isArray(s.attachments) && s.attachments.length > 0) && (
                  <>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Attachments</Typography>
                    <Stack spacing={1}>
                      {s.attachments.map((a, idx) => (
                        <Stack key={idx} direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                          <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name || a.url}</Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {a.uploadedAt && <Chip size="small" label={new Date(a.uploadedAt).toLocaleDateString()} />}
                            <Button size="small" href={a.url} target="_blank" rel="noreferrer">Open</Button>
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                  </>
                )}
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
