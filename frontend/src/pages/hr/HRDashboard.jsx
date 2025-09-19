import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import api from '../../services/api';

const HRDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.hr.getEmployeeStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching HR stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-200 text-lg">Loading HR dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-200 mb-2">HR Dashboard</h1>
        <p className="text-gray-400">Employee management and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Employee Overview Card */}
        <Card title="Employee Overview" className="bg-gray-900 border-gray-700">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total Employees:</span>
              <Badge variant="primary">{stats?.totalEmployees || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Active Employees:</span>
              <Badge variant="success">{stats?.activeEmployees || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">New Hires (This Month):</span>
              <Badge variant="info">{stats?.newHires || 0}</Badge>
            </div>
          </div>
        </Card>

        {/* Department Breakdown Card */}
        <Card title="Department Breakdown" className="bg-gray-900 border-gray-700">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Developers:</span>
              <span className="text-gray-200 font-medium">{stats?.departments?.developers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Testers:</span>
              <span className="text-gray-200 font-medium">{stats?.departments?.testers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Managers:</span>
              <span className="text-gray-200 font-medium">{stats?.departments?.managers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Others:</span>
              <span className="text-gray-200 font-medium">{stats?.departments?.others || 0}</span>
            </div>
          </div>
        </Card>

        {/* Quick Actions Card */}
        <Card title="Quick Actions" className="bg-gray-900 border-gray-700">
          <div className="space-y-3">
            <Button 
              variant="primary" 
              size="sm" 
              className="w-full"
              onClick={() => navigate('/hr/employees/create')}
            >
              Add New Employee
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full"
              onClick={() => navigate('/hr/employees')}
            >
              View All Employees
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full"
              onClick={() => navigate('/hr/stats')}
            >
              Generate Reports
            </Button>
          </div>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-700 text-center">
          <div className="text-2xl font-bold text-indigo-400 mb-1">
            {stats?.totalEmployees || 0}
          </div>
          <div className="text-sm text-gray-400">Total Employees</div>
        </Card>
        
        <Card className="bg-gray-900 border-gray-700 text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {stats?.activeEmployees || 0}
          </div>
          <div className="text-sm text-gray-400">Active Employees</div>
        </Card>
        
        <Card className="bg-gray-900 border-gray-700 text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">
            {stats?.newHires || 0}
          </div>
          <div className="text-sm text-gray-400">New Hires This Month</div>
        </Card>
        
        <Card className="bg-gray-900 border-gray-700 text-center">
          <div className="text-2xl font-bold text-yellow-400 mb-1">
            {stats?.departments?.developers || 0}
          </div>
          <div className="text-sm text-gray-400">Development Team</div>
        </Card>
      </div>
    </div>
  );
};

export default HRDashboard;
