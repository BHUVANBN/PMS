import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  MenuItem,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { FormInput, FormSelect } from '../../components/shared/FormComponents';
import { managerAPI } from '../../services/api';

const TICKET_TYPES = [
  { label: 'Task', value: 'task' },
  { label: 'Bug', value: 'bug' }
];

const TICKET_PRIORITIES = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' }
];

const TicketForm = ({ open, onClose, onSuccess, projectId, moduleId, moduleName }) => {
  const [values, setValues] = useState({
    title: '',
    description: '',
    type: 'task',
    priority: 'medium',
    assignedDeveloper: '',
    tester: '',
    estimatedHours: '',
    storyPoints: '',
    dueDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState({ developers: [], testers: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      fetchEmployees();
    }
  }, [open]);

  const fetchEmployees = async () => {
    try {
      const [devResponse, testerResponse] = await Promise.all([
        managerAPI.getEmployees({ role: 'developer' }),
        managerAPI.getEmployees({ role: 'tester' })
      ]);

      setEmployees({
        developers: devResponse?.data || [],
        testers: testerResponse?.data || []
      });
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees');
    }
  };

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        title: values.title,
        description: values.description,
        type: values.type,
        priority: values.priority,
        assignedDeveloper: values.assignedDeveloper || null,
        tester: values.tester || null,
        estimatedHours: values.estimatedHours ? parseFloat(values.estimatedHours) : 0,
        storyPoints: values.storyPoints ? parseInt(values.storyPoints) : 0,
        dueDate: values.dueDate || null
      };

      await managerAPI.createTicket(projectId, moduleId, payload);
      
      // Reset form
      setValues({
        title: '',
        description: '',
        type: 'task',
        priority: 'medium',
        assignedDeveloper: '',
        tester: '',
        estimatedHours: '',
        storyPoints: '',
        dueDate: ''
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError(err.response?.data?.error || err.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          Create Ticket
          {moduleName && (
            <Typography variant="body2" color="text.secondary">
              Module: {moduleName}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
              <Typography color="error.dark">{error}</Typography>
            </Box>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormInput
                label="Title"
                value={values.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <FormInput
                label="Description"
                value={values.description}
                onChange={(e) => handleChange('description', e.target.value)}
                multiline
                rows={3}
                fullWidth
              />
            </Grid>

            <Grid item xs={6}>
              <FormSelect
                label="Type"
                value={values.type}
                onChange={(e) => handleChange('type', e.target.value)}
                required
                fullWidth
              >
                {TICKET_TYPES.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </FormSelect>
            </Grid>

            <Grid item xs={6}>
              <FormSelect
                label="Priority"
                value={values.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                required
                fullWidth
              >
                {TICKET_PRIORITIES.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </FormSelect>
            </Grid>

            <Grid item xs={6}>
              <FormSelect
                label="Assign Developer"
                value={values.assignedDeveloper}
                onChange={(e) => handleChange('assignedDeveloper', e.target.value)}
                fullWidth
              >
                <MenuItem value="">Unassigned</MenuItem>
                {employees.developers.map(dev => (
                  <MenuItem key={dev._id} value={dev._id}>
                    {dev.firstName} {dev.lastName} ({dev.username})
                  </MenuItem>
                ))}
              </FormSelect>
            </Grid>

            <Grid item xs={6}>
              <FormSelect
                label="Assign Tester"
                value={values.tester}
                onChange={(e) => handleChange('tester', e.target.value)}
                fullWidth
              >
                <MenuItem value="">Unassigned</MenuItem>
                {employees.testers.map(tester => (
                  <MenuItem key={tester._id} value={tester._id}>
                    {tester.firstName} {tester.lastName} ({tester.username})
                  </MenuItem>
                ))}
              </FormSelect>
            </Grid>

            <Grid item xs={4}>
              <FormInput
                label="Estimated Hours"
                type="number"
                value={values.estimatedHours}
                onChange={(e) => handleChange('estimatedHours', e.target.value)}
                inputProps={{ min: 0, step: 0.5 }}
                fullWidth
              />
            </Grid>

            <Grid item xs={4}>
              <FormInput
                label="Story Points"
                type="number"
                value={values.storyPoints}
                onChange={(e) => handleChange('storyPoints', e.target.value)}
                inputProps={{ min: 0, step: 1 }}
                fullWidth
              />
            </Grid>

            <Grid item xs={4}>
              <FormInput
                label="Due Date"
                type="date"
                value={values.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || !values.title}
            startIcon={loading && <CircularProgress size={20} />}
          >
            Create Ticket
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TicketForm;
