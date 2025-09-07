import React, { useState, useEffect } from 'react';
import DataTable from './DataTable';
import { managerAPI } from '../../services/api';
import { TICKET_STATUS, TICKET_PRIORITY, TICKET_TYPE } from '../../utils/constants/api';

const TicketTable = ({
  projectId = null,
  showActions = true,
  selectable = true,
  onTicketEdit = null,
  onTicketDelete = null,
  onTicketView = null,
  className = ''
}) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState([]);

  useEffect(() => {
    loadTickets();
  }, [projectId]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = projectId 
        ? await managerAPI.getProjectTickets(projectId)
        : await managerAPI.getAllTickets();
      setTickets(response.tickets || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketAction = (action, ticket) => {
    switch (action) {
      case 'edit':
        onTicketEdit?.(ticket);
        break;
      case 'delete':
        onTicketDelete?.(ticket);
        break;
      case 'view':
        onTicketView?.(ticket);
        break;
      default:
        break;
    }
  };

  const getStatusBadgeColor = (status) => {
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
      case TICKET_STATUS.BLOCKED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case TICKET_PRIORITY.LOW:
        return 'bg-green-100 text-green-800';
      case TICKET_PRIORITY.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case TICKET_PRIORITY.HIGH:
        return 'bg-orange-100 text-orange-800';
      case TICKET_PRIORITY.CRITICAL:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case TICKET_TYPE.FEATURE:
        return 'bg-blue-100 text-blue-800';
      case TICKET_TYPE.BUG:
        return 'bg-red-100 text-red-800';
      case TICKET_TYPE.IMPROVEMENT:
        return 'bg-green-100 text-green-800';
      case TICKET_TYPE.TASK:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'ticketId',
      title: 'ID',
      render: (value, row) => (
        <div className="font-mono text-sm text-blue-600">
          #{value || row._id?.slice(-6)}
        </div>
      )
    },
    {
      key: 'title',
      title: 'Title',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 max-w-xs truncate">{value}</div>
          <div className="text-sm text-gray-500 max-w-xs truncate">
            {row.description || 'No description'}
          </div>
        </div>
      )
    },
    {
      key: 'type',
      title: 'Type',
      type: 'badge',
      badgeColors: {
        [TICKET_TYPE.FEATURE]: getTypeBadgeColor(TICKET_TYPE.FEATURE),
        [TICKET_TYPE.BUG]: getTypeBadgeColor(TICKET_TYPE.BUG),
        [TICKET_TYPE.IMPROVEMENT]: getTypeBadgeColor(TICKET_TYPE.IMPROVEMENT),
        [TICKET_TYPE.TASK]: getTypeBadgeColor(TICKET_TYPE.TASK)
      }
    },
    {
      key: 'status',
      title: 'Status',
      type: 'badge',
      badgeColors: {
        [TICKET_STATUS.OPEN]: getStatusBadgeColor(TICKET_STATUS.OPEN),
        [TICKET_STATUS.IN_PROGRESS]: getStatusBadgeColor(TICKET_STATUS.IN_PROGRESS),
        [TICKET_STATUS.IN_REVIEW]: getStatusBadgeColor(TICKET_STATUS.IN_REVIEW),
        [TICKET_STATUS.TESTING]: getStatusBadgeColor(TICKET_STATUS.TESTING),
        [TICKET_STATUS.DONE]: getStatusBadgeColor(TICKET_STATUS.DONE),
        [TICKET_STATUS.BLOCKED]: getStatusBadgeColor(TICKET_STATUS.BLOCKED)
      }
    },
    {
      key: 'priority',
      title: 'Priority',
      type: 'badge',
      badgeColors: {
        [TICKET_PRIORITY.LOW]: getPriorityBadgeColor(TICKET_PRIORITY.LOW),
        [TICKET_PRIORITY.MEDIUM]: getPriorityBadgeColor(TICKET_PRIORITY.MEDIUM),
        [TICKET_PRIORITY.HIGH]: getPriorityBadgeColor(TICKET_PRIORITY.HIGH),
        [TICKET_PRIORITY.CRITICAL]: getPriorityBadgeColor(TICKET_PRIORITY.CRITICAL)
      }
    },
    {
      key: 'assignee',
      title: 'Assignee',
      render: (value, row) => {
        if (!row.assignee) return (
          <span className="text-gray-400 italic">Unassigned</span>
        );
        
        return (
          <div className="flex items-center">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
              {row.assignee.firstName?.charAt(0)}{row.assignee.lastName?.charAt(0)}
            </div>
            <span className="text-sm">
              {row.assignee.firstName} {row.assignee.lastName}
            </span>
          </div>
        );
      }
    },
    {
      key: 'project',
      title: 'Project',
      render: (value, row) => {
        if (!row.project) return 'No project';
        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900">{row.project.name}</div>
          </div>
        );
      }
    },
    {
      key: 'estimatedHours',
      title: 'Est. Hours',
      render: (value) => value ? `${value}h` : 'Not set'
    },
    {
      key: 'dueDate',
      title: 'Due Date',
      render: (value, row) => {
        if (!value) return 'Not set';
        
        const dueDate = new Date(value);
        const today = new Date();
        const isOverdue = dueDate < today && row.status !== TICKET_STATUS.DONE;
        const isDueSoon = !isOverdue && dueDate <= new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
        
        return (
          <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : isDueSoon ? 'text-yellow-600 font-medium' : ''}`}>
            {dueDate.toLocaleDateString()}
            {isOverdue && <div className="text-xs text-red-500">Overdue</div>}
            {isDueSoon && !isOverdue && <div className="text-xs text-yellow-500">Due soon</div>}
          </div>
        );
      }
    },
    {
      key: 'createdAt',
      title: 'Created',
      type: 'date'
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
              handleTicketAction('view', row);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            title="View Details"
          >
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTicketAction('edit', row);
            }}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
            title="Edit Ticket"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTicketAction('delete', row);
            }}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            title="Delete Ticket"
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
        onClick={loadTickets}
        className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        title="Refresh"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
      {selectedTickets.length > 0 && (
        <>
          <button
            onClick={() => console.log('Bulk status update for:', selectedTickets)}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Update Status ({selectedTickets.length})
          </button>
          <button
            onClick={() => console.log('Bulk assign for:', selectedTickets)}
            className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Assign ({selectedTickets.length})
          </button>
        </>
      )}
    </>
  );

  return (
    <DataTable
      data={tickets}
      columns={columns}
      loading={loading}
      error={error}
      selectable={selectable}
      onSelectionChange={setSelectedTickets}
      onRowClick={onTicketView}
      actions={actions}
      emptyMessage="No tickets found"
      className={className}
    />
  );
};

export default TicketTable;
