import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import api from '../../services/api';

const MyWorkPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMyTickets();
  }, [filter]);

  const fetchMyTickets = async () => {
    try {
      const filters = filter !== 'all' ? { status: filter } : {};
      const data = await api.developer.getMyTickets(filters);
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'primary';
      case 'in-progress': return 'warning';
      case 'completed': return 'success';
      case 'closed': return 'secondary';
      default: return 'primary';
    }
  };

  const columns = [
    {
      key: 'ticketId',
      title: 'Ticket ID'
    },
    {
      key: 'title',
      title: 'Title'
    },
    {
      key: 'project',
      title: 'Project',
      render: (_, row) => row.project?.name || 'N/A'
    },
    {
      key: 'priority',
      title: 'Priority',
      render: (value) => (
        <Badge variant={getPriorityVariant(value)}>
          {value || 'Low'}
        </Badge>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <Badge variant={getStatusVariant(value)}>
          {value || 'Open'}
        </Badge>
      )
    },
    {
      key: 'dueDate',
      title: 'Due Date',
      type: 'date'
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <Button
          size="sm"
          variant="primary"
          onClick={() => window.open(`/projects/${row.projectId}/tickets/${row.id}`, '_blank')}
        >
          View Details
        </Button>
      )
    }
  ];

  const filterButtons = [
    { key: 'all', label: 'All Tickets' },
    { key: 'open', label: 'Open' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' }
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#e5e7eb', margin: 0, marginBottom: '8px' }}>My Work</h1>
        <p style={{ color: '#9ca3af', margin: 0 }}>View and manage your assigned tasks</p>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
        {filterButtons.map(button => (
          <Button
            key={button.key}
            size="sm"
            variant={filter === button.key ? 'primary' : 'secondary'}
            onClick={() => setFilter(button.key)}
          >
            {button.label}
          </Button>
        ))}
      </div>

      <Card>
        <DataTable
          data={tickets}
          columns={columns}
          loading={loading}
          emptyMessage="No tickets assigned to you"
        />
      </Card>
    </div>
  );
};

export default MyWorkPage;
