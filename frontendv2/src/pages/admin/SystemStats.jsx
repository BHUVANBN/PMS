import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, Chip, Stack, Divider, IconButton, Tooltip } from '@mui/material';
import { Refresh, CheckCircle, Error as ErrorIcon, Insights, Storage, Security, Speed } from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import StatsCard from '../../components/dashboard/StatsCard';

const StatItem = ({ label, value }) => (
  <Box display="flex" justifyContent="space-between" py={0.5}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="body2" fontWeight={600}>{value}</Typography>
  </Box>
);

const SystemStats = () => {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [s, h, a] = await Promise.all([
        adminAPI.getSystemStats(),
        adminAPI.getSystemHealth(),
        adminAPI.getActivityLogs(),
      ]);
      setStats(s?.stats || s?.data?.stats || s);
      setHealth(h?.health || h?.data?.health || h);
      const logs = a?.logs || a?.data?.logs || a?.data || a || [];
      setActivity(Array.isArray(logs) ? logs.slice(0, 10) : []);
    } catch (e) {
      setError(e.message || 'Failed to load system stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <div>
          <Typography variant="h4" fontWeight="bold">System Statistics</Typography>
          <Typography variant="body2" color="text.secondary">Realtime view of platform health and activity</Typography>
        </div>
        <Tooltip title="Refresh">
          <span>
            <IconButton onClick={fetchAll} disabled={loading}>
              <Refresh />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {error && (
        <Paper sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <StatsCard title="Total Users" value={stats?.users?.total ?? stats?.totalUsers ?? 0} icon={Insights} color="primary" changeType="neutral" change="" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatsCard title="Active Projects" value={stats?.projects?.active ?? stats?.activeProjects ?? 0} icon={Speed} color="success" changeType="neutral" change="" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatsCard title="Open Tickets" value={stats?.tickets?.open ?? 0} icon={Security} color="warning" changeType="neutral" change="" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatsCard title="Resolved Bugs" value={stats?.bugs?.resolved ?? 0} icon={CheckCircle} color="info" changeType="neutral" change="" />
            </Grid>
          </Grid>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Recent Activity</Typography>
            {activity.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No recent activity</Typography>
            ) : (
              <Stack divider={<Divider flexItem />} spacing={1}>
                {activity.map((log, idx) => (
                  <Box key={idx} py={0.5} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">{log.message || log.action || 'Activity'}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(log.timestamp || log.createdAt || Date.now()).toLocaleString()}</Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="h6" fontWeight={600}>System Health</Typography>
              <Chip
                size="small"
                color={health?.database?.status === 'connected' ? 'success' : 'error'}
                label={health?.database?.status === 'connected' ? 'Healthy' : 'Degraded'}
              />
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1}>
              <StatItem label="Database" value={health?.database?.status || 'unknown'} />
              <StatItem label="Uptime" value={health?.uptime ? `${Math.round(health.uptime / 60)} min` : '—'} />
              <StatItem label="Memory Use" value={health?.memory?.rss ? `${Math.round(health.memory.rss / (1024*1024))} MB` : '—'} />
              <StatItem label="CPU Load" value={Array.isArray(health?.loadavg) ? health.loadavg[0].toFixed(2) : '—'} />
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Services</Typography>
            <Stack spacing={1}>
              <Box display="flex" alignItems="center" gap={1}><Storage fontSize="small" /><Typography variant="body2">MongoDB</Typography></Box>
              <Box display="flex" alignItems="center" gap={1}><Security fontSize="small" /><Typography variant="body2">Auth Service</Typography></Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemStats;
