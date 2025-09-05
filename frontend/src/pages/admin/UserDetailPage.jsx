import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { api } from '../../config/api';

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRemoveProjectModal, setShowRemoveProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
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
    fetchUserProjects();
    // Check if edit mode is requested via URL params
    if (searchParams.get('edit') === 'true') {
      setEditing(true);
    }
  }, [id, searchParams]);

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

  const fetchUserProjects = async () => {
    try {
      const response = await api.get(`/admin/users/${id}/projects`);
      setUserProjects(response.data || []);
    } catch (error) {
      console.error('Error fetching user projects:', error);
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

  const handleRemoveFromProject = async () => {
    if (!selectedProject) return;
    
    try {
      await api.delete(`/admin/projects/${selectedProject.id}/users/${id}`);
      setUserProjects(userProjects.filter(project => project.id !== selectedProject.id));
      setShowRemoveProjectModal(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error removing user from project:', error);
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
    return <LoadingSpinner />;
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
    <ErrorBoundary>
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

        {/* User Information */}
        <Card className="p-6">
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
        </Card>

        {/* User Projects */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Assigned Projects
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/users/project-wise')}
            >
              Manage Projects
            </Button>
          </div>

          {userProjects.length > 0 ? (
            <div className="space-y-3">
              {userProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {project.name}
                      </span>
                      <Badge variant="info" size="sm">
                        {project.status || 'Active'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {project.description || 'No description available'}
                    </p>
                  </div>
                  <Button
                    variant="error"
                    size="sm"
                    onClick={() => {
                      setSelectedProject(project);
                      setShowRemoveProjectModal(true);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No projects assigned to this user</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => navigate('/admin/users/project-wise')}
              >
                Assign Projects
              </Button>
            </div>
          )}
        </Card>

        {/* Delete User Modal */}
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

        {/* Remove from Project Modal */}
        <Modal
          isOpen={showRemoveProjectModal}
          onClose={() => setShowRemoveProjectModal(false)}
          title="Remove User from Project"
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to remove <strong>{user?.firstName} {user?.lastName}</strong> from <strong>{selectedProject?.name}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowRemoveProjectModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="error"
                onClick={handleRemoveFromProject}
              >
                Remove User
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ErrorBoundary>
  );
};

export default UserDetailPage;
