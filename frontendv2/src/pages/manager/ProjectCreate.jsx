import React from 'react';
import { Box, Typography, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProjectForm from './ProjectForm';

const ProjectCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projectCreated, setProjectCreated] = React.useState(false);

  const handleSuccess = () => {
    if (user?.role === 'admin') {
      // For admin users, show success message instead of redirecting
      setProjectCreated(true);
    } else {
      // For managers, redirect to projects page
      navigate('/manager/projects', { state: { refresh: true } });
    }
  };

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>New Project</Typography>

      {projectCreated ? (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleBackToProjects}>
              Back to Projects
            </Button>
          }
        >
          Project created successfully! The assigned manager has been notified and can now manage the project.
        </Alert>
      ) : (
        <ProjectForm
          mode="create"
          onCancel={() => user?.role === 'admin' ? navigate('/admin/projects') : navigate('/manager/projects')}
          onSuccess={handleSuccess}
        />
      )}
    </Box>
  );
};

export default ProjectCreate;
