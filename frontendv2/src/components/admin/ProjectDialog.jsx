import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
} from '@mui/material';
import { adminAPI } from '../../services/api';

const PROJECT_STATUSES = [
  'active',
  'on-hold',
  'completed',
  'cancelled'
];

const PRIORITIES = [
  'low',
  'medium',
  'high',
  'critical'
];

const ProjectDialog = ({ open, project, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    status: 'active',
    priority: 'medium',
    projectManager: '',
    startDate: '',
    endDate: '',
  });
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingManagers, setLoadingManagers] = useState(false);

  useEffect(() => {
    if (open) {
      fetchManagers();
    }
  }, [open]);

  useEffect(() => {
    if (project) {
      // Editing existing project
      console.log('ProjectDialog received project:', project);
      setFormData({
        projectName: project.projectName || project.name || '',
        description: project.description || '',
        status: project.status || 'active',
        priority: project.priority || 'medium',
        projectManager: project.projectManager?._id || project.projectManager || '',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      });
    } else {
      // Creating new project
      setFormData({
        projectName: '',
        description: '',
        status: 'active',
        priority: 'medium',
        projectManager: '',
        startDate: '',
        endDate: '',
      });
    }
  }, [project]);

  const fetchManagers = async () => {
    try {
      setLoadingManagers(true);
      const response = await adminAPI.getUsersByRole('manager');
      
      // Normalize managers response
      let managersList = [];
      if (Array.isArray(response)) {
        managersList = response;
      } else if (response?.users) {
        managersList = response.users;
      } else if (response?.data?.users) {
        managersList = response.data.users;
      } else if (response?.data && Array.isArray(response.data)) {
        managersList = response.data;
      }

      setManagers(managersList);
    } catch (error) {
      console.error('Error fetching managers:', error);
      setManagers([]);
    } finally {
      setLoadingManagers(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const submitData = { ...formData };
      if (project) {
        submitData.id = project._id || project.id;
        console.log('Project ID being sent:', submitData.id);
      }
      
      // Convert dates to proper format (only if they have values)
      if (submitData.startDate && submitData.startDate.trim() !== '') {
        submitData.startDate = new Date(submitData.startDate).toISOString();
      } else {
        delete submitData.startDate; // Remove empty date fields
      }
      if (submitData.endDate && submitData.endDate.trim() !== '') {
        submitData.endDate = new Date(submitData.endDate).toISOString();
      } else {
        delete submitData.endDate; // Remove empty date fields
      }
      
      console.log('Submitting project data:', submitData);
      await onSave(submitData);
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    // For editing, only require projectName (allow partial updates)
    if (project) {
      return formData.projectName.trim() !== '';
    } else {
      // For creating, require essential fields
      const required = ['projectName', 'description', 'projectManager'];
      return required.every(field => formData[field].trim() !== '');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {project ? 'Edit Project' : 'Create New Project'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Project Name"
                fullWidth
                value={formData.projectName}
                onChange={(e) => handleChange('projectName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required={!project}>
                <InputLabel id="manager-select-label">Project Manager</InputLabel>
                <Select
                  labelId="manager-select-label"
                  id="manager-select"
                  value={formData.projectManager}
                  label="Project Manager"
                  onChange={(e) => handleChange('projectManager', e.target.value)}
                  disabled={loadingManagers}
                >
                  {loadingManagers ? (
                    <MenuItem disabled>Loading managers...</MenuItem>
                  ) : managers.length === 0 ? (
                    <MenuItem disabled>No managers available</MenuItem>
                  ) : (
                    managers.map((manager) => (
                      <MenuItem key={manager._id || manager.id} value={manager._id || manager.id}>
                        {manager.firstName && manager.lastName 
                          ? `${manager.firstName} ${manager.lastName}` 
                          : manager.username || manager.email}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required={!project}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="status-select-label">Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  id="status-select"
                  value={formData.status}
                  label="Status"
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  {PROJECT_STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="priority-select-label">Priority</InputLabel>
                <Select
                  labelId="priority-select-label"
                  id="priority-select"
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => handleChange('priority', e.target.value)}
                >
                  {PRIORITIES.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="End Date"
                type="date"
                fullWidth
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={loading || !isFormValid()}
        >
          {loading ? 'Saving...' : (project ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectDialog;
