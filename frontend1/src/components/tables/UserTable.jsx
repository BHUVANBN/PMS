import React, { useState, useEffect } from 'react';
import DataTable from './DataTable';
import { adminAPI } from '../../services/api';
import { USER_ROLES } from '../../utils/constants/api';

const UserTable = ({
  showActions = true,
  selectable = true,
  onUserEdit = null,
  onUserDelete = null,
  onUserView = null,
  className = ''
}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getAllUsers();
      setUsers(response.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = (action, user) => {
    switch (action) {
      case 'edit':
        onUserEdit?.(user);
        break;
      case 'delete':
        onUserDelete?.(user);
        break;
      case 'view':
        onUserView?.(user);
        break;
      default:
        break;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'bg-red-100 text-red-800';
      case USER_ROLES.MANAGER:
        return 'bg-blue-100 text-blue-800';
      case USER_ROLES.DEVELOPER:
        return 'bg-green-100 text-green-800';
      case USER_ROLES.TESTER:
        return 'bg-purple-100 text-purple-800';
      case USER_ROLES.HR:
        return 'bg-yellow-100 text-yellow-800';
      case USER_ROLES.EMPLOYEE:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'firstName',
      title: 'Name',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
            {row.firstName?.charAt(0)}{row.lastName?.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {row.firstName} {row.lastName}
            </div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role',
      type: 'badge',
      badgeColors: {
        [USER_ROLES.ADMIN]: getRoleBadgeColor(USER_ROLES.ADMIN),
        [USER_ROLES.MANAGER]: getRoleBadgeColor(USER_ROLES.MANAGER),
        [USER_ROLES.DEVELOPER]: getRoleBadgeColor(USER_ROLES.DEVELOPER),
        [USER_ROLES.TESTER]: getRoleBadgeColor(USER_ROLES.TESTER),
        [USER_ROLES.HR]: getRoleBadgeColor(USER_ROLES.HR),
        [USER_ROLES.EMPLOYEE]: getRoleBadgeColor(USER_ROLES.EMPLOYEE)
      }
    },
    {
      key: 'department',
      title: 'Department',
      render: (value) => value || 'Not assigned'
    },
    {
      key: 'status',
      title: 'Status',
      type: 'badge',
      badgeColors: {
        active: getStatusBadgeColor('active'),
        inactive: getStatusBadgeColor('inactive'),
        pending: getStatusBadgeColor('pending')
      }
    },
    {
      key: 'createdAt',
      title: 'Joined',
      type: 'date'
    },
    {
      key: 'lastLogin',
      title: 'Last Login',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'Never'
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
              handleUserAction('view', row);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            title="View Details"
          >
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUserAction('edit', row);
            }}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
            title="Edit User"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUserAction('delete', row);
            }}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            title="Delete User"
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
        onClick={loadUsers}
        className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        title="Refresh"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
      {selectedUsers.length > 0 && (
        <button
          onClick={() => console.log('Bulk action for:', selectedUsers)}
          className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Delete Selected ({selectedUsers.length})
        </button>
      )}
    </>
  );

  return (
    <DataTable
      data={users}
      columns={columns}
      loading={loading}
      error={error}
      selectable={selectable}
      onSelectionChange={setSelectedUsers}
      onRowClick={onUserView}
      actions={actions}
      emptyMessage="No users found"
      className={className}
    />
  );
};

export default UserTable;
