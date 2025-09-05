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
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="flex items-center justify-between mt-4 mb-4">
        <Checkbox
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          label="Remember me"
        />
        <a 
          href="/forgot-password" 
          className="text-sm text-blue-300 no-underline hover:text-blue-200"
        >
          Forgot your password?
        </a>
      </div>

      {error && !error.includes('email') && !error.includes('password') && (
        <div className="bg-red-900 text-red-200 px-3 py-2.5 rounded-lg mb-3 text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
};

export default LoginForm;
