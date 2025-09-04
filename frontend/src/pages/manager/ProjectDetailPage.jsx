import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../config/api';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/manager/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
      // Mock data for demonstration
      setProject({
        id: id,
        name: 'E-commerce Platform Redesign',
        description: 'Complete redesign of the company e-commerce platform with modern UI/UX and improved performance.',
        status: 'active',
        priority: 'high',
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        budget: 150000,
        client: 'Acme Corporation',
        manager: 'John Smith',
        technologies: ['React', 'Node.js', 'MongoDB', 'AWS'],
        progress: 65,
        teamMembers: [
          { id: 1, name: 'Alice Johnson', role: 'Frontend Developer', avatar: null },
          { id: 2, name: 'Bob Wilson', role: 'Backend Developer', avatar: null },
          { id: 3, name: 'Carol Davis', role: 'UI/UX Designer', avatar: null },
          { id: 4, name: 'David Brown', role: 'QA Engineer', avatar: null }
        ],
        tasks: {
          total: 45,
          completed: 29,
          inProgress: 12,
          pending: 4
        },
        milestones: [
          { id: 1, name: 'Design Phase', dueDate: '2024-02-15', status: 'completed' },
          { id: 2, name: 'Development Phase 1', dueDate: '2024-04-15', status: 'in-progress' },
          { id: 3, name: 'Testing Phase', dueDate: '2024-05-30', status: 'pending' },
          { id: 4, name: 'Deployment', dueDate: '2024-06-30', status: 'pending' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/manager/projects/${id}`);
      navigate('/manager/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'planning': return 'info';
      case 'on-hold': return 'warning';
      case 'completed': return 'secondary';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getMilestoneStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'pending': return 'secondary';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'team', label: 'Team' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'milestones', label: 'Milestones' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Project Not Found</h2>
        <Button onClick={() => navigate('/manager/projects')}>Back to Projects</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
          <div className="flex items-center space-x-4 mt-2">
            <Badge variant={getStatusColor(project.status)}>{project.status}</Badge>
            <Badge variant={getPriorityColor(project.priority)}>{project.priority} priority</Badge>
            <span className="text-gray-600 dark:text-gray-400">
              Progress: {project.progress}%
            </span>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/manager/projects')}
          >
            Back to Projects
          </Button>
          <Button
            onClick={() => navigate(`/manager/projects/${id}/edit`)}
          >
            Edit Project
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Project Progress</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Project Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Client:</span>
                        <span className="text-gray-900 dark:text-white">{project.client}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Manager:</span>
                        <span className="text-gray-900 dark:text-white">{project.manager}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Budget:</span>
                        <span className="text-gray-900 dark:text-white">${project.budget?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(project.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">End Date:</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(project.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Technologies</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies?.map((tech, index) => (
                        <Badge key={index} variant="secondary">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Team Members</h3>
                <Button size="sm" onClick={() => navigate(`/manager/projects/${id}/team`)}>
                  Manage Team
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.teamMembers?.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Task Summary</h3>
                <Button size="sm" onClick={() => navigate(`/projects/${id}/tickets`)}>
                  View All Tasks
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{project.tasks?.total}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{project.tasks?.completed}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{project.tasks?.inProgress}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{project.tasks?.pending}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
                </div>
              </div>
            </div>
          )}

          {/* Milestones Tab */}
          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Project Milestones</h3>
              <div className="space-y-3">
                {project.milestones?.map((milestone) => (
                  <div key={milestone.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{milestone.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={getMilestoneStatusColor(milestone.status)}>
                      {milestone.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Once you delete a project, there is no going back. Please be certain.
        </p>
        <Button
          variant="error"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete Project
        </Button>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Project"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete "{project.name}"? This action cannot be undone and will remove all associated tasks, files, and data.
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
              Delete Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;
