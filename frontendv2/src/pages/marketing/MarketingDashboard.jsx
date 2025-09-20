import React from 'react';
import { Typography, Card, CardContent } from '@mui/material';

const MarketingDashboard = () => (
  <>
    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Marketing Dashboard</Typography>
    <Card><CardContent><Typography>Campaigns</Typography></CardContent></Card>
  </>
);

export default MarketingDashboard;
