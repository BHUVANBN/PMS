import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../config/api';

const ProjectsListPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, priorityFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/projects?status=${statusFilter}&priority=${priorityFilter}`);
      setProjects(response.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Mock data for demonstration
      setProjects([
        {
          id: 1,
          name: 'E-commerce Platform Redesign',
          description: 'Complete redesign of the company e-commerce platform with modern UI/UX.',
          status: 'active',
          priority: 'high',
          progress: 65,
          startDate: '2024-01-01',
          endDate: '2024-06-30',
          manager: 'John Smith',
          teamSize: 8,
          budget: 150000
        },
        {
          id: 2,
          name: 'Mobile App Development',
          description: 'Native mobile application for iOS and Android platforms.',
          status: 'planning',
          priority: 'medium',
          progress: 15,
          startDate: '2024-02-01',
          endDate: '2024-08-30',
          manager: 'Sarah Johnson',
          teamSize: 6,
          budget: 120000
        },
        {
          id: 3,
          name: 'Data Analytics Dashboard',
          description: 'Business intelligence dashboard for real-time analytics.',
          status: 'active',
          priority: 'high',
          progress: 40,
          startDate: '2024-01-15',
          endDate: '2024-05-15',
          manager: 'Mike Wilson',
          teamSize: 5,
          budget: 80000
        },
        {
          id: 4,
          name: 'API Gateway Implementation',
          description: 'Microservices API gateway with authentication and rate limiting.',
          status: 'completed',
          priority: 'medium',
          progress: 100,
          startDate: '2023-10-01',
          endDate: '2023-12-31',
          manager: 'Lisa Brown',
          teamSize: 4,
          budget: 60000
        }
      ]);
    } finally {
      setLoading(false);
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

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.manager.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Projects</h1>
          <p className="text-gray-600 dark:text-gray-400">Browse and manage all projects across the organization</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'planning', label: 'Planning' },
              { value: 'active', label: 'Active' },
              { value: 'on-hold', label: 'On Hold' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }
            ]}
          />
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Priority' },
              { value: 'critical', label: 'Critical' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' }
            ]}
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {project.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                    {project.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <Badge variant={getStatusColor(project.status)}>{project.status}</Badge>
                <Badge variant={getPriorityColor(project.priority)}>{project.priority}</Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Manager:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{project.manager}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Team Size:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{project.teamSize} members</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(project.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">End Date:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(project.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Budget:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    ${project.budget?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <Button
                  size="sm"
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="flex-1"
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/projects/${project.id}/tickets`)}
                >
                  Tasks
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No projects found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectsListPage;
