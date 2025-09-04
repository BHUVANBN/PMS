import React, { useState } from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export const TicketTable = ({
  tickets = [],
  onEdit,
  onDelete,
  onView,
  onStatusChange,
  className = ''
}) => {
  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedTickets = tickets
    .filter(ticket => {
      const matchesSearch = ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || ticket.status === statusFilter;
      const matchesPriority = !priorityFilter || ticket.priority === priorityFilter;
      const matchesType = !typeFilter || ticket.type === typeFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesType;
    })
    .sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (sortField === 'estimatedHours') {
        return (parseFloat(aValue) - parseFloat(bValue)) * direction;
      }
      
      return aValue.localeCompare(bValue) * direction;
    });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'todo': return 'secondary';
      case 'in-progress': return 'info';
      case 'review': return 'warning';
      case 'testing': return 'warning';
      case 'done': return 'success';
      default: return 'default';
    }
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

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'bug': return 'danger';
      case 'feature': return 'success';
      case 'task': return 'info';
      case 'improvement': return 'warning';
      case 'epic': return 'primary';
      default: return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'bug': return '🐛';
      case 'feature': return '✨';
      case 'task': return '📝';
      case 'improvement': return '🔧';
      case 'epic': return '🚀';
      default: return '📋';
    }
  };

  const tableStyles = {
    backgroundColor: '#111827',
    border: '1px solid #374151',
    borderRadius: '8px',
    overflow: 'hidden',
    width: '100%'
  };

  const headerStyles = {
    padding: '16px 20px',
    borderBottom: '1px solid #374151',
    backgroundColor: '#1f2937'
  };

  const filtersStyles = {
    display: 'flex',
    gap: '12px',
    alignItems: 'end',
    flexWrap: 'wrap',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: '8px'
    }
  };

  const tableContainerStyles = {
    overflowX: 'auto',
    width: '100%',
    minWidth: '800px'
  };

  const thStyles = {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    backgroundColor: '#1f2937',
    borderBottom: '1px solid #374151',
    cursor: 'pointer',
    userSelect: 'none'
  };

  const tdStyles = {
    padding: '12px 16px',
    borderBottom: '1px solid #374151',
    fontSize: '14px',
    color: '#e5e7eb'
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'In Review' },
    { value: 'testing', label: 'Testing' },
    { value: 'done', label: 'Done' }
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'task', label: 'Task' },
    { value: 'bug', label: 'Bug' },
    { value: 'feature', label: 'Feature' },
    { value: 'improvement', label: 'Improvement' },
    { value: 'epic', label: 'Epic' }
  ];

  return (
    <div style={tableStyles} className={className}>
      <div style={headerStyles}>
        <div style={filtersStyles}>
          <div style={{ minWidth: '200px' }}>
            <Input
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ minWidth: '120px' }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
          </div>
          <div style={{ minWidth: '120px' }}>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={priorityOptions}
            />
          </div>
          <div style={{ minWidth: '120px' }}>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={typeOptions}
            />
          </div>
        </div>
      </div>

      <div style={tableContainerStyles}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyles} onClick={() => handleSort('title')}>
                Ticket {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyles} onClick={() => handleSort('type')}>
                Type {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyles} onClick={() => handleSort('status')}>
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyles} onClick={() => handleSort('priority')}>
                Priority {sortField === 'priority' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyles}>Assignee</th>
              <th style={thStyles} onClick={() => handleSort('estimatedHours')}>
                Est. Hours {sortField === 'estimatedHours' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyles} onClick={() => handleSort('dueDate')}>
                Due Date {sortField === 'dueDate' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyles}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTickets.map((ticket) => (
              <tr key={ticket.id} style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={tdStyles}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '16px' }}>{getTypeIcon(ticket.type)}</span>
                      <span style={{ fontWeight: '500' }}>{ticket.title}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                      {ticket.description?.substring(0, 80)}
                      {ticket.description?.length > 80 ? '...' : ''}
                    </div>
                  </div>
                </td>
                <td style={tdStyles}>
                  <Badge variant={getTypeColor(ticket.type)}>
                    {ticket.type}
                  </Badge>
                </td>
                <td style={tdStyles}>
                  {onStatusChange ? (
                    <Select
                      value={ticket.status}
                      onChange={(e) => onStatusChange(ticket.id, e.target.value)}
                      options={statusOptions.filter(opt => opt.value)}
                      style={{ minWidth: '120px' }}
                    />
                  ) : (
                    <Badge variant={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  )}
                </td>
                <td style={tdStyles}>
                  <Badge variant={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </td>
                <td style={tdStyles}>
                  {ticket.assignee ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>
                        {ticket.assignee.avatar ? (
                          <img src={ticket.assignee.avatar} alt={ticket.assignee.name} 
                               style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                        ) : (
                          ticket.assignee.name?.charAt(0)?.toUpperCase() || '?'
                        )}
                      </div>
                      <span style={{ fontSize: '12px' }}>{ticket.assignee.name}</span>
                    </div>
                  ) : (
                    <span style={{ color: '#6b7280', fontSize: '12px' }}>Unassigned</span>
                  )}
                </td>
                <td style={tdStyles}>
                  {ticket.estimatedHours ? (
                    <span>{ticket.estimatedHours}h</span>
                  ) : (
                    <span style={{ color: '#6b7280' }}>-</span>
                  )}
                </td>
                <td style={tdStyles}>
                  {ticket.dueDate ? (
                    <div style={{
                      color: new Date(ticket.dueDate) < new Date() ? '#ef4444' : '#e5e7eb'
                    }}>
                      {new Date(ticket.dueDate).toLocaleDateString()}
                    </div>
                  ) : (
                    <span style={{ color: '#6b7280' }}>No due date</span>
                  )}
                </td>
                <td style={tdStyles}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {onView && (
                      <Button size="sm" variant="outline" onClick={() => onView(ticket)}>
                        View
                      </Button>
                    )}
                    {onEdit && (
                      <Button size="sm" variant="outline" onClick={() => onEdit(ticket)}>
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button size="sm" variant="outline" onClick={() => onDelete(ticket.id)}
                              style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                        Delete
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSortedTickets.length === 0 && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            No tickets found matching the current filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketTable;
