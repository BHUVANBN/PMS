import React from 'react';
import { Button } from '../ui/Button';

export const QuickActions = ({
  actions = [],
  className = ''
}) => {
  const defaultActions = [
    {
      id: 'create-project',
      label: 'New Project',
      icon: '🚀',
      color: 'primary',
      onClick: () => console.log('Create project')
    },
    {
      id: 'create-task',
      label: 'Add Task',
      icon: '📝',
      color: 'secondary',
      onClick: () => console.log('Create task')
    },
    {
      id: 'invite-user',
      label: 'Invite User',
      icon: '👥',
      color: 'info',
      onClick: () => console.log('Invite user')
    },
    {
      id: 'view-reports',
      label: 'Reports',
      icon: '📊',
      color: 'warning',
      onClick: () => console.log('View reports')
    }
  ];

  const actionItems = actions.length > 0 ? actions : defaultActions;

  const containerStyles = {
    backgroundColor: '#111827',
    border: '1px solid #374151',
    borderRadius: '8px',
    padding: '20px'
  };

  const headerStyles = {
    marginBottom: '16px'
  };

  const titleStyles = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#e5e7eb',
    margin: 0
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px'
  };

  const actionButtonStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 12px',
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    color: 'inherit'
  };

  const iconStyles = {
    fontSize: '24px',
    marginBottom: '4px'
  };

  const labelStyles = {
    fontSize: '12px',
    fontWeight: '500',
    color: '#e5e7eb',
    textAlign: 'center'
  };

  return (
    <div style={containerStyles} className={className}>
      <div style={headerStyles}>
        <h3 style={titleStyles}>Quick Actions</h3>
      </div>
      
      <div style={gridStyles}>
        {actionItems.map((action) => (
          <button
            key={action.id}
            style={actionButtonStyles}
            onClick={action.onClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#374151';
              e.currentTarget.style.borderColor = '#4f46e5';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1f2937';
              e.currentTarget.style.borderColor = '#374151';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={iconStyles}>{action.icon}</div>
            <div style={labelStyles}>{action.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
