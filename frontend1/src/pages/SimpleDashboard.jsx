import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const SimpleDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to role-specific dashboard
    if (user?.role) {
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'hr':
          navigate('/hr/dashboard', { replace: true });
          break;
        case 'manager':
          navigate('/manager/dashboard', { replace: true });
          break;
        case 'developer':
          navigate('/developer/dashboard', { replace: true });
          break;
        case 'tester':
          navigate('/tester/dashboard', { replace: true });
          break;
        case 'employee':
          navigate('/employee/dashboard', { replace: true });
          break;
        default:
          // Default fallback for any other roles
          navigate('/');
          break;
      }
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.firstName} {user?.lastName}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            {/* User Info Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Your Profile</h3>
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="bg-blue-50 overflow-hidden rounded-lg p-4">
                    <div className="text-sm font-medium text-blue-600">Role</div>
                    <div className="mt-1 text-lg font-semibold text-blue-900 capitalize">{user?.role}</div>
                  </div>
                  <div className="bg-green-50 overflow-hidden rounded-lg p-4">
                    <div className="text-sm font-medium text-green-600">Department</div>
                    <div className="mt-1 text-lg font-semibold text-green-900 capitalize">{user?.department}</div>
                  </div>
                  <div className="bg-purple-50 overflow-hidden rounded-lg p-4">
                    <div className="text-sm font-medium text-purple-600">Email</div>
                    <div className="mt-1 text-sm font-semibold text-purple-900">{user?.email}</div>
                  </div>
                  <div className="bg-yellow-50 overflow-hidden rounded-lg p-4">
                    <div className="text-sm font-medium text-yellow-600">Status</div>
                    <div className="mt-1 text-lg font-semibold text-yellow-900">Active</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Role-specific Content */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {user?.role === 'admin' && 'Admin Dashboard'}
                  {user?.role === 'manager' && 'Project Management'}
                  {user?.role === 'developer' && 'Development Tasks'}
                  {user?.role === 'tester' && 'Testing & QA'}
                  {user?.role === 'hr' && 'Human Resources'}
                  {!['admin', 'manager', 'developer', 'tester', 'hr'].includes(user?.role) && 'Employee Dashboard'}
                </h3>
                <div className="mt-5">
                  {user?.role === 'admin' && (
                    <div className="space-y-4">
                      <p className="text-gray-600">System administration and user management tools.</p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900">Users</h4>
                          <p className="text-2xl font-bold text-blue-600">1,234</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900">Projects</h4>
                          <p className="text-2xl font-bold text-green-600">56</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900">System Health</h4>
                          <p className="text-2xl font-bold text-purple-600">99.9%</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {user?.role === 'manager' && (
                    <div className="space-y-4">
                      <p className="text-gray-600">Project oversight and team management.</p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900">Active Projects</h4>
                          <p className="text-2xl font-bold text-blue-600">8</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900">Team Members</h4>
                          <p className="text-2xl font-bold text-green-600">24</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900">Completed Tasks</h4>
                          <p className="text-2xl font-bold text-purple-600">156</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {user?.role === 'developer' && (
                    <div className="space-y-4">
                      <p className="text-gray-600">Development tasks and code management.</p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900">Assigned Tasks</h4>
                          <p className="text-2xl font-bold text-blue-600">12</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900">Code Reviews</h4>
                          <p className="text-2xl font-bold text-green-600">8</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900">Bugs Fixed</h4>
                          <p className="text-2xl font-bold text-purple-600">15</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {user?.role === 'tester' && (
                    <div className="space-y-4">
                      <p className="text-gray-600">Quality assurance and testing activities.</p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900">Test Cases</h4>
                          <p className="text-2xl font-bold text-blue-600">89</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900">Bugs Found</h4>
                          <p className="text-2xl font-bold text-red-600">23</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900">Tests Passed</h4>
                          <p className="text-2xl font-bold text-green-600">156</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {user?.role === 'hr' && (
                    <div className="space-y-4">
                      <p className="text-gray-600">Employee management and HR activities.</p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900">Total Employees</h4>
                          <p className="text-2xl font-bold text-blue-600">245</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900">New Hires</h4>
                          <p className="text-2xl font-bold text-green-600">12</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900">Attendance</h4>
                          <p className="text-2xl font-bold text-purple-600">96%</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!['admin', 'manager', 'developer', 'tester', 'hr'].includes(user?.role) && (
                    <div className="space-y-4">
                      <p className="text-gray-600">General employee dashboard and activities.</p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900">My Tasks</h4>
                          <p className="text-2xl font-bold text-blue-600">8</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900">Completed</h4>
                          <p className="text-2xl font-bold text-green-600">24</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900">Hours Logged</h4>
                          <p className="text-2xl font-bold text-purple-600">38.5</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    View Projects
                  </button>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Create Task
                  </button>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                    View Reports
                  </button>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SimpleDashboard;
