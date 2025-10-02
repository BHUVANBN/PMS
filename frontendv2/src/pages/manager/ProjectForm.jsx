import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, MenuItem, Paper, Stack, Typography, Chip } from '@mui/material';
import { FormInput, FormSelect, FormSection, FormActions } from '../../components/shared/FormComponents';
import { projectsAPI, usersAPI, managerAPI, adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// Align with backend PROJECT_STATUS enum
const STATUS_OPTIONS = [
  { label: 'Planning', value: 'planning' },
  { label: 'Active', value: 'active' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const ProjectForm = ({ mode = 'create', projectId, onCancel, onSuccess }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [values, setValues] = useState({
    name: '',
    description: '',
    status: 'planning',
    startDate: '',
    endDate: '',
    projectManager: '',
    teamMembers: [], // Always initialize as array
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
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
        console.log('Users API response:', res);
        const list = res?.data || res?.users || res || [];
        console.log('Extracted users list:', list);
        
        // Load managers for admin
        if (isAdmin) {
          try {
            console.log('Admin detected, fetching managers...');
            const managersRes = await adminAPI.getUsersByRole('manager');
            console.log('Managers API response:', managersRes);
            const managersList = managersRes?.data || managersRes?.users || managersRes || [];
            console.log('Extracted managers list:', managersList);
            console.log('Managers list length:', managersList.length);
            const normalizedManagers = Array.isArray(managersList) ? managersList : [];
            setManagers(normalizedManagers);
            console.log('Set managers state:', normalizedManagers);
            
            if (normalizedManagers.length === 0) {
              console.warn('No managers found via API, checking fallback...');
              // Fallback: filter managers from all users
              const managerUsers = list.filter(u => {
                console.log(`User ${u.email} has role: ${u.role}`);
                return u.role === 'manager';
              });
              console.log('Fallback managers from users list:', managerUsers);
              setManagers(managerUsers);
            }
          } catch (err) {
            console.error('Error loading managers:', err);
            // Fallback: filter managers from all users
            const managerUsers = list.filter(u => {
              console.log(`Fallback - User ${u.email} has role: ${u.role}`);
              return u.role === 'manager';
            });
            setManagers(managerUsers);
            console.log('Error fallback managers from users list:', managerUsers);
          }
        }
        
        // Deduplicate by _id and normalize shape
        const seen = new Set();
        const normalized = [];
        const usersList = Array.isArray(list) ? list : [];
        console.log('Users list for deduplication:', usersList);
        usersList.forEach(u => {
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
        console.log('Normalized users:', normalized);
        setUsers(normalized);
        
        // Set empty array if no users found to prevent errors
        if (!Array.isArray(normalized) || normalized.length === 0) {
          console.warn('No users found, setting empty array');
          setUsers([]);
        }
      } catch (err) {
        console.error('Error loading users:', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          response: err.response?.data
        });
        setError('Unable to load team members. Please try refreshing the page.');
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
          let currentTeam = [];
          try {
            const tRes = await managerAPI.getProjectTeam(projectId);
            const t = tRes?.data || tRes?.team || tRes || [];
            currentTeam = Array.isArray(t) ? t : (t.data || []);
            setTeam(currentTeam);
          } catch {
            // ignore
          }
          // Load candidate users by roles
          try {
            const roles = ['developer','tester','intern','marketing','sales'];
            const results = await Promise.allSettled(roles.map(r => usersAPI.getUsersByRole(r)));
            const pool = [];
            const resultsArray = Array.isArray(results) ? results : [];
            console.log('Results array for role fetching:', resultsArray);
            resultsArray.forEach((r) => {
              if (r.status === 'fulfilled') {
                const list = r.value?.data || r.value?.users || r.value || [];
                const listArray = Array.isArray(list) ? list : [];
                console.log('Adding users from role result:', listArray.length);
                pool.push(...listArray);
              }
            });
            // Dedup and exclude already in team - use currentTeam from above, not stale state
            const teamIds = new Set((Array.isArray(currentTeam) ? currentTeam : []).map(u => u._id || u.id));
            const seen = new Set();
            const cand = [];
            const poolArray = Array.isArray(pool) ? pool : [];
            console.log('Pool array for deduplication:', poolArray);

            // Fetch project counts for each user
            for (const u of poolArray) {
              const id = u?._id || u?.id;
              if (!id || seen.has(id) || teamIds.has(id)) continue;

              try {
                // Get projects for this user
                const userProjects = await managerAPI.getUserProjects(id);
                const projectCount = Array.isArray(userProjects?.data) ? userProjects.data.length : 0;

                // Add project count to user object
                const userWithProjects = {
                  ...u,
                  projectCount: projectCount
                };

                cand.push(userWithProjects);
                seen.add(id);
              } catch (projectError) {
                console.warn(`Could not fetch projects for user ${id}:`, projectError);
                // Still add the user but with projectCount = 0
                cand.push({ ...u, projectCount: 0 });
                seen.add(id);
              }
            }

            setCandidates(cand);
          } catch {
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
        const payload = {
          name: values.name,
          description: values.description,
          startDate: values.startDate,
          endDate: values.endDate || undefined,
          status: values.status,
        };
        
        // Admin can assign manager and team, otherwise backend sets from authenticated user
        if (isAdmin) {
          if (!values.projectManager) {
            setError('Please select a project manager');
            setLoading(false);
            return;
          }
          payload.projectManager = values.projectManager;
          // Add team members if selected (optional)
          if (values.teamMembers && values.teamMembers.length > 0) {
            payload.teamMembers = values.teamMembers;
          }
          await projectsAPI.createProject(payload);
        } else {
          await managerAPI.createProject(payload);
        }
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

  // Team management helpers (outside of handleSubmit)
  const allTeamMembers = [...team, ...candidates];
  const filteredCandidates = allTeamMembers.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const q = search.trim().toLowerCase();
    const label = (u.firstName ? `${u.firstName} ${u.lastName||''}` : (u.username || u.email || '')).toLowerCase();
    const matchSearch = !q || label.includes(q);
    return matchRole && matchSearch;
  });

  const handleRemoveFromTeam = async (userId) => {
    try {
      // To properly revert the add operation, assign null role to remove from team
      await managerAPI.assignTeamRole(projectId, userId, { role: null });

      // Update local state - move from team back to candidates
      const user = team.find(u => (u._id || u.id) === userId);
      if (user) {
        setCandidates(prev => [...prev, user]);
        setTeam(prev => prev.filter(u => (u._id || u.id) !== userId));
      }
    } catch (e) {
      alert(e.message || 'Failed to remove from team');
    }
  };

  return (
    <Paper sx={{ p: 4 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <Typography variant="h5" fontWeight="bold">
            {mode === 'create' ? 'Create Project' : 'Edit Project'}
          </Typography>

          {error && (
            <Box className="text-red-600 text-sm">{error}</Box>
          )}

          <FormSection title="Basic Info">
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormInput 
                  label="Project Name" 
                  value={values.name} 
                  onChange={(e)=>handleChange('name', e.target.value)} 
                  required 
                  disabled={mode === 'edit' && !isAdmin}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormSelect 
                  label="Status" 
                  value={values.status} 
                  onChange={(e)=>handleChange('status', e.target.value)} 
                  options={STATUS_OPTIONS}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormInput label="Description" multiline rows={3} value={values.description} onChange={(e)=>handleChange('description', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormInput 
                  label="Start Date" 
                  type="date" 
                  value={values.startDate} 
                  onChange={(e)=>handleChange('startDate', e.target.value)} 
                  required 
                  disabled={mode === 'edit' && !isAdmin}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormInput 
                  label="End Date" 
                  type="date" 
                  value={values.endDate} 
                  onChange={(e)=>handleChange('endDate', e.target.value)} 
                  disabled={mode === 'edit' && !isAdmin}
                />
              </Grid>
            </Grid>
          </FormSection>

          <FormSection title="Project Assignment">
            <Grid container spacing={3}>
              {/* Current Project Manager Info - Always show in edit mode */}
              {mode === 'edit' && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary.main" gutterBottom>
                      Current Project Manager
                    </Typography>
                    <Typography variant="body2">
                      {(() => {
                        // For managers in edit mode, show the current logged-in manager's name
                        if (!isAdmin && mode === 'edit') {
                          return `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || user?.email || 'Current Manager';
                        }

                        // For admins or create mode, show the selected manager
                        const manager = managers.find(m => (m._id || m.id) === values.projectManager) ||
                                      users.find(u => (u._id || u.id) === values.projectManager);
                        return manager ? `${manager.firstName || ''} ${manager.lastName || ''}`.trim() || manager.username || manager.email : 'No manager assigned';
                      })()}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {/* Show manager selection only for admin during creation */}
              {isAdmin && mode === 'create' && (
                <Grid item xs={12} sm={8}>
                  <FormSelect
                    label="Project Manager"
                    value={values.projectManager}
                    onChange={(e)=>handleChange('projectManager', e.target.value)}
                    options={managers.length > 0 ? managers.map(m => ({
                      value: m._id || m.id,
                      label: `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.username || m.email
                    })) : users.filter(u => u.role === 'manager').length > 0 ? users.filter(u => u.role === 'manager').map(m => ({
                      value: m._id || m.id,
                      label: `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.username || m.email
                    })) : [{ value: '', label: 'No managers available' }]}
                    required
                    disabled={managers.length === 0 && users.filter(u => u.role === 'manager').length === 0}
                    helperText={managers.length === 0 && users.filter(u => u.role === 'manager').length === 0
                      ? "No managers found. Please create manager accounts first via Admin > Users."
                      : `Select a manager to lead this project (${managers.length || users.filter(u => u.role === 'manager').length} available)`
                    }
                  />
                </Grid>
              )}

              {/* Team Members - only show in edit mode, not during creation */}
              {mode === 'edit' ? (
                <>
                  {/* Current Team Members Display */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="success.main" gutterBottom>
                        Current Team Members ({team.length})
                      </Typography>
                      {team.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No team members assigned yet
                        </Typography>
                      ) : (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {team.map((member) => (
                            <Chip
                              key={member._id || member.id}
                              label={member.firstName ? `${member.firstName} ${member.lastName || ''}`.trim() : (member.username || member.email || 'Unknown')}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </>
              ) : isAdmin && mode === 'create' ? (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    💡 Team members can be assigned by the project manager after the project is created.
                  </Typography>
                  {managers.length === 0 && users.filter(u => u.role === 'manager').length === 0 && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.50', borderRadius: 1, border: '1px solid', borderColor: 'warning.200' }}>
                      <Typography variant="body2" color="warning.dark" sx={{ mb: 1 }}>
                        ⚠️ No manager accounts found. You need to create manager users first.
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        color="warning"
                        onClick={() => window.open('/admin/users/new', '_blank')}
                      >
                        Create Manager Account
                      </Button>
                    </Box>
                  )}
                </Grid>
              ) : mode === 'create' ? (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Team members can be added after creating the project.
                  </Typography>
                </Grid>
              ) : null}
            </Grid>
          </FormSection>

          {mode === 'edit' && (
            <FormSection title="Team Management" subtitle="Manage project team members">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>Project Team Members</Typography>
                  <Paper variant="outlined" sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                    {filteredCandidates.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No team members found</Typography>
                    ) : (
                      filteredCandidates.map((u) => (
                        <Box key={u._id || u.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #e0e0e0' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {u.firstName ? `${u.firstName} ${u.lastName||''}` : (u.username || u.email || u._id)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {u.role} • {u.projectCount || 0} projects
                            </Typography>
                          </Box>
                          <Button
                            variant={team.some(member => (member._id || member.id) === (u._id || u.id)) ? "outlined" : "contained"}
                            color={team.some(member => (member._id || member.id) === (u._id || u.id)) ? "error" : "primary"}
                            size="small"
                            onClick={() => {
                              const isInTeam = team.some(member => (member._id || member.id) === (u._id || u.id));
                              if (isInTeam) {
                                handleRemoveFromTeam(u._id || u.id);
                              } else {
                                handleAddToTeam(u._id || u.id);
                              }
                            }}
                            sx={{ minHeight: '32px', px: 2 }}
                          >
                            {team.some(member => (member._id || member.id) === (u._id || u.id)) ? 'Remove' : 'Add'}
                          </Button>
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
