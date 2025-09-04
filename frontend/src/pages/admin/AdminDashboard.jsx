import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';
import { useResponsive, getResponsiveCardPadding, getResponsiveFontSize } from '../../utils/responsive';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const screenSize = useResponsive();
  const isMobile = screenSize === 'xs' || screenSize === 'sm';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.admin.getSystemStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set mock data for demonstration
        setStats({
          totalUsers: 45,
          activeProjects: 12,
          openTickets: 28
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cardPadding = getResponsiveCardPadding(screenSize);
  
  const cardStyles = {
    backgroundColor: '#111827',
    borderRadius: '8px',
    padding: cardPadding,
    border: '1px solid #374151',
    color: '#e5e7eb'
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: isMobile ? '16px' : '24px',
    width: '100%',
    height: 'auto'
  };

  const containerStyles = {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: isMobile ? '16px' : '24px',
    margin: 0,
    boxSizing: 'border-box',
  };

  const headerStyles = {
    marginBottom: isMobile ? '16px' : '24px',
    flexShrink: 0
  };

  const titleStyles = {
    color: '#e5e7eb',
    margin: 0,
    marginBottom: '8px',
    fontSize: isMobile ? '24px' : '32px',
    fontWeight: '700'
  };

  const subtitleStyles = {
    color: '#9ca3af',
    margin: 0,
    fontSize: isMobile ? '14px' : '16px'
  };

  const contentStyles = {
    flex: 1,
    overflow: 'auto',
    minHeight: 0,
    width: '100%'
  };

  const cardTitleStyles = {
    margin: '0 0 16px 0',
    color: '#4f46e5',
    fontSize: getResponsiveFontSize('body', screenSize),
    fontWeight: '600'
  };

  const statRowStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: getResponsiveFontSize('body', screenSize),
    flexWrap: screenSize === 'xs' ? 'wrap' : 'nowrap',
    gap: screenSize === 'xs' ? '8px' : '0'
  };

  const buttonContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  if (loading) {
    return <div style={{ color: '#e5e7eb' }}>Loading dashboard...</div>;
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h1 style={titleStyles}>Admin Dashboard</h1>
        <p style={subtitleStyles}>System overview and management</p>
      </div>
      
      <div style={contentStyles}>

      <div style={gridStyles}>
        <div style={cardStyles}>
          <h3 style={cardTitleStyles}>System Overview</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={statRowStyles}>
              <span>Total Users:</span>
              <Badge variant="primary">{stats?.totalUsers || 0}</Badge>
            </div>
            <div style={statRowStyles}>
              <span>Active Projects:</span>
              <Badge variant="success">{stats?.activeProjects || 0}</Badge>
            </div>
            <div style={statRowStyles}>
              <span>Open Tickets:</span>
              <Badge variant="warning">{stats?.openTickets || 0}</Badge>
            </div>
          </div>
        </div>

        <div style={cardStyles}>
          <h3 style={cardTitleStyles}>Quick Actions</h3>
          <div style={buttonContainerStyles}>
            <Button 
              variant="primary" 
              size={screenSize === 'xs' ? 'sm' : 'md'}
              onClick={() => console.log('Create New User clicked')}
            >
              Create New User
            </Button>
            <Button 
              variant="secondary" 
              size={screenSize === 'xs' ? 'sm' : 'md'}
              onClick={() => console.log('View All Users clicked')}
            >
              View All Users
            </Button>
            <Button 
              variant="secondary" 
              size={screenSize === 'xs' ? 'sm' : 'md'}
              onClick={() => console.log('System Settings clicked')}
            >
              System Settings
            </Button>
          </div>
        </div>

        <div style={cardStyles}>
          <h3 style={cardTitleStyles}>Recent Activity</h3>
          <div style={{ 
            color: '#9ca3af', 
            fontSize: getResponsiveFontSize('small', screenSize),
            lineHeight: '1.5'
          }}>
            <p style={{ margin: 0 }}>No recent activity to display</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
