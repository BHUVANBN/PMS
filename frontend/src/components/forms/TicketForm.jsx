import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export const TicketForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    type: initialData.type || 'task',
    priority: initialData.priority || 'medium',
    status: initialData.status || 'todo',
    assigneeId: initialData.assigneeId || '',
    projectId: initialData.projectId || '',
    estimatedHours: initialData.estimatedHours || '',
    dueDate: initialData.dueDate || '',
    tags: initialData.tags || '',
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
      newErrors.title = 'Ticket title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Ticket description is required';
    }
    
    if (formData.estimatedHours && (isNaN(formData.estimatedHours) || formData.estimatedHours < 0)) {
      newErrors.estimatedHours = 'Estimated hours must be a positive number';
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

  const typeOptions = [
    { value: 'task', label: 'Task' },
    { value: 'bug', label: 'Bug' },
    { value: 'feature', label: 'Feature' },
    { value: 'improvement', label: 'Improvement' },
    { value: 'epic', label: 'Epic' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'In Review' },
    { value: 'testing', label: 'Testing' },
    { value: 'done', label: 'Done' }
  ];

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        <Input
          label="Ticket Title"
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
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter ticket description..."
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={typeOptions}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Estimated Hours"
            name="estimatedHours"
            type="number"
            step="0.5"
            value={formData.estimatedHours}
            onChange={handleChange}
            error={errors.estimatedHours}
            placeholder="Enter estimated hours"
          />

          <Input
            label="Due Date"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="Enter tags separated by commas"
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
            {initialData.id ? 'Update Ticket' : 'Create Ticket'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TicketForm;
