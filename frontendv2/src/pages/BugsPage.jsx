import React from 'react';
import { Stack, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const BugsPage = () => {
  const navigate = useNavigate();
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Bug Tracker</Typography>
      <Stack direction="row" spacing={1}>
        <Button variant="contained" onClick={() => navigate('/tester/kanban')}>Open Testing Kanban</Button>
        <Button variant="outlined" onClick={() => navigate('/manager/kanban')}>Open Project Kanban</Button>
        <Button variant="text" onClick={() => navigate('/developer/kanban')}>Open My Kanban</Button>
      </Stack>
    </Stack>
  );
};

export default BugsPage;
