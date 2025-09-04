import React, { useState } from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export const UserTable = ({
  users = [],
  onEdit,
  onDelete,
  onView,
  className = ''
}) => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus = !statusFilter || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      const direction = sortDirection === 'asc' ? 1 : -1;
      return aValue.localeCompare(bValue) * direction;
    });

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'danger';
      case 'manager': return 'warning';
      case 'developer': return 'info';
      case 'tester': return 'secondary';
      case 'hr': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'suspended': return 'danger';
      default: return 'default';
    }
  };

  const tableStyles = {
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

  const filtersStyles = {
    display: 'flex',
    gap: '12px',
    alignItems: 'end',
    flexWrap: 'wrap'
  };

  const tableContainerStyles = {
    overflowX: 'auto'
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

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'developer', label: 'Developer' },
    { value: 'tester', label: 'Tester' },
    { value: 'hr', label: 'HR' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ];

  return (
    <div style={tableStyles} className={className}>
      <div style={headerStyles}>
        <div style={filtersStyles}>
          <div style={{ minWidth: '200px' }}>
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ minWidth: '120px' }}>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={roleOptions}
            />
          </div>
          <div style={{ minWidth: '120px' }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
          </div>
        </div>
      </div>

      <div style={tableContainerStyles}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyles} onClick={() => handleSort('name')}>
                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyles} onClick={() => handleSort('email')}>
                Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyles} onClick={() => handleSort('role')}>
                Role {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyles} onClick={() => handleSort('status')}>
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyles} onClick={() => handleSort('lastLogin')}>
                Last Login {sortField === 'lastLogin' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyles}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedUsers.map((user) => (
              <tr key={user.id} style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={tdStyles}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                      ) : (
                        user.name?.charAt(0)?.toUpperCase() || '?'
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: '500' }}>{user.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{user.department}</div>
                    </div>
                  </div>
                </td>
                <td style={tdStyles}>{user.email}</td>
                <td style={tdStyles}>
                  <Badge variant={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                </td>
                <td style={tdStyles}>
                  <Badge variant={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                </td>
                <td style={tdStyles}>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                </td>
                <td style={tdStyles}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {onView && (
                      <Button size="sm" variant="outline" onClick={() => onView(user)}>
                        View
                      </Button>
                    )}
                    {onEdit && (
                      <Button size="sm" variant="outline" onClick={() => onEdit(user)}>
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button size="sm" variant="outline" onClick={() => onDelete(user.id)}
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

        {filteredAndSortedUsers.length === 0 && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            No users found matching the current filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTable;
