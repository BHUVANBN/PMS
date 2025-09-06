import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../common';
import { managerAPI } from '../../services/api';
import { SPRINT_STATUS } from '../../utils/constants/api';

const SprintForm = ({ 
  sprint = null, 
  projectId = null,
  onSuccess, 
  onError, 
  onCancel,
  className = '' 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectId: projectId || '',
    startDate: '',
    endDate: '',
    status: SPRINT_STATUS.PLANNING,
    goal: '',
    capacity: '',
    velocity: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [projects, setProjects] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const isEditing = Boolean(sprint);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (sprint) {
      setFormData({
        name: sprint.name || '',
        description: sprint.description || '',
        projectId: sprint.projectId?._id || projectId || '',
        startDate: sprint.startDate ? new Date(sprint.startDate).toISOString().split('T')[0] : '',
        endDate: sprint.endDate ? new Date(sprint.endDate).toISOString().split('T')[0] : '',
        status: sprint.status || SPRINT_STATUS.PLANNING,
        goal: sprint.goal || '',
        capacity: sprint.capacity || '',
        velocity: sprint.velocity || ''
      });
    }
  }, [sprint, projectId]);

  const loadInitialData = async () => {
    try {
      const projectsRes = await managerAPI.getProjects();
      setProjects(projectsRes.projects || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Sprint name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Sprint name must be at least 3 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Sprint description is required';
    }
    
    if (!formData.projectId) {
      newErrors.projectId = 'Project selection is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    if (!formData.goal.trim()) {
      newErrors.goal = 'Sprint goal is required';
    }
    
    if (formData.capacity && (isNaN(formData.capacity) || parseFloat(formData.capacity) < 0)) {
      newErrors.capacity = 'Capacity must be a valid positive number';
    }
    
    if (formData.velocity && (isNaN(formData.velocity) || parseFloat(formData.velocity) < 0)) {
      newErrors.velocity = 'Velocity must be a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const sprintData = {
        ...formData,
        capacity: formData.capacity ? parseFloat(formData.capacity) : null,
        velocity: formData.velocity ? parseFloat(formData.velocity) : null
      };

      let response;
      if (isEditing) {
        response = await managerAPI.updateSprint(sprint._id, sprintData);
      } else {
        response = await managerAPI.createSprint(sprintData);
      }
      
      onSuccess?.(response);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        `Failed to ${isEditing ? 'update' : 'create'} sprint. Please try again.`;
      setErrors({ submit: errorMessage });
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" text="Loading form data..." />
      </div>
    );
  }

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isEditing ? 'Edit Sprint' : 'Create New Sprint'}
          </h2>
          <p className="text-gray-600">
            {isEditing ? 'Update sprint details' : 'Plan your next sprint iteration'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sprint Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Sprint Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Sprint 1, Sprint 2024-Q1, etc."
              disabled={loading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Project Selection */}
          <div>
            <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-2">
              Project *
            </label>
            <select
              id="projectId"
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                errors.projectId ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
            {errors.projectId && (
              <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-vertical ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Brief description of the sprint"
              disabled={loading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Sprint Goal */}
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
              Sprint Goal *
            </label>
            <textarea
              id="goal"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-vertical ${
                errors.goal ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="What do you want to achieve in this sprint?"
              disabled={loading}
            />
            {errors.goal && (
              <p className="mt-1 text-sm text-red-600">{errors.goal}</p>
            )}
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Status and Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                disabled={loading}
              >
                <option value={SPRINT_STATUS.PLANNING}>Planning</option>
                <option value={SPRINT_STATUS.ACTIVE}>Active</option>
                <option value={SPRINT_STATUS.COMPLETED}>Completed</option>
                <option value={SPRINT_STATUS.CANCELLED}>Cancelled</option>
              </select>
            </div>

            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                Team Capacity (hours)
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="0"
                step="0.5"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  errors.capacity ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="80"
                disabled={loading}
              />
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
              )}
            </div>

            <div>
              <label htmlFor="velocity" className="block text-sm font-medium text-gray-700 mb-2">
                Target Velocity (story points)
              </label>
              <input
                type="number"
                id="velocity"
                name="velocity"
                value={formData.velocity}
                onChange={handleChange}
                min="0"
                step="1"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  errors.velocity ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="25"
                disabled={loading}
              />
              {errors.velocity && (
                <p className="mt-1 text-sm text-red-600">{errors.velocity}</p>
              )}
            </div>
          </div>

          {/* Sprint Duration Info */}
          {formData.startDate && formData.endDate && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <p className="text-green-800 font-medium">Sprint Duration</p>
                  <p className="text-green-700">
                    {Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))} days
                    ({Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24 * 7))} weeks)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </span>
                </>
              ) : (
                isEditing ? 'Update Sprint' : 'Create Sprint'
              )}
            </button>
            
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SprintForm;
