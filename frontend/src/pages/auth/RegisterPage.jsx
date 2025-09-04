import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'employee'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roles = [
    { value: 'employee', label: 'Employee' },
    { value: 'developer', label: 'Developer' },
    { value: 'tester', label: 'Tester' },
    { value: 'manager', label: 'Manager' },
    { value: 'intern', label: 'Intern' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const registrationData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        role: formData.role
      };

      await api.auth.register(registrationData);
      
      setSuccess('Registration successful! Please wait for administrator approval.');
      
      // Clear form
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        role: 'employee'
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 480, background: '#111827', padding: 24, borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.3)', color: '#e5e7eb' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>Create Account</h2>
          <p style={{ marginTop: 6, color: '#9ca3af' }}>Register for a new account</p>
        </div>

        {error && (
          <div style={{ background: '#7f1d1d', color: '#fecaca', padding: '10px 12px', borderRadius: 8, marginBottom: 12 }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: '#065f46', color: '#a7f3d0', padding: '10px 12px', borderRadius: 8, marginBottom: 12 }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #374151', background: '#0b1220', color: '#e5e7eb' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #374151', background: '#0b1220', color: '#e5e7eb' }}
              />
            </div>
          </div>

          <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter username"
            autoComplete="username"
            required
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #374151', background: '#0b1220', color: '#e5e7eb', marginBottom: 12 }}
          />

          <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
            autoComplete="email"
            required
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #374151', background: '#0b1220', color: '#e5e7eb', marginBottom: 12 }}
          />

          <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #374151', background: '#0b1220', color: '#e5e7eb', marginBottom: 12 }}
          >
            {roles.map(role => (
              <option key={role.value} value={role.value} style={{ background: '#0b1220' }}>
                {role.label}
              </option>
            ))}
          </select>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                autoComplete="new-password"
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #374151', background: '#0b1220', color: '#e5e7eb' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                autoComplete="new-password"
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #374151', background: '#0b1220', color: '#e5e7eb' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #059669',
              background: loading ? '#047857' : '#059669',
              color: '#e5e7eb',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: 12
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: 16, background: '#1f2937', color: '#e5e7eb', padding: '10px 12px', borderRadius: 8, fontSize: 12 }}>
          Your account will need administrator approval before you can log in.
        </div>

        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 14, color: '#e5e7eb' }}>
          Already have an account?{' '}
          <button
            onClick={handleBackToLogin}
            style={{ background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
