import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Stack, Typography, Chip, LinearProgress, Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import { Refresh } from '@mui/icons-material';
import { managerAPI } from '../../services/api';

const Stat = ({ label, value, color = 'default' }) => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="h5" fontWeight={700} color={color}>{value}</Typography>
  </Paper>
);

const SprintSummary = () => {
  const { id } = useParams();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await managerAPI.getSprintSummary(id);
      const data = res?.summary || res?.data?.summary || res?.data || res || {};
      setSummary(data);
    } catch (e) {
      setError(e.message || 'Failed to load sprint summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSummary(); }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <LinearProgress sx={{ width: '60%' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <div>
          <Typography variant="h4" fontWeight="bold">Sprint Summary</Typography>
          <Typography variant="body2" color="text.secondary">Sprint ID: {id}</Typography>
        </div>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchSummary} disabled={loading}>Refresh</Button>
      </Stack>

      {error && (
        <Paper sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Overview</Typography>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <Chip label={summary?.status || 'unknown'} color={summary?.status === 'active' ? 'success' : summary?.status === 'completed' ? 'primary' : 'default'} />
              {summary?.goal && <Chip label={summary.goal} />}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Start: {summary?.startDate ? new Date(summary.startDate).toLocaleDateString() : '—'}
              {"  •  "}
              End: {summary?.endDate ? new Date(summary.endDate).toLocaleDateString() : '—'}
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Velocity & Burndown</Typography>
            <Stack direction="row" spacing={2}>
              <Stat label="Velocity" value={summary?.metrics?.velocity ?? 0} color="primary" />
              <Stat label="Committed" value={summary?.metrics?.committed ?? 0} />
              <Stat label="Completed" value={summary?.metrics?.completed ?? 0} color="success" />
            </Stack>
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">Burndown (completed / committed)</Typography>
              <LinearProgress variant="determinate" value={Math.min(100, Math.round(((summary?.metrics?.completed || 0) / Math.max(summary?.metrics?.committed || 1, 1)) * 100))} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <Stat label="Open Tickets" value={summary?.tickets?.open ?? 0} />
            <Stat label="In Progress" value={summary?.tickets?.inProgress ?? 0} />
            <Stat label="Blocked" value={summary?.tickets?.blocked ?? 0} color="warning" />
            <Stat label="Done" value={summary?.tickets?.done ?? 0} color="success" />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SprintSummary;
