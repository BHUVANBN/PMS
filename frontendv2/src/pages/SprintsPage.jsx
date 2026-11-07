import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Stack, Chip, CircularProgress,
  LinearProgress, Grid, Avatar, Tooltip, IconButton, Collapse,
  useTheme, Alert
} from '@mui/material';
import { ExpandMore, ExpandLess, Speed, CheckCircle, PlayArrow, Schedule } from '@mui/icons-material';
import { sprintsAPI } from '../services/api';
import { format, differenceInDays } from 'date-fns';

const statusColor = {
  active: 'success',
  planned: 'info',
  completed: 'default',
  cancelled: 'error',
};

const SprintCard = ({ sprint }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const startDate = sprint.startDate ? new Date(sprint.startDate) : null;
  const endDate = sprint.endDate ? new Date(sprint.endDate) : null;
  const daysLeft = endDate ? differenceInDays(endDate, new Date()) : null;

  const totalTickets = sprint.tickets?.length || 0;
  const doneTickets = sprint.tickets?.filter((t) => t.status === 'done').length || 0;
  const progress = totalTickets > 0 ? Math.round((doneTickets / totalTickets) * 100) : 0;

  return (
    <Card sx={{
      borderRadius: 3,
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: 'none',
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: theme.shadows[3] },
    }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <Typography variant="h6" fontWeight={600}>{sprint.name || 'Unnamed Sprint'}</Typography>
              <Chip
                label={sprint.status || 'unknown'}
                size="small"
                color={statusColor[sprint.status] || 'default'}
                sx={{ textTransform: 'capitalize' }}
              />
            </Stack>
            {sprint.goal && (
              <Typography variant="body2" color="text.secondary" mb={1}>{sprint.goal}</Typography>
            )}
            <Stack direction="row" spacing={3} mb={2} flexWrap="wrap">
              {startDate && (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <PlayArrow fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {format(startDate, 'MMM d, yyyy')}
                  </Typography>
                </Stack>
              )}
              {endDate && (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Schedule fontSize="small" sx={{ color: daysLeft < 3 ? 'error.main' : 'text.secondary' }} />
                  <Typography variant="caption" color={daysLeft < 3 ? 'error.main' : 'text.secondary'}>
                    {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Ends today' : 'Ended'}
                  </Typography>
                </Stack>
              )}
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <CheckCircle fontSize="small" sx={{ color: 'success.main' }} />
                <Typography variant="caption" color="text.secondary">
                  {doneTickets}/{totalTickets} tickets done
                </Typography>
              </Stack>
            </Stack>
            <Box>
              <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption" color="text.secondary">Progress</Typography>
                <Typography variant="caption" fontWeight={600} color={progress >= 80 ? 'success.main' : 'text.primary'}>
                  {progress}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress}
                color={progress >= 80 ? 'success' : progress >= 50 ? 'warning' : 'primary'}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          </Box>
          <Tooltip title={open ? 'Hide tickets' : 'Show tickets'}>
            <IconButton size="small" onClick={() => setOpen(!open)} sx={{ ml: 1 }}>
              {open ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Tooltip>
        </Stack>

        <Collapse in={open}>
          {(sprint.tickets || []).length === 0 ? (
            <Typography variant="body2" color="text.secondary" mt={2}>No tickets in this sprint.</Typography>
          ) : (
            <Box mt={2}>
              <Typography variant="caption" fontWeight={600} color="text.secondary" mb={1} display="block">
                TICKETS ({sprint.tickets.length})
              </Typography>
              <Stack spacing={1}>
                {sprint.tickets.map((ticket) => (
                  <Stack
                    key={ticket._id}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{ticket.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {ticket.ticketNumber} • {ticket.type}
                      </Typography>
                    </Box>
                    <Chip
                      label={(ticket.status || 'open').replace('_', ' ')}
                      size="small"
                      color={ticket.status === 'done' ? 'success' : ticket.status === 'in_progress' ? 'warning' : 'default'}
                      sx={{ textTransform: 'capitalize', ml: 2, flexShrink: 0 }}
                    />
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};

const SprintsPage = () => {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSprints = async () => {
      try {
        setLoading(true);
        const res = await sprintsAPI.getAllSprints();
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setSprints(data);
      } catch (err) {
        setError(err.message || 'Failed to load sprints');
      } finally {
        setLoading(false);
      }
    };
    fetchSprints();
  }, []);

  const active = sprints.filter((s) => s.status === 'active');
  const planned = sprints.filter((s) => s.status === 'planned' || s.status === 'planning');
  const completed = sprints.filter((s) => s.status === 'completed');

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Sprints</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Track sprint progress and ticket completion
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          {[
            { label: 'Active', count: active.length, color: 'success.main' },
            { label: 'Planned', count: planned.length, color: 'info.main' },
            { label: 'Completed', count: completed.length, color: 'text.secondary' },
          ].map(({ label, count, color }) => (
            <Box key={label} textAlign="center">
              <Typography variant="h5" fontWeight={700} color={color}>{count}</Typography>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
            </Box>
          ))}
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {sprints.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Speed sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>No sprints found</Typography>
          <Typography variant="body2" color="text.disabled">
            Sprints are created by your project manager. Check back later.
          </Typography>
        </Box>
      ) : (
        <>
          {active.length > 0 && (
            <Box mb={4}>
              <Typography variant="h6" fontWeight={600} mb={2} color="success.main">
                🟢 Active Sprints ({active.length})
              </Typography>
              <Stack spacing={2}>{active.map((s) => <SprintCard key={s._id} sprint={s} />)}</Stack>
            </Box>
          )}
          {planned.length > 0 && (
            <Box mb={4}>
              <Typography variant="h6" fontWeight={600} mb={2} color="info.main">
                🔵 Planned Sprints ({planned.length})
              </Typography>
              <Stack spacing={2}>{planned.map((s) => <SprintCard key={s._id} sprint={s} />)}</Stack>
            </Box>
          )}
          {completed.length > 0 && (
            <Box mb={4}>
              <Typography variant="h6" fontWeight={600} mb={2} color="text.secondary">
                ✅ Completed Sprints ({completed.length})
              </Typography>
              <Stack spacing={2}>{completed.map((s) => <SprintCard key={s._id} sprint={s} />)}</Stack>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default SprintsPage;
