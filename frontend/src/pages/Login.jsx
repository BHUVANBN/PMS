import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

const LoginPage = () => {
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
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.auth.login({ username: formData.email, password: formData.password });
      
      // Store user data in localStorage
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
      
      // Redirect based on user role
      const { role } = response;
      switch (role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'hr':
          navigate('/hr/dashboard');
          break;
        case 'manager':
          navigate('/manager/dashboard');
          break;
        case 'developer':
          navigate('/developer/dashboard');
          break;
        case 'tester':
          navigate('/tester/dashboard');
          break;
        case 'employee':
          navigate('/employee/dashboard');
          break;
        case 'marketing':
          navigate('/marketing/dashboard');
          break;
        case 'sales':
          navigate('/sales/dashboard');
          break;
        case 'intern':
          navigate('/intern/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#111827', padding: 24, borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.3)', color: '#e5e7eb' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ marginTop: 6, color: '#9ca3af' }}>Sign in to your account</p>
        </div>

        {error ? (
          <div style={{ background: '#7f1d1d', color: '#fecaca', padding: '10px 12px', borderRadius: 8, marginBottom: 12 }}>{error}</div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            autoComplete="email"
            required
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #374151', background: '#0b1220', color: '#e5e7eb', marginBottom: 12 }}
          />

          <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #374151', background: '#0b1220', color: '#e5e7eb', marginBottom: 16 }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#e5e7eb' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: 16, height: 16 }}
              />
              Remember me
            </label>
            <a href="#" style={{ fontSize: 14, color: '#93c5fd' }}>Forgot your password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #4f46e5',
              background: loading ? '#3730a3' : '#4f46e5',
              color: '#e5e7eb',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: 16, background: '#1f2937', color: '#e5e7eb', padding: '10px 12px', borderRadius: 8, fontSize: 12 }}>
          You can enter your email here. We'll sign you in using the associated username on the server.
        </div>

        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 14, color: '#e5e7eb' }}>
          Don't have an account? <a href="#" style={{ color: '#93c5fd' }}>Contact your administrator</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
