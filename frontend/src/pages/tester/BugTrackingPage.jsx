import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';

const BugTrackingPage = () => {
  const navigate = useNavigate();
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBugs();
  }, [filter]);

  const fetchBugs = async () => {
    try {
      const filters = filter !== 'all' ? { status: filter } : {};
      const data = await api.user.getMyBugs(filters);
      setBugs(data);
    } catch (error) {
      console.error('Error fetching bugs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityVariant = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'danger';
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'danger';
      case 'in-progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'secondary';
      default: return 'primary';
    }
  };

  const columns = [
    {
      key: 'bugId',
      title: 'Bug ID'
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
      key: 'severity',
      title: 'Severity',
      render: (value) => (
        <Badge variant={getSeverityVariant(value)}>
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
      key: 'assignedTo',
      title: 'Assigned To',
      render: (_, row) => row.assignedTo?.username || 'Unassigned'
    },
    {
      key: 'createdAt',
      title: 'Reported',
      type: 'date'
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/projects/${row.projectId}/bugs/${row.id}`)}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate(`/projects/${row.projectId}/bugs/${row.id}/edit`)}
          >
            Edit
          </Button>
        </div>
      )
    }
  ];

  const filterButtons = [
    { key: 'all', label: 'All Bugs' },
    { key: 'open', label: 'Open' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' }
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#e5e7eb', margin: 0, marginBottom: '8px' }}>Bug Tracking</h1>
          <p style={{ color: '#9ca3af', margin: 0 }}>Track and manage bug reports</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/bugs/create')}
        >
          Report New Bug
        </Button>
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
          data={bugs}
          columns={columns}
          loading={loading}
          emptyMessage="No bugs found"
        />
      </Card>
    </div>
  );
};

export default BugTrackingPage;
