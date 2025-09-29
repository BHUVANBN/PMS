import React from 'react';
import { Stack, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ReportsPage = () => {
  const navigate = useNavigate();
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Reports</Typography>
      <Stack direction="row" spacing={1}>
        <Button variant="contained" onClick={() => navigate('/analytics')}>Open Analytics</Button>
        <Button variant="outlined" onClick={() => navigate('/manager/kanban')}>Project Kanban</Button>
        <Button variant="text" onClick={() => navigate('/developer/kanban')}>My Kanban</Button>
      </Stack>
    </Stack>
  );
};

export default ReportsPage;
