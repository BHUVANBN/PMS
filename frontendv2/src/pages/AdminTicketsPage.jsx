import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { projectsAPI, ticketsAPI } from '../services/api';

const AdminTicketsPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    priority: '',
    status: '',
    adminSuggestion: ''
  });

  // Fetch all projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch tickets when project or module changes
  useEffect(() => {
    if (selectedProject) {
      fetchTickets();
    } else {
      setTickets([]);
      setFilteredTickets([]);
    }
  }, [selectedProject, selectedModule, fetchTickets]);

  // Filter tickets based on search and status
  useEffect(() => {
    filterTickets();
  }, [tickets, searchTerm, statusFilter, filterTickets]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectsAPI.getAllProjects();
      const projectList = res?.data?.projects || res?.projects || res?.data || [];
      setProjects(Array.isArray(projectList) ? projectList : []);
    } catch (err) {
      setError('Failed to load projects: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!selectedProject) {
        setTickets([]);
        return;
      }

      const project = projects.find(p => (p._id || p.id) === selectedProject);
      
      let allTickets = [];
      if (project && project.modules) {
        project.modules.forEach(module => {
          if (selectedModule && module._id !== selectedModule) return;
          
          if (module.tickets && Array.isArray(module.tickets)) {
            const moduleTickets = module.tickets.map(ticket => ({
              ...ticket,
              id: ticket._id || ticket.id,
              projectId: project._id || project.id,
              projectName: project.name,
              moduleId: module._id || module.id,
              moduleName: module.name
            }));
            allTickets = [...allTickets, ...moduleTickets];
          }
        });
      }
      
      setTickets(allTickets);
    } catch (err) {
      setError('Failed to load tickets: ' + (err.message || 'Unknown error'));
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [selectedProject, selectedModule, projects]);

  const filterTickets = useCallback(() => {
    let filtered = [...tickets];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(ticket =>
        ticket.title?.toLowerCase().includes(search) ||
        ticket.description?.toLowerCase().includes(search) ||
        ticket.ticketId?.toLowerCase().includes(search)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, statusFilter]);

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
    setSelectedModule('');
    setTickets([]);
  };

  const handleModuleChange = (e) => {
    setSelectedModule(e.target.value);
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setViewDialogOpen(true);
  };

  const handleEditTicket = (ticket) => {
    setSelectedTicket(ticket);
    setEditFormData({
      title: ticket.title || '',
      description: ticket.description || '',
      priority: ticket.priority || 'medium',
      status: ticket.status || 'todo',
      adminSuggestion: ticket.adminSuggestion || ''
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      await ticketsAPI.updateTicket(
        selectedTicket.projectId,
        selectedTicket.id,
        editFormData
      );
      setEditDialogOpen(false);
      fetchTickets();
      alert('Ticket updated successfully! Developer will be notified.');
    } catch (err) {
      alert('Failed to update ticket: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'todo': 'default',
      'in_progress': 'primary',
      'testing': 'warning',
      'done': 'success',
      'blocked': 'error'
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'success',
      'medium': 'warning',
      'high': 'error',
      'critical': 'error'
    };
    return colors[priority] || 'default';
  };

  const selectedProjectData = projects.find(p => (p._id || p.id) === selectedProject);
  const modules = selectedProjectData?.modules || [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <div>
          <Typography variant="h4" fontWeight="bold">Tickets Management</Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage tickets across projects
          </Typography>
        </div>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchTickets}
          disabled={!selectedProject}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="medium">
              <InputLabel>Select Project</InputLabel>
              <Select
                value={selectedProject}
                label="Select Project"
                onChange={handleProjectChange}
              >
                <MenuItem value="">
                  <em>Select a project</em>
                </MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project._id || project.id} value={project._id || project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="medium" disabled={!selectedProject}>
              <InputLabel>Select Module (Optional)</InputLabel>
              <Select
                value={selectedModule}
                label="Select Module (Optional)"
                onChange={handleModuleChange}
              >
                <MenuItem value="">
                  <em>All Modules</em>
                </MenuItem>
                {modules.map((module) => (
                  <MenuItem key={module._id || module.id} value={module._id || module.id}>
                    {module.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="medium">
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="testing">Testing</MenuItem>
                <MenuItem value="done">Done</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="Search tickets by title, description, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Stats */}
      {selectedProject && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {filteredTickets.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Tickets
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {filteredTickets.filter(t => t.status === 'in_progress').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  In Progress
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {filteredTickets.filter(t => t.status === 'testing').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Testing
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {filteredTickets.filter(t => t.status === 'done').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tickets Table */}
      {selectedProject ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ticket ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Module</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Loading tickets...
                  </TableCell>
                </TableRow>
              ) : filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No tickets found. {searchTerm || statusFilter ? 'Try adjusting your filters.' : 'Select a project to view tickets.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id} hover>
                    <TableCell>{ticket.ticketId || ticket.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {ticket.title}
                      </Typography>
                    </TableCell>
                    <TableCell>{ticket.projectName}</TableCell>
                    <TableCell>{ticket.moduleName}</TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.status?.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(ticket.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.priority?.toUpperCase()}
                        color={getPriorityColor(ticket.priority)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {ticket.assignedDeveloper ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                            {ticket.assignedDeveloper.firstName?.[0] || 'U'}
                          </Avatar>
                          <Typography variant="body2">
                            {ticket.assignedDeveloper.firstName} {ticket.assignedDeveloper.lastName}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewTicket(ticket)}
                        title="View Details"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEditTicket(ticket)}
                        title="Suggest Changes"
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Project Selected
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please select a project from the dropdown above to view its tickets
          </Typography>
        </Paper>
      )}

      {/* View Ticket Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedTicket && (
          <>
            <DialogTitle>
              Ticket Details - {selectedTicket.ticketId || selectedTicket.id}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                  <Typography variant="body1" fontWeight="medium">{selectedTicket.title}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body2">{selectedTicket.description || 'No description'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Project</Typography>
                  <Typography variant="body2">{selectedTicket.projectName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Module</Typography>
                  <Typography variant="body2">{selectedTicket.moduleName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip label={selectedTicket.status} color={getStatusColor(selectedTicket.status)} size="small" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                  <Chip label={selectedTicket.priority} color={getPriorityColor(selectedTicket.priority)} size="small" />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Assigned Developer</Typography>
                  <Typography variant="body2">
                    {selectedTicket.assignedDeveloper 
                      ? `${selectedTicket.assignedDeveloper.firstName} ${selectedTicket.assignedDeveloper.lastName}`
                      : 'Unassigned'}
                  </Typography>
                </Grid>
                {selectedTicket.adminSuggestion && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Admin Suggestion</Typography>
                    <Typography variant="body2" color="primary.main">{selectedTicket.adminSuggestion}</Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
              <Button variant="contained" onClick={() => {
                setViewDialogOpen(false);
                handleEditTicket(selectedTicket);
              }}>
                Suggest Changes
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit/Suggest Changes Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Suggest Changes - {selectedTicket?.ticketId || selectedTicket?.id}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={editFormData.priority}
                  label="Priority"
                  onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editFormData.status}
                  label="Status"
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <MenuItem value="todo">To Do</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="testing">Testing</MenuItem>
                  <MenuItem value="done">Done</MenuItem>
                  <MenuItem value="blocked">Blocked</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Admin Suggestion (This will notify the developer)"
                value={editFormData.adminSuggestion}
                onChange={(e) => setEditFormData({ ...editFormData, adminSuggestion: e.target.value })}
                placeholder="Add your suggestions or feedback for the developer..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={loading}>
            Save Changes & Notify
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTicketsPage;
