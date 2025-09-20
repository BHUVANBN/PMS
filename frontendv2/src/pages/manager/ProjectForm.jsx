import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, MenuItem, Paper, Stack, Typography } from '@mui/material';
import { FormInput, FormSelect, FormSection, FormActions } from '../../components/shared/FormComponents';
import { projectsAPI, usersAPI } from '../../services/api';

// Align with backend PROJECT_STATUS enum
const STATUS_OPTIONS = [
  { label: 'Planning', value: 'planning' },
  { label: 'Active', value: 'active' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const ProjectForm = ({ mode = 'create', projectId, onCancel, onSuccess }) => {
  const [values, setValues] = useState({
    name: '',
    description: '',
    status: 'planning',
    startDate: '',
    endDate: '',
    projectManager: '',
    teamMembers: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Load users for manager/team selection
    (async () => {
      try {
        const res = await usersAPI.getAllUsers();
        const list = res?.data || res?.users || res || [];
        setUsers(list);
      } catch (_) {
        // ignore
      }
    })();
    if (mode === 'edit' && projectId) {
      (async () => {
        try {
          setLoading(true);
          const res = await projectsAPI.getProject(projectId);
          const p = res?.data || res?.project || res || {};
          setValues({
            name: p.name || '',
            description: p.description || '',
            status: p.status || 'planning',
            startDate: p.startDate ? p.startDate.substring(0,10) : '',
            endDate: p.endDate ? p.endDate.substring(0,10) : '',
            projectManager: p.projectManager?._id || p.projectManager || '',
            teamMembers: Array.isArray(p.teamMembers) ? p.teamMembers.map(u => u._id || u) : [],
          });
        } catch (e) {
          setError(e.message || 'Failed to load project');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [mode, projectId]);

  const handleChange = (name, value) => setValues(prev => ({...prev, [name]: value}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      if (mode === 'create') {
        // Backend requires: name, description, startDate, projectManager
        const payload = {
          name: values.name,
          description: values.description,
          startDate: values.startDate,
          endDate: values.endDate || undefined,
          projectManager: values.projectManager,
          teamMembers: values.teamMembers,
        };
        await projectsAPI.createProject(payload);
      } else {
        const payload = {
          name: values.name,
          description: values.description,
          endDate: values.endDate || undefined,
          status: values.status,
          teamMembers: values.teamMembers,
        };
        await projectsAPI.updateProject(projectId, payload);
      }
      onSuccess?.();
    } catch (e) {
      setError(e.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Typography variant="h5" fontWeight="bold">
            {mode === 'create' ? 'Create Project' : 'Edit Project'}
          </Typography>

          {error && (
            <Box className="text-red-600 text-sm">{error}</Box>
          )}

          <FormSection title="Basic Info">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormInput label="Project Name" value={values.name} onChange={(e)=>handleChange('name', e.target.value)} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormSelect label="Status" value={values.status} onChange={(e)=>handleChange('status', e.target.value)} required disabled={mode==='create'}>
                  {STATUS_OPTIONS.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                </FormSelect>
              </Grid>
              <Grid item xs={12}>
                <FormInput label="Description" multiline rows={3} value={values.description} onChange={(e)=>handleChange('description', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormInput label="Start Date" type="date" value={values.startDate} onChange={(e)=>handleChange('startDate', e.target.value)} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormInput label="End Date" type="date" value={values.endDate} onChange={(e)=>handleChange('endDate', e.target.value)} />
              </Grid>
            </Grid>
          </FormSection>

          <FormSection title="Team">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormSelect
                  label="Project Manager"
                  value={values.projectManager}
                  onChange={(e)=>handleChange('projectManager', e.target.value)}
                  required
                >
                  {users.map(u => (
                    <MenuItem key={u._id||u.id} value={u._id||u.id}>
                      {u.firstName ? `${u.firstName} ${u.lastName||''}`.trim() : (u.username || u.email || u._id)}
                    </MenuItem>
                  ))}
                </FormSelect>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormSelect
                  label="Team Members"
                  value={values.teamMembers}
                  onChange={(e)=>handleChange('teamMembers', e.target.value)}
                  multiple
                >
                  {users.map(u => (
                    <MenuItem key={u._id||u.id} value={u._id||u.id}>
                      {u.firstName ? `${u.firstName} ${u.lastName||''}`.trim() : (u.username || u.email || u._id)}
                    </MenuItem>
                  ))}
                </FormSelect>
              </Grid>
            </Grid>
          </FormSection>

          <FormActions>
            <Button variant="outlined" disabled={loading} onClick={onCancel}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>{mode === 'create' ? 'Create' : 'Save Changes'}</Button>
          </FormActions>
        </Stack>
      </form>
    </Paper>
  );
};

export default ProjectForm;
