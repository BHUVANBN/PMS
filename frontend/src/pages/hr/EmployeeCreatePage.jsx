import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { api } from '../../config/api';
import { validateEmail, validateRequired } from '../../utils/validators';

const EmployeeCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    salary: '',
    hireDate: '',
    manager: '',
    skills: '',
    status: 'active'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateRequired(formData.firstName)) {
      newErrors.firstName = 'First name is required';
    }

    if (!validateRequired(formData.lastName)) {
      newErrors.lastName = 'Last name is required';
    }

    if (!validateRequired(formData.email)) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!validateRequired(formData.department)) {
      newErrors.department = 'Department is required';
    }

    if (!validateRequired(formData.position)) {
      newErrors.position = 'Position is required';
    }

    if (!validateRequired(formData.hireDate)) {
      newErrors.hireDate = 'Hire date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const dataToSend = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        salary: formData.salary ? parseFloat(formData.salary) : null
      };
      
      await api.post('/hr/employees', dataToSend);
      navigate('/hr/employees');
    } catch (error) {
      console.error('Error creating employee:', error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Failed to create employee. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-200 mb-2">Add New Employee</h1>
          <p className="text-gray-400">Create a new employee record</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => navigate('/hr/employees')}
          className="w-full sm:w-auto"
        >
          Back to Employees
        </Button>
      </div>

      {/* Form Card */}
      <Card className="bg-gray-900 border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <p className="text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name *"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                error={errors.firstName}
                placeholder="John"
              />
              <Input
                label="Last Name *"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                error={errors.lastName}
                placeholder="Doe"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                placeholder="john.doe@company.com"
              />
              <Input
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                error={errors.phone}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Work Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2">
              Work Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Department *"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                error={errors.department}
                options={[
                  { value: '', label: 'Select Department' },
                  { value: 'engineering', label: 'Engineering' },
                  { value: 'design', label: 'Design' },
                  { value: 'marketing', label: 'Marketing' },
                  { value: 'sales', label: 'Sales' },
                  { value: 'hr', label: 'Human Resources' },
                  { value: 'finance', label: 'Finance' },
                  { value: 'operations', label: 'Operations' }
                ]}
              />
              <Input
                label="Position *"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                error={errors.position}
                placeholder="Software Engineer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Salary"
                name="salary"
                type="number"
                value={formData.salary}
                onChange={handleInputChange}
                error={errors.salary}
                placeholder="75000"
              />
              <Input
                label="Hire Date *"
                name="hireDate"
                type="date"
                value={formData.hireDate}
                onChange={handleInputChange}
                error={errors.hireDate}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Manager"
                name="manager"
                value={formData.manager}
                onChange={handleInputChange}
                error={errors.manager}
                placeholder="Jane Smith"
              />
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'on leave', label: 'On Leave' }
                ]}
              />
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2">
              Skills & Expertise
            </h3>
            <Input
              label="Skills"
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              error={errors.skills}
              placeholder="React, Node.js, Python, Project Management"
              help="Separate multiple skills with commas"
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-700">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/hr/employees')}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="w-full sm:w-auto"
            >
              Create Employee
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EmployeeCreatePage;
