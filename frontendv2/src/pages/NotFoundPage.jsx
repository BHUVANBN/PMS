import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <Container maxWidth="md" sx={{ display: 'flex', alignItems: 'center', minHeight: '70vh' }}>
      <Box sx={{ textAlign: 'center', width: '100%' }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>404</Typography>
        <Typography variant="h5" sx={{ mb: 2 }}>Page not found</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>The page you are looking for does not exist or has been moved.</Typography>
        <Button variant="contained" onClick={() => navigate('/')}>Go to Dashboard</Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
