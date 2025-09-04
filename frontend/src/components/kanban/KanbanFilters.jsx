import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export const KanbanFilters = ({
  filters,
  onFiltersChange
}) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const assigneeOptions = [
    { value: '', label: 'All Assignees' },
    { value: '1', label: 'John Doe' },
    { value: '2', label: 'Jane Smith' },
    { value: '3', label: 'Mike Johnson' }
  ];

  const containerStyles = {
    display: 'flex',
    gap: '12px',
    alignItems: 'end',
    flexWrap: 'wrap'
  };

  return (
    <div style={containerStyles}>
      <div style={{ minWidth: '200px' }}>
        <Input
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
      </div>
      
      <div style={{ minWidth: '150px' }}>
        <Select
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          options={priorityOptions}
        />
      </div>
      
      <div style={{ minWidth: '150px' }}>
        <Select
          value={filters.assignee}
          onChange={(e) => handleFilterChange('assignee', e.target.value)}
          options={assigneeOptions}
        />
      </div>
    </div>
  );
};

export default KanbanFilters;
