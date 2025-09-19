import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../config/api';

const LeaveManagementPage = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeaveRequests();
  }, [filter]);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/hr/leave-requests?status=${filter}`);
      setLeaveRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      // Mock data for demonstration
      setLeaveRequests([
        {
          id: 1,
          employeeName: 'John Doe',
          employeeId: 'EMP001',
          department: 'Engineering',
          leaveType: 'vacation',
          startDate: '2024-01-15',
          endDate: '2024-01-19',
          days: 5,
          reason: 'Family vacation',
          status: 'pending',
          appliedDate: '2024-01-01',
          approver: 'Jane Smith'
        },
        {
          id: 2,
          employeeName: 'Sarah Johnson',
          employeeId: 'EMP002',
          department: 'Design',
          leaveType: 'sick',
          startDate: '2024-01-10',
          endDate: '2024-01-12',
          days: 3,
          reason: 'Medical appointment',
          status: 'approved',
          appliedDate: '2024-01-08',
          approver: 'Mike Wilson'
        },
        {
          id: 3,
          employeeName: 'Mike Chen',
          employeeId: 'EMP003',
          department: 'Marketing',
          leaveType: 'personal',
          startDate: '2024-01-20',
          endDate: '2024-01-20',
          days: 1,
          reason: 'Personal matters',
          status: 'rejected',
          appliedDate: '2024-01-05',
          approver: 'Lisa Brown'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await api.put(`/hr/leave-requests/${requestId}`, { status: newStatus });
      setLeaveRequests(prev => 
        prev.map(request => 
          request.id === requestId ? { ...request, status: newStatus } : request
        )
      );
      setShowModal(false);
    } catch (error) {
      console.error('Error updating leave request:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getLeaveTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'vacation': return 'info';
      case 'sick': return 'warning';
      case 'personal': return 'secondary';
      case 'emergency': return 'error';
      default: return 'default';
    }
  };

  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || request.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-200 mb-2">Leave Management</h1>
          <p className="text-gray-400">Manage employee leave requests and approvals</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex space-x-4">
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Requests' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' }
              ]}
            />
          </div>
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by employee name, ID, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-700">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-200">
                        {request.employeeName}
                      </div>
                      <div className="text-sm text-gray-400">
                        {request.employeeId} • {request.department}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getLeaveTypeColor(request.leaveType)}>
                      {request.leaveType}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    <div>
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                    </div>
                    <div className="text-gray-400">
                      {request.days} day{request.days > 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {new Date(request.appliedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowModal(true);
                      }}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">No leave requests found.</p>
          </div>
        )}
      </div>

      {/* Leave Request Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Leave Request Details"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Employee
                </label>
                <p className="text-gray-200">{selectedRequest.employeeName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Employee ID
                </label>
                <p className="text-gray-200">{selectedRequest.employeeId}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Department
                </label>
                <p className="text-gray-200">{selectedRequest.department}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Leave Type
                </label>
                <Badge variant={getLeaveTypeColor(selectedRequest.leaveType)}>
                  {selectedRequest.leaveType}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Start Date
                </label>
                <p className="text-gray-200">
                  {new Date(selectedRequest.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  End Date
                </label>
                <p className="text-gray-200">
                  {new Date(selectedRequest.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Reason
              </label>
              <p className="text-gray-200">{selectedRequest.reason}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Current Status
              </label>
              <Badge variant={getStatusColor(selectedRequest.status)}>
                {selectedRequest.status}
              </Badge>
            </div>

            {selectedRequest.status === 'pending' && (
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-700">
                <Button
                  variant="danger"
                  onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}
                  className="w-full sm:w-auto"
                >
                  Reject
                </Button>
                <Button
                  variant="success"
                  onClick={() => handleStatusUpdate(selectedRequest.id, 'approved')}
                  className="w-full sm:w-auto"
                >
                  Approve
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeaveManagementPage;
