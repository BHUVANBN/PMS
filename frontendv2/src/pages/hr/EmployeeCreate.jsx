import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import EmployeeForm from './EmployeeForm';

const EmployeeCreate = () => {
  const navigate = useNavigate();
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>New Employee</Typography>
      <EmployeeForm
        mode="create"
        onCancel={() => navigate('/hr/employees')}
        onSuccess={() => navigate('/hr/employees')}
      />
    </Box>
  );
};

export default EmployeeCreate;
