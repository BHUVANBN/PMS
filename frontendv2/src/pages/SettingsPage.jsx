import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Switch, FormControlLabel,
  Divider, Stack, Avatar, Chip, Button, Select, MenuItem,
  FormControl, InputLabel, Alert, Snackbar, useTheme
} from '@mui/material';
import {
  Palette, Notifications, Security, Person,
  Language, Save, CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/useThemeMode';

const SettingSection = ({ icon, title, children }) => {
  const theme = useTheme();
  return (
    <Card sx={{
      mb: 3,
      borderRadius: 3,
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: 'none',
    }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
          <Box sx={{ color: 'primary.main' }}>{icon}</Box>
          <Typography variant="h6" fontWeight={600}>{title}</Typography>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {children}
      </CardContent>
    </Card>
  );
};

const SettingsPage = () => {
  const { user } = useAuth();
  const { mode, setMode } = useThemeMode();
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    inApp: true,
    taskUpdates: true,
    leaveUpdates: true,
    meetingReminders: true,
  });
  const [language, setLanguage] = useState('en');

  const handleSave = () => {
    setSaved(true);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Settings</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage your account preferences and application settings
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          sx={{ borderRadius: 2 }}
        >
          Save Changes
        </Button>
      </Stack>

      {/* Profile Overview */}
      <SettingSection icon={<Person />} title="Account">
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Avatar
            src={user?.profilePicture}
            sx={{ width: 64, height: 64, fontSize: '1.5rem', bgcolor: 'primary.main' }}
          >
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          <Box>
            <Typography fontWeight={600}>{user?.firstName} {user?.lastName}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
            <Chip label={user?.role} size="small" color="primary" variant="outlined" sx={{ mt: 0.5, textTransform: 'capitalize' }} />
          </Box>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          To update your profile information, visit the <strong>Profile</strong> page.
        </Typography>
      </SettingSection>

      {/* Appearance */}
      <SettingSection icon={<Palette />} title="Appearance">
        <FormControl fullWidth size="small" sx={{ maxWidth: 300 }}>
          <InputLabel>Theme</InputLabel>
          <Select
            value={mode}
            label="Theme"
            onChange={(e) => setMode(e.target.value)}
          >
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
            <MenuItem value="system">System Default</MenuItem>
          </Select>
        </FormControl>
      </SettingSection>

      {/* Notifications */}
      <SettingSection icon={<Notifications />} title="Notifications">
        <Stack spacing={1.5}>
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
            { key: 'inApp', label: 'In-App Notifications', desc: 'Show notifications within the app' },
            { key: 'taskUpdates', label: 'Task & Ticket Updates', desc: 'When tickets are assigned or updated' },
            { key: 'leaveUpdates', label: 'Leave Request Updates', desc: 'Status changes on leave requests' },
            { key: 'meetingReminders', label: 'Meeting Reminders', desc: 'Reminders before scheduled meetings' },
          ].map(({ key, label, desc }) => (
            <Stack key={key} direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" fontWeight={500}>{label}</Typography>
                <Typography variant="caption" color="text.secondary">{desc}</Typography>
              </Box>
              <Switch
                checked={notifications[key]}
                onChange={(e) => setNotifications((prev) => ({ ...prev, [key]: e.target.checked }))}
                color="primary"
              />
            </Stack>
          ))}
        </Stack>
      </SettingSection>

      {/* Language */}
      <SettingSection icon={<Language />} title="Language & Region">
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Language</InputLabel>
          <Select value={language} label="Language" onChange={(e) => setLanguage(e.target.value)}>
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="hi">Hindi</MenuItem>
          </Select>
        </FormControl>
      </SettingSection>

      {/* Security */}
      <SettingSection icon={<Security />} title="Security">
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" fontWeight={500} mb={0.5}>Password</Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Use a strong password with at least 8 characters, including uppercase, lowercase, and numbers.
            </Typography>
            <Button variant="outlined" size="small" href="/forgot-password" sx={{ borderRadius: 2 }}>
              Change Password
            </Button>
          </Box>
        </Stack>
      </SettingSection>

      <Snackbar
        open={saved}
        autoHideDuration={3000}
        onClose={() => setSaved(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          icon={<CheckCircle />}
          severity="success"
          variant="filled"
          onClose={() => setSaved(false)}
        >
          Settings saved successfully
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
