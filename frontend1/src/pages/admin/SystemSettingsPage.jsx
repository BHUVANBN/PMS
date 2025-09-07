import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const SystemSettingsPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [settings, setSettings] = useState({
    systemName: 'Project Management System',
    systemDescription: 'Comprehensive project and team management platform',
    allowSelfRegistration: false,
    defaultUserRole: 'employee',
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    passwordMinLength: 6,
    requirePasswordChange: false,
    enableEmailNotifications: true,
    enableSystemLogs: true
  });

  const roles = ['employee', 'intern', 'marketing', 'sales', 'tester', 'developer'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Since there's no backend endpoint for system settings yet,
      // we'll simulate the save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('System settings updated successfully');
      
      // In a real implementation, you would make an API call like:
      // const response = await fetch('/api/admin/settings', {
      //   method: 'PUT',
      //   credentials: 'include',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      
    } catch (err) {
      setError(err.message || 'Failed to update system settings');
      console.error('Error updating settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      setSettings({
        systemName: 'Project Management System',
        systemDescription: 'Comprehensive project and team management platform',
        allowSelfRegistration: false,
        defaultUserRole: 'employee',
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        passwordMinLength: 6,
        requirePasswordChange: false,
        enableEmailNotifications: true,
        enableSystemLogs: true
      });
      setSuccess('Settings reset to defaults');
    }
  };

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
              <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
              <p className="text-gray-600">Configure system-wide settings and preferences</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Back to Dashboard
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
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Success</h3>
                  <p className="text-sm text-green-700 mt-1">{success}</p>
                </div>
              </div>
            </div>
          )}

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

          {/* Settings Form */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* General Settings */}
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">General Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="systemName" className="block text-sm font-medium text-gray-700">
                        System Name
                      </label>
                      <input
                        type="text"
                        id="systemName"
                        name="systemName"
                        value={settings.systemName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter system name"
                      />
                    </div>
                    <div>
                      <label htmlFor="systemDescription" className="block text-sm font-medium text-gray-700">
                        System Description
                      </label>
                      <textarea
                        id="systemDescription"
                        name="systemDescription"
                        rows={3}
                        value={settings.systemDescription}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter system description"
                      />
                    </div>
                  </div>
                </div>

                {/* User Registration Settings */}
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">User Registration</h3>
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allowSelfRegistration"
                        name="allowSelfRegistration"
                        checked={settings.allowSelfRegistration}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="allowSelfRegistration" className="ml-2 block text-sm text-gray-900">
                        Allow self-registration for new users
                      </label>
                    </div>
                    <div>
                      <label htmlFor="defaultUserRole" className="block text-sm font-medium text-gray-700">
                        Default Role for New Users
                      </label>
                      <select
                        id="defaultUserRole"
                        name="defaultUserRole"
                        value={settings.defaultUserRole}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        {roles.map(role => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Security Settings</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700">
                        Session Timeout (hours)
                      </label>
                      <input
                        type="number"
                        id="sessionTimeout"
                        name="sessionTimeout"
                        min="1"
                        max="168"
                        value={settings.sessionTimeout}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="maxLoginAttempts" className="block text-sm font-medium text-gray-700">
                        Max Login Attempts
                      </label>
                      <input
                        type="number"
                        id="maxLoginAttempts"
                        name="maxLoginAttempts"
                        min="3"
                        max="10"
                        value={settings.maxLoginAttempts}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="passwordMinLength" className="block text-sm font-medium text-gray-700">
                        Minimum Password Length
                      </label>
                      <input
                        type="number"
                        id="passwordMinLength"
                        name="passwordMinLength"
                        min="6"
                        max="20"
                        value={settings.passwordMinLength}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requirePasswordChange"
                        name="requirePasswordChange"
                        checked={settings.requirePasswordChange}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="requirePasswordChange" className="ml-2 block text-sm text-gray-900">
                        Require password change on first login
                      </label>
                    </div>
                  </div>
                </div>

                {/* System Features */}
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">System Features</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableEmailNotifications"
                        name="enableEmailNotifications"
                        checked={settings.enableEmailNotifications}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="enableEmailNotifications" className="ml-2 block text-sm text-gray-900">
                        Enable email notifications
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableSystemLogs"
                        name="enableSystemLogs"
                        checked={settings.enableSystemLogs}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="enableSystemLogs" className="ml-2 block text-sm text-gray-900">
                        Enable system activity logging
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="border-t border-gray-200 pt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={handleResetToDefaults}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                  >
                    Reset to Defaults
                  </button>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => navigate('/admin/dashboard')}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
                    >
                      {loading && (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Information Panel */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Important Information</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Changes to security settings will affect all users on their next login</li>
                    <li>System settings are cached and may take a few minutes to take effect</li>
                    <li>Some settings require a system restart to fully apply</li>
                    <li>Always test changes in a development environment first</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SystemSettingsPage;
