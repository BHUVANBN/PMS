import React from 'react';
import { Stack, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const TeamPage = () => {
  const navigate = useNavigate();
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Team</Typography>
      <Stack direction="row" spacing={1}>
        <Button variant="contained" onClick={() => navigate('/manager/team')}>Manage Team</Button>
        <Button variant="outlined" onClick={() => navigate('/manager/kanban')}>Project Kanban</Button>
        <Button variant="text" onClick={() => navigate('/projects')}>Projects</Button>
      </Stack>
    </Stack>
  );
};

export default TeamPage;
