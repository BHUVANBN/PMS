import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FormInput, FormSelect, FormSection, FormActions } from '../../components/shared/FormComponents';
import { useState } from 'react';
import { adminAPI } from '../../services/api';
import { Button, Grid, MenuItem, Paper, Stack } from '@mui/material';

const ROLE_OPTIONS = [
  'admin','hr','manager','developer','tester','sales','marketing','intern'
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
      <Typography variant="h4" fontWeight="bold" mb={3}>Create User</Typography>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {error && <Box className="text-red-600 text-sm">{error}</Box>}
            <FormSection title="Basic Information">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormInput label="First Name" value={values.firstName} onChange={(e)=>handleChange('firstName', e.target.value)} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormInput label="Last Name" value={values.lastName} onChange={(e)=>handleChange('lastName', e.target.value)} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormInput label="Username" value={values.username} onChange={(e)=>handleChange('username', e.target.value)} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormInput label="Email" type="email" value={values.email} onChange={(e)=>handleChange('email', e.target.value)} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormSelect label="Role" value={values.role} onChange={(e)=>handleChange('role', e.target.value)} required>
                    {ROLE_OPTIONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </FormSelect>
                </Grid>
                <Grid item xs={12} sm={6}>
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
