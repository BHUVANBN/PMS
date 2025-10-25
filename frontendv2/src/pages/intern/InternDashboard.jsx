import React from 'react';
import { Typography, Card, CardContent, Grid, Box } from '@mui/material';
import MyUpcomingEvents from '../../components/dashboard/MyUpcomingEvents';

const InternDashboard = () => (
  <Box>
    <Grid container spacing={2} alignItems="center" mb={3}>
      <Grid item xs={12} md={8}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 800, 
            color: 'text.primary',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            letterSpacing: '-0.02em',
            mb: 1.5
          }}
        >
          Intern Dashboard
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'text.secondary',
            fontWeight: 400,
            fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
            lineHeight: 1.6,
            letterSpacing: '0.01em'
          }}
        >
          Welcome back! Here are your onboarding and learning items.
        </Typography>
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
