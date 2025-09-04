import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../config/api';

const SystemSettingsPage = () => {
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    adminEmail: '',
    timezone: '',
    dateFormat: '',
    allowRegistration: false,
    requireEmailVerification: false,
    enableNotifications: false,
    maintenanceMode: false,
    maxFileSize: '',
    allowedFileTypes: '',
    sessionTimeout: '',
    passwordMinLength: '',
    requireSpecialChars: false,
    enableTwoFactor: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');
      setSettings(response.data || settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/admin/settings', settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'security', label: 'Security' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'files', label: 'File Management' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Configure system-wide settings and preferences</p>
        </div>
        <Button
          onClick={handleSave}
          loading={saving}
        >
          Save Settings
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Site Name"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleInputChange}
                  placeholder="Project Management System"
                />
                <Input
                  label="Admin Email"
                  name="adminEmail"
                  type="email"
                  value={settings.adminEmail}
                  onChange={handleInputChange}
                  placeholder="admin@company.com"
                />
              </div>
              
              <Input
                label="Site Description"
                name="siteDescription"
                value={settings.siteDescription}
                onChange={handleInputChange}
                placeholder="A comprehensive project management solution"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Timezone"
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleInputChange}
                  options={[
                    { value: 'UTC', label: 'UTC' },
                    { value: 'America/New_York', label: 'Eastern Time' },
                    { value: 'America/Chicago', label: 'Central Time' },
                    { value: 'America/Denver', label: 'Mountain Time' },
                    { value: 'America/Los_Angeles', label: 'Pacific Time' },
                    { value: 'Asia/Kolkata', label: 'India Standard Time' }
                  ]}
                />
                <Select
                  label="Date Format"
                  name="dateFormat"
                  value={settings.dateFormat}
                  onChange={handleInputChange}
                  options={[
                    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
                  ]}
                />
              </div>

              <div className="space-y-4">
                <Checkbox
                  label="Allow User Registration"
                  name="allowRegistration"
                  checked={settings.allowRegistration}
                  onChange={handleInputChange}
                />
                <Checkbox
                  label="Maintenance Mode"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Session Timeout (minutes)"
                  name="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={handleInputChange}
                  placeholder="30"
                />
                <Input
                  label="Password Minimum Length"
                  name="passwordMinLength"
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={handleInputChange}
                  placeholder="8"
                />
              </div>

              <div className="space-y-4">
                <Checkbox
                  label="Require Email Verification"
                  name="requireEmailVerification"
                  checked={settings.requireEmailVerification}
                  onChange={handleInputChange}
                />
                <Checkbox
                  label="Require Special Characters in Password"
                  name="requireSpecialChars"
                  checked={settings.requireSpecialChars}
                  onChange={handleInputChange}
                />
                <Checkbox
                  label="Enable Two-Factor Authentication"
                  name="enableTwoFactor"
                  checked={settings.enableTwoFactor}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Checkbox
                  label="Enable System Notifications"
                  name="enableNotifications"
                  checked={settings.enableNotifications}
                  onChange={handleInputChange}
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Notification Types
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">New User Registration</span>
                    <Badge variant="success">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Project Updates</span>
                    <Badge variant="success">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">System Alerts</span>
                    <Badge variant="warning">Disabled</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* File Management Settings */}
          {activeTab === 'files' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Maximum File Size (MB)"
                  name="maxFileSize"
                  type="number"
                  value={settings.maxFileSize}
                  onChange={handleInputChange}
                  placeholder="10"
                />
                <Input
                  label="Allowed File Types"
                  name="allowedFileTypes"
                  value={settings.allowedFileTypes}
                  onChange={handleInputChange}
                  placeholder="jpg,png,pdf,doc,docx"
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Storage Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Total Storage Used</span>
                    <span className="text-gray-900 dark:text-white font-medium">2.4 GB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Available Storage</span>
                    <span className="text-gray-900 dark:text-white font-medium">47.6 GB</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '5%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">Online</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">System Status</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">99.9%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">v1.0.0</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Version</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
