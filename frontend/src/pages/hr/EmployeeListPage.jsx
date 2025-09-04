import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';

const EmployeeListPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await api.hr.getAllEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (employeeId) => {
    try {
      await api.hr.toggleEmployeeStatus(employeeId);
      fetchEmployees(); // Refresh the list
    } catch (error) {
      console.error('Error toggling employee status:', error);
    }
  };

  const columns = [
    {
      key: 'employeeId',
      title: 'Employee ID'
    },
    {
      key: 'name',
      title: 'Name',
      render: (_, row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.username
    },
    {
      key: 'email',
      title: 'Email'
    },
    {
      key: 'role',
      title: 'Role',
      type: 'badge',
      variant: 'primary'
    },
    {
      key: 'department',
      title: 'Department',
      render: (value) => value || 'General'
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'secondary'}>
          {value || 'inactive'}
        </Badge>
      )
    },
    {
      key: 'joinDate',
      title: 'Join Date',
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
            onClick={() => navigate(`/hr/employees/${row.id}`)}
          >
            View
          </Button>
          <Button
            size="sm"
            variant={row.status === 'active' ? 'warning' : 'success'}
            onClick={() => handleToggleStatus(row.id)}
          >
            {row.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#e5e7eb', margin: 0, marginBottom: '8px' }}>Employee Directory</h1>
          <p style={{ color: '#9ca3af', margin: 0 }}>Manage employee information and status</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/hr/employees/create')}
        >
          Add New Employee
        </Button>
      </div>

      <Card>
        <DataTable
          data={employees}
          columns={columns}
          loading={loading}
          emptyMessage="No employees found"
        />
      </Card>
    </div>
  );
};

export default EmployeeListPage;
