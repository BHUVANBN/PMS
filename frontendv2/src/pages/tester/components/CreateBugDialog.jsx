import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  MenuItem,
  Typography,
  Box,
} from '@mui/material';

const severityOptions = ['critical', 'high', 'medium', 'low'];
const typeOptions = ['functional', 'ui', 'performance', 'security', 'data'];

const initialState = {
  title: '',
  description: '',
  severity: 'medium',
  bugType: 'functional',
  expectedBehavior: '',
  actualBehavior: '',
  steps: '',
};

const CreateBugDialog = ({ open, onClose, onSubmit, ticket, submitting }) => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm((prev) => ({
        ...initialState,
        title: ticket?.title ? `${ticket.title} bug` : '',
      }));
      setErrors({});
    }
  }, [open, ticket]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const stepsPayload = useMemo(() => {
    return form.steps
      .split('\n')
      .map((step) => step.trim())
      .filter(Boolean)
      .map((step, index) => ({ step, order: index + 1 }));
  }, [form.steps]);

  const handleSubmit = async () => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = 'Title is required';
    if (!form.description.trim()) nextErrors.description = 'Description is required';
    if (!form.severity) nextErrors.severity = 'Severity is required';
    if (!form.bugType) nextErrors.bugType = 'Bug type is required';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      severity: form.severity,
      bugType: form.bugType,
      expectedBehavior: form.expectedBehavior.trim() || undefined,
      actualBehavior: form.actualBehavior.trim() || undefined,
      stepsToReproduce: stepsPayload,
    };

    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Bug Tracker Entry</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Ticket
            </Typography>
            <Typography variant="subtitle1" fontWeight={600}>
              {ticket?.title || 'Untitled Ticket'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              #{ticket?._id?.toString()?.slice(-6) || ticket?.id}
            </Typography>
          </Box>

          <TextField
            label="Bug Title"
            value={form.title}
            onChange={handleChange('title')}
            error={Boolean(errors.title)}
            helperText={errors.title}
            fullWidth
            required
          />

          <TextField
            label="Description"
            value={form.description}
            onChange={handleChange('description')}
            error={Boolean(errors.description)}
            helperText={errors.description}
            multiline
            minRows={3}
            fullWidth
            required
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Severity"
              select
              value={form.severity}
              onChange={handleChange('severity')}
              error={Boolean(errors.severity)}
              helperText={errors.severity}
              fullWidth
              required
            >
              {severityOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Bug Type"
              select
              value={form.bugType}
              onChange={handleChange('bugType')}
              error={Boolean(errors.bugType)}
              helperText={errors.bugType}
              fullWidth
              required
            >
              {typeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <TextField
            label="Expected Behaviour"
            value={form.expectedBehavior}
            onChange={handleChange('expectedBehavior')}
            multiline
            minRows={2}
            fullWidth
          />

          <TextField
            label="Actual Behaviour"
            value={form.actualBehavior}
            onChange={handleChange('actualBehavior')}
            multiline
            minRows={2}
            fullWidth
          />

          <TextField
            label="Steps to Reproduce"
            value={form.steps}
            onChange={handleChange('steps')}
            placeholder={'1. Step description\n2. Step description'}
            multiline
            minRows={4}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {submitting ? 'Saving...' : 'Create Bug'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateBugDialog;
