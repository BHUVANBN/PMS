import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../config/api';

const TestReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('all');
  const [timeframe, setTimeframe] = useState('month');
  const [metrics, setMetrics] = useState({
    totalTests: 0,
    passRate: 0,
    failRate: 0,
    coverage: 0,
    avgExecutionTime: 0,
    criticalBugs: 0,
    testTrends: []
  });

  useEffect(() => {
    fetchReports();
  }, [selectedProject, timeframe]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [reportsResponse, projectsResponse, metricsResponse] = await Promise.all([
        api.get(`/tester/reports?project=${selectedProject}&timeframe=${timeframe}`),
        api.get('/tester/projects'),
        api.get(`/tester/metrics?project=${selectedProject}&timeframe=${timeframe}`)
      ]);
      
      setReports(reportsResponse.data || []);
      setProjects(projectsResponse.data || []);
      setMetrics(metricsResponse.data || metrics);
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Mock data for demonstration
      setReports([
        {
          id: 1,
          name: 'Sprint 3 Test Execution Report',
          project: 'E-commerce Platform',
          type: 'execution',
          generatedDate: '2024-01-22',
          testSuite: 'Regression Suite',
          totalTests: 45,
          passed: 38,
          failed: 5,
          skipped: 2,
          passRate: 84.4,
          executionTime: '2h 15m',
          environment: 'Staging',
          tester: 'David Brown'
        },
        {
          id: 2,
          name: 'Payment Module Coverage Report',
          project: 'E-commerce Platform',
          type: 'coverage',
          generatedDate: '2024-01-20',
          testSuite: 'Payment Tests',
          totalTests: 28,
          passed: 25,
          failed: 3,
          skipped: 0,
          passRate: 89.3,
          executionTime: '1h 30m',
          environment: 'Production',
          tester: 'Sarah Johnson'
        },
        {
          id: 3,
          name: 'Performance Test Summary',
          project: 'E-commerce Platform',
          type: 'performance',
          generatedDate: '2024-01-18',
          testSuite: 'Load Tests',
          totalTests: 12,
          passed: 10,
          failed: 2,
          skipped: 0,
          passRate: 83.3,
          executionTime: '4h 45m',
          environment: 'Performance',
          tester: 'Mike Wilson'
        }
      ]);
      setProjects([
        { id: 1, name: 'E-commerce Platform' },
        { id: 2, name: 'Mobile App' },
        { id: 3, name: 'Data Analytics Dashboard' }
      ]);
      setMetrics({
        totalTests: 156,
        passRate: 85.9,
        failRate: 14.1,
        coverage: 78.5,
        avgExecutionTime: 2.8,
        criticalBugs: 3,
        testTrends: [
          { date: '2024-01-15', passed: 120, failed: 15 },
          { date: '2024-01-16', passed: 125, failed: 12 },
          { date: '2024-01-17', passed: 130, failed: 10 },
          { date: '2024-01-18', passed: 128, failed: 14 },
          { date: '2024-01-19', passed: 135, failed: 8 },
          { date: '2024-01-20', passed: 140, failed: 6 },
          { date: '2024-01-21', passed: 142, failed: 5 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type) => {
    try {
      await api.post('/tester/reports/generate', {
        type,
        project: selectedProject,
        timeframe
      });
      fetchReports();
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const exportReport = async (reportId, format) => {
    try {
      const response = await api.get(`/tester/reports/${reportId}/export?format=${format}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `test-report-${reportId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const getReportTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'execution': return 'info';
      case 'coverage': return 'success';
      case 'performance': return 'warning';
      case 'security': return 'error';
      default: return 'default';
    }
  };

  const MetricCard = ({ title, value, subtitle, icon, color = 'blue' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Test Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">View testing metrics and generate reports</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => generateReport('execution')}
          >
            Generate Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex space-x-4">
            <Select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              options={[
                { value: 'all', label: 'All Projects' },
                ...projects.map(project => ({
                  value: project.id,
                  label: project.name
                }))
              ]}
            />
            <Select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              options={[
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'quarter', label: 'This Quarter' },
                { value: 'year', label: 'This Year' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Tests"
          value={metrics.totalTests}
          subtitle="Executed this period"
          icon="📊"
          color="blue"
        />
        <MetricCard
          title="Pass Rate"
          value={`${metrics.passRate}%`}
          subtitle="Success rate"
          icon="✅"
          color="green"
        />
        <MetricCard
          title="Test Coverage"
          value={`${metrics.coverage}%`}
          subtitle="Code coverage"
          icon="🎯"
          color="purple"
        />
        <MetricCard
          title="Critical Bugs"
          value={metrics.criticalBugs}
          subtitle="High priority issues"
          icon="🚨"
          color="red"
        />
      </div>

      {/* Test Trends Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Test Execution Trends</h2>
        <div className="h-64 flex items-end justify-between space-x-2">
          {metrics.testTrends.map((trend, index) => {
            const maxValue = Math.max(...metrics.testTrends.map(t => t.passed + t.failed));
            const totalHeight = 200;
            const passedHeight = (trend.passed / maxValue) * totalHeight;
            const failedHeight = (trend.failed / maxValue) * totalHeight;
            
            return (
              <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                <div className="flex flex-col items-end space-y-1">
                  <div 
                    className="bg-red-500 rounded-t"
                    style={{ height: `${failedHeight}px`, width: '20px' }}
                  ></div>
                  <div 
                    className="bg-green-500 rounded-b"
                    style={{ height: `${passedHeight}px`, width: '20px' }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 transform rotate-45">
                  {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Passed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Failed</span>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Report
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Results
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pass Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Generated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {report.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {report.project} • {report.testSuite}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getReportTypeColor(report.type)}>
                      {report.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex space-x-4">
                      <span className="text-green-600 dark:text-green-400">✓ {report.passed}</span>
                      <span className="text-red-600 dark:text-red-400">✗ {report.failed}</span>
                      {report.skipped > 0 && (
                        <span className="text-yellow-600 dark:text-yellow-400">⊘ {report.skipped}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {report.passRate}%
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                          <div 
                            className={`h-2 rounded-full ${
                              report.passRate >= 90 ? 'bg-green-500' :
                              report.passRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${report.passRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div>
                      {new Date(report.generatedDate).toLocaleDateString()}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                      by {report.tester}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => exportReport(report.id, 'pdf')}
                      >
                        Export PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => exportReport(report.id, 'excel')}
                      >
                        Export Excel
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reports.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No reports found for the selected criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestReportsPage;
