import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';

const EmployeeDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await api.employee.getMe();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching employee data:', error);
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
    return <div style={{ color: '#e5e7eb' }}>Loading employee dashboard...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#e5e7eb', margin: 0, marginBottom: '8px' }}>Employee Dashboard</h1>
        <p style={{ color: '#9ca3af', margin: 0 }}>Welcome to your workspace</p>
      </div>

      <div style={gridStyles}>
        <div style={cardStyles}>
          <h3 style={{ margin: '0 0 16px 0', color: '#4f46e5' }}>My Profile</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Employee ID:</span>
              <span>{user?.employeeId || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Department:</span>
              <Badge variant="info">{user?.department || 'General'}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Status:</span>
              <Badge variant="success">Active</Badge>
            </div>
          </div>
        </div>

        <div style={cardStyles}>
          <h3 style={{ margin: '0 0 16px 0', color: '#4f46e5' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button variant="primary" size="sm">
              View My Profile
            </Button>
            <Button variant="secondary" size="sm">
              Update Information
            </Button>
            <Button variant="secondary" size="sm">
              Contact HR
            </Button>
          </div>
        </div>

        <div style={cardStyles}>
          <h3 style={{ margin: '0 0 16px 0', color: '#4f46e5' }}>Announcements</h3>
          <div style={{ color: '#9ca3af', fontSize: '14px' }}>
            <p>No new announcements</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
