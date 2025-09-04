import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../config/api';

const EmployeeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    salary: '',
    hireDate: '',
    status: '',
    manager: '',
    skills: ''
  });

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/hr/employees/${id}`);
      setEmployee(response.data);
      setFormData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        department: response.data.department || '',
        position: response.data.position || '',
        salary: response.data.salary || '',
        hireDate: response.data.hireDate || '',
        status: response.data.status || '',
        manager: response.data.manager || '',
        skills: response.data.skills?.join(', ') || ''
      });
    } catch (error) {
      console.error('Error fetching employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const dataToSend = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      };
      await api.put(`/hr/employees/${id}`, dataToSend);
      setEmployee({ ...employee, ...dataToSend });
      setEditing(false);
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/hr/employees/${id}`);
      navigate('/hr/employees');
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'terminated': return 'error';
      case 'on leave': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Employee Not Found</h2>
        <Button onClick={() => navigate('/hr/employees')}>Back to Employees</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Employee Details</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage employee information and records</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/hr/employees')}
          >
            Back to Employees
          </Button>
          {!editing ? (
            <Button onClick={() => setEditing(true)}>
              Edit Employee
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    firstName: employee.firstName || '',
                    lastName: employee.lastName || '',
                    email: employee.email || '',
                    phone: employee.phone || '',
                    department: employee.department || '',
                    position: employee.position || '',
                    salary: employee.salary || '',
                    hireDate: employee.hireDate || '',
                    status: employee.status || '',
                    manager: employee.manager || '',
                    skills: employee.skills?.join(', ') || ''
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name
              </label>
              {editing ? (
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="text-gray-900 dark:text-white font-medium">{employee.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name
              </label>
              {editing ? (
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="text-gray-900 dark:text-white font-medium">{employee.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              {editing ? (
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{employee.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone
              </label>
              {editing ? (
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{employee.phone || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Department
              </label>
              {editing ? (
                <Select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  options={[
                    { value: 'engineering', label: 'Engineering' },
                    { value: 'design', label: 'Design' },
                    { value: 'marketing', label: 'Marketing' },
                    { value: 'sales', label: 'Sales' },
                    { value: 'hr', label: 'Human Resources' },
                    { value: 'finance', label: 'Finance' }
                  ]}
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{employee.department}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Position
              </label>
              {editing ? (
                <Input
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{employee.position}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              {editing ? (
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'on leave', label: 'On Leave' },
                    { value: 'terminated', label: 'Terminated' }
                  ]}
                />
              ) : (
                <Badge variant={getStatusColor(employee.status)}>{employee.status}</Badge>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Salary
              </label>
              {editing ? (
                <Input
                  name="salary"
                  type="number"
                  value={formData.salary}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {employee.salary ? `$${employee.salary.toLocaleString()}` : 'Not disclosed'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hire Date
              </label>
              {editing ? (
                <Input
                  name="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Manager
              </label>
              {editing ? (
                <Input
                  name="manager"
                  value={formData.manager}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{employee.manager || 'Not assigned'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skills
              </label>
              {editing ? (
                <Input
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="React, Node.js, Python"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {employee.skills?.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  )) || <p className="text-gray-500">No skills listed</p>}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Employee ID
              </label>
              <p className="text-gray-900 dark:text-white font-mono">{employee.id || employee._id}</p>
            </div>
          </div>
        </div>

        {!editing && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="error"
              onClick={() => setShowDeleteModal(true)}
            >
              Remove Employee
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Remove Employee"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to remove this employee? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="error"
              onClick={handleDelete}
            >
              Remove Employee
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeDetailPage;
