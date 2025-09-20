import React from 'react';
import { Typography, Grid, Card, CardContent } from '@mui/material';

const TesterDashboard = () => (
  <>
    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Tester Dashboard</Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}><Card><CardContent><Typography>Test Cases</Typography></CardContent></Card></Grid>
      <Grid item xs={12} md={6}><Card><CardContent><Typography>Bug Queue</Typography></CardContent></Card></Grid>
    </Grid>
  </>
);

export default TesterDashboard;
