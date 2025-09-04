import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DataTable from '../../components/tables/DataTable';
import Modal from '../../components/ui/Modal';
import api from '../../services/api';

const UserListPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.admin.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await api.admin.deleteUser(selectedUser.id);
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const columns = [
    {
      key: 'username',
      title: 'Username'
    },
    {
      key: 'email',
      title: 'Email'
    },
    {
      key: 'role',
      title: 'Role',
      type: 'badge',
      variant: 'primary'
    },
    {
      key: 'status',
      title: 'Status',
      type: 'badge',
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'secondary'}>
          {value || 'inactive'}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      title: 'Created',
      type: 'date'
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/admin/users/${row.id}`)}
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

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#e5e7eb', margin: 0, marginBottom: '8px' }}>User Management</h1>
          <p style={{ color: '#9ca3af', margin: 0 }}>Manage system users and their permissions</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/admin/users/create')}
        >
          Create New User
        </Button>
      </div>

      <Card>
        <DataTable
          data={users}
          columns={columns}
          loading={loading}
          emptyMessage="No users found"
        />
      </Card>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
      >
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#e5e7eb', margin: 0 }}>
            Are you sure you want to delete user "{selectedUser?.username}"? This action cannot be undone.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteUser}
          >
            Delete User
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UserListPage;
