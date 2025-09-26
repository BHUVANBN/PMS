import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  LinearProgress,
  Grid,
  Avatar,
  AvatarGroup,
  Chip,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { MoreVert, FolderOpen, Group, Schedule } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { projectsAPI, managerAPI } from '../../services/api';

const ProjectOverview = ({ projects = [], onRefresh }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedProject, setSelectedProject] = React.useState(null);
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = React.useState(false);
  const [editValues, setEditValues] = React.useState({ id: '', name: '', description: '', status: 'planning', endDate: '' });
  const [editLoading, setEditLoading] = React.useState(false);
  const [editError, setEditError] = React.useState('');

  const goToEdit = (pid) => {
    if (!pid) return;
    try {
      navigate(`/manager/projects/${pid}/edit`);
      // In case Router navigation is blocked by guard or context hiccup, hard navigate as fallback
      setTimeout(() => {
        if (window?.location?.pathname?.includes(`/manager/projects/${pid}/edit`) === false) {
          window.location.href = `/manager/projects/${pid}/edit`;
        }
      }, 0);
    } catch (_) {
      window.location.href = `/manager/projects/${pid}/edit`;
    }
  };

  const deleteFromDialog = async () => {
    try {
      setEditLoading(true);
      const pid = editValues.id;
      if (!pid) return;
      const ok = window.confirm('Are you sure you want to delete this project? This action cannot be undone.');
      if (!ok) return;
      await (managerAPI.deleteProjectHard ? managerAPI.deleteProjectHard(pid) : projectsAPI.deleteProject(pid));
      setEditOpen(false);
      if (typeof onRefresh === 'function') onRefresh();
    } catch (e) {
      setEditError(e.message || 'Failed to delete project');
    } finally {
      setEditLoading(false);
    }
  };

  const handleMenuClick = (event, project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const openEdit = (project) => {
    if (!project) return;
    setEditError('');
    setEditValues({
      id: project.rawId || project.id,
      name: project.name || '',
      description: project.description || '',
      status: project.status || 'planning',
      endDate: project.dueDate ? String(project.dueDate).substring(0,10) : ''
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
  };

  const handleEditChange = (field, value) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  const saveEdit = async () => {
    try {
      setEditLoading(true);
      setEditError('');
      const pid = editValues.id;
      if (!pid) throw new Error('Missing project id');
      const payload = {
        name: editValues.name,
        description: editValues.description,
        status: editValues.status,
        endDate: editValues.endDate || undefined,
      };
      await projectsAPI.updateProject(pid, payload);
      setEditOpen(false);
      if (typeof onRefresh === 'function') onRefresh();
    } catch (e) {
      setEditError(e.message || 'Failed to save changes');
    } finally {
      setEditLoading(false);
    }
  };

  // Normalize backend projects into a consistent display shape with computed metrics
  const displayProjects = (projects || []).map((p, idx) => {
    const raw = p._id ?? p.id ?? null;
    const rawId = raw ? String(raw) : null;
    const id = rawId || String(idx);
    const name = p.name || 'Untitled Project';
    const description = p.description || '';
    const status = p.status || 'planning';
    const dueDate = p.endDate || p.dueDate || null;
    const teamMembers = Array.isArray(p.teamMembers)
      ? p.teamMembers.map((m, i) => {
          const first = m.firstName || '';
          const last = m.lastName || '';
          const username = m.username || `${first} ${last}`.trim() || `Member ${i+1}`;
          return {
            id: m._id || m.id || i,
            name: username,
            avatar: m.avatar || undefined,
          };
        })
      : [];

    // Compute ticket metrics from embedded modules
    let totalTickets = 0;
    let completedTickets = 0;
    const modules = Array.isArray(p.modules) ? p.modules : [];
    modules.forEach(mod => {
      (mod.tickets || []).forEach(t => {
        totalTickets += 1;
        if (t.status === 'done' || t.status === 'completed') completedTickets += 1;
      });
    });
    // If no tickets but modules have completionPercentage, average it
    let progress = 0;
    if (totalTickets > 0) {
      progress = Math.round((completedTickets / totalTickets) * 100);
    } else if (modules.length > 0) {
      const sum = modules.reduce((acc, mod) => acc + (mod.completionPercentage || 0), 0);
      progress = Math.round(sum / modules.length);
    }

    return {
      id,
      rawId,
      name,
      description,
      status,
      dueDate,
      teamMembers,
      totalTasks: totalTickets,
      completedTasks: completedTickets,
      priority: 'medium', // No project-level priority in schema; defaulting
      progress,
    };
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'on_hold':
        return 'warning';
      case 'completed':
        return 'primary';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Project Overview"
        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
        action={
          <Chip
            label={`${displayProjects.filter(p => p.status === 'active').length} active`}
            size="small"
            color="success"
            variant="outlined"
          />
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <Grid container spacing={2} alignItems="stretch">
          {displayProjects.map((project) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={project.id} sx={{ display: 'flex' }}>
              <Card variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                      <FolderOpen fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="h6" 
                        fontWeight="bold"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => {
                          const pid = project.rawId || project.id;
                          openEdit(project);
                        }}
                      >
                        {project.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {project.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => openEdit(project)}
                    >
                      Edit
                    </Button>
                    <IconButton 
                      size="small"
                      onClick={(e) => handleMenuClick(e, project)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {project.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={project.progress}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'grey.200'
                    }}
                  />
                </Box>

                <Grid container spacing={2} alignItems="center" sx={{ mt: 'auto' }}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Group fontSize="small" color="action" />
                      <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
                        {project.teamMembers.map((member) => (
                          <Avatar 
                            key={member.id} 
                            alt={member.name}
                            src={member.avatar}
                            sx={{ bgcolor: 'primary.main' }}
                          >
                            {member.name.charAt(0)}
                          </Avatar>
                        ))}
                      </AvatarGroup>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {project.completedTasks}/{project.totalTasks} tasks completed
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                      <Box display="flex" gap={0.5}>
                        <Chip
                          label={project.priority}
                          size="small"
                          color={getPriorityColor(project.priority)}
                          variant="outlined"
                        />
                        <Chip
                          label={project.status}
                          size="small"
                          color={getStatusColor(project.status)}
                          variant="filled"
                        />
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Schedule fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {project.dueDate ? `${getDaysRemaining(project.dueDate)} days left` : 'No due date'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))}
        </Grid>

      {/* Quick Edit Dialog */}
      <Dialog open={editOpen} onClose={closeEdit} fullWidth maxWidth="sm">
        <DialogTitle>Quick Edit Project</DialogTitle>
        <DialogContent dividers>
          {editError && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>{editError}</Typography>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Project Name"
              value={editValues.name}
              onChange={(e)=>handleEditChange('name', e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={editValues.description}
              onChange={(e)=>handleEditChange('description', e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                label="Status"
                value={editValues.status}
                onChange={(e)=>handleEditChange('status', e.target.value)}
              >
                <MenuItem value="planning">Planning</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="on_hold">On Hold</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="End Date"
              type="date"
              value={editValues.endDate}
              onChange={(e)=>handleEditChange('endDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button onClick={deleteFromDialog} color="error" disabled={editLoading}>Delete</Button>
          <Box>
            <Button onClick={closeEdit} sx={{ mr: 1 }} disabled={editLoading}>Cancel</Button>
            <Button onClick={saveEdit} variant="contained" disabled={editLoading}>Save</Button>
          </Box>
        </DialogActions>
      </Dialog>
    </CardContent>
  </Card>
);
};

export default ProjectOverview;
