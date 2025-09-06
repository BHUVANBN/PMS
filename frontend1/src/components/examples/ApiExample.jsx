import React, { useState, useEffect } from 'react';
import { authAPI, adminAPI, managerAPI, developerAPI } from '../../services/api.js';
import { useApi, useApiForm } from '../../hooks/useApi.js';
import { apiHelpers } from '../../utils/helpers/apiHelpers.js';
import { USER_ROLES, TICKET_STATUS } from '../../utils/constants/api.js';

const ApiExample = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('auth');

  // Authentication example
  const { data: loginData, loading: loginLoading, error: loginError, execute: executeLogin } = useApi(authAPI.login);
  const { submit: submitLogin, loading: formLoading, error: formError } = useApiForm(
    authAPI.login,
    (result) => {
      console.log('Login successful:', result);
      setCurrentUser(authAPI.getCurrentUser());
    },
    (error) => console.error('Login failed:', error)
  );

  // Projects example
  const { data: projects, loading: projectsLoading, error: projectsError, execute: fetchProjects } = useApi(managerAPI.getMyProjects);

  // Users example
  const { data: users, loading: usersLoading, error: usersError, execute: fetchUsers } = useApi(adminAPI.getAllUsers);

  useEffect(() => {
    setCurrentUser(authAPI.getCurrentUser());
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const credentials = {
      username: formData.get('username'),
      password: formData.get('password')
    };
    await submitLogin(credentials);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderAuthSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Authentication Example</h3>
      
      {currentUser ? (
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-green-800">Logged in as: <strong>{currentUser.role}</strong></p>
          <button
            onClick={handleLogout}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={formLoading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {formLoading ? 'Logging in...' : 'Login'}
          </button>
          {formError && <p className="text-red-600 text-sm">{formError}</p>}
        </form>
      )}
    </div>
  );

  const renderProjectsSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Projects Example</h3>
      
      <button
        onClick={() => fetchProjects()}
        disabled={projectsLoading}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
      >
        {projectsLoading ? 'Loading...' : 'Fetch My Projects'}
      </button>

      {projectsError && (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-800">Error: {projectsError}</p>
        </div>
      )}

      {projects && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Projects ({projects.length})</h4>
          {projects.length > 0 ? (
            <ul className="space-y-2">
              {projects.map((project, index) => (
                <li key={project._id || index} className="bg-white p-2 rounded border">
                  <div className="font-medium">{project.name}</div>
                  <div className="text-sm text-gray-600">
                    Status: <span className={`px-2 py-1 rounded text-xs ${apiHelpers.getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">Team: {project.teamMembers?.length || 0} members</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-blue-600">No projects found</p>
          )}
        </div>
      )}
    </div>
  );

  const renderUsersSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Users Example (Admin Only)</h3>
      
      <button
        onClick={() => fetchUsers()}
        disabled={usersLoading}
        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
      >
        {usersLoading ? 'Loading...' : 'Fetch All Users'}
      </button>

      {usersError && (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-800">Error: {usersError}</p>
        </div>
      )}

      {users && (
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-medium text-purple-800 mb-2">Users ({users.length})</h4>
          {users.length > 0 ? (
            <ul className="space-y-2">
              {users.slice(0, 5).map((user, index) => (
                <li key={user._id || index} className="bg-white p-2 rounded border">
                  <div className="font-medium">{apiHelpers.formatUserName(user)}</div>
                  <div className="text-sm text-gray-600">
                    Role: <span className="font-medium">{user.role}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Status: <span className={user.isActive ? 'text-green-600' : 'text-red-600'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </li>
              ))}
              {users.length > 5 && (
                <li className="text-sm text-gray-500">... and {users.length - 5} more users</li>
              )}
            </ul>
          ) : (
            <p className="text-purple-600">No users found</p>
          )}
        </div>
      )}
    </div>
  );

  const renderUtilitiesSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">API Utilities Example</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">User Role Check</h4>
          <p>Current Role: <strong>{apiHelpers.getUserRole() || 'Not logged in'}</strong></p>
          <p>Is Admin: {apiHelpers.hasRole(USER_ROLES.ADMIN) ? '✅' : '❌'}</p>
          <p>Is Manager: {apiHelpers.hasRole(USER_ROLES.MANAGER) ? '✅' : '❌'}</p>
          <p>Is Developer: {apiHelpers.hasRole(USER_ROLES.DEVELOPER) ? '✅' : '❌'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Status Colors</h4>
          <div className="space-y-1">
            {Object.values(TICKET_STATUS).map(status => (
              <div key={status} className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs ${apiHelpers.getStatusColor(status)}`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Helper Functions</h4>
          <p>File Size: {apiHelpers.formatFileSize(1024000)}</p>
          <p>Duration: {apiHelpers.formatDuration(2.5)}</p>
          <p>Completion: {apiHelpers.calculateCompletion(7, 10)}%</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Authentication Status</h4>
          <p>Is Authenticated: {authAPI.isAuthenticated() ? '✅' : '❌'}</p>
          <p>Token Exists: {localStorage.getItem('token') ? '✅' : '❌'}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">API Integration Examples</h1>
      
      <div className="mb-6">
        <nav className="flex space-x-4">
          {[
            { id: 'auth', label: 'Authentication' },
            { id: 'projects', label: 'Projects' },
            { id: 'users', label: 'Users' },
            { id: 'utilities', label: 'Utilities' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeTab === 'auth' && renderAuthSection()}
        {activeTab === 'projects' && renderProjectsSection()}
        {activeTab === 'users' && renderUsersSection()}
        {activeTab === 'utilities' && renderUtilitiesSection()}
      </div>

      <div className="mt-8 bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-medium text-yellow-800 mb-2">Usage Instructions</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Make sure your backend server is running on http://localhost:5000</li>
          <li>• Try logging in with valid credentials to test authentication</li>
          <li>• Different API endpoints require different user roles</li>
          <li>• Check the browser console for detailed API responses</li>
          <li>• All API calls include automatic error handling and loading states</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiExample;
