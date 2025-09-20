import React from 'react';
import { Typography, Card, CardContent } from '@mui/material';

const SalesDashboard = () => (
  <>
    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Sales Dashboard</Typography>
    <Card><CardContent><Typography>Sales Reports</Typography></CardContent></Card>
  </>
);

export default SalesDashboard;
