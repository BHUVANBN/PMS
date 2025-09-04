import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export const UserForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    role: initialData.role || 'employee',
    department: initialData.department || '',
    position: initialData.position || '',
    status: initialData.status || 'active',
    startDate: initialData.startDate || '',
    ...initialData
  });

  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'hr', label: 'HR' },
    { value: 'manager', label: 'Manager' },
    { value: 'developer', label: 'Developer' },
    { value: 'tester', label: 'Tester' },
    { value: 'employee', label: 'Employee' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const departmentOptions = [
    { value: 'engineering', label: 'Engineering' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'finance', label: 'Finance' },
    { value: 'operations', label: 'Operations' }
  ];

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            required
          />

          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
            required
          />
        </div>

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <Input
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter phone number"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={roleOptions}
            error={errors.role}
            required
          />

          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            options={departmentOptions}
          />

          <Input
            label="Position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            placeholder="Enter job position"
          />
        </div>

        <Input
          label="Start Date"
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
        />

        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            loading={isLoading}
          >
            {initialData.id ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default UserForm;
