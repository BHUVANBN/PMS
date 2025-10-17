import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import EmployeeForm from './EmployeeForm';

const EmployeeCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialValues = {
    firstName: params.get('firstName') || '',
    lastName: params.get('lastName') || '',
    email: params.get('email') || '',
    username: params.get('username') || '',
    role: params.get('role') || 'employee',
  };

  const handleSuccess = async () => {
    navigate('/hr/onboarding-public', { state: { refresh: true } });
  };
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>New Employee</Typography>
      <EmployeeForm
        mode="create"
        initialValues={initialValues}
        onCancel={() => navigate('/hr/employees')}
        onSuccess={handleSuccess}
      />
    </Box>
  );
};

export default EmployeeCreate;
