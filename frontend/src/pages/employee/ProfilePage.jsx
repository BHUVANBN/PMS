import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../config/api';
import { useAuth } from '../../hooks/useAuth';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    bio: '',
    skills: '',
    avatar: null,
    preferences: {
      theme: 'dark',
      notifications: true,
      emailUpdates: true,
      language: 'en'
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employee/profile');
      setProfile(response.data || profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Mock data for demonstration
      setProfile({
        firstName: user?.firstName || 'John',
        lastName: user?.lastName || 'Doe',
        email: user?.email || 'john.doe@company.com',
        phone: '+1 (555) 123-4567',
        department: 'Engineering',
        position: 'Senior Developer',
        bio: 'Experienced full-stack developer with expertise in React, Node.js, and cloud technologies.',
        skills: 'React, Node.js, TypeScript, AWS, Docker, MongoDB',
        avatar: null,
        preferences: {
          theme: 'dark',
          notifications: true,
          emailUpdates: true,
          language: 'en'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1];
      setProfile(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/employee/profile', profile);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);
      
      try {
        const response = await api.post('/employee/profile/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setProfile(prev => ({ ...prev, avatar: response.data.avatarUrl }));
      } catch (error) {
        console.error('Error uploading avatar:', error);
      }
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'professional', label: 'Professional' },
    { id: 'preferences', label: 'Preferences' }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your personal information and preferences</p>
        </div>
        <div className="flex space-x-3">
          {!editing ? (
            <Button onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  fetchProfile();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                loading={saving}
              >
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                `${profile.firstName?.charAt(0) || ''}${profile.lastName?.charAt(0) || ''}`
              )}
            </div>
            {editing && (
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <span className="text-xs">📷</span>
              </label>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{profile.position}</p>
            <p className="text-gray-500 dark:text-gray-500">{profile.department}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
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
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
                <Input
                  label="Phone"
                  name="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleInputChange}
                  disabled={!editing}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          )}

          {/* Professional Tab */}
          {activeTab === 'professional' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Department"
                  name="department"
                  value={profile.department}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
                <Input
                  label="Position"
                  name="position"
                  value={profile.position}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Skills
                </label>
                {editing ? (
                  <textarea
                    name="skills"
                    value={profile.skills}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="React, Node.js, Python, etc."
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills?.split(',').map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill.trim()}</Badge>
                    )) || <p className="text-gray-500">No skills listed</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Theme"
                  name="preferences.theme"
                  value={profile.preferences.theme}
                  onChange={handleInputChange}
                  disabled={!editing}
                  options={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'auto', label: 'Auto' }
                  ]}
                />
                <Select
                  label="Language"
                  name="preferences.language"
                  value={profile.preferences.language}
                  onChange={handleInputChange}
                  disabled={!editing}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Spanish' },
                    { value: 'fr', label: 'French' },
                    { value: 'de', label: 'German' }
                  ]}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Push Notifications
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive notifications about project updates
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="preferences.notifications"
                      checked={profile.preferences.notifications}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Email Updates
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive email notifications for important updates
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="preferences.emailUpdates"
                      checked={profile.preferences.emailUpdates}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
