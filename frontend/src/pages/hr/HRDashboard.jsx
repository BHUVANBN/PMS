import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';

const HRDashboard = () => {
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

  const cardStyles = {
    backgroundColor: '#111827',
    borderRadius: '8px',
    padding: '24px',
    border: '1px solid #374151',
    color: '#e5e7eb'
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  };

  if (loading) {
    return <div style={{ color: '#e5e7eb' }}>Loading HR dashboard...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#e5e7eb', margin: 0, marginBottom: '8px' }}>HR Dashboard</h1>
        <p style={{ color: '#9ca3af', margin: 0 }}>Employee management and analytics</p>
      </div>

      <div style={gridStyles}>
        <div style={cardStyles}>
          <h3 style={{ margin: '0 0 16px 0', color: '#4f46e5' }}>Employee Overview</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Employees:</span>
              <Badge variant="primary">{stats?.totalEmployees || 0}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Active Employees:</span>
              <Badge variant="success">{stats?.activeEmployees || 0}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>New Hires (This Month):</span>
              <Badge variant="info">{stats?.newHires || 0}</Badge>
            </div>
          </div>
        </div>

        <div style={cardStyles}>
          <h3 style={{ margin: '0 0 16px 0', color: '#4f46e5' }}>Department Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Developers:</span>
              <span>{stats?.departments?.developers || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Testers:</span>
              <span>{stats?.departments?.testers || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Managers:</span>
              <span>{stats?.departments?.managers || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Others:</span>
              <span>{stats?.departments?.others || 0}</span>
            </div>
          </div>
        </div>

        <div style={cardStyles}>
          <h3 style={{ margin: '0 0 16px 0', color: '#4f46e5' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button variant="primary" size="sm">
              Add New Employee
            </Button>
            <Button variant="secondary" size="sm">
              View All Employees
            </Button>
            <Button variant="secondary" size="sm">
              Generate Reports
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
