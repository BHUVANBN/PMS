import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { 
  UserPlus, 
  User, 
  Mail, 
  Lock, 
  Shield, 
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { validateForm, validateEmail, validatePassword, validateRequired } from '../../utils/validators';
import { api } from '../../config/api';

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
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

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
      await api.post('/admin/users', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      });
      
      setShowSuccessToast(true);
      setTimeout(() => {
        navigate('/admin/users');
      }, 1500);
    } catch (error) {
      setShowErrorToast(true);
      setErrors({ submit: error.message || 'Failed to create user' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <UserPlus className="mr-3 h-8 w-8 text-blue-600" />
                Create New User
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Add a new user to the system
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/users')}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </div>

          {/* Form Card */}
          <Card className="p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <User className="mr-2 h-5 w-5 text-blue-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    name="firstName"
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                    required
                    placeholder="Enter first name"
                  />
                  <Input
                    name="lastName"
                    label="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                    required
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Mail className="mr-2 h-5 w-5 text-blue-600" />
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    name="username"
                    label="Username"
                    value={formData.username}
                    onChange={handleChange}
                    error={errors.username}
                    required
                    placeholder="Enter username"
                  />
                  <Input
                    type="email"
                    name="email"
                    label="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              {/* Security & Role */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-blue-600" />
                  Security & Role
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    name="role"
                    label="Role"
                    value={formData.role}
                    onChange={handleChange}
                    options={roles}
                    required
                  />
                  <div></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    type="password"
                    name="password"
                    label="Password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    required
                    placeholder="Enter password"
                  />
                  <Input
                    type="password"
                    name="confirmPassword"
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    required
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              {errors.submit && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  {errors.submit}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/users')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                  className="flex items-center"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create User
                </Button>
              </div>
            </form>
          </Card>

          {/* Success Toast */}
          {showSuccessToast && (
            <div className="fixed top-4 right-4 z-50 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-6 py-4 rounded-lg shadow-lg flex items-center">
              <CheckCircle className="mr-3 h-5 w-5" />
              User created successfully! Redirecting...
            </div>
          )}

          {/* Error Toast */}
          {showErrorToast && (
            <div className="fixed top-4 right-4 z-50 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg shadow-lg flex items-center">
              <AlertCircle className="mr-3 h-5 w-5" />
              Failed to create user. Please try again.
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default UserCreatePage;
