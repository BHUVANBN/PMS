import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { 
  Box, Button, Paper, Select, MenuItem, Stack, Typography, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Chip, IconButton, Menu, TextField, Alert, Grid
} from '@mui/material';
import { Refresh, Add, PersonAdd, Close, MoreVert, Delete, Edit, AddCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/shared/DataTable';
import { managerAPI, hrAPI, usersAPI } from '../../services/api';

// Note: Team role assignment on backend is project/module-scoped (teamMember/moduleLead),
// not changing the user's global role (developer/tester). Actions are adjusted accordingly.

const TeamManagement = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Team creation state
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assigning, setAssigning] = useState(false);
  // Filters for available users list
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  // Team member actions
  const [memberMenuAnchor, setMemberMenuAnchor] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Manual user input (workaround)
  const [manualUserEmail, setManualUserEmail] = useState('');

  // Load projects list and set default selection
  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await managerAPI.getAllProjects();
      console.log('Manager projects response:', res);
      const projects = res?.projects || res?.data?.projects || res?.data || res || [];
      console.log('Extracted projects:', projects);

      const data = {
        projects: Array.isArray(projects) ? projects : [],
        members: [],
        statistics: {}
      };

      setOverview(data);

      if (data.projects.length === 0) {
        setError('No projects found. You need to create projects first or be assigned as project manager to existing projects.');
      } else {
        setError(null);
      }

      if (!selectedProjectId && data.projects.length > 0) {
        const first = data.projects[0];
        if (first && (first._id || first.id)) {
          setSelectedProjectId(first._id || first.id);
        }
      }
    } catch (e) {
      console.error('Error fetching projects:', e);
      setError(`Failed to load projects: ${e.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  // Load team for a selected project
  const fetchProjectTeam = useCallback(async (projectId) => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching team for project: ${projectId}`);

      const res = await managerAPI.getProjectTeam(projectId);
      console.log('Project team response:', res);

      const list = res?.data || res?.team || res || [];
      console.log('Extracted team list:', list);

      const normalized = (Array.isArray(list) ? list : []).map((m) => ({
        id: m._id || m.id,
        name: m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim(),
        email: m.email,
        role: m.role || 'Team Member',
        projectRole: m.projectRole || 'Project Team',
        modules: (m.modules || []).length,
        isActive: m.isActive !== false,
      }));

      console.log('Normalized team members:', normalized);
      setMembers(normalized);

      if (normalized.length === 0) {
        setError('No team members found for this project. Click "Add Members" to assign team members.');
      }
    } catch (e) {
      console.error('Error fetching project team:', e);
      setError(e.message || 'Failed to load project team');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoadingUsers(true);
      let users = [];

      // Strategy 1: Use Manager API (manager-accessible, returns active employees)
      try {
        console.log('Trying Manager API (employees)...');
        const mgrRes = await managerAPI.getEmployees();
        console.log('Manager API employees response:', mgrRes);
        users = mgrRes?.data || mgrRes?.employees || mgrRes || [];
        if (!Array.isArray(users) || users.length === 0) throw new Error('No users from Manager API');
      } catch (mgrErr) {
        console.warn('Manager API failed, trying Users API:', mgrErr);
        // Strategy 2: Use Users API (full user directory - may be restricted)
        try {
          console.log('Trying Users API (all users)...');
          const userRes = await usersAPI.getAllUsers();
          console.log('Users API response:', userRes);
          users = userRes?.data || userRes?.users || userRes || [];
          if (!Array.isArray(users) || users.length === 0) throw new Error('No users from Users API');
        } catch (usersErr) {
          console.warn('Users API failed, trying HR employees API:', usersErr);
          // Strategy 3: Try HR API (usually HR/Admin only)
          try {
            const hrRes = await hrAPI.getAllEmployees();
            users = hrRes?.employees || hrRes?.data?.employees || hrRes?.data || hrRes || [];
            if (!Array.isArray(users) || users.length === 0) throw new Error('No employees from HR API');
          } catch (hrErr) {
            console.warn('HR API failed, trying project teams aggregation:', hrErr);
            // Strategy 4: Aggregate users from existing project teams across projects
            try {
              const projectsRes = await managerAPI.getAllProjects();
              const projects = projectsRes?.projects || projectsRes?.data?.projects || projectsRes?.data || [];
              const allTeamMembers = new Map();
              for (const project of (projects || [])) {
                try {
                  const teamRes = await managerAPI.getProjectTeam(project._id || project.id);
                  const teamMembers = teamRes?.team || teamRes?.data?.team || teamRes?.data || [];
                  teamMembers.forEach(member => {
                    const userId = member._id || member.id;
                    if (userId && !allTeamMembers.has(userId)) {
                      allTeamMembers.set(userId, member);
                    }
                  });
                } catch (teamErr) {
                  console.warn(`Failed to get team for project ${project.name}:`, teamErr);
                }
              }
              users = Array.from(allTeamMembers.values());
            } catch (projAggErr) {
              console.warn('Project aggregation also failed:', projAggErr);
            }
          }
        }
      }

      // Deduplicate by id and keep only active
      const dedup = new Map();
      (Array.isArray(users) ? users : []).forEach(u => {
        const id = u?._id || u?.id;
        if (id && !dedup.has(id)) dedup.set(id, u);
      });
      const allActiveUsers = Array.from(dedup.values()).filter(u => u?.isActive !== false);
      console.log('Active users to display:', allActiveUsers.length);

      setAllUsers(allActiveUsers);
    } catch (e) {
      console.error('Failed to fetch users:', e);
    } finally {
      setLoadingUsers(false);
    }
  };


  const handleOpenAddDialog = () => {
    setShowAddMemberDialog(true);
    fetchAllUsers();
  };


  const handleMemberMenuOpen = (event, member) => {
    setMemberMenuAnchor(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMemberMenuClose = () => {
    setMemberMenuAnchor(null);
    setSelectedMember(null);
  };

  const handleRemoveMember = async () => {
    if (!selectedMember || !selectedProjectId) return;
    
    const confirmed = window.confirm(`Are you sure you want to remove ${selectedMember.name} from this project team?`);
    if (!confirmed) return;

    try {
      // Note: Backend might need a remove endpoint. For now, we'll try to assign with empty role or use a different approach
      // This is a placeholder - you may need to implement a proper remove endpoint in the backend
      await managerAPI.assignTeamRole(selectedProjectId, selectedMember.id, { role: null, remove: true });
      
      // Refresh the team list
      await fetchProjectTeam(selectedProjectId);
      handleMemberMenuClose();
    } catch (e) {
      setError(e.message || 'Failed to remove team member');
      handleMemberMenuClose();
    }
  };

  // Inline Add/Remove actions for Available Users and Member cards
  const handleAddToTeam = useCallback(async (userId) => {
    if (!selectedProjectId) return;
    try {
      setAssigning(true);
      const response = await managerAPI.assignTeamRole(selectedProjectId, userId, { role: 'teamMember' });
      if (response && response.success === false) {
        throw new Error(response.error || 'Assignment failed');
      }
      await fetchProjectTeam(selectedProjectId);
      setSuccessMessage('Member added to team successfully');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (e) {
      setError(e.message || 'Failed to add member');
    } finally {
      setAssigning(false);
    }
  }, [selectedProjectId, fetchProjectTeam]);

  const handleRemoveFromTeam = useCallback(async (userId) => {
    if (!selectedProjectId) return;
    try {
      setAssigning(true);
      const response = await managerAPI.assignTeamRole(selectedProjectId, userId, { role: null, remove: true });
      if (response && response.success === false) {
        throw new Error(response.error || 'Remove failed');
      }
      await fetchProjectTeam(selectedProjectId);
      setSuccessMessage('Member removed from team');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (e) {
      setError(e.message || 'Failed to remove member');
    } finally {
      setAssigning(false);
    }
  }, [selectedProjectId, fetchProjectTeam]);

  const findUserByEmail = async (email) => {
    // First try to find user in the current user list
    const foundUser = allUsers.find(user => 
      user.email?.toLowerCase() === email.toLowerCase()
    );
    
    if (foundUser) {
      return foundUser._id || foundUser.id;
    }
    
    // If not found in current list, try to search via HR API
    try {
      const hrRes = await hrAPI.getAllEmployees();
      const employees = hrRes?.employees || hrRes?.data?.employees || hrRes?.data || [];
      const employee = employees.find(emp => 
        emp.email?.toLowerCase() === email.toLowerCase()
      );
      
      if (employee) {
        return employee._id || employee.id;
      }
    } catch (hrError) {
      console.warn('Could not search HR employees:', hrError);
    }
    
    throw new Error(`User with email "${email}" not found. Please check the email address or ask HR to create the user account.`);
  };

  const handleAddUserByEmail = async () => {
    if (!manualUserEmail.trim() || !selectedProjectId) {
      setError('Please enter an email address and select a project');
      return;
    }
    
    try {
      setAssigning(true);
      setError(null);
      console.log('Adding user by email:', manualUserEmail.trim());
      
      // Find user ID by email first
      const userId = await findUserByEmail(manualUserEmail.trim());
      console.log('Found user ID:', userId);
      
      // Now assign using the user ID
      const response = await managerAPI.assignTeamRole(selectedProjectId, userId, { 
        role: 'teamMember'
      });
      console.log('Email assignment response:', response);
      
      // Clear input and refresh
      setManualUserEmail('');
      await fetchProjectTeam(selectedProjectId);
      setShowAddMemberDialog(false);
      setError(null); // Clear any previous errors
      
      // Show success message
      setSuccessMessage(`Successfully added user ${manualUserEmail.trim()} to the project!`);
      setTimeout(() => setSuccessMessage(null), 5000);
      
      console.log('User added successfully by email');
      
    } catch (e) {
      console.error('Error adding user by email:', e);
      setError(e.message || 'Failed to add user by email. Please check the email address.');
    } finally {
      setAssigning(false);
    }
  };

  useEffect(() => { fetchOverview(); }, [fetchOverview]);
  useEffect(() => { if (selectedProjectId) fetchProjectTeam(selectedProjectId); }, [selectedProjectId, fetchProjectTeam]);
  // Ensure available users are loaded for inline Add list when a project is selected
  useEffect(() => {
    if (selectedProjectId && allUsers.length === 0) {
      fetchAllUsers();
    }
  }, [selectedProjectId, allUsers.length]);

  const columns = useMemo(() => [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    {
      key: 'role',
      label: 'Project Role',
      type: 'chip',
      render: (row) => (
        <Stack direction="column" spacing={0.5}>
          <Chip
            label={row.role}
            size="small"
            color={row.role === 'Module Lead' ? 'primary' : 'default'}
          />
          {row.projectRole && row.projectRole !== row.role && (
            <Typography variant="caption" color="text.secondary">
              {row.projectRole}
            </Typography>
          )}
        </Stack>
      ),
    },
    { key: 'isActive', label: 'Status', type: 'status', valueMap: { true: 'Active', false: 'Inactive' } },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleRemoveFromTeam(row.id)}
            disabled={!selectedProjectId || assigning}
          >
            Remove
          </Button>
          <IconButton
            size="small"
            onClick={(e) => handleMemberMenuOpen(e, row)}
            disabled={!selectedProjectId}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ], [selectedProjectId, assigning, handleRemoveFromTeam]);

  // Build project options from overview
  const projectOptions = (overview?.projects || []).map((p) => ({
    id: p._id || p.id,
    name: p.name,
  }));

  // Helper: get number of projects (managed by current manager) this user is in
  const getUserProjectCount = useCallback((userId) => {
    const projects = Array.isArray(overview?.projects) ? overview.projects : [];
    let count = 0;
    projects.forEach((proj) => {
      const members = Array.isArray(proj.teamMembers) ? proj.teamMembers : [];
      // teamMembers may be populated docs or ids
      if (members.some((m) => {
        const id = m?._id || m?.id || m; // handle ObjectId/string
        return id?.toString?.() === userId?.toString?.();
      })) {
        count += 1;
      }
    });
    return count;
  }, [overview?.projects]);

  return (
    <Box>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Paper sx={{ 
          p: 3, 
          mb: 2, 
          border: '1px solid', 
          borderColor: error.includes('No team members found') ? 'info.light' : 'error.light',
          backgroundColor: error.includes('No team members found') ? 'info.50' : 'error.50'
        }}>
          <Stack spacing={2}>
            <Typography color={error.includes('No team members found') ? 'info.main' : 'error'}>
              {error}
            </Typography>
            
            {error.includes('No projects found') && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  To manage teams, you need to have projects first. Create a new project or ask an admin to assign you as project manager to existing projects.
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddCircle />}
                  onClick={() => navigate('/manager/projects/new')}
                  size="small"
                >
                  Create New Project
                </Button>
              </Box>
            )}
            
            {error.includes('No team members found') && selectedProjectId && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  This project doesn't have any team members assigned yet. Add team members to start collaborating on this project.
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<PersonAdd />}
                  onClick={handleOpenAddDialog}
                  size="small"
                >
                  Add Team Members
                </Button>
              </Box>
            )}
          </Stack>
        </Paper>
      )}

      {/* Project Switcher */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel id="project-select-label">Select Project</InputLabel>
            <Select
              labelId="project-select-label"
              label="Select Project"
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              displayEmpty
            >
              {projectOptions.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {projectOptions
              .filter(p => p.id !== selectedProjectId)
              .slice(0, 6)
              .map((p) => (
                <Chip
                  key={p.id}
                  label={p.name}
                  size="small"
                  variant="outlined"
                  onClick={() => setSelectedProjectId(p.id)}
                />
              ))}
          </Stack>

          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchOverview}
            >
              Refresh Projects
            </Button>
            {selectedProjectId && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => fetchProjectTeam(selectedProjectId)}
              >
                Refresh Team
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      <DataTable
        columns={columns}
        data={members}
        loading={loading}
        enableSearch
        searchableKeys={["name","email","role"]}
        initialPageSize={10}
        emptyMessage={
          selectedProjectId 
            ? 'No team members assigned to this project yet. Click "Add Members" to get started.' 
            : 'Select a project to view and manage team members'
        }
      />
      
      {/* Project Info Card */}
      {selectedProjectId && !loading && (
        <Paper sx={{ p: 3, mt: 2, backgroundColor: 'background.default' }}>
          <Stack spacing={3}>
            {/* Project Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {projectOptions.find(p => p.id === selectedProjectId)?.name || 'Unknown Project'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Team Members: {members.length} | Active: {members.filter(m => m.isActive).length}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={() => fetchProjectTeam(selectedProjectId)}
                >
                  Refresh Team
                </Button>
                <Button 
                  size="small" 
                  variant="contained" 
                  startIcon={<PersonAdd />}
                  onClick={handleOpenAddDialog}
                >
                  Add Members
                </Button>
              </Stack>
            </Stack>

            {/* Team Members Details */}
            {members.length > 0 && (
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                  Team Members Details
                </Typography>
                <Grid container spacing={2}>
                  {members.map((member) => (
                    <Grid item xs={12} sm={6} md={4} key={member.id}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          border: '1px solid', 
                          borderColor: 'divider',
                          backgroundColor: member.isActive ? 'background.paper' : 'action.hover',
                          '&:hover': { 
                            borderColor: 'primary.main',
                            boxShadow: 1
                          }
                        }}
                      >
                        <Stack spacing={1.5}>
                          {/* Member Header */}
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {member.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {member.email}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1}>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => handleRemoveFromTeam(member.id)}
                                disabled={assigning}
                              >
                                Remove
                              </Button>
                              <IconButton 
                                size="small" 
                                onClick={(e) => handleMemberMenuOpen(e, member)}
                              >
                                <MoreVert fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Stack>

                          {/* Role Information */}
                          <Stack spacing={0.5}>
                            <Chip 
                              label={member.role} 
                              size="small" 
                              color={member.role === 'Module Lead' ? 'primary' : 'default'}
                              sx={{ alignSelf: 'flex-start' }}
                            />
                            {member.projectRole && member.projectRole !== member.role && (
                              <Typography variant="caption" color="text.secondary">
                                {member.projectRole}
                              </Typography>
                            )}
                          </Stack>

                          {/* Status and Additional Info */}
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Chip 
                              label={member.isActive ? 'Active' : 'Inactive'} 
                              size="small" 
                              color={member.isActive ? 'success' : 'default'}
                              variant="outlined"
                            />
                            <Typography variant="caption" color="text.secondary">
                              ID: {member.id.slice(-6)}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Empty State */}
            {members.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  No team members assigned to this project yet
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<PersonAdd />}
                  onClick={handleOpenAddDialog}
                >
                  Add First Team Member
                </Button>
              </Box>
            )}

            {/* Available Users with Add/Remove buttons (like Project Edit) */}
            <Box>
              {(() => {
                // Pre-compute filtered pool for header count
                const poolForCount = (allUsers || []).filter(u => {
                  if (roleFilter !== 'all' && u.role !== roleFilter) return false;
                  const q = search.trim().toLowerCase();
                  if (!q) return true;
                  const name = (u.firstName ? `${u.firstName} ${u.lastName || ''}` : (u.username || u.email || '')).toLowerCase();
                  return name.includes(q);
                });
                return (
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    Available Users ({poolForCount.length})
                  </Typography>
                );
              })()}
              {/* Filters */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ maxWidth: 360 }}
                />
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel id="role-filter-label">Filter by Role</InputLabel>
                  <Select
                    labelId="role-filter-label"
                    label="Filter by Role"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="developer">Developer</MenuItem>
                    <MenuItem value="tester">Tester</MenuItem>
                    <MenuItem value="marketing">Marketing</MenuItem>
                    <MenuItem value="sales">Sales</MenuItem>
                    <MenuItem value="intern">Intern</MenuItem>
                    <MenuItem value="employee">Employee</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              {(() => {
                const teamIds = new Set(members.map(m => m.id));
                const pool = (allUsers || []).filter(u => {
                  const id = u._id || u.id;
                  if (!id) return false;
                  if (roleFilter !== 'all' && u.role !== roleFilter) return false;
                  const q = search.trim().toLowerCase();
                  if (!q) return true;
                  const name = (u.firstName ? `${u.firstName} ${u.lastName || ''}` : (u.username || u.email || '')).toLowerCase();
                  return name.includes(q);
                });

                return (
                  <Paper variant="outlined" sx={{ p: 2, maxHeight: 360, overflow: 'auto' }}>
                    {pool.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No users found</Typography>
                    ) : (
                      pool.map(u => {
                        const id = u._id || u.id;
                        const label = u.firstName ? `${u.firstName} ${u.lastName || ''}` : (u.username || u.email || id);
                        const isInTeam = teamIds.has(id);
                        const roleLabel = (u.role || 'Team Member');
                        return (
                          <Box key={id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.25, borderBottom: '1px solid #eee' }}>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">{label}</Typography>
                              <Typography variant="caption" color="text.secondary">{roleLabel} • {getUserProjectCount(id)} projects</Typography>
                            </Box>
                            {isInTeam ? (
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => handleRemoveFromTeam(id)}
                                disabled={assigning}
                              >
                                Remove
                              </Button>
                            ) : (
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleAddToTeam(id)}
                                disabled={assigning}
                              >
                                Add
                              </Button>
                            )}
                          </Box>
                        );
                      })
                    )}
                  </Paper>
                );
              })()}
            </Box>
          </Stack>
        </Paper>
      )}

      {/* Add Members Dialog */}
      <Dialog 
        open={showAddMemberDialog} 
        onClose={() => setShowAddMemberDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Add Team Members</Typography>
            <IconButton onClick={() => setShowAddMemberDialog(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add team members to the project. Users can be assigned to multiple projects.
          </Typography>
          
          {/* Manual user input section */}
          <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Add User by Email</Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                placeholder="Enter user email address"
                value={manualUserEmail}
                onChange={(e) => setManualUserEmail(e.target.value)}
                sx={{ flexGrow: 1 }}
                onKeyPress={(e) => e.key === 'Enter' && handleAddUserByEmail()}
              />
              <Button 
                variant="contained" 
                onClick={handleAddUserByEmail}
                disabled={!manualUserEmail.trim() || assigning}
                size="small"
              >
                {assigning ? 'Adding...' : 'Add'}
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Enter the email address of the employee you want to add to the team
            </Typography>
          </Box>

          {/* User list section */}
          {allUsers.length > 0 ? (
            <>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Or select from available users ({allUsers.length} found)
              </Typography>
            </>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>No user list available.</strong> Use the email input above to add team members.
                <br />
                <small>Note: Only users with existing accounts can be added to teams.</small>
              </Typography>
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {assigning && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Adding team members to project... Please wait.
            </Alert>
          )}
          
          {loadingUsers ? (
            <Typography>Loading users...</Typography>
          ) : (
            <Stack spacing={1} sx={{ maxHeight: 400, overflow: 'auto' }}>
              {allUsers.map((user) => {
                const userId = user._id || user.id;
                const isCurrentMember = members.some(m => m.id === userId);
                const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || (user.username || user.email || userId);
                const roleLabel = user.role || 'Team Member';
                return (
                  <Box key={userId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.25, px: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: isCurrentMember ? 'action.hover' : 'background.paper' }}>
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle1">{displayName}</Typography>
                        {isCurrentMember && (
                          <Chip label="Already in team" size="small" color="info" variant="outlined" />
                        )}
                      </Stack>
                      <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                      <Typography variant="caption" color="text.secondary">{roleLabel}</Typography>
                    </Box>
                    {isCurrentMember ? (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleRemoveFromTeam(userId)}
                        disabled={assigning}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleAddToTeam(userId)}
                        disabled={assigning}
                      >
                        Add
                      </Button>
                    )}
                  </Box>
                );
              })}
              {allUsers.length === 0 && (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No available users to add
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddMemberDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Member Actions Menu */}
      <Menu anchorEl={memberMenuAnchor} open={Boolean(memberMenuAnchor)} onClose={handleMemberMenuClose}>
        <MenuItem onClick={handleRemoveMember} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Remove from Team
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TeamManagement;
