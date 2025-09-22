import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, MenuItem, Paper, Stack, Typography } from '@mui/material';
import { FormInput, FormSelect, FormSection, FormActions } from '../../components/shared/FormComponents';
import { projectsAPI, usersAPI, managerAPI } from '../../services/api';

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
  // Team management state (edit mode)
  const [team, setTeam] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Load users for manager/team selection
    (async () => {
      try {
        const res = await usersAPI.getAllUsers();
        const list = res?.data || res?.users || res || [];
        // Deduplicate by _id and normalize shape
        const seen = new Set();
        const normalized = [];
        list.forEach(u => {
          const id = u?._id || u?.id;
          if (id && !seen.has(id)) {
            seen.add(id);
            normalized.push(u);
          }
        });
        // Optional: sort by firstName/username
        normalized.sort((a,b)=>{
          const an = (a.firstName || a.username || a.email || '').toLowerCase();
          const bn = (b.firstName || b.username || b.email || '').toLowerCase();
          return an.localeCompare(bn);
        });
        setUsers(normalized);
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
          // Load current team
          try {
            const tRes = await managerAPI.getProjectTeam(projectId);
            const t = tRes?.data || tRes?.team || tRes || [];
            setTeam(Array.isArray(t) ? t : (t.data || []));
          } catch (_) {
            // ignore
          }
          // Load candidate users by roles
          try {
            const roles = ['developer','tester','intern','marketing','sales'];
            const results = await Promise.allSettled(roles.map(r => usersAPI.getUsersByRole(r)));
            const pool = [];
            results.forEach((r) => {
              if (r.status === 'fulfilled') {
                const list = r.value?.data || r.value?.users || r.value || [];
                pool.push(...list);
              }
            });
            // Dedup and exclude already in team
            const teamIds = new Set((Array.isArray(team) ? team : []).map(u => u._id || u.id));
            const seen = new Set();
            const cand = [];
            pool.forEach(u => {
              const id = u?._id || u?.id;
              if (!id || seen.has(id) || teamIds.has(id)) return;
              seen.add(id);
              cand.push(u);
            });
            setCandidates(cand);
          } catch (_) {
            // ignore
          }
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
        // Manager creation: backend sets projectManager from authenticated user
        const payload = {
          name: values.name,
          description: values.description,
          startDate: values.startDate,
          endDate: values.endDate || undefined,
        };

  // Team management handlers
  const filteredCandidates = candidates.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const q = search.trim().toLowerCase();
    const label = (u.firstName ? `${u.firstName} ${u.lastName||''}` : (u.username || u.email || '')).toLowerCase();
    const matchSearch = !q || label.includes(q);
    return matchRole && matchSearch;
  });

  const handleAddToTeam = async (userId) => {
    try {
      await managerAPI.assignTeamRole(projectId, userId, { role: 'teamMember' });
      // Move from candidates to team
      const user = candidates.find(u => (u._id || u.id) === userId);
      if (user) setTeam(prev => [...prev, user]);
      setCandidates(prev => prev.filter(u => (u._id || u.id) !== userId));
    } catch (e) {
      alert(e.message || 'Failed to add to team');
    }
  };
        await managerAPI.createProject(payload);
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
              {mode !== 'create' && (
                <Grid item xs={12} sm={6}>
                  <FormSelect
                    label="Project Manager"
                    value={values.projectManager}
                    onChange={(e)=>handleChange('projectManager', e.target.value)}
                    required
                  >
                    {users.filter(u => (u.role === 'manager' || u.role === 'admin')).map(u => (
                      <MenuItem key={u._id||u.id} value={u._id||u.id}>
                        {u.firstName ? `${u.firstName} ${u.lastName||''}`.trim() : (u.username || u.email || u._id)}
                      </MenuItem>
                    ))}
                  </FormSelect>
                </Grid>
              )}
              {mode !== 'create' ? (
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
              ) : (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Team can be added after creating the project in the Team Management section.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </FormSection>

          {mode === 'edit' && (
            <FormSection title="Team Management" subtitle="Add employees to this project's team">
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>Current Team</Typography>
                  <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                    {(team || []).length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No team members yet</Typography>
                    ) : (
                      (team || []).map((u) => (
                        <Box key={u._id || u.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                          <Typography variant="body2">{u.firstName ? `${u.firstName} ${u.lastName||''}` : (u.username || u.email || u._id)}</Typography>
                          <Chip label={u.role} size="small" />
                        </Box>
                      ))
                    )}
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>Add Candidates</Typography>
                  <Stack direction="row" spacing={1} mb={1}>
                    <FormSelect label="Role" value={roleFilter} onChange={(e)=>setRoleFilter(e.target.value)} size="small">
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="developer">Developer</MenuItem>
                      <MenuItem value="tester">Tester</MenuItem>
                      <MenuItem value="marketing">Marketing</MenuItem>
                      <MenuItem value="sales">Sales</MenuItem>
                      <MenuItem value="intern">Intern</MenuItem>
                    </FormSelect>
                    <FormInput label="Search" value={search} onChange={(e)=>setSearch(e.target.value)} size="small" />
                  </Stack>
                  <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                    {filteredCandidates.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No candidates found</Typography>
                    ) : (
                      filteredCandidates.map((u) => (
                        <Box key={u._id || u.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                          <Typography variant="body2">{u.firstName ? `${u.firstName} ${u.lastName||''}` : (u.username || u.email || u._id)}</Typography>
                          <Button variant="outlined" size="small" onClick={() => handleAddToTeam(u._id || u.id)}>Add</Button>
                        </Box>
                      ))
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </FormSection>
          )}

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
