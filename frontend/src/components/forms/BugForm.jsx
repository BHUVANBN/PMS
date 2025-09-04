import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export const BugForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    severity: initialData.severity || 'medium',
    priority: initialData.priority || 'medium',
    status: initialData.status || 'open',
    reporterId: initialData.reporterId || '',
    assigneeId: initialData.assigneeId || '',
    projectId: initialData.projectId || '',
    environment: initialData.environment || 'production',
    stepsToReproduce: initialData.stepsToReproduce || '',
    expectedBehavior: initialData.expectedBehavior || '',
    actualBehavior: initialData.actualBehavior || '',
    browserVersion: initialData.browserVersion || '',
    operatingSystem: initialData.operatingSystem || '',
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
    
    if (!formData.title.trim()) {
      newErrors.title = 'Bug title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Bug description is required';
    }
    
    if (!formData.stepsToReproduce.trim()) {
      newErrors.stepsToReproduce = 'Steps to reproduce are required';
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

  const severityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
    { value: 'duplicate', label: 'Duplicate' }
  ];

  const environmentOptions = [
    { value: 'development', label: 'Development' },
    { value: 'staging', label: 'Staging' },
    { value: 'production', label: 'Production' }
  ];

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        <Input
          label="Bug Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          required
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Describe the bug..."
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Severity"
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            options={severityOptions}
          />

          <Select
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={priorityOptions}
          />

          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
          />

          <Select
            label="Environment"
            name="environment"
            value={formData.environment}
            onChange={handleChange}
            options={environmentOptions}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Steps to Reproduce *
          </label>
          <textarea
            name="stepsToReproduce"
            value={formData.stepsToReproduce}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="1. Step one&#10;2. Step two&#10;3. Step three..."
          />
          {errors.stepsToReproduce && (
            <p className="text-red-500 text-sm">{errors.stepsToReproduce}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Expected Behavior
            </label>
            <textarea
              name="expectedBehavior"
              value={formData.expectedBehavior}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="What should happen..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Actual Behavior
            </label>
            <textarea
              name="actualBehavior"
              value={formData.actualBehavior}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="What actually happens..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Browser/Version"
            name="browserVersion"
            value={formData.browserVersion}
            onChange={handleChange}
            placeholder="e.g., Chrome 91.0.4472.124"
          />

          <Input
            label="Operating System"
            name="operatingSystem"
            value={formData.operatingSystem}
            onChange={handleChange}
            placeholder="e.g., Windows 10, macOS 11.4"
          />
        </div>

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
            {initialData.id ? 'Update Bug Report' : 'Submit Bug Report'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default BugForm;
