import React from 'react';
import { KanbanCard } from './KanbanCard';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const KanbanColumn = ({
  column,
  tasks = [],
  onTaskMove,
  onTaskEdit,
  onTaskDelete,
  loading = false
}) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('text/plain'));
    if (taskId && onTaskMove) {
      onTaskMove(taskId, column.id);
    }
  };

  const columnStyles = {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '300px',
    maxWidth: '300px',
    backgroundColor: '#111827',
    borderRadius: '8px',
    border: '1px solid #374151'
  };

  const headerStyles = {
    padding: '12px 16px',
    borderBottom: '1px solid #374151',
    backgroundColor: '#1f2937'
  };

  const titleStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#e5e7eb'
  };

  const badgeStyles = {
    backgroundColor: column.color,
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  };

  const contentStyles = {
    flex: 1,
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minHeight: '400px',
    maxHeight: '600px',
    overflowY: 'auto'
  };

  const emptyStateStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    color: '#6b7280',
    fontSize: '14px',
    fontStyle: 'italic'
  };

  return (
    <div
      style={columnStyles}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div style={headerStyles}>
        <div style={titleStyles}>
          <span>{column.title}</span>
          <span style={badgeStyles}>{tasks.length}</span>
        </div>
      </div>

      <div style={contentStyles}>
        {loading ? (
          <div style={emptyStateStyles}>
            <LoadingSpinner size="sm" />
          </div>
        ) : tasks.length === 0 ? (
          <div style={emptyStateStyles}>
            No tasks in {column.title.toLowerCase()}
          </div>
        ) : (
          tasks.map(task => (
            <KanbanCard
              key={task.id}
              task={task}
              onEdit={onTaskEdit}
              onDelete={onTaskDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
