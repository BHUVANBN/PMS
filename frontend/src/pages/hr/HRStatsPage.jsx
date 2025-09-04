import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../config/api';

const HRStatsPage = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    newHires: 0,
    departures: 0,
    departmentBreakdown: [],
    averageSalary: 0,
    turnoverRate: 0,
    employeeSatisfaction: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('month');

  useEffect(() => {
    fetchStats();
  }, [timeframe]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/hr/stats?timeframe=${timeframe}`);
      setStats(response.data || stats);
    } catch (error) {
      console.error('Error fetching HR stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon, color = 'blue' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}% from last {timeframe}
            </p>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HR Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Employee statistics and insights</p>
        </div>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          change={5.2}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Active Employees"
          value={stats.activeEmployees}
          change={2.1}
          icon="✅"
          color="green"
        />
        <StatCard
          title="New Hires"
          value={stats.newHires}
          change={12.5}
          icon="🆕"
          color="purple"
        />
        <StatCard
          title="Departures"
          value={stats.departures}
          change={-3.2}
          icon="👋"
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Department Breakdown</h2>
          <div className="space-y-4">
            {stats.departmentBreakdown.map((dept, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span className="text-gray-900 dark:text-white font-medium">{dept.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 dark:text-gray-400">{dept.count}</span>
                  <Badge variant="secondary">{dept.percentage}%</Badge>
                </div>
              </div>
            )) || (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <span className="text-gray-900 dark:text-white font-medium">Engineering</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-gray-400">45</span>
                    <Badge variant="secondary">42%</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="text-gray-900 dark:text-white font-medium">Design</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-gray-400">18</span>
                    <Badge variant="secondary">17%</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                    <span className="text-gray-900 dark:text-white font-medium">Marketing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-gray-400">22</span>
                    <Badge variant="secondary">21%</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-900 dark:text-white font-medium">Sales</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-gray-400">12</span>
                    <Badge variant="secondary">11%</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span className="text-gray-900 dark:text-white font-medium">HR</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-gray-400">8</span>
                    <Badge variant="secondary">7%</Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Performance Metrics</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 dark:text-gray-300">Average Salary</span>
                <span className="text-gray-900 dark:text-white font-bold">
                  ${stats.averageSalary?.toLocaleString() || '75,000'}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 dark:text-gray-300">Turnover Rate</span>
                <span className="text-gray-900 dark:text-white font-bold">
                  {stats.turnoverRate || 8.5}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 dark:text-gray-300">Employee Satisfaction</span>
                <span className="text-gray-900 dark:text-white font-bold">
                  {stats.employeeSatisfaction || 4.2}/5.0
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '84%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent HR Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white font-medium">New employee onboarded</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Sarah Johnson joined the Design team</p>
            </div>
            <span className="text-gray-500 dark:text-gray-400 text-sm">2 hours ago</span>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white font-medium">Performance review completed</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Q4 reviews for Engineering team</p>
            </div>
            <span className="text-gray-500 dark:text-gray-400 text-sm">1 day ago</span>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white font-medium">Leave request approved</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Mike Chen's vacation request for next week</p>
            </div>
            <span className="text-gray-500 dark:text-gray-400 text-sm">2 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRStatsPage;
