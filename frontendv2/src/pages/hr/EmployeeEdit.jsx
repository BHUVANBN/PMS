import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import EmployeeForm from './EmployeeForm';

const EmployeeEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>Edit Employee</Typography>
      <EmployeeForm
        mode="edit"
        employeeId={id}
        onCancel={() => navigate('/hr/employees')}
        onSuccess={() => navigate('/hr/employees')}
      />
    </Box>
  );
};

export default EmployeeEdit;
