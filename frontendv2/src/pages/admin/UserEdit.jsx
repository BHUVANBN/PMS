import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stack, Button, Grid, MenuItem } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { FormInput, FormSelect, FormSection, FormActions } from '../../components/shared/FormComponents';
import { adminAPI } from '../../services/api';

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

const UserEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    role: 'developer',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setFetchLoading(true);
      const response = await adminAPI.getAllUsers();
      
      // Find the user from the response
      let users = [];
      if (Array.isArray(response)) {
        users = response;
      } else if (response?.users) {
        users = response.users;
      } else if (response?.data?.users) {
        users = response.data.users;
      } else if (response?.data && Array.isArray(response.data)) {
        users = response.data;
      }

      const user = users.find(u => (u._id || u.id) === id);
      
      if (user) {
        setValues({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          username: user.username || '',
          email: user.email || '',
          role: user.role || 'developer',
          password: '', // Don't pre-fill password
        });
      } else {
        setError('User not found');
      }
    } catch (e) {
      setError(e.message || 'Failed to fetch user');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (name, value) => setValues(prev => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const updateData = { ...values };
      // Don't send password if it's empty
      if (!updateData.password) {
        delete updateData.password;
      }
      
      await adminAPI.updateUserRole(id, updateData);
      navigate('/admin/users');
    } catch (e) {
      setError(e.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" mb={3}>Edit User</Typography>
        <Paper sx={{ p: 3 }}>
          <Typography>Loading user data...</Typography>
        </Paper>
      </Box>
    );
  }

  if (error && fetchLoading === false && !values.username) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" mb={3}>Edit User</Typography>
        <Paper sx={{ p: 3 }}>
          <Typography color="error">{error}</Typography>
          <Button onClick={() => navigate('/admin/users')} sx={{ mt: 2 }}>
            Back to Users
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>Edit User</Typography>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {error && <Box sx={{ color: 'error.main', fontSize: '0.875rem' }}>{error}</Box>}
            <FormSection title="User Information">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormInput 
                    label="First Name" 
                    value={values.firstName} 
                    onChange={(e) => handleChange('firstName', e.target.value)} 
                    required 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormInput 
                    label="Last Name" 
                    value={values.lastName} 
                    onChange={(e) => handleChange('lastName', e.target.value)} 
                    required 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormInput 
                    label="Username" 
                    value={values.username} 
                    onChange={(e) => handleChange('username', e.target.value)} 
                    required 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormInput 
                    label="Email" 
                    type="email" 
                    value={values.email} 
                    onChange={(e) => handleChange('email', e.target.value)} 
                    required 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormSelect 
                    label="Role" 
                    value={values.role} 
                    onChange={(e) => handleChange('role', e.target.value)} 
                    options={ROLE_OPTIONS}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormInput 
                    label="New Password (leave blank to keep current)" 
                    type="password" 
                    value={values.password} 
                    onChange={(e) => handleChange('password', e.target.value)}
                    helperText="Leave blank to keep current password"
                  />
                </Grid>
              </Grid>
            </FormSection>
            <FormActions>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/admin/users')} 
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update User'}
              </Button>
            </FormActions>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default UserEdit;
