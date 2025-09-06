import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../common';
import { testerAPI, managerAPI } from '../../services/api';
import { BUG_SEVERITY, BUG_STATUS, BUG_PRIORITY } from '../../utils/constants/api';

const BugForm = ({ 
  bug = null, 
  projectId = null,
  onSuccess, 
  onError, 
  onCancel,
  className = '' 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    severity: BUG_SEVERITY.MEDIUM,
    priority: BUG_PRIORITY.MEDIUM,
    status: BUG_STATUS.OPEN,
    projectId: projectId || '',
    assignedTo: '',
    reportedBy: '',
    environment: '',
    browserVersion: '',
    operatingSystem: '',
    attachments: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const isEditing = Boolean(bug);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (bug) {
      setFormData({
        title: bug.title || '',
        description: bug.description || '',
        stepsToReproduce: bug.stepsToReproduce || '',
        expectedBehavior: bug.expectedBehavior || '',
        actualBehavior: bug.actualBehavior || '',
        severity: bug.severity || BUG_SEVERITY.MEDIUM,
        priority: bug.priority || BUG_PRIORITY.MEDIUM,
        status: bug.status || BUG_STATUS.OPEN,
        projectId: bug.projectId?._id || projectId || '',
        assignedTo: bug.assignedTo?._id || '',
        reportedBy: bug.reportedBy?._id || '',
        environment: bug.environment || '',
        browserVersion: bug.browserVersion || '',
        operatingSystem: bug.operatingSystem || '',
        attachments: bug.attachments || []
      });
    }
  }, [bug, projectId]);

  const loadInitialData = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        managerAPI.getProjects(),
        managerAPI.getTeamMembers()
      ]);
      setProjects(projectsRes.projects || []);
      setUsers(usersRes.users || []);
    } catch (error) {
      console.error('Failed to load initial data:', error);
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
    
    if (!formData.title.trim()) {
      newErrors.title = 'Bug title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Bug description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    if (!formData.stepsToReproduce.trim()) {
      newErrors.stepsToReproduce = 'Steps to reproduce are required';
    }
    
    if (!formData.expectedBehavior.trim()) {
      newErrors.expectedBehavior = 'Expected behavior is required';
    }
    
    if (!formData.actualBehavior.trim()) {
      newErrors.actualBehavior = 'Actual behavior is required';
    }
    
    if (!formData.projectId) {
      newErrors.projectId = 'Project selection is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const bugData = {
        ...formData,
        assignedTo: formData.assignedTo || null,
        reportedBy: formData.reportedBy || null
      };

      let response;
      if (isEditing) {
        response = await testerAPI.updateBug(bug._id, bugData);
      } else {
        response = await testerAPI.createBug(bugData);
      }
      
      onSuccess?.(response);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        `Failed to ${isEditing ? 'update' : 'create'} bug report. Please try again.`;
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
    <div className={`max-w-3xl mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isEditing ? 'Edit Bug Report' : 'Report New Bug'}
          </h2>
          <p className="text-gray-600">
            {isEditing ? 'Update bug report details' : 'Provide detailed information about the bug'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Bug Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Brief description of the bug"
              disabled={loading}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
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
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-vertical ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Detailed description of the bug"
              disabled={loading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Steps to Reproduce */}
          <div>
            <label htmlFor="stepsToReproduce" className="block text-sm font-medium text-gray-700 mb-2">
              Steps to Reproduce *
            </label>
            <textarea
              id="stepsToReproduce"
              name="stepsToReproduce"
              value={formData.stepsToReproduce}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-vertical ${
                errors.stepsToReproduce ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1. Step one&#10;2. Step two&#10;3. Step three"
              disabled={loading}
            />
            {errors.stepsToReproduce && (
              <p className="mt-1 text-sm text-red-600">{errors.stepsToReproduce}</p>
            )}
          </div>

          {/* Expected vs Actual Behavior */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="expectedBehavior" className="block text-sm font-medium text-gray-700 mb-2">
                Expected Behavior *
              </label>
              <textarea
                id="expectedBehavior"
                name="expectedBehavior"
                value={formData.expectedBehavior}
                onChange={handleChange}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-vertical ${
                  errors.expectedBehavior ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="What should happen?"
                disabled={loading}
              />
              {errors.expectedBehavior && (
                <p className="mt-1 text-sm text-red-600">{errors.expectedBehavior}</p>
              )}
            </div>

            <div>
              <label htmlFor="actualBehavior" className="block text-sm font-medium text-gray-700 mb-2">
                Actual Behavior *
              </label>
              <textarea
                id="actualBehavior"
                name="actualBehavior"
                value={formData.actualBehavior}
                onChange={handleChange}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-vertical ${
                  errors.actualBehavior ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="What actually happens?"
                disabled={loading}
              />
              {errors.actualBehavior && (
                <p className="mt-1 text-sm text-red-600">{errors.actualBehavior}</p>
              )}
            </div>
          </div>

          {/* Severity, Priority, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
                Severity
              </label>
              <select
                id="severity"
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                disabled={loading}
              >
                <option value={BUG_SEVERITY.LOW}>Low</option>
                <option value={BUG_SEVERITY.MEDIUM}>Medium</option>
                <option value={BUG_SEVERITY.HIGH}>High</option>
                <option value={BUG_SEVERITY.CRITICAL}>Critical</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                disabled={loading}
              >
                <option value={BUG_PRIORITY.LOW}>Low</option>
                <option value={BUG_PRIORITY.MEDIUM}>Medium</option>
                <option value={BUG_PRIORITY.HIGH}>High</option>
                <option value={BUG_PRIORITY.CRITICAL}>Critical</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                disabled={loading}
              >
                <option value={BUG_STATUS.OPEN}>Open</option>
                <option value={BUG_STATUS.IN_PROGRESS}>In Progress</option>
                <option value={BUG_STATUS.RESOLVED}>Resolved</option>
                <option value={BUG_STATUS.CLOSED}>Closed</option>
                <option value={BUG_STATUS.REOPENED}>Reopened</option>
              </select>
            </div>
          </div>

          {/* Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To
              </label>
              <select
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                disabled={loading}
              >
                <option value="">Unassigned</option>
                {users.filter(user => ['developer', 'manager'].includes(user.role)).map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reportedBy" className="block text-sm font-medium text-gray-700 mb-2">
                Reported By
              </label>
              <select
                id="reportedBy"
                name="reportedBy"
                value={formData.reportedBy}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                disabled={loading}
              >
                <option value="">Select reporter</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} ({user.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Environment Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="environment" className="block text-sm font-medium text-gray-700 mb-2">
                Environment
              </label>
              <select
                id="environment"
                name="environment"
                value={formData.environment}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                disabled={loading}
              >
                <option value="">Select environment</option>
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
                <option value="testing">Testing</option>
              </select>
            </div>

            <div>
              <label htmlFor="browserVersion" className="block text-sm font-medium text-gray-700 mb-2">
                Browser Version
              </label>
              <input
                type="text"
                id="browserVersion"
                name="browserVersion"
                value={formData.browserVersion}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="Chrome 91.0.4472.124"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="operatingSystem" className="block text-sm font-medium text-gray-700 mb-2">
                Operating System
              </label>
              <input
                type="text"
                id="operatingSystem"
                name="operatingSystem"
                value={formData.operatingSystem}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="Windows 10, macOS 11.4, Ubuntu 20.04"
                disabled={loading}
              />
            </div>
          </div>

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
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">
                    {isEditing ? 'Updating...' : 'Reporting...'}
                  </span>
                </>
              ) : (
                isEditing ? 'Update Bug Report' : 'Report Bug'
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

export default BugForm;
