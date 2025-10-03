import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { 
  Box, Button, Paper, Select, MenuItem, Stack, Typography, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Chip, IconButton, Menu, TextField, Alert, Grid
} from '@mui/material';
import { Refresh, Add, PersonAdd, Close, MoreVert, Delete, Edit, AddCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/shared/DataTable';
import { managerAPI, hrAPI } from '../../services/api';

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
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assigning, setAssigning] = useState(false);
  
  // Team member actions
  const [memberMenuAnchor, setMemberMenuAnchor] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Manual user input (workaround)
  const [manualUserEmail, setManualUserEmail] = useState('');

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch manager's projects directly
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
      
      // Show helpful message if no projects found
      if (data.projects.length === 0) {
        setError('No projects found. You need to create projects first or be assigned as project manager to existing projects.');
      } else {
        // Clear any previous errors when projects are found
        setError(null);
      }
      
      // Default select first project if not chosen
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

  const fetchProjectTeam = useCallback(async (projectId) => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching team for project: ${projectId}`);
      
      const res = await managerAPI.getProjectTeam(projectId);
      console.log('Project team response:', res);
      
      // Backend returns team members in res.data (Array.from(teamMembers.values()))
      const list = res?.data || res?.team || res || [];
      console.log('Extracted team list:', list);
      
      const normalized = (Array.isArray(list) ? list : []).map((m) => ({
        id: m._id || m.id,
        name: m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim(),
        email: m.email,
        role: m.role || 'Team Member', // Use the role from backend (Team Member, Module Lead, etc.)
        projectRole: m.projectRole || 'Project Team', // Additional role info
        modules: (m.modules || []).length,
        isActive: m.isActive !== false,
      }));
      
      console.log('Normalized team members:', normalized);
      setMembers(normalized);
      
      // Show helpful message if no team members found
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
      
      // Strategy 1: Try HR API first (most likely to have all employees)
      try {
        console.log('Trying HR employees API...');
        const hrRes = await hrAPI.getAllEmployees();
        console.log('HR employees response:', hrRes);
        users = hrRes?.employees || hrRes?.data?.employees || hrRes?.data || hrRes || [];
        
        if (users.length > 0) {
          console.log('Successfully fetched users from HR API:', users);
        } else {
          throw new Error('No employees found in HR API');
        }
        
      } catch (hrError) {
        console.warn('HR API failed, trying project teams approach:', hrError);
        
        // Strategy 2: Aggregate users from existing project teams
        try {
          console.log('Fetching users from all project teams...');
          const projectsRes = await managerAPI.getAllProjects();
          const projects = projectsRes?.projects || projectsRes?.data?.projects || projectsRes?.data || [];
          
          // Get team members from all projects to build user pool
          const allTeamMembers = new Map(); // Use Map to avoid duplicates
          
          for (const project of projects) {
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
          console.log('Found users from project teams:', users);
          
          if (users.length === 0) {
            throw new Error('No users found in existing project teams');
          }
          
        } catch (projectError) {
          console.warn('Project-based user fetching also failed:', projectError);
          // Don't throw error here, just log it - we'll show manual input option
          console.log('Will rely on manual email input for adding team members');
        }
      }
      
      console.log('Final extracted users:', users);
      
      // Show all active users
      const allActiveUsers = users.filter(user => user.isActive !== false);
      console.log('Active users to display:', allActiveUsers);
      
      setAllUsers(allActiveUsers);
      
    } catch (e) {
      console.error('Failed to fetch users:', e);
      // Don't set error here - we have manual input as fallback
      console.log('Using manual email input as primary method');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddMembers = async () => {
    if (!selectedProjectId || selectedUsers.length === 0) {
      setError('Please select a project and at least one user to add');
      return;
    }
    
    try {
      setAssigning(true);
      setError(null);
      console.log('Adding members to project:', selectedProjectId);
      console.log('Selected users:', selectedUsers);
      
      // Assign each selected user to the project team
      for (const userId of selectedUsers) {
        console.log(`Assigning user ${userId} to project ${selectedProjectId}`);
        const response = await managerAPI.assignTeamRole(selectedProjectId, userId, { role: 'teamMember' });
        console.log('Assignment response:', response);
      }
      
      console.log('All members assigned successfully');
      
      // Refresh the team list
      await fetchProjectTeam(selectedProjectId);
      
      // Close dialog and reset
      setShowAddMemberDialog(false);
      setSelectedUsers([]);
      
      // Show success message
      setError(null);
      setSuccessMessage(`Successfully added ${selectedUsers.length} team member${selectedUsers.length !== 1 ? 's' : ''} to the project!`);
      setTimeout(() => setSuccessMessage(null), 5000);
      
    } catch (e) {
      console.error('Error assigning team members:', e);
      setError(`Failed to assign team members: ${e.message || 'Unknown error'}`);
    } finally {
      setAssigning(false);
    }
  };

  const handleOpenAddDialog = () => {
    setShowAddMemberDialog(true);
    fetchAllUsers();
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
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

  // Assignment actions are project/module-scoped in backend and require module context.
  // This page currently focuses on viewing team per project; actions are deferred to a dedicated UI.

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
      )
    },
    { key: 'isActive', label: 'Status', type: 'status', valueMap: { true: 'Active', false: 'Inactive' } },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <IconButton 
          size="small" 
          onClick={(e) => handleMemberMenuOpen(e, row)}
          disabled={!selectedProjectId}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      ),
    },
  ], [selectedProjectId]);

  const projectOptions = (overview?.projects || []).map((p) => ({
    id: p._id || p.id,
    name: p.name,
  }));

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <div>
          <Typography variant="h4" fontWeight="bold">Team Management</Typography>
          <Typography variant="body2" color="text.secondary">Assign roles and manage team members per project</Typography>
        </div>
        <Stack direction="row" spacing={1}>
          <Select
            size="small"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            displayEmpty
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="" disabled>Select Project</MenuItem>
            {projectOptions.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
            ))}
          </Select>
          <Button 
            variant="contained" 
            startIcon={<PersonAdd />} 
            onClick={handleOpenAddDialog}
            disabled={!selectedProjectId}
          >
            Add Members
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />} 
            onClick={() => fetchProjectTeam(selectedProjectId)} 
            disabled={!selectedProjectId}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

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
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleMemberMenuOpen(e, member)}
                            >
                              <MoreVert fontSize="small" />
                            </IconButton>
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
                const isSelected = selectedUsers.includes(userId);
                const isCurrentMember = members.some(m => m.id === userId);
                
                return (
                  <Paper 
                    key={userId}
                    sx={{ 
                      p: 2, 
                      cursor: 'pointer',
                      border: isSelected ? '2px solid' : '1px solid',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      backgroundColor: isCurrentMember ? 'action.hover' : 'background.paper',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                    onClick={() => handleUserToggle(userId)}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="subtitle1">
                            {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()}
                          </Typography>
                          {isCurrentMember && (
                            <Chip label="Already in team" size="small" color="info" variant="outlined" />
                          )}
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                      <Chip 
                        label={user.role} 
                        size="small" 
                        color={isSelected ? 'primary' : 'default'}
                      />
                    </Stack>
                  </Paper>
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
            Cancel
          </Button>
          {selectedUsers.length > 0 && (
            <Button 
              variant="contained" 
              onClick={handleAddMembers}
              disabled={assigning}
            >
              {assigning ? 'Adding...' : `Add ${selectedUsers.length} Selected Member${selectedUsers.length !== 1 ? 's' : ''}`}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Member Actions Menu */}
      <Menu
        anchorEl={memberMenuAnchor}
        open={Boolean(memberMenuAnchor)}
        onClose={handleMemberMenuClose}
      >
        <MenuItem onClick={handleRemoveMember} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Remove from Team
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TeamManagement;
