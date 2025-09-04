import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';

const ProjectListPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await api.project.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'completed': return 'secondary';
      case 'on-hold': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'primary';
    }
  };

  const columns = [
    {
      key: 'name',
      title: 'Project Name'
    },
    {
      key: 'description',
      title: 'Description',
      render: (value) => value ? (value.length > 50 ? `${value.substring(0, 50)}...` : value) : 'No description'
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <Badge variant={getStatusVariant(value)}>
          {value || 'Draft'}
        </Badge>
      )
    },
    {
      key: 'priority',
      title: 'Priority',
      render: (value) => (
        <Badge variant={value === 'high' ? 'danger' : value === 'medium' ? 'warning' : 'info'}>
          {value || 'Low'}
        </Badge>
      )
    },
    {
      key: 'teamSize',
      title: 'Team Size',
      render: (_, row) => row.members?.length || 0
    },
    {
      key: 'deadline',
      title: 'Deadline',
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
            onClick={() => navigate(`/manager/projects/${row.id}`)}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate(`/manager/projects/${row.id}/edit`)}
          >
            Edit
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#e5e7eb', margin: 0, marginBottom: '8px' }}>Project Management</h1>
          <p style={{ color: '#9ca3af', margin: 0 }}>Manage all projects under your supervision</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/manager/projects/create')}
        >
          Create New Project
        </Button>
      </div>

      <Card>
        <DataTable
          data={projects}
          columns={columns}
          loading={loading}
          emptyMessage="No projects found"
        />
      </Card>
    </div>
  );
};

export default ProjectListPage;
