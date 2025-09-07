import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const TeamManagementPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/manager/team', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }

      const data = await response.json();
      setTeamMembers(data.teamMembers || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToProject = async (memberId, projectId) => {
    try {
      const response = await fetch(`/api/manager/team/${memberId}/assign`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign team member');
      }

      // Refresh team members list
      fetchTeamMembers();
    } catch (err) {
      setError(err.message);
      console.error('Error assigning team member:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  // Filter team members based on search term and role
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role) => {
    switch (role) {
      case 'developer':
        return 'bg-blue-100 text-blue-800';
      case 'tester':
        return 'bg-green-100 text-green-800';
      case 'designer':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
              <p className="text-gray-600">Manage team members and project assignments</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/manager/dashboard')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    {/* Search */}
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Search team members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    {/* Role Filter */}
                    <div>
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="all">All Roles</option>
                        <option value="developer">Developer</option>
                        <option value="tester">Tester</option>
                        <option value="designer">Designer</option>
                        <option value="manager">Manager</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No team members found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || roleFilter !== 'all' ? 'Try adjusting your search or filters.' : 'No team members available.'}
                </p>
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div key={member._id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {member.firstName} {member.lastName}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">{member.email}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
                          {member.role?.charAt(0).toUpperCase() + member.role?.slice(1)}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    {/* Current Projects */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Current Projects</h4>
                      {member.currentProjects && member.currentProjects.length > 0 ? (
                        <div className="space-y-1">
                          {member.currentProjects.slice(0, 2).map((project, index) => (
                            <div key={index} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                              {project.name || `Project ${index + 1}`}
                            </div>
                          ))}
                          {member.currentProjects.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{member.currentProjects.length - 2} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">No active projects</p>
                      )}
                    </div>

                    {/* Performance Metrics */}
                    <div className="mt-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {member.completedTasks || 0}
                          </div>
                          <div className="text-xs text-gray-500">Tasks Done</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {member.activeTickets || 0}
                          </div>
                          <div className="text-xs text-gray-500">Active Tickets</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex space-x-2">
                      <button
                        onClick={() => navigate(`/manager/team/${member._id}`)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-md transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => navigate(`/manager/team/${member._id}/assign`)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded-md transition-colors"
                      >
                        Assign Project
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          {filteredMembers.length > 0 && (
            <div className="mt-6 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="text-sm text-gray-500">
                  Showing {filteredMembers.length} of {teamMembers.length} team members
                  {searchTerm && ` matching "${searchTerm}"`}
                  {roleFilter !== 'all' && ` with role "${roleFilter}"`}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeamManagementPage;
