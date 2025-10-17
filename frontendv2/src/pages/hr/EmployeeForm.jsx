import React, { useEffect, useState } from 'react';
import { 
  Box, Button, Grid, Paper, Stack, Typography,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
  Alert
} from '@mui/material';
import { FormInput, FormSection, FormActions } from '../../components/shared/FormComponents';
import { hrAPI } from '../../services/api';

// Roles that HR can assign (matches backend hr.controller.js allowedRolesForHR)
const ROLE_OPTIONS = [
  { label: 'Employee', value: 'employee' },
  { label: 'Manager', value: 'manager' },
  { label: 'Developer', value: 'developer' },
  { label: 'Tester', value: 'tester' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Sales', value: 'sales' },
  { label: 'Intern', value: 'intern' },
];

const EmployeeForm = ({ mode = 'create', employeeId, onCancel, onSuccess, initialValues }) => {
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    role: 'employee',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Prefill on create using initialValues if provided
  useEffect(() => {
    if (mode === 'create' && initialValues) {
      setValues((prev) => ({
        ...prev,
        ...initialValues,
        role: initialValues.role || prev.role,
      }));
    }
  }, [mode, initialValues]);

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
      setSuccess(false);
      const payload = { ...values };
      
      if (mode === 'create') {
        const response = await hrAPI.createEmployee(payload);
        console.log('Employee created:', response);
        setSuccess(true);
        
        // Wait a moment to show success message, then redirect
        setTimeout(() => {
          if (onSuccess) {
            const newId = response?.employee?._id || response?.employee?.id || response?._id || response?.id || null;
            onSuccess(newId);
          }
        }, 1000);
      } else {
        delete payload.password; // avoid sending empty password
        const response = await hrAPI.updateEmployee(employeeId, payload);
        console.log('Employee updated:', response);
        setSuccess(true);
        
        // Wait a moment to show success message, then redirect
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
        }, 1000);
      }
    } catch (e) {
      console.error('Error saving employee:', e);
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
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Employee {mode === 'create' ? 'created' : 'updated'} successfully! Redirecting...
            </Alert>
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
              <Grid item xs={12}>
                <FormControl 
                  component="fieldset" 
                  required 
                  fullWidth
                  sx={{
                    border: '1px solid rgba(0, 0, 0, 0.23)',
                    borderRadius: '4px',
                    padding: '16px',
                    '&:hover': {
                      borderColor: 'rgba(0, 0, 0, 0.87)',
                    },
                    '&:focus-within': {
                      borderColor: 'primary.main',
                      borderWidth: '2px',
                    }
                  }}
                >
                  <FormLabel 
                    component="legend" 
                    sx={{ 
                      mb: 1.5, 
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: 'rgba(0, 0, 0, 0.6)',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      }
                    }}
                  >
                    Role *
                  </FormLabel>
                  <RadioGroup
                    name="role"
                    value={values.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    row
                    sx={{
                      gap: 2,
                      flexWrap: 'wrap',
                    }}
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <FormControlLabel
                        key={opt.value}
                        value={opt.value}
                        control={<Radio />}
                        label={opt.label}
                        sx={{
                          margin: 0,
                          '& .MuiFormControlLabel-label': {
                            fontSize: '0.95rem',
                          }
                        }}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
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
