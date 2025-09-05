import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Search, 
  Filter,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Calendar,
  User
} from 'lucide-react';
import { api } from '../../config/api';

const ProjectUsersPage = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showRemoveUserModal, setShowRemoveUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsResponse, usersResponse] = await Promise.all([
        api.get('/admin/projects'),
        api.get('/admin/users')
      ]);
      setProjects(projectsResponse.data || []);
      setUsers(usersResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUserToProject = async () => {
    if (!selectedProject || !selectedUser) return;
    
    try {
      await api.post(`/admin/projects/${selectedProject.id}/users`, {
        userId: selectedUser.id
      });
      await fetchData(); // Refresh data
      setShowAddUserModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error adding user to project:', error);
    }
  };

  const handleRemoveUserFromProject = async () => {
    if (!selectedProject || !selectedUser) return;
    
    try {
      await api.delete(`/admin/projects/${selectedProject.id}/users/${selectedUser.id}`);
      await fetchData(); // Refresh data
      setShowRemoveUserModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error removing user from project:', error);
    }
  };

  const toggleProject = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableUsers = users.filter(user => 
    !selectedProject?.users?.some(projectUser => projectUser.id === user.id) &&
    user.role?.toLowerCase().includes(filterRole.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Users className="mr-3 h-8 w-8 text-blue-600" />
                Project-wise Users
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage user assignments across projects
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <Card className="p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  label="Search Projects"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by project name..."
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Select
                  label="Filter by Role"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  options={[
                    { value: '', label: 'All Roles' },
                    { value: 'admin', label: 'Admin' },
                    { value: 'manager', label: 'Manager' },
                    { value: 'hr', label: 'HR' },
                    { value: 'developer', label: 'Developer' },
                    { value: 'tester', label: 'Tester' },
                    { value: 'employee', label: 'Employee' }
                  ]}
                  className="pl-10"
                />
              </div>
            </div>
          </Card>

          {/* Projects List */}
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => toggleProject(project.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {expandedProjects[project.id] ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                      <FolderOpen className="h-6 w-6 text-blue-600" />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {project.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {project.description || 'No description available'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="info" className="flex items-center">
                        <Users className="mr-1 h-3 w-3" />
                        {project.users?.length || 0} users
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project);
                          setShowAddUserModal(true);
                        }}
                        className="flex items-center"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add User
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedProjects[project.id] && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800">
                    {project.users && project.users.length > 0 ? (
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                          <Users className="mr-2 h-5 w-5" />
                          Assigned Users
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {project.users.map((user) => (
                            <div
                              key={user.id}
                              className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-600"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {user.firstName} {user.lastName}
                                    </span>
                                  </div>
                                  <div className="space-y-2">
                                    <Badge variant={getRoleColor(user.role)} size="sm">
                                      {user.role}
                                    </Badge>
                                    <Badge variant={getStatusColor(user.status)} size="sm">
                                      {user.status}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    {user.email}
                                  </p>
                                </div>
                                <Button
                                  variant="error"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setSelectedUser(user);
                                    setShowRemoveUserModal(true);
                                  }}
                                  className="flex items-center"
                                >
                                  <UserMinus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          No users assigned to this project
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProject(project);
                            setShowAddUserModal(true);
                          }}
                          className="flex items-center mx-auto"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add First User
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <Card className="p-12 text-center">
              <FolderOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No projects found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No projects match your search criteria
              </p>
            </Card>
          )}

          {/* Add User Modal */}
          <Modal
            isOpen={showAddUserModal}
            onClose={() => {
              setShowAddUserModal(false);
              setSelectedUser(null);
            }}
            title={`Add User to ${selectedProject?.name}`}
          >
            <div className="space-y-4">
              <Select
                label="Select User"
                value={selectedUser?.id || ''}
                onChange={(e) => {
                  const userId = e.target.value;
                  const user = availableUsers.find(u => u.id === userId);
                  setSelectedUser(user);
                }}
                options={[
                  { value: '', label: 'Choose a user...' },
                  ...availableUsers.map(user => ({
                    value: user.id,
                    label: `${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`
                  }))
                ]}
              />
              
              {availableUsers.length === 0 && (
                <div className="text-center py-4">
                  <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    All users are already assigned to this project
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddUserToProject}
                  disabled={!selectedUser}
                  className="flex items-center"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>
            </div>
          </Modal>

          {/* Remove User Modal */}
          <Modal
            isOpen={showRemoveUserModal}
            onClose={() => {
              setShowRemoveUserModal(false);
              setSelectedUser(null);
            }}
            title="Remove User from Project"
          >
            <div className="space-y-4">
              <div className="text-center py-4">
                <UserMinus className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Are you sure you want to remove{' '}
                  <strong className="text-gray-900 dark:text-white">
                    {selectedUser?.firstName} {selectedUser?.lastName}
                  </strong>{' '}
                  from <strong className="text-gray-900 dark:text-white">{selectedProject?.name}</strong>?
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRemoveUserModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="error"
                  onClick={handleRemoveUserFromProject}
                  className="flex items-center"
                >
                  <UserMinus className="mr-2 h-4 w-4" />
                  Remove User
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ProjectUsersPage;