import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DataTable from '../../components/tables/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';

const UserListPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.admin.getAllUsers();
      // Handle the response structure from backend
      setUsers(response.users || response || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await api.admin.deleteUser(selectedUser._id || selectedUser.id);
      setUsers(users.filter(user => (user._id || user.id) !== (selectedUser._id || selectedUser.id)));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    }
  };

  const getStatusBadge = (user) => {
    const isActive = user.isActive !== false; // Default to active if not specified
    return (
      <Badge variant={isActive ? 'success' : 'secondary'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      admin: 'danger',
      hr: 'info',
      manager: 'warning',
      developer: 'primary',
      tester: 'secondary',
      employee: 'success'
    };
    return (
      <Badge variant={roleColors[role] || 'secondary'}>
        {role?.charAt(0).toUpperCase() + role?.slice(1) || 'Unknown'}
      </Badge>
    );
  };

  const columns = [
    {
      key: 'username',
      title: 'Username',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-gray-600">
              {(row.firstName || row.username || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.firstName} {row.lastName}</div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      title: 'Email'
    },
    {
      key: 'role',
      title: 'Role',
      render: (value) => getRoleBadge(value)
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (value, row) => getStatusBadge(row)
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/admin/users/${row._id || row.id}`)}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              setSelectedUser(row);
              setShowDeleteModal(true);
            }}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">Manage system users and their permissions</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/admin')}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/admin/users/create')}
            >
              Create New User
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <Card className="bg-white border border-gray-200">
        <DataTable
          data={users}
          columns={columns}
          loading={loading}
          emptyMessage="No users found"
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
              <p className="text-sm text-gray-500">This action cannot be undone.</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700">
              Are you sure you want to delete user <strong>"{selectedUser?.username}"</strong>? 
              This will deactivate their account and they will no longer be able to access the system.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteUser}
              className="w-full sm:w-auto"
            >
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserListPage;
