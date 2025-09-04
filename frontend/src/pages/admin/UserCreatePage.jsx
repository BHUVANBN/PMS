import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import { validateForm, validateEmail, validatePassword, validateRequired } from '../../utils/validators';
import api from '../../services/api';

const UserCreatePage = () => {
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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'hr', label: 'HR Manager' },
    { value: 'manager', label: 'Project Manager' },
    { value: 'developer', label: 'Developer' },
    { value: 'tester', label: 'Tester' },
    { value: 'employee', label: 'Employee' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationRules = {
      username: [validateRequired],
      email: [validateEmail],
      password: [validatePassword],
      confirmPassword: [(value) => formData.password !== value ? 'Passwords do not match' : ''],
      firstName: [validateRequired],
      lastName: [validateRequired]
    };

    const { isValid, errors: validationErrors } = validateForm(formData, validationRules);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await api.admin.createUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      });
      
      navigate('/admin/users');
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to create user' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#e5e7eb', margin: 0, marginBottom: '8px' }}>Create New User</h1>
        <p style={{ color: '#9ca3af', margin: 0 }}>Add a new user to the system</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <Input
              name="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              required
            />
            <Input
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Input
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Input
              type="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Select
              name="role"
              label="Role"
              value={formData.role}
              onChange={handleChange}
              options={roles}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <Input
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
            <Input
              type="password"
              name="confirmPassword"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />
          </div>

          {errors.submit && (
            <div style={{ 
              background: '#7f1d1d', 
              color: '#fecaca', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '16px' 
            }}>
              {errors.submit}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/users')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              Create User
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UserCreatePage;
