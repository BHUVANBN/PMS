import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../common';
import { managerAPI } from '../../services/api';
import { TICKET_STATUS, TICKET_PRIORITY } from '../../utils/constants/api';

const TaskSummary = ({ 
  projectId = null, 
  userId = null, 
  className = '',
  showHeader = true 
}) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTaskSummary();
  }, [projectId, userId]);

  const loadTaskSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await managerAPI.getTaskSummary({ projectId, userId });
      setSummary(response.summary);
    } catch (err) {
      console.error('Failed to load task summary:', err);
      setError('Failed to load task summary');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case TICKET_STATUS.OPEN:
        return 'bg-gray-100 text-gray-800';
      case TICKET_STATUS.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case TICKET_STATUS.IN_REVIEW:
        return 'bg-yellow-100 text-yellow-800';
      case TICKET_STATUS.TESTING:
        return 'bg-purple-100 text-purple-800';
      case TICKET_STATUS.DONE:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case TICKET_PRIORITY.LOW:
        return 'bg-green-50 border-green-200 text-green-700';
      case TICKET_PRIORITY.MEDIUM:
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case TICKET_PRIORITY.HIGH:
        return 'bg-orange-50 border-orange-200 text-orange-700';
      case TICKET_PRIORITY.CRITICAL:
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const calculateProgress = (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        {showHeader && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Summary</h3>
        )}
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="md" text="Loading summary..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        {showHeader && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Summary</h3>
        )}
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadTaskSummary}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        {showHeader && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Summary</h3>
        )}
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500">No tasks found</p>
        </div>
      </div>
    );
  }

  const totalTasks = summary.byStatus ? Object.values(summary.byStatus).reduce((sum, count) => sum + count, 0) : 0;
  const completedTasks = summary.byStatus?.[TICKET_STATUS.DONE] || 0;
  const progress = calculateProgress(completedTasks, totalTasks);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {showHeader && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Task Summary</h3>
            <button
              onClick={loadTaskSummary}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Refresh"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-500">{completedTasks}/{totalTasks} completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-right mt-1">
            <span className="text-lg font-semibold text-gray-900">{progress}%</span>
          </div>
        </div>

        {/* Status Breakdown */}
        {summary.byStatus && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">By Status</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(summary.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Priority Breakdown */}
        {summary.byPriority && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">By Priority</h4>
            <div className="space-y-2">
              {Object.entries(summary.byPriority).map(([priority, count]) => (
                <div key={priority} className={`flex items-center justify-between p-3 border rounded-lg ${getPriorityColor(priority)}`}>
                  <span className="text-sm font-medium capitalize">{priority}</span>
                  <span className="text-lg font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overdue Tasks */}
        {summary.overdue > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">
                  {summary.overdue} Overdue Task{summary.overdue !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-red-600">
                  Requires immediate attention
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Due Soon */}
        {summary.dueSoon > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  {summary.dueSoon} Task{summary.dueSoon !== 1 ? 's' : ''} Due Soon
                </p>
                <p className="text-sm text-yellow-600">
                  Due within the next 3 days
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estimated Hours */}
        {summary.estimatedHours && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Estimated Hours</p>
                  <p className="text-sm text-blue-600">Remaining work effort</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-900">{summary.estimatedHours}h</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskSummary;
