import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';
import { useResponsive, getResponsiveCardPadding } from '../../utils/responsive';

const DeveloperDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const screenSize = useResponsive();
  const isMobile = screenSize === 'xs' || screenSize === 'sm';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projectsData, ticketsData] = await Promise.all([
          api.developer.getMyProjects(),
          api.developer.getMyTickets()
        ]);
        setProjects(projectsData);
        setTickets(ticketsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set mock data for demonstration
        setProjects([
          { id: 1, name: 'E-commerce Platform', status: 'active', progress: 75 },
          { id: 2, name: 'Mobile App', status: 'planning', progress: 25 }
        ]);
        setTickets([
          { id: 1, title: 'Fix login bug', status: 'in-progress', priority: 'high' },
          { id: 2, title: 'Add payment gateway', status: 'todo', priority: 'medium' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: isMobile ? '16px' : '24px',
    margin: 0,
    boxSizing: 'border-box',
    minHeight: '100vh'
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

  if (loading) {
    return <div style={{ color: '#e5e7eb' }}>Loading developer dashboard...</div>;
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h1 style={titleStyles}>Developer Dashboard</h1>
        <p style={subtitleStyles}>Your projects and assigned tasks</p>
      </div>
      
      <div style={contentStyles}>

      <div style={gridStyles}>
        <div style={cardStyles}>
          <h3 style={{ margin: '0 0 16px 0', color: '#4f46e5' }}>My Work</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Active Projects:</span>
              <Badge variant="primary">{projects.length}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Open Tickets:</span>
              <Badge variant="warning">{tickets.length}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Completed Today:</span>
              <Badge variant="success">0</Badge>
            </div>
          </div>
        </div>

        <div style={cardStyles}>
          <h3 style={{ margin: '0 0 16px 0', color: '#4f46e5' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button 
              variant="primary" 
              size={screenSize === 'xs' ? 'sm' : 'md'}
              onClick={() => console.log('View My Tasks clicked')}
            >
              View My Tasks
            </Button>
            <Button 
              variant="secondary" 
              size={screenSize === 'xs' ? 'sm' : 'md'}
              onClick={() => console.log('Submit Code Review clicked')}
            >
              Submit Code Review
            </Button>
            <Button 
              variant="secondary" 
              size={screenSize === 'xs' ? 'sm' : 'md'}
              onClick={() => console.log('Report Bug clicked')}
            >
              Report Bug
            </Button>
          </div>
        </div>

        <div style={cardStyles}>
          <h3 style={{ margin: '0 0 16px 0', color: '#4f46e5' }}>Recent Activity</h3>
          <div style={{ color: '#9ca3af', fontSize: '14px' }}>
            <p>No recent activity</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
