import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../config/api';

const TimeTrackingPage = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [newEntry, setNewEntry] = useState({
    projectId: '',
    taskId: '',
    description: '',
    hours: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [filter, setFilter] = useState('today');

  useEffect(() => {
    fetchData();
  }, [filter]);

  useEffect(() => {
    let interval = null;
    if (activeTimer) {
      interval = setInterval(() => {
        setTimerSeconds(seconds => seconds + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesResponse, projectsResponse] = await Promise.all([
        api.get(`/developer/time-entries?filter=${filter}`),
        api.get('/developer/projects')
      ]);
      
      setTimeEntries(entriesResponse.data || []);
      setProjects(projectsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Mock data for demonstration
      setTimeEntries([
        {
          id: 1,
          projectName: 'E-commerce Platform',
          taskName: 'User Authentication',
          description: 'Implemented JWT middleware',
          hours: 3.5,
          date: '2024-01-22',
          status: 'approved'
        },
        {
          id: 2,
          projectName: 'E-commerce Platform',
          taskName: 'Payment Integration',
          description: 'Stripe API integration',
          hours: 4.0,
          date: '2024-01-22',
          status: 'pending'
        },
        {
          id: 3,
          projectName: 'Mobile App',
          taskName: 'UI Components',
          description: 'Created reusable components',
          hours: 2.5,
          date: '2024-01-21',
          status: 'approved'
        }
      ]);
      setProjects([
        { id: 1, name: 'E-commerce Platform' },
        { id: 2, name: 'Mobile App' },
        { id: 3, name: 'Data Analytics Dashboard' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = (projectId, taskId, description) => {
    setActiveTimer({ projectId, taskId, description });
    setTimerSeconds(0);
  };

  const stopTimer = async () => {
    if (activeTimer && timerSeconds > 0) {
      const hours = (timerSeconds / 3600).toFixed(2);
      try {
        await api.post('/developer/time-entries', {
          ...activeTimer,
          hours: parseFloat(hours),
          date: new Date().toISOString().split('T')[0]
        });
        fetchData();
      } catch (error) {
        console.error('Error saving time entry:', error);
      }
    }
    setActiveTimer(null);
    setTimerSeconds(0);
  };

  const handleManualEntry = async () => {
    try {
      await api.post('/developer/time-entries', newEntry);
      fetchData();
      setShowModal(false);
      setNewEntry({
        projectId: '',
        taskId: '',
        description: '',
        hours: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error creating time entry:', error);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Time Tracking</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your work hours and manage time entries</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          Add Manual Entry
        </Button>
      </div>

      {/* Active Timer */}
      {activeTimer && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">Timer Running</h3>
              <p className="text-blue-700 dark:text-blue-300">{activeTimer.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-mono font-bold text-blue-900 dark:text-blue-100">
                {formatTime(timerSeconds)}
              </div>
              <Button variant="error" onClick={stopTimer}>
                Stop Timer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Time Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Hours</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {timeEntries.filter(e => e.date === new Date().toISOString().split('T')[0]).reduce((sum, e) => sum + e.hours, 0).toFixed(1)}h
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <span className="text-2xl">⏰</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalHours.toFixed(1)}h</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {timeEntries.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.hours, 0).toFixed(1)}h
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {timeEntries.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.hours, 0).toFixed(1)}h
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'all', label: 'All Time' }
            ]}
          />
        </div>
      </div>

      {/* Time Entries Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Project / Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {timeEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {entry.projectName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {entry.taskName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {entry.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {entry.hours}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusColor(entry.status)}>
                      {entry.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startTimer(entry.projectId, entry.taskId, entry.description)}
                        disabled={!!activeTimer}
                      >
                        Start Timer
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {timeEntries.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No time entries found.</p>
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Time Entry"
      >
        <div className="space-y-4">
          <Select
            label="Project"
            value={newEntry.projectId}
            onChange={(e) => setNewEntry(prev => ({ ...prev, projectId: e.target.value }))}
            options={[
              { value: '', label: 'Select a project...' },
              ...projects.map(project => ({
                value: project.id,
                label: project.name
              }))
            ]}
          />

          <Input
            label="Task/Ticket ID"
            value={newEntry.taskId}
            onChange={(e) => setNewEntry(prev => ({ ...prev, taskId: e.target.value }))}
            placeholder="TASK-123"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={newEntry.description}
              onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Describe what you worked on..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hours"
              type="number"
              step="0.25"
              value={newEntry.hours}
              onChange={(e) => setNewEntry(prev => ({ ...prev, hours: e.target.value }))}
              placeholder="2.5"
            />
            <Input
              label="Date"
              type="date"
              value={newEntry.date}
              onChange={(e) => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleManualEntry}
              disabled={!newEntry.projectId || !newEntry.hours || !newEntry.description}
            >
              Add Entry
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TimeTrackingPage;
