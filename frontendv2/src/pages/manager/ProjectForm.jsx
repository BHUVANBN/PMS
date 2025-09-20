import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, MenuItem, Paper, Stack, Typography } from '@mui/material';
import { FormInput, FormSelect, FormSection, FormActions, FormDatePicker } from '../../components/shared/FormComponents';
import { managerAPI } from '../../services/api';

const STATUS_OPTIONS = [
  { label: 'Planned', value: 'planned' },
  { label: 'active', value: 'active' },
  { label: 'completed', value: 'completed' },
  { label: 'archived', value: 'archived' },
];

const ProjectForm = ({ mode = 'create', projectId, onCancel, onSuccess }) => {
  const [values, setValues] = useState({
    name: '',
    description: '',
    status: 'active',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mode === 'edit' && projectId) {
      (async () => {
        try {
          setLoading(true);
          const res = await managerAPI.getProjectDetails(projectId);
          const p = res?.project || res?.data?.project || res?.data || res || {};
          setValues({
            name: p.name || '',
            description: p.description || '',
            status: p.status || 'active',
            startDate: p.startDate ? p.startDate.substring(0,10) : '',
            endDate: p.endDate ? p.endDate.substring(0,10) : '',
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
        await managerAPI.createProject(values);
      } else {
        await managerAPI.updateProject(projectId, values);
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
                <FormSelect label="Status" value={values.status} onChange={(e)=>handleChange('status', e.target.value)} required>
                  {STATUS_OPTIONS.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                </FormSelect>
              </Grid>
              <Grid item xs={12}>
                <FormInput label="Description" multiline rows={3} value={values.description} onChange={(e)=>handleChange('description', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormInput label="Start Date" type="date" value={values.startDate} onChange={(e)=>handleChange('startDate', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormInput label="End Date" type="date" value={values.endDate} onChange={(e)=>handleChange('endDate', e.target.value)} />
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
