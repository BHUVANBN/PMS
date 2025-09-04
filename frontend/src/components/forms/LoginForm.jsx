import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Checkbox from '../ui/Checkbox';
import api from '../../services/api';

const LoginForm = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.auth.login({ 
        username: formData.email, 
        password: formData.password 
      });
      
      localStorage.setItem('user', JSON.stringify({ 
        role: response.role,
        token: response.token 
      }));
      localStorage.setItem('isAuthenticated', 'true');
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }
      
      if (onSuccess) {
        onSuccess(response);
      } else {
        // Default role-based navigation
        const { role } = response;
        const roleRoutes = {
          admin: '/admin/dashboard',
          hr: '/hr/dashboard',
          manager: '/manager/dashboard',
          developer: '/developer/dashboard',
          tester: '/tester/dashboard',
          employee: '/employee/dashboard',
          marketing: '/marketing/dashboard',
          sales: '/sales/dashboard',
          intern: '/intern/dashboard'
        };
        navigate(roleRoutes[role] || '/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        name="email"
        label="Email Address"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter your email"
        autoComplete="email"
        required
        error={error && error.includes('email') ? error : ''}
      />

      <div style={{ marginTop: '16px' }}>
        <Input
          type="password"
          name="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          error={error && error.includes('password') ? error : ''}
        />
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginTop: '16px',
        marginBottom: '16px'
      }}>
        <Checkbox
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          label="Remember me"
        />
        <a 
          href="/forgot-password" 
          style={{ 
            fontSize: '14px', 
            color: '#93c5fd', 
            textDecoration: 'none' 
          }}
        >
          Forgot your password?
        </a>
      </div>

      {error && !error.includes('email') && !error.includes('password') && (
        <div style={{ 
          background: '#7f1d1d', 
          color: '#fecaca', 
          padding: '10px 12px', 
          borderRadius: '8px', 
          marginBottom: '12px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        disabled={loading}
        style={{ width: '100%' }}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
};

export default LoginForm;
