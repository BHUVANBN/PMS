import React, { useState } from 'react';
import { Box, Paper, Stack, Typography, Switch, FormControlLabel, Divider, Button, Alert } from '@mui/material';

const SystemSettings = () => {
  const [values, setValues] = useState({
    allowUserRegistration: true,
    enforceStrongPasswords: true,
    require2FA: false,
    maintenanceMode: false,
    enableAuditLogs: true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const handleToggle = (key) => (e) => setValues((prev) => ({ ...prev, [key]: e.target.checked }));

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      // Placeholder: wire to backend settings API when available
      await new Promise((r) => setTimeout(r, 600));
      setMessage({ type: 'success', text: 'Settings saved successfully.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>System Settings</Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={600}>Security</Typography>
          <FormControlLabel control={<Switch checked={values.enforceStrongPasswords} onChange={handleToggle('enforceStrongPasswords')} />} label="Enforce strong passwords" />
          <FormControlLabel control={<Switch checked={values.require2FA} onChange={handleToggle('require2FA')} />} label="Require two-factor authentication (2FA)" />
          <FormControlLabel control={<Switch checked={values.enableAuditLogs} onChange={handleToggle('enableAuditLogs')} />} label="Enable audit logs" />

          <Divider sx={{ my: 1 }} />

          <Typography variant="h6" fontWeight={600}>Access & Registration</Typography>
          <FormControlLabel control={<Switch checked={values.allowUserRegistration} onChange={handleToggle('allowUserRegistration')} />} label="Allow public user registration" />

          <Divider sx={{ my: 1 }} />

          <Typography variant="h6" fontWeight={600}>Maintenance</Typography>
          <FormControlLabel control={<Switch checked={values.maintenanceMode} onChange={handleToggle('maintenanceMode')} />} label="Maintenance mode (read-only)" />

          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
            <Button variant="outlined" disabled={saving} onClick={() => setValues(values)}>Cancel</Button>
            <Button variant="contained" disabled={saving} onClick={handleSave}>Save Changes</Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default SystemSettings;
