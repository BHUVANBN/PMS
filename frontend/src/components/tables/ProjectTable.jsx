import React, { useState } from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export const ProjectTable = ({
  projects = [],
  onEdit,
  onDelete,
  onView,
  className = ''
}) => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedProjects = projects
    .filter(project => {
      const matchesSearch = project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || project.status === statusFilter;
      const matchesPriority = !priorityFilter || project.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (sortField === 'progress') {
        return (parseFloat(aValue) - parseFloat(bValue)) * direction;
      }
      
      return aValue.localeCompare(bValue) * direction;
    });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'planning': return 'info';
      case 'on-hold': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
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

  const tableStyles = {
    backgroundColor: '#111827',
    border: '1px solid #374151',
    borderRadius: '8px',
    overflow: 'hidden',
    width: '100%',
    overflowX: 'auto'
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
      alignItems: 'stretch'
    }
  };

  const tableContainerStyles = {
    overflowX: 'auto',
    width: '100%',
    minWidth: '600px'
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
    { value: 'planning', label: 'Planning' },
    { value: 'active', label: 'Active' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  return (
    <div style={tableStyles} className={className}>
      <div style={headerStyles}>
        <div style={filtersStyles}>
          <div style={{ minWidth: '200px' }}>
            <Input
              placeholder="Search projects..."
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
        </div>
      </div>

      <div style={tableContainerStyles}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyles} onClick={() => handleSort('name')}>
                Project {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyles} onClick={() => handleSort('status')}>
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyles} onClick={() => handleSort('priority')}>
                Priority {sortField === 'priority' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyles} onClick={() => handleSort('progress')}>
                Progress {sortField === 'progress' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyles} onClick={() => handleSort('dueDate')}>
                Due Date {sortField === 'dueDate' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyles}>Team</th>
              <th style={thStyles}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedProjects.map((project) => (
              <tr key={project.id} style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={tdStyles}>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>{project.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                      {project.description?.substring(0, 60)}
                      {project.description?.length > 60 ? '...' : ''}
                    </div>
                  </div>
                </td>
                <td style={tdStyles}>
                  <Badge variant={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </td>
                <td style={tdStyles}>
                  <Badge variant={getPriorityColor(project.priority)}>
                    {project.priority}
                  </Badge>
                </td>
                <td style={tdStyles}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '60px',
                      height: '6px',
                      backgroundColor: '#374151',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${project.progress || 0}%`,
                        height: '100%',
                        backgroundColor: project.progress >= 100 ? '#10b981' : 
                                       project.progress >= 75 ? '#3b82f6' :
                                       project.progress >= 50 ? '#f59e0b' : '#ef4444',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {project.progress || 0}%
                    </span>
                  </div>
                </td>
                <td style={tdStyles}>
                  {project.dueDate ? (
                    <div style={{
                      color: new Date(project.dueDate) < new Date() ? '#ef4444' : '#e5e7eb'
                    }}>
                      {new Date(project.dueDate).toLocaleDateString()}
                    </div>
                  ) : (
                    <span style={{ color: '#6b7280' }}>No due date</span>
                  )}
                </td>
                <td style={tdStyles}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {project.team?.slice(0, 3).map((member, index) => (
                      <div key={index} style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: '600',
                        marginLeft: index > 0 ? '-8px' : '0',
                        border: '2px solid #111827'
                      }}>
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} 
                               style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                        ) : (
                          member.name?.charAt(0)?.toUpperCase() || '?'
                        )}
                      </div>
                    ))}
                    {project.team?.length > 3 && (
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        marginLeft: '4px'
                      }}>
                        +{project.team.length - 3}
                      </div>
                    )}
                  </div>
                </td>
                <td style={tdStyles}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {onView && (
                      <Button size="sm" variant="outline" onClick={() => onView(project)}>
                        View
                      </Button>
                    )}
                    {onEdit && (
                      <Button size="sm" variant="outline" onClick={() => onEdit(project)}>
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button size="sm" variant="outline" onClick={() => onDelete(project.id)}
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

        {filteredAndSortedProjects.length === 0 && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            No projects found matching the current filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTable;
