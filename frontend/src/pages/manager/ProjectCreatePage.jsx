import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { api } from '../../config/api';
import { validateRequired } from '../../utils/validators';

const ProjectCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
    budget: '',
    client: '',
    manager: '',
    teamMembers: [],
    technologies: '',
    requirements: '',
    isPublic: false,
    enableTimeTracking: true,
    enableBugTracking: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

    if (!validateRequired(formData.name)) {
      newErrors.name = 'Project name is required';
    }

    if (!validateRequired(formData.description)) {
      newErrors.description = 'Project description is required';
    }

    if (!validateRequired(formData.startDate)) {
      newErrors.startDate = 'Start date is required';
    }

    if (!validateRequired(formData.endDate)) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
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
        budget: formData.budget ? parseFloat(formData.budget) : null,
        technologies: formData.technologies.split(',').map(tech => tech.trim()).filter(tech => tech)
      };
      
      const response = await api.post('/manager/projects', dataToSend);
      navigate(`/manager/projects/${response.data.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Failed to create project. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Project</h1>
          <p className="text-gray-600 dark:text-gray-400">Set up a new project with team and requirements</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/manager/projects')}
        >
          Back to Projects
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-red-600 dark:text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h2>
            
            <Input
              label="Project Name *"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              placeholder="E-commerce Platform Redesign"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Detailed project description, goals, and objectives..."
              />
              {errors.description && (
                <p className="text-red-600 dark:text-red-400 text-sm">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                options={[
                  { value: 'planning', label: 'Planning' },
                  { value: 'active', label: 'Active' },
                  { value: 'on-hold', label: 'On Hold' },
                  { value: 'completed', label: 'Completed' }
                ]}
              />
              <Select
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'critical', label: 'Critical' }
                ]}
              />
              <Input
                label="Budget"
                name="budget"
                type="number"
                value={formData.budget}
                onChange={handleInputChange}
                placeholder="50000"
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Timeline</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date *"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                error={errors.startDate}
              />
              <Input
                label="End Date *"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                error={errors.endDate}
              />
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Project Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Client"
                name="client"
                value={formData.client}
                onChange={handleInputChange}
                placeholder="Acme Corporation"
              />
              <Input
                label="Project Manager"
                name="manager"
                value={formData.manager}
                onChange={handleInputChange}
                placeholder="John Smith"
              />
            </div>

            <Input
              label="Technologies"
              name="technologies"
              value={formData.technologies}
              onChange={handleInputChange}
              placeholder="React, Node.js, MongoDB, AWS"
              help="Separate multiple technologies with commas"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Requirements
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="List key requirements, features, and deliverables..."
              />
            </div>
          </div>

          {/* Project Settings */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Project Settings</h2>
            
            <div className="space-y-3">
              <Checkbox
                label="Public Project"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
                help="Allow all team members to view this project"
              />
              <Checkbox
                label="Enable Time Tracking"
                name="enableTimeTracking"
                checked={formData.enableTimeTracking}
                onChange={handleInputChange}
                help="Track time spent on project tasks"
              />
              <Checkbox
                label="Enable Bug Tracking"
                name="enableBugTracking"
                checked={formData.enableBugTracking}
                onChange={handleInputChange}
                help="Allow bug reports and tracking for this project"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/manager/projects')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
            >
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectCreatePage;
