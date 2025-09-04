import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../config/api';

const QAWorkspacePage = () => {
  const [testCases, setTestCases] = useState([]);
  const [testRuns, setTestRuns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('test-cases');
  const [showModal, setShowModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newTestCase, setNewTestCase] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: 'medium',
    type: 'functional',
    steps: '',
    expectedResult: ''
  });

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [testCasesResponse, testRunsResponse, projectsResponse] = await Promise.all([
        api.get(`/tester/test-cases?filter=${filter}`),
        api.get('/tester/test-runs'),
        api.get('/tester/projects')
      ]);
      
      setTestCases(testCasesResponse.data || []);
      setTestRuns(testRunsResponse.data || []);
      setProjects(projectsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Mock data for demonstration
      setTestCases([
        {
          id: 1,
          title: 'User Login Functionality',
          description: 'Test user authentication with valid credentials',
          project: 'E-commerce Platform',
          priority: 'high',
          type: 'functional',
          status: 'active',
          steps: '1. Navigate to login page\n2. Enter valid credentials\n3. Click login button',
          expectedResult: 'User should be logged in successfully',
          lastRun: '2024-01-20',
          lastResult: 'passed',
          createdBy: 'David Brown',
          createdDate: '2024-01-15'
        },
        {
          id: 2,
          title: 'Payment Processing',
          description: 'Test payment gateway integration',
          project: 'E-commerce Platform',
          priority: 'critical',
          type: 'integration',
          status: 'active',
          steps: '1. Add items to cart\n2. Proceed to checkout\n3. Enter payment details\n4. Submit payment',
          expectedResult: 'Payment should be processed successfully',
          lastRun: '2024-01-19',
          lastResult: 'failed',
          createdBy: 'Sarah Johnson',
          createdDate: '2024-01-10'
        },
        {
          id: 3,
          title: 'Mobile Responsiveness',
          description: 'Test UI responsiveness on mobile devices',
          project: 'E-commerce Platform',
          priority: 'medium',
          type: 'ui',
          status: 'active',
          steps: '1. Open application on mobile\n2. Navigate through pages\n3. Test form interactions',
          expectedResult: 'UI should be responsive and functional',
          lastRun: '2024-01-18',
          lastResult: 'passed',
          createdBy: 'Mike Wilson',
          createdDate: '2024-01-12'
        }
      ]);
      setTestRuns([
        {
          id: 1,
          name: 'Sprint 3 Regression',
          project: 'E-commerce Platform',
          status: 'in-progress',
          progress: 65,
          totalTests: 45,
          passed: 28,
          failed: 2,
          pending: 15,
          startDate: '2024-01-20',
          assignee: 'David Brown'
        },
        {
          id: 2,
          name: 'Payment Module Testing',
          project: 'E-commerce Platform',
          status: 'completed',
          progress: 100,
          totalTests: 12,
          passed: 10,
          failed: 2,
          pending: 0,
          startDate: '2024-01-15',
          assignee: 'Sarah Johnson'
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

  const handleCreateTestCase = async () => {
    try {
      await api.post('/tester/test-cases', newTestCase);
      fetchData();
      setShowModal(false);
      setNewTestCase({
        title: '',
        description: '',
        projectId: '',
        priority: 'medium',
        type: 'functional',
        steps: '',
        expectedResult: ''
      });
    } catch (error) {
      console.error('Error creating test case:', error);
    }
  };

  const handleRunTest = async (testCaseId) => {
    try {
      await api.post(`/tester/test-cases/${testCaseId}/run`);
      fetchData();
    } catch (error) {
      console.error('Error running test:', error);
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'passed': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      case 'active': return 'info';
      case 'in-progress': return 'warning';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'functional': return 'info';
      case 'integration': return 'warning';
      case 'ui': return 'secondary';
      case 'performance': return 'error';
      case 'security': return 'purple';
      default: return 'default';
    }
  };

  const filteredTestCases = testCases.filter(testCase => {
    const matchesSearch = testCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testCase.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const tabs = [
    { id: 'test-cases', label: 'Test Cases' },
    { id: 'test-runs', label: 'Test Runs' }
  ];

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">QA Workspace</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage test cases and execute test runs</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          Create Test Case
        </Button>
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
          {/* Test Cases Tab */}
          {activeTab === 'test-cases' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex space-x-4">
                  <Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    options={[
                      { value: 'all', label: 'All Test Cases' },
                      { value: 'active', label: 'Active' },
                      { value: 'passed', label: 'Recently Passed' },
                      { value: 'failed', label: 'Recently Failed' }
                    ]}
                  />
                </div>
                <div className="flex-1 max-w-md">
                  <Input
                    placeholder="Search test cases..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Test Cases Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredTestCases.map((testCase) => (
                  <div key={testCase.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {testCase.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          {testCase.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                      <Badge variant={getPriorityColor(testCase.priority)}>{testCase.priority}</Badge>
                      <Badge variant={getTypeColor(testCase.type)}>{testCase.type}</Badge>
                      {testCase.lastResult && (
                        <Badge variant={getStatusColor(testCase.lastResult)}>{testCase.lastResult}</Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div>Project: {testCase.project}</div>
                      <div>Created by: {testCase.createdBy}</div>
                      {testCase.lastRun && (
                        <div>Last run: {new Date(testCase.lastRun).toLocaleDateString()}</div>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        size="sm"
                        onClick={() => handleRunTest(testCase.id)}
                      >
                        Run Test
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTestCase(testCase);
                          // Could open a detailed view modal
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Runs Tab */}
          {activeTab === 'test-runs' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {testRuns.map((run) => (
                  <div key={run.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {run.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {run.project}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(run.status)}>{run.status}</Badge>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{run.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${run.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                      <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        <div className="font-bold text-green-600 dark:text-green-400">{run.passed}</div>
                        <div className="text-gray-600 dark:text-gray-400">Passed</div>
                      </div>
                      <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        <div className="font-bold text-red-600 dark:text-red-400">{run.failed}</div>
                        <div className="text-gray-600 dark:text-gray-400">Failed</div>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                        <div className="font-bold text-yellow-600 dark:text-yellow-400">{run.pending}</div>
                        <div className="text-gray-600 dark:text-gray-400">Pending</div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div>Assignee: {run.assignee}</div>
                      <div>Started: {new Date(run.startDate).toLocaleDateString()}</div>
                    </div>

                    <Button size="sm" variant="outline" className="w-full">
                      View Test Run Details
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Test Case Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create Test Case"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={newTestCase.title}
            onChange={(e) => setNewTestCase(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Test case title"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={newTestCase.description}
              onChange={(e) => setNewTestCase(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Describe what this test case validates..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Project"
              value={newTestCase.projectId}
              onChange={(e) => setNewTestCase(prev => ({ ...prev, projectId: e.target.value }))}
              options={[
                { value: '', label: 'Select project...' },
                ...projects.map(project => ({
                  value: project.id,
                  label: project.name
                }))
              ]}
            />
            <Select
              label="Priority"
              value={newTestCase.priority}
              onChange={(e) => setNewTestCase(prev => ({ ...prev, priority: e.target.value }))}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' }
              ]}
            />
            <Select
              label="Type"
              value={newTestCase.type}
              onChange={(e) => setNewTestCase(prev => ({ ...prev, type: e.target.value }))}
              options={[
                { value: 'functional', label: 'Functional' },
                { value: 'integration', label: 'Integration' },
                { value: 'ui', label: 'UI/UX' },
                { value: 'performance', label: 'Performance' },
                { value: 'security', label: 'Security' }
              ]}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Test Steps
            </label>
            <textarea
              value={newTestCase.steps}
              onChange={(e) => setNewTestCase(prev => ({ ...prev, steps: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="1. Step one&#10;2. Step two&#10;3. Step three..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Expected Result
            </label>
            <textarea
              value={newTestCase.expectedResult}
              onChange={(e) => setNewTestCase(prev => ({ ...prev, expectedResult: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Describe the expected outcome..."
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
              onClick={handleCreateTestCase}
              disabled={!newTestCase.title || !newTestCase.description}
            >
              Create Test Case
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QAWorkspacePage;
