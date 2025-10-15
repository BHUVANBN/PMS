import React from 'react';
import { Typography, Card, CardContent, Grid, Box } from '@mui/material';
import MyUpcomingEvents from '../../components/dashboard/MyUpcomingEvents';

const InternDashboard = () => (
  <Box>
    <Grid container spacing={2} alignItems="center" mb={2}>
      <Grid item xs={12} md={8}>
        <Typography variant="h5" sx={{ mb: { xs: 1, md: 0 }, fontWeight: 600 }}>Intern Dashboard</Typography>
      </Grid>
      <Grid item xs={12} md={4}>
        <MyUpcomingEvents title="My Upcoming Events" days={14} />
      </Grid>
    </Grid>
    <Card>
      <CardContent>
        <Typography>Getting Started</Typography>
      </CardContent>
    </Card>
  </Box>
);

export default InternDashboard;
