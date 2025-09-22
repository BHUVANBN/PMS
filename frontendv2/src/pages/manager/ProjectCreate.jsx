import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ProjectForm from './ProjectForm';

const ProjectCreate = () => {
  const navigate = useNavigate();
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>New Project</Typography>
      <ProjectForm
        mode="create"
        onCancel={() => navigate('/manager/projects')}
        onSuccess={() => navigate('/manager/projects', { state: { refresh: true } })}
      />
    </Box>
  );
};

export default ProjectCreate;
