import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../config/api';

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '',
    status: '',
    firstName: '',
    lastName: '',
    department: ''
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${id}`);
      setUser(response.data);
      setFormData({
        username: response.data.username || '',
        email: response.data.email || '',
        role: response.data.role || '',
        status: response.data.status || '',
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        department: response.data.department || ''
      });
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      await api.put(`/admin/users/${id}`, formData);
      setUser({ ...user, ...formData });
      setEditing(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/users/${id}`);
      navigate('/admin/users');
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'hr': return 'info';
      case 'developer': return 'success';
      case 'tester': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Not Found</h2>
        <Button onClick={() => navigate('/admin/users')}>Back to Users</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Details</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage user information and permissions</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/users')}
          >
            Back to Users
          </Button>
          {!editing ? (
            <Button onClick={() => setEditing(true)}>
              Edit User
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    username: user.username || '',
                    email: user.email || '',
                    role: user.role || '',
                    status: user.status || '',
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    department: user.department || ''
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              {editing ? (
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="text-gray-900 dark:text-white font-medium">{user.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              {editing ? (
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{user.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name
              </label>
              {editing ? (
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{user.firstName || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name
              </label>
              {editing ? (
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{user.lastName || 'Not provided'}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              {editing ? (
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  options={[
                    { value: 'admin', label: 'Admin' },
                    { value: 'manager', label: 'Manager' },
                    { value: 'hr', label: 'HR' },
                    { value: 'developer', label: 'Developer' },
                    { value: 'tester', label: 'Tester' },
                    { value: 'employee', label: 'Employee' }
                  ]}
                />
              ) : (
                <Badge variant={getRoleColor(user.role)}>{user.role}</Badge>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              {editing ? (
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'suspended', label: 'Suspended' }
                  ]}
                />
              ) : (
                <Badge variant={getStatusColor(user.status)}>{user.status}</Badge>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Department
              </label>
              {editing ? (
                <Input
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{user.department || 'Not assigned'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Created At
              </label>
              <p className="text-gray-900 dark:text-white">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {!editing && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="error"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete User
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this user? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="error"
              onClick={handleDelete}
            >
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserDetailPage;
