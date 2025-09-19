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

    const validationErrors = validateForm(formData, validationRules);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      };

      await api.admin.createUser(userData);
      navigate('/admin/users');
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Failed to create user. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New User</h1>
            <p className="text-gray-600">Add a new user to the system</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/admin/users')}
            >
              Back to Users
            </Button>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white border border-gray-200">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{errors.submit}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="First Name *"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                    placeholder="John"
                  />
                  <Input
                    label="Last Name *"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Username *"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    error={errors.username}
                    placeholder="johndoe"
                  />
                  <Input
                    label="Email *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Security */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Security
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Password *"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="Enter password"
                  />
                  <Input
                    label="Confirm Password *"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              {/* Role Assignment */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Role Assignment
                </h3>
                <Select
                  label="Role *"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  options={roles}
                  error={errors.role}
                />
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/admin/users')}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  className="w-full sm:w-auto"
                >
                  Create User
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserCreatePage;