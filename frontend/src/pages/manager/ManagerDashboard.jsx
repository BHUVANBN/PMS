import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';
import { useResponsive, getResponsiveCardPadding } from '../../utils/responsive';

const ManagerDashboard = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const screenSize = useResponsive();
  const isMobile = screenSize === 'xs' || screenSize === 'sm';

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const teamData = await api.manager.getTeam();
        setTeam(teamData);
      } catch (error) {
        console.error('Error fetching team data:', error);
        // Set mock data for demonstration
        setTeam([
          { id: 1, name: 'John Doe', role: 'Developer', status: 'active' },
          { id: 2, name: 'Jane Smith', role: 'Designer', status: 'active' },
          { id: 3, name: 'Bob Johnson', role: 'Tester', status: 'busy' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
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
    return <div style={{ color: '#e5e7eb' }}>Loading manager dashboard...</div>;
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h1 style={titleStyles}>Manager Dashboard</h1>
        <p style={subtitleStyles}>Team and project management</p>
      </div>
      
      <div style={contentStyles}>
        <div style={gridStyles}>
          <div style={cardStyles}>
            <h3 style={{ margin: '0 0 16px 0', color: '#4f46e5' }}>Team Overview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Team Members:</span>
                <Badge variant="primary">{team?.length || 0}</Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Active Projects:</span>
                <Badge variant="success">0</Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Pending Tasks:</span>
                <Badge variant="warning">0</Badge>
              </div>
            </div>
          </div>

        <div style={cardStyles}>
          <h3 style={{ margin: '0 0 16px 0', color: '#4f46e5' }}>Project Management</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button 
              variant="primary" 
              size={screenSize === 'xs' ? 'sm' : 'md'}
              onClick={() => console.log('Create New Project clicked')}
            >
              Create New Project
            </Button>
            <Button 
              variant="secondary" 
              size={screenSize === 'xs' ? 'sm' : 'md'}
              onClick={() => console.log('View All Projects clicked')}
            >
              View All Projects
            </Button>
            <Button 
              variant="secondary" 
              size={screenSize === 'xs' ? 'sm' : 'md'}
              onClick={() => console.log('Assign Tasks clicked')}
            >
              Assign Tasks
            </Button>
          </div>
        </div>

        <div style={cardStyles}>
          <h3 style={{ margin: '0 0 16px 0', color: '#4f46e5' }}>Team Members</h3>
          <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            {team && team.length > 0 ? (
              team.map((member, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #374151'
                }}>
                  <span>{member.name || member.username || 'Team Member'}</span>
                  <Badge variant="info" size="sm">{member.role || 'Member'}</Badge>
                </div>
              ))
            ) : (
              <p style={{ color: '#9ca3af', fontSize: '14px' }}>No team members found</p>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
