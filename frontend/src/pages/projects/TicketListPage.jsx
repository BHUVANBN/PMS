import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../config/api';

const TicketListPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [projectId, statusFilter, priorityFilter, assigneeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectResponse, ticketsResponse] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/tickets?status=${statusFilter}&priority=${priorityFilter}&assignee=${assigneeFilter}`)
      ]);
      
      setProject(projectResponse.data);
      setTickets(ticketsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Mock data for demonstration
      setProject({
        id: projectId,
        name: 'E-commerce Platform Redesign'
      });
      setTickets([
        {
          id: 1,
          title: 'Implement user authentication system',
          description: 'Create login, registration, and password reset functionality',
          status: 'in-progress',
          priority: 'high',
          assignee: 'Alice Johnson',
          reporter: 'John Smith',
          createdDate: '2024-01-15',
          dueDate: '2024-02-15',
          estimatedHours: 40,
          actualHours: 25,
          tags: ['backend', 'security']
        },
        {
          id: 2,
          title: 'Design product catalog page',
          description: 'Create responsive design for product listing and filtering',
          status: 'todo',
          priority: 'medium',
          assignee: 'Carol Davis',
          reporter: 'Sarah Johnson',
          createdDate: '2024-01-20',
          dueDate: '2024-02-20',
          estimatedHours: 24,
          actualHours: 0,
          tags: ['frontend', 'design']
        },
        {
          id: 3,
          title: 'Setup payment gateway integration',
          description: 'Integrate Stripe payment processing with order system',
          status: 'done',
          priority: 'critical',
          assignee: 'Bob Wilson',
          reporter: 'John Smith',
          createdDate: '2024-01-10',
          dueDate: '2024-01-30',
          estimatedHours: 32,
          actualHours: 35,
          tags: ['backend', 'payment']
        },
        {
          id: 4,
          title: 'Write unit tests for API endpoints',
          description: 'Comprehensive test coverage for all REST API endpoints',
          status: 'in-progress',
          priority: 'medium',
          assignee: 'David Brown',
          reporter: 'Mike Wilson',
          createdDate: '2024-01-25',
          dueDate: '2024-02-25',
          estimatedHours: 20,
          actualHours: 8,
          tags: ['testing', 'backend']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'todo': return 'secondary';
      case 'in-progress': return 'warning';
      case 'done': return 'success';
      case 'blocked': return 'error';
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

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.assignee.toLowerCase().includes(searchTerm.toLowerCase());
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Project Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tasks for {project?.name}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            Back to Project
          </Button>
          <Button
            onClick={() => navigate(`/projects/${projectId}/tickets/create`)}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'todo', label: 'To Do' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'done', label: 'Done' },
              { value: 'blocked', label: 'Blocked' }
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
          <Select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Assignees' },
              { value: 'alice', label: 'Alice Johnson' },
              { value: 'bob', label: 'Bob Wilson' },
              { value: 'carol', label: 'Carol Davis' },
              { value: 'david', label: 'David Brown' }
            ]}
          />
        </div>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{tickets.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {tickets.filter(t => t.status === 'in-progress').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {tickets.filter(t => t.status === 'done').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {tickets.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'done').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
              <span className="text-2xl">🚨</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {ticket.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {ticket.description}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ticket.tags?.map((tag, index) => (
                          <Badge key={index} variant="secondary" size="sm">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {ticket.assignee}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div>
                      {new Date(ticket.dueDate).toLocaleDateString()}
                    </div>
                    {new Date(ticket.dueDate) < new Date() && ticket.status !== 'done' && (
                      <div className="text-red-500 text-xs">Overdue</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {ticket.actualHours}h / {ticket.estimatedHours}h
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((ticket.actualHours / ticket.estimatedHours) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/projects/${projectId}/tickets/${ticket.id}`)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No tasks found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketListPage;
