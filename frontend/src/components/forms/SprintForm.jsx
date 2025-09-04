import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export const SprintForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    goal: initialData.goal || '',
    startDate: initialData.startDate || '',
    endDate: initialData.endDate || '',
    capacity: initialData.capacity || '',
    projectId: initialData.projectId || '',
    status: initialData.status || 'planning',
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Sprint name is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    if (formData.capacity && (isNaN(formData.capacity) || formData.capacity < 0)) {
      newErrors.capacity = 'Capacity must be a positive number';
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

  const statusOptions = [
    { value: 'planning', label: 'Planning' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        <Input
          label="Sprint Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          placeholder="e.g., Sprint 1, Q1 Sprint"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Sprint Goal
          </label>
          <textarea
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="What do you want to achieve in this sprint?"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            error={errors.startDate}
            required
          />

          <Input
            label="End Date"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            error={errors.endDate}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Team Capacity (hours)"
            name="capacity"
            type="number"
            value={formData.capacity}
            onChange={handleChange}
            error={errors.capacity}
            placeholder="Total available hours"
          />

          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
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
            {initialData.id ? 'Update Sprint' : 'Create Sprint'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SprintForm;
