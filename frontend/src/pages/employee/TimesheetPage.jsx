import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../config/api';

const TimesheetPage = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [newEntry, setNewEntry] = useState({
    projectId: '',
    taskDescription: '',
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: ''
  });

  function getCurrentWeek() {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return monday.toISOString().split('T')[0];
  }

  useEffect(() => {
    fetchData();
  }, [selectedWeek]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [timesheetsResponse, projectsResponse] = await Promise.all([
        api.get(`/employee/timesheets?week=${selectedWeek}`),
        api.get('/employee/projects')
      ]);
      
      setTimesheets(timesheetsResponse.data || []);
      setProjects(projectsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Mock data for demonstration
      setTimesheets([
        {
          id: 1,
          projectName: 'E-commerce Platform',
          taskDescription: 'Frontend development',
          monday: 8,
          tuesday: 7.5,
          wednesday: 8,
          thursday: 6,
          friday: 8,
          saturday: 0,
          sunday: 0,
          total: 37.5,
          status: 'submitted'
        },
        {
          id: 2,
          projectName: 'Mobile App',
          taskDescription: 'API integration',
          monday: 0,
          tuesday: 0.5,
          wednesday: 0,
          thursday: 2,
          friday: 0,
          saturday: 0,
          sunday: 0,
          total: 2.5,
          status: 'draft'
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

  const handleAddEntry = async () => {
    try {
      const totalHours = Object.keys(newEntry)
        .filter(key => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(key))
        .reduce((sum, day) => sum + (parseFloat(newEntry[day]) || 0), 0);

      const entryData = {
        ...newEntry,
        week: selectedWeek,
        total: totalHours
      };

      await api.post('/employee/timesheets', entryData);
      fetchData();
      setShowModal(false);
      setNewEntry({
        projectId: '',
        taskDescription: '',
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
        sunday: ''
      });
    } catch (error) {
      console.error('Error adding timesheet entry:', error);
    }
  };

  const handleSubmitTimesheet = async () => {
    try {
      await api.post(`/employee/timesheets/submit?week=${selectedWeek}`);
      fetchData();
    } catch (error) {
      console.error('Error submitting timesheet:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success';
      case 'submitted': return 'warning';
      case 'rejected': return 'error';
      case 'draft': return 'secondary';
      default: return 'default';
    }
  };

  const getWeekDates = (weekStart) => {
    const start = new Date(weekStart);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(selectedWeek);
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const totalWeekHours = timesheets.reduce((sum, entry) => sum + entry.total, 0);
  const hasSubmittedEntries = timesheets.some(entry => entry.status === 'submitted');

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Timesheet</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your weekly work hours</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowModal(true)}
          >
            Add Entry
          </Button>
          {!hasSubmittedEntries && timesheets.length > 0 && (
            <Button onClick={handleSubmitTimesheet}>
              Submit Timesheet
            </Button>
          )}
        </div>
      </div>

      {/* Week Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Week of {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Total Hours: {totalWeekHours}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Input
              type="date"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>
      </div>

      {/* Timesheet Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Project / Task
                </th>
                {dayNames.map((day, index) => (
                  <th key={day} className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div>{day.substring(0, 3)}</div>
                    <div className="text-xs font-normal">
                      {weekDates[index].getDate()}/{weekDates[index].getMonth() + 1}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {timesheets.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {entry.projectName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {entry.taskDescription}
                      </div>
                    </div>
                  </td>
                  {dayKeys.map((day) => (
                    <td key={day} className="px-3 py-4 text-center text-sm text-gray-900 dark:text-white">
                      {entry[day] || '-'}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-white">
                    {entry.total}h
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant={getStatusColor(entry.status)}>
                      {entry.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {timesheets.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No timesheet entries for this week.</p>
            <Button
              className="mt-4"
              onClick={() => setShowModal(true)}
            >
              Add Your First Entry
            </Button>
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Timesheet Entry"
        size="lg"
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Task Description
            </label>
            <textarea
              value={newEntry.taskDescription}
              onChange={(e) => setNewEntry(prev => ({ ...prev, taskDescription: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Describe the work performed..."
            />
          </div>

          <div className="grid grid-cols-7 gap-2">
            {dayNames.map((day, index) => (
              <Input
                key={day}
                label={day.substring(0, 3)}
                type="number"
                step="0.25"
                value={newEntry[dayKeys[index]]}
                onChange={(e) => setNewEntry(prev => ({ ...prev, [dayKeys[index]]: e.target.value }))}
                placeholder="0"
              />
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddEntry}
              disabled={!newEntry.projectId || !newEntry.taskDescription}
            >
              Add Entry
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TimesheetPage;
