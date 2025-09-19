import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import api from '../../services/api';

const SystemStatsPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.admin.getSystemStats();
      setStats(response);
    } catch (error) {
      console.error('Error fetching system stats:', error);
      setError('Failed to load system statistics');
      // Set fallback data structure
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        byRole: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-400">Loading system statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-200 mb-2">Error Loading Statistics</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={fetchSystemStats}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">System Statistics</h1>
            <p className="text-gray-600">Detailed analytics and system metrics</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/admin')}
            >
              Back to Dashboard
            </Button>
            <Button 
              variant="primary" 
              onClick={fetchSystemStats}
            >
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.inactiveUsers || 0} inactive
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-green-600">{stats?.activeUsers || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round(((stats?.activeUsers || 0) / (stats?.totalUsers || 1)) * 100)}% of total
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">User Roles</p>
                <p className="text-3xl font-bold text-purple-600">{stats?.byRole?.length || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Different roles
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-3xl font-bold text-green-600">99.9%</p>
                <p className="text-xs text-gray-500 mt-1">
                  Uptime
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Role Breakdown */}
        <Card className="bg-white border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Role Distribution</h3>
            <div className="space-y-4">
              {stats?.byRole?.map((role, index) => {
                const percentage = Math.round((role.count / (stats?.totalUsers || 1)) * 100);
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <span className="font-medium text-gray-900 capitalize">{role._id}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="primary">{role.count}</Badge>
                        <span className="text-sm text-gray-500">{percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{role.active} active</span>
                      <span>{role.inactive} inactive</span>
                    </div>
                  </div>
                );
              }) || (
                <div className="text-center py-8 text-gray-500">
                  <p>No role data available</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* System Performance */}
        <Card className="bg-white border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Server Uptime</p>
                    <p className="text-sm text-gray-500">Last 30 days</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600">99.9%</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Database Size</p>
                    <p className="text-sm text-gray-500">Current usage</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600">2.4 GB</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">API Requests</p>
                    <p className="text-sm text-gray-500">Last 24 hours</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-purple-600">1,247</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Response Time</p>
                    <p className="text-sm text-gray-500">Average</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-yellow-600">45ms</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SystemStatsPage;
