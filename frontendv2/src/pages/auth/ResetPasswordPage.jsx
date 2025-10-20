import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Typography,
  Button,
  Alert,
  useTheme,
  InputAdornment
} from '@mui/material';
import { Lock } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const ResetPasswordPage = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const [token, setToken] = useState('');
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      setAlert({ severity: 'error', message: 'Reset token is missing or invalid.' });
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!token) {
      setAlert({ severity: 'error', message: 'Reset token is missing or invalid.' });
      return;
    }

    if (!form.password || form.password.length < 6) {
      setAlert({ severity: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setAlert({ severity: 'error', message: 'Passwords do not match.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await resetPassword({ token, password: form.password });
      if (result.success) {
        setAlert({ severity: 'success', message: 'Password reset successful. Redirecting to login...' });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setAlert({ severity: 'error', message: result.error || 'Unable to reset password.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.secondary.light}20, ${theme.palette.primary.light}20)`,
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography variant="h4" fontWeight={600} textAlign="center" mb={1}>
            Reset Password
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" mb={4}>
            Enter your new password below.
          </Typography>

          {alert && (
            <Alert severity={alert.severity} sx={{ mb: 3 }}>
              {alert.message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              type="password"
              label="New Password"
              name="password"
              value={form.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              type="password"
              label="Confirm Password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{ py: 1.5, fontWeight: 600, mb: 2 }}
            >
              {isSubmitting ? 'Updating Password...' : 'Reset Password'}
            </Button>
          </Box>

          <Button
            component={Link}
            to="/login"
            fullWidth
            variant="text"
            sx={{ fontWeight: 600 }}
          >
            Back to Login
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPasswordPage;
