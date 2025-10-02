import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
} from '@mui/material';

const USER_ROLES = [
  'admin',
  'hr', 
  'manager',
  'developer',
  'tester',
  'sales',
  'marketing',
  'intern',
  'employee'
];

const UserDialog = ({ open, user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    role: 'developer',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Editing existing user
      const nameParts = user.username.split(' ');
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        username: user.username,
        email: user.email,
        role: user.role,
        password: '', // Don't pre-fill password for editing
      });
    } else {
      // Creating new user
      setFormData({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        role: 'developer',
        password: '',
      });
    }
  }, [user]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const submitData = { ...formData };
      if (user) {
        submitData.id = user.id;
        // Don't send password if it's empty for updates
        if (!submitData.password) {
          delete submitData.password;
        }
      }
      
      // Ensure username is properly formatted for new users
      if (!user && formData.firstName && formData.lastName) {
        submitData.username = `${formData.firstName} ${formData.lastName}`;
      }
      
      console.log('Submitting user data:', submitData);
      await onSave(submitData);
    } catch (error) {
      console.error('Error saving user:', error);
      // Don't set loading to false here as the parent component will handle the dialog closing
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    const required = ['firstName', 'lastName', 'username', 'email'];
    if (!user) {
      required.push('password'); // Password required for new users
    }
    return required.every(field => formData[field].trim() !== '');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {user ? 'Edit User' : 'Create New User'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                fullWidth
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                fullWidth
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Username"
                fullWidth
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  id="role-select"
                  value={formData.role}
                  label="Role"
                  onChange={(e) => handleChange('role', e.target.value)}
                >
                  {USER_ROLES.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={user ? "New Password (leave blank to keep current)" : "Password"}
                type="password"
                fullWidth
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required={!user}
                helperText={user ? "Leave blank to keep current password" : ""}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={loading || !isFormValid()}
        >
          {loading ? 'Saving...' : (user ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDialog;
