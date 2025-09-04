import React from 'react';
import { Badge } from '../ui/Badge';

export const TaskSummary = ({
  tasks = {},
  className = ''
}) => {
  const {
    total = 0,
    completed = 0,
    inProgress = 0,
    todo = 0,
    overdue = 0
  } = tasks;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

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
    margin: '0 0 8px 0'
  };

  const progressBarStyles = {
    width: '100%',
    height: '8px',
    backgroundColor: '#374151',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '16px'
  };

  const progressFillStyles = {
    height: '100%',
    backgroundColor: '#10b981',
    width: `${completionRate}%`,
    transition: 'width 0.3s ease'
  };

  const statsGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  };

  const statItemStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0'
  };

  const statLabelStyles = {
    fontSize: '14px',
    color: '#9ca3af'
  };

  // Keeping styles object in case of future use; suppress lint for now
  // eslint-disable-next-line no-unused-vars
  const statValueStyles = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#e5e7eb'
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'inProgress': return 'info';
      case 'todo': return 'secondary';
      case 'overdue': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div style={containerStyles} className={className}>
      <div style={headerStyles}>
        <h3 style={titleStyles}>Task Summary</h3>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e5e7eb' }}>
          {completionRate}% Complete
        </div>
      </div>

      <div style={progressBarStyles}>
        <div style={progressFillStyles}></div>
      </div>

      <div style={statsGridStyles}>
        <div style={statItemStyles}>
          <span style={statLabelStyles}>Total Tasks</span>
          <Badge variant="default">{total}</Badge>
        </div>

        <div style={statItemStyles}>
          <span style={statLabelStyles}>Completed</span>
          <Badge variant={getStatusColor('completed')}>{completed}</Badge>
        </div>

        <div style={statItemStyles}>
          <span style={statLabelStyles}>In Progress</span>
          <Badge variant={getStatusColor('inProgress')}>{inProgress}</Badge>
        </div>

        <div style={statItemStyles}>
          <span style={statLabelStyles}>To Do</span>
          <Badge variant={getStatusColor('todo')}>{todo}</Badge>
        </div>

        {overdue > 0 && (
          <div style={statItemStyles}>
            <span style={statLabelStyles}>Overdue</span>
            <Badge variant={getStatusColor('overdue')}>{overdue}</Badge>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskSummary;
