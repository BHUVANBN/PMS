import React from 'react';
import { Typography, Grid, Card, CardContent } from '@mui/material';

const HRDashboard = () => (
  <>
    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>HR Dashboard</Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}><Card><CardContent><Typography>Employees</Typography></CardContent></Card></Grid>
      <Grid item xs={12} md={6}><Card><CardContent><Typography>Leave Requests</Typography></CardContent></Card></Grid>
    </Grid>
  </>
);

export default HRDashboard;
