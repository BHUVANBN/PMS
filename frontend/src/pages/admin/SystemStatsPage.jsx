import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';

const SystemStatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const data = await api.admin.getSystemStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  };

  if (loading) {
    return <div style={{ color: '#e5e7eb' }}>Loading system statistics...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#e5e7eb', margin: 0, marginBottom: '8px' }}>System Statistics</h1>
        <p style={{ color: '#9ca3af', margin: 0 }}>Detailed analytics and system metrics</p>
      </div>

      <div style={gridStyles}>
        <Card title="User Statistics">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Users:</span>
              <Badge variant="primary">{stats?.totalUsers || 0}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Active Users:</span>
              <Badge variant="success">{stats?.activeUsers || 0}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>New Users (This Month):</span>
              <Badge variant="info">{stats?.newUsersThisMonth || 0}</Badge>
            </div>
          </div>
        </Card>

        <Card title="Project Statistics">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Projects:</span>
              <Badge variant="primary">{stats?.totalProjects || 0}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Active Projects:</span>
              <Badge variant="success">{stats?.activeProjects || 0}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Completed Projects:</span>
              <Badge variant="secondary">{stats?.completedProjects || 0}</Badge>
            </div>
          </div>
        </Card>

        <Card title="Ticket Statistics">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Tickets:</span>
              <Badge variant="primary">{stats?.totalTickets || 0}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Open Tickets:</span>
              <Badge variant="warning">{stats?.openTickets || 0}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Resolved Tickets:</span>
              <Badge variant="success">{stats?.resolvedTickets || 0}</Badge>
            </div>
          </div>
        </Card>

        <Card title="System Performance">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Server Uptime:</span>
              <span style={{ color: '#10b981' }}>{stats?.serverUptime || '99.9%'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Database Size:</span>
              <span>{stats?.databaseSize || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>API Requests (Today):</span>
              <Badge variant="info">{stats?.apiRequestsToday || 0}</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SystemStatsPage;
