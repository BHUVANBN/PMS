import React, { useState } from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const KanbanCard = ({
  task,
  onEdit,
  onDelete
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.id.toString());
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'low': return 'secondary';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      case 'critical': return 'danger';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const cardStyles = {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '6px',
    padding: '12px',
    cursor: 'grab',
    transition: 'all 0.2s ease',
    opacity: isDragging ? 0.5 : 1,
    transform: isDragging ? 'rotate(5deg)' : 'none'
  };

  const titleStyles = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: '8px',
    lineHeight: '1.4'
  };

  const descriptionStyles = {
    fontSize: '12px',
    color: '#9ca3af',
    marginBottom: '12px',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  };

  const metaStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px'
  };

  const tagsStyles = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginBottom: '8px'
  };

  const tagStyles = {
    backgroundColor: '#374151',
    color: '#9ca3af',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '500'
  };

  const assigneeStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#9ca3af'
  };

  const avatarStyles = {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: '600'
  };

  const actionsStyles = {
    display: 'flex',
    gap: '4px',
    marginTop: '8px'
  };

  const dueDateStyles = {
    fontSize: '11px',
    color: task.dueDate && new Date(task.dueDate) < new Date() ? '#ef4444' : '#6b7280'
  };

  return (
    <div
      style={cardStyles}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#4f46e5';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#374151';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={titleStyles}>{task.title}</div>
      
      {task.description && (
        <div style={descriptionStyles}>{task.description}</div>
      )}

      <div style={metaStyles}>
        <Badge variant={getPriorityColor(task.priority)} size="sm">
          {task.priority}
        </Badge>
        {task.dueDate && (
          <div style={dueDateStyles}>
            Due {formatDate(task.dueDate)}
          </div>
        )}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div style={tagsStyles}>
          {task.tags.map((tag, index) => (
            <span key={index} style={tagStyles}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {task.assignee && (
        <div style={assigneeStyles}>
          <div style={avatarStyles}>
            {task.assignee.avatar ? (
              <img
                src={task.assignee.avatar}
                alt={task.assignee.name}
                style={{ width: '100%', height: '100%', borderRadius: '50%' }}
              />
            ) : (
              task.assignee.name?.charAt(0)?.toUpperCase() || '?'
            )}
          </div>
          <span>{task.assignee.name}</span>
        </div>
      )}

      {task.estimatedHours && (
        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
          Est: {task.estimatedHours}h
        </div>
      )}

      <div style={actionsStyles}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit && onEdit(task)}
          style={{ fontSize: '11px', padding: '4px 8px' }}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete && onDelete(task.id)}
          style={{ fontSize: '11px', padding: '4px 8px', color: '#ef4444', borderColor: '#ef4444' }}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default KanbanCard;
