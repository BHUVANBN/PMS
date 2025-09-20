import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, MenuItem, Paper, Stack, Typography } from '@mui/material';
import { FormInput, FormSelect, FormSection, FormActions } from '../../components/shared/FormComponents';
import { hrAPI } from '../../services/api';

const ROLE_OPTIONS = [
  { label: 'Admin', value: 'admin' },
  { label: 'HR', value: 'hr' },
  { label: 'Manager', value: 'manager' },
  { label: 'Developer', value: 'developer' },
  { label: 'Tester', value: 'tester' },
  { label: 'Sales', value: 'sales' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Intern', value: 'intern' },
];

const EmployeeForm = ({ mode = 'create', employeeId, onCancel, onSuccess }) => {
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    role: 'developer',
    department: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mode === 'edit' && employeeId) {
      (async () => {
        try {
          setLoading(true);
          const res = await hrAPI.getEmployeeById(employeeId);
          const u = res?.employee || res?.data?.employee || res?.data || res;
          setValues({
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            email: u.email || '',
            username: u.username || '',
            role: u.role || 'developer',
            department: u.department || '',
            password: '',
          });
        } catch (e) {
          setError(e.message || 'Failed to load employee');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [mode, employeeId]);

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const payload = { ...values };
      if (mode === 'create') {
        await hrAPI.createEmployee(payload);
      } else {
        delete payload.password; // avoid sending empty password
        await hrAPI.updateEmployee(employeeId, payload);
      }
      onSuccess?.();
    } catch (e) {
      setError(e.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Typography variant="h5" fontWeight="bold">
            {mode === 'create' ? 'Create Employee' : 'Edit Employee'}
          </Typography>

          {error && (
            <Box className="text-red-600 text-sm">{error}</Box>
          )}

          <FormSection title="Basic Information">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormInput
                  label="First Name"
                  name="firstName"
                  value={values.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormInput
                  label="Last Name"
                  name="lastName"
                  value={values.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormInput
                  label="Email"
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormInput
                  label="Username"
                  name="username"
                  value={values.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormSelect
                  label="Role"
                  name="role"
                  value={values.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  required
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </FormSelect>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormInput
                  label="Department"
                  name="department"
                  value={values.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                />
              </Grid>
              {mode === 'create' && (
                <Grid item xs={12} sm={6}>
                  <FormInput
                    label="Password"
                    type="password"
                    name="password"
                    value={values.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
                  />
                </Grid>
              )}
            </Grid>
          </FormSection>

          <FormActions>
            <Button variant="outlined" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {mode === 'create' ? 'Create' : 'Save Changes'}
            </Button>
          </FormActions>
        </Stack>
      </form>
    </Paper>
  );
};

export default EmployeeForm;
