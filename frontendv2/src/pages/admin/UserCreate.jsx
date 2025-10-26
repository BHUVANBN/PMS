import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FormInput, FormSelect, FormSection, FormActions } from '../../components/shared/FormComponents';
import { useState } from 'react';
import { adminAPI } from '../../services/api';
import { Button, Grid, MenuItem, Paper, Stack } from '@mui/material';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'hr', label: 'HR' },
  { value: 'manager', label: 'Manager' },
  { value: 'developer', label: 'Developer' },
  { value: 'tester', label: 'Tester' },
  { value: 'sales', label: 'Sales' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'intern', label: 'Intern' },
  { value: 'employee', label: 'Employee' }
];

const UserCreate = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    role: 'developer',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (name, value) => setValues(prev => ({...prev, [name]: value}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await adminAPI.createUser(values);
      navigate('/admin/users');
    } catch (e) {
      setError(e.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h1" className="page-title" sx={{ fontSize: { xs: '1.75rem', md: '2rem' }, fontWeight: 700, mb: 3 }}>Create User</Typography>
      <Paper sx={{ p: 3 }} className="card-pad">
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {error && <Box className="input-error-text" sx={{ fontSize: '0.75rem', color: 'error.main', mb: 2 }}>{error}</Box>}
            <FormSection title="Basic Information">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} className="form-field">
                  <FormInput label="First Name" value={values.firstName} onChange={(e)=>handleChange('firstName', e.target.value)} required />
                </Grid>
                <Grid item xs={12} sm={6} className="form-field">
                  <FormInput label="Last Name" value={values.lastName} onChange={(e)=>handleChange('lastName', e.target.value)} required />
                </Grid>
                <Grid item xs={12} sm={6} className="form-field">
                  <FormInput label="Username" value={values.username} onChange={(e)=>handleChange('username', e.target.value)} required />
                </Grid>
                <Grid item xs={12} sm={6} className="form-field">
                  <FormInput label="Email" type="email" value={values.email} onChange={(e)=>handleChange('email', e.target.value)} required />
                </Grid>
                <Grid item xs={12} sm={6} className="form-field">
                  <FormSelect 
                    label="Role" 
                    value={values.role} 
                    onChange={(e)=>handleChange('role', e.target.value)} 
                    options={ROLE_OPTIONS}
                    required 
                  />
                </Grid>
                <Grid item xs={12} sm={6} className="form-field">
                  <FormInput label="Password" type="password" value={values.password} onChange={(e)=>handleChange('password', e.target.value)} required />
                </Grid>
              </Grid>
            </FormSection>
            <FormActions>
              <Button variant="outlined" onClick={()=>navigate('/admin/users')} disabled={loading}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading}>Create</Button>
            </FormActions>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default UserCreate;
