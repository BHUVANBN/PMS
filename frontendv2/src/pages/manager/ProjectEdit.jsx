import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ProjectForm from './ProjectForm';

const ProjectEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>Edit Project</Typography>
      <ProjectForm
        mode="edit"
        projectId={id}
        onCancel={() => navigate('/manager/projects')}
        onSuccess={() => navigate('/manager/projects')}
      />
    </Box>
  );
};

export default ProjectEdit;
