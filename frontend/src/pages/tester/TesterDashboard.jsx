import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';

const TesterDashboard = () => {
  // eslint-disable-next-line no-unused-vars
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await api.tester.getMe();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching tester data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
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
    return <div style={{ color: '#e5e7eb' }}>Loading tester dashboard...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#e5e7eb', margin: 0, marginBottom: '8px' }}>Tester Dashboard</h1>
        <p style={{ color: '#9ca3af', margin: 0 }}>Quality assurance and testing overview</p>
      </div>

      <div style={gridStyles}>
        <div style={cardStyles}>
          <h3 style={{ margin: '0 0 16px 0', color: '#4f46e5' }}>Testing Overview</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Active Test Cases:</span>
              <Badge variant="primary">0</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Open Bugs:</span>
              <Badge variant="danger">0</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Tests Passed:</span>
              <Badge variant="success">0</Badge>
            </div>
          </div>
        </div>

        <div style={cardStyles}>
          <h3 style={{ margin: '0 0 16px 0', color: '#4f46e5' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button variant="primary" size="sm">
              Create Bug Report
            </Button>
            <Button variant="secondary" size="sm">
              View Test Cases
            </Button>
            <Button variant="secondary" size="sm">
              My Bug Reports
            </Button>
          </div>
        </div>

        <div style={cardStyles}>
          <h3 style={{ margin: '0 0 16px 0', color: '#4f46e5' }}>Recent Testing Activity</h3>
          <div style={{ color: '#9ca3af', fontSize: '14px' }}>
            <p>No recent testing activity</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TesterDashboard;
