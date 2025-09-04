import React from 'react';
import { Badge } from '../ui/Badge';

export const RecentActivity = ({
  activities = [],
  maxItems = 10,
  className = ''
}) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'task_created': return '📝';
      case 'task_completed': return '✅';
      case 'task_assigned': return '👤';
      case 'project_created': return '🚀';
      case 'bug_reported': return '🐛';
      case 'comment_added': return '💬';
      case 'file_uploaded': return '📎';
      case 'user_joined': return '👋';
      default: return '📋';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'task_completed': return 'success';
      case 'bug_reported': return 'danger';
      case 'project_created': return 'primary';
      case 'user_joined': return 'info';
      default: return 'secondary';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return time.toLocaleDateString();
  };

  const containerStyles = {
    backgroundColor: '#111827',
    border: '1px solid #374151',
    borderRadius: '8px',
    overflow: 'hidden'
  };

  const headerStyles = {
    padding: '16px 20px',
    borderBottom: '1px solid #374151',
    backgroundColor: '#1f2937'
  };

  const titleStyles = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#e5e7eb',
    margin: 0
  };

  const listStyles = {
    maxHeight: '400px',
    overflowY: 'auto'
  };

  const itemStyles = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 20px',
    borderBottom: '1px solid #374151',
    transition: 'background-color 0.2s ease'
  };

  const iconStyles = {
    fontSize: '16px',
    marginTop: '2px'
  };

  const contentStyles = {
    flex: 1,
    minWidth: 0
  };

  const messageStyles = {
    fontSize: '14px',
    color: '#e5e7eb',
    lineHeight: '1.4',
    marginBottom: '4px'
  };

  const metaStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#6b7280'
  };

  const emptyStateStyles = {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#6b7280'
  };

  const displayActivities = activities.slice(0, maxItems);

  return (
    <div style={containerStyles} className={className}>
      <div style={headerStyles}>
        <h3 style={titleStyles}>Recent Activity</h3>
      </div>
      
      {displayActivities.length === 0 ? (
        <div style={emptyStateStyles}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📭</div>
          <div>No recent activity</div>
        </div>
      ) : (
        <div style={listStyles}>
          {displayActivities.map((activity, index) => (
            <div
              key={activity.id || index}
              style={itemStyles}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1f2937';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={iconStyles}>
                {getActivityIcon(activity.type)}
              </div>
              
              <div style={contentStyles}>
                <div style={messageStyles}>
                  <strong>{activity.user?.name || 'Someone'}</strong> {activity.message}
                </div>
                
                <div style={metaStyles}>
                  <span>{formatTimeAgo(activity.timestamp)}</span>
                  {activity.project && (
                    <>
                      <span>•</span>
                      <span>{activity.project}</span>
                    </>
                  )}
                  <Badge variant={getActivityColor(activity.type)} size="sm">
                    {activity.type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
