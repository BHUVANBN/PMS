import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { Email } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!email.trim()) {
      setAlert({ severity: 'error', message: 'Email is required' });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await forgotPassword(email.trim());
      if (result.success) {
        setAlert({
          severity: 'success',
          message: 'If that account exists, we have emailed password reset instructions.'
        });
        setEmail('');
      } else {
        setAlert({ severity: 'error', message: result.error || 'Unable to process request' });
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
            Forgot Password
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" mb={4}>
            Enter your email address to receive password reset instructions.
          </Typography>

          {alert && (
            <Alert severity={alert.severity} sx={{ mb: 3 }}>
              {alert.message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
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
              {isSubmitting ? 'Sending Instructions...' : 'Send Reset Link'}
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

export default ForgotPasswordPage;
