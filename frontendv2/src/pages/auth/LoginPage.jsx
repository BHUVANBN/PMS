import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  Checkbox,
  FormControlLabel,
  Paper,
  useTheme,
  InputAdornment,
  IconButton,
  Stack,
  Divider
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock,
  AccountCircle,
  TrendingUp,
  People,
  Security
} from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../contexts/AuthContext';
import skillonxLogo from '../../assets/skillonx.png';

const dashboardRoutes = {
  admin: '/admin/dashboard',
  hr: '/hr/dashboard',
  manager: '/manager/dashboard',
  developer: '/developer/dashboard',
  tester: '/tester/dashboard',
  sales: '/sales/dashboard',
  marketing: '/marketing/dashboard',
  intern: '/intern/dashboard',
};

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    clearError();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLogin = async () => {
    const { success, firstLogin, user, error } = await login(formData);

    if (success) {
      if (firstLogin) {
        toast.success(`Welcome ${user.fullName}! Your account has been verified by HR.`);
      } else {
        toast.success(`Welcome back, ${user.fullName}!`);
      }

      const normalizedRole = (user?.role || '').toString().trim().toLowerCase();
      const redirectTo = dashboardRoutes[normalizedRole] || '/';
      navigate(redirectTo, { replace: true });
    } else {
      toast.error(`Login failed: ${error || 'Unknown error'}`);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await handleLogin();
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: <TrendingUp />, text: 'Track project progress in real-time' },
    { icon: <People />, text: 'Collaborate with your team seamlessly' },
    { icon: <Security />, text: 'Enterprise-grade security & privacy' }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 20%, rgba(66, 165, 245, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(3, 169, 244, 0.15) 0%, transparent 50%),
          linear-gradient(135deg, #f8fbff 0%, #e3f2fd 50%, #f8fbff 100%)
        `,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(33, 150, 243, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-30%',
          left: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(66, 165, 245, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(50px)',
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            alignItems: 'stretch'
          }}
        >
          {/* Left Side - Branding & Info */}
          <Box
            sx={{
              flex: 1,
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'center',
              pr: 4
            }}
          >
            <Box sx={{ mb: 4 }}>
              {/* Logo */}
              <Box
                sx={{
                  mb: 3,
                  display: 'flex',
                  justifyContent: 'flex-start'
                }}
              >
                <Box
                  component="img"
                  src={skillonxLogo}
                  alt="Skillonx"
                  sx={{
                    height: 'auto',
                    width: '240px',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))'
                  }}
                />
              </Box>
              
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 2
                }}
              >
                Streamline Your Workflow
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  mb: 4,
                  lineHeight: 1.7
                }}
              >
                Manage projects, track progress, and collaborate with your team all in one powerful platform.
              </Typography>
            </Box>

            {/* Features List */}
            <Stack spacing={3}>
              {features.map((feature, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    border: '1px solid rgba(33, 150, 243, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(8px)',
                      boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      color: theme.palette.primary.main
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 500,
                      color: 'text.primary'
                    }}
                  >
                    {feature.text}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Right Side - Login Form with Enhanced Glassmorphism */}
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 5 },
                width: '100%',
                maxWidth: 480,
                mx: 'auto',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                backdropFilter: 'blur(30px) saturate(180%)',
                WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: `
                  0 8px 32px rgba(31, 38, 135, 0.15),
                  0 2px 8px rgba(31, 38, 135, 0.1),
                  inset 0 0 0 1px rgba(255, 255, 255, 0.5)
                `,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(33, 150, 243, 0.03) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                {/* Logo for mobile */}
                <Box
                  sx={{
                    display: { xs: 'flex', md: 'none' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3
                  }}
                >
                  <Box
                    component="img"
                    src={skillonxLogo}
                    alt="Skillonx"
                    sx={{
                      height: 'auto',
                      width: '180px',
                      maxWidth: '80%',
                      objectFit: 'contain'
                    }}
                  />
                </Box>

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    mb: 1,
                    textAlign: 'center',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  Welcome Back
                </Typography>
                
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    mb: 4,
                    textAlign: 'center'
                  }}
                >
                  Sign in to continue to your dashboard
                </Typography>

                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: '12px',
                      background: 'rgba(211, 47, 47, 0.08)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(211, 47, 47, 0.2)'
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '14px',
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        border: '1px solid rgba(33, 150, 243, 0.1)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: '1px solid rgba(33, 150, 243, 0.2)',
                        },
                        '&.Mui-focused': {
                          background: 'rgba(255, 255, 255, 0.9)',
                          boxShadow: '0 4px 16px rgba(33, 150, 243, 0.15)'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(33, 150, 243, 0.2)',
                      }
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{
                              '&:hover': {
                                background: 'rgba(33, 150, 243, 0.08)'
                              }
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '14px',
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        border: '1px solid rgba(33, 150, 243, 0.1)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: '1px solid rgba(33, 150, 243, 0.2)',
                        },
                        '&.Mui-focused': {
                          background: 'rgba(255, 255, 255, 0.9)',
                          boxShadow: '0 4px 16px rgba(33, 150, 243, 0.15)'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(33, 150, 243, 0.2)',
                      }
                    }}
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <FormControlLabel
                      control={<Checkbox color="primary" />}
                      label={<Typography variant="body2">Remember me</Typography>}
                    />
                    <Link
                      to="/forgot-password"
                      style={{
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      Forgot password?
                    </Link>
                  </Box>
                  
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                      py: 1.75,
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                      boxShadow: '0 4px 16px rgba(33, 150, 243, 0.35)',
                      textTransform: 'none',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                        transition: 'left 0.5s ease',
                      },
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        boxShadow: '0 6px 20px rgba(33, 150, 243, 0.45)',
                        transform: 'translateY(-2px)',
                        '&::before': {
                          left: '100%',
                        }
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>

                  <Divider 
                    sx={{ 
                      my: 3,
                      '&::before, &::after': {
                        borderColor: 'rgba(0, 0, 0, 0.08)'
                      }
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      OR
                    </Typography>
                  </Divider>

                  <Button
                    component={Link}
                    to="/onboard"
                    fullWidth
                    variant="outlined"
                    startIcon={<AccountCircle />}
                    sx={{
                      py: 1.5,
                      borderRadius: '14px',
                      borderWidth: 2,
                      fontWeight: 600,
                      textTransform: 'none',
                      borderColor: 'rgba(33, 150, 243, 0.3)',
                      background: 'rgba(255, 255, 255, 0.4)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderWidth: 2,
                        borderColor: theme.palette.primary.main,
                        background: 'rgba(33, 150, 243, 0.08)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)'
                      }
                    }}
                  >
                    New Employee Onboarding
                  </Button>

                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.secondary',
                      mt: 2
                    }}
                  >
                    Contact HR for your login credentials
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Box>
  );
};

export default LoginPage;