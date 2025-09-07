import React, { useState, useEffect } from 'react';
import DataTable from './DataTable';
import { managerAPI } from '../../services/api';
import { PROJECT_STATUS } from '../../utils/constants/api';

const ProjectTable = ({
  showActions = true,
  selectable = true,
  onProjectEdit = null,
  onProjectDelete = null,
  onProjectView = null,
  className = ''
}) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await managerAPI.getAllProjects();
      setProjects(response.projects || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectAction = (action, project) => {
    switch (action) {
      case 'edit':
        onProjectEdit?.(project);
        break;
      case 'delete':
        onProjectDelete?.(project);
        break;
      case 'view':
        onProjectView?.(project);
        break;
      default:
        break;
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case PROJECT_STATUS.PLANNING:
        return 'bg-yellow-100 text-yellow-800';
      case PROJECT_STATUS.ACTIVE:
        return 'bg-green-100 text-green-800';
      case PROJECT_STATUS.ON_HOLD:
        return 'bg-orange-100 text-orange-800';
      case PROJECT_STATUS.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      case PROJECT_STATUS.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = (project) => {
    if (!project.totalTasks || project.totalTasks === 0) return 0;
    return Math.round((project.completedTasks / project.totalTasks) * 100);
  };

  const columns = [
    {
      key: 'name',
      title: 'Project Name',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {row.description || 'No description'}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      type: 'badge',
      badgeColors: {
        [PROJECT_STATUS.PLANNING]: getStatusBadgeColor(PROJECT_STATUS.PLANNING),
        [PROJECT_STATUS.ACTIVE]: getStatusBadgeColor(PROJECT_STATUS.ACTIVE),
        [PROJECT_STATUS.ON_HOLD]: getStatusBadgeColor(PROJECT_STATUS.ON_HOLD),
        [PROJECT_STATUS.COMPLETED]: getStatusBadgeColor(PROJECT_STATUS.COMPLETED),
        [PROJECT_STATUS.CANCELLED]: getStatusBadgeColor(PROJECT_STATUS.CANCELLED)
      }
    },
    {
      key: 'priority',
      title: 'Priority',
      type: 'badge',
      badgeColors: {
        low: getPriorityBadgeColor('low'),
        medium: getPriorityBadgeColor('medium'),
        high: getPriorityBadgeColor('high'),
        critical: getPriorityBadgeColor('critical')
      }
    },
    {
      key: 'manager',
      title: 'Manager',
      render: (value, row) => {
        if (!row.manager) return 'Not assigned';
        return `${row.manager.firstName} ${row.manager.lastName}`;
      }
    },
    {
      key: 'teamMembers',
      title: 'Team Size',
      render: (value, row) => {
        const teamSize = row.teamMembers?.length || 0;
        return (
          <div className="flex items-center">
            <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            {teamSize} member{teamSize !== 1 ? 's' : ''}
          </div>
        );
      }
    },
    {
      key: 'progress',
      title: 'Progress',
      render: (value, row) => {
        const progress = calculateProgress(row);
        return (
          <div className="w-full">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">{progress}%</span>
              <span className="text-xs text-gray-500">
                {row.completedTasks || 0}/{row.totalTasks || 0}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'startDate',
      title: 'Start Date',
      type: 'date'
    },
    {
      key: 'endDate',
      title: 'End Date',
      render: (value, row) => {
        if (!value) return 'Not set';
        const endDate = new Date(value);
        const today = new Date();
        const isOverdue = endDate < today && row.status !== PROJECT_STATUS.COMPLETED;
        
        return (
          <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
            {endDate.toLocaleDateString()}
            {isOverdue && (
              <div className="text-xs text-red-500">Overdue</div>
            )}
          </div>
        );
      }
    }
  ];

  if (showActions) {
    columns.push({
      key: 'actions',
      title: 'Actions',
      sortable: false,
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleProjectAction('view', row);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            title="View Details"
          >
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleProjectAction('edit', row);
            }}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
            title="Edit Project"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleProjectAction('delete', row);
            }}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            title="Delete Project"
          >
            Delete
          </button>
        </div>
      )
    });
  }

  const actions = (
    <>
      <button
        onClick={loadProjects}
        className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        title="Refresh"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
      {selectedProjects.length > 0 && (
        <button
          onClick={() => console.log('Bulk action for:', selectedProjects)}
          className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Archive Selected ({selectedProjects.length})
        </button>
      )}
    </>
  );

  return (
    <DataTable
      data={projects}
      columns={columns}
      loading={loading}
      error={error}
      selectable={selectable}
      onSelectionChange={setSelectedProjects}
      onRowClick={onProjectView}
      actions={actions}
      emptyMessage="No projects found"
      className={className}
    />
  );
};

export default ProjectTable;
