import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add,
  ExpandMore,
  Assignment,
  CheckCircle,
  Schedule,
  BugReport
} from '@mui/icons-material';
import { FormInput, FormSelect } from '../../components/shared/FormComponents';
import { managerAPI } from '../../services/api';
import TicketForm from './TicketForm';

const MODULE_STATUS = [
  { label: 'Planning', value: 'planning' },
  { label: 'Active', value: 'active' },
  { label: 'Testing', value: 'testing' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on_hold' }
];

const ModuleManagement = ({ projectId }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [newModule, setNewModule] = useState({
    name: '',
    description: '',
    status: 'planning',
    startDate: '',
    endDate: ''
  });

  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await managerAPI.getProjectDetails(projectId);
      const project = response?.data || response;
      setModules(project?.modules || []);
    } catch (error) {
      console.error('Error fetching project details:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId, fetchProjectDetails]);

  const handleCreateModule = async () => {
    try {
      await managerAPI.addModule(projectId, newModule);
      setModuleDialogOpen(false);
      setNewModule({
        name: '',
        description: '',
        status: 'planning',
        startDate: '',
        endDate: ''
      });
      fetchProjectDetails();
    } catch (error) {
      console.error('Error creating module:', error);
      alert('Failed to create module: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleCreateTicket = (module) => {
    setSelectedModule(module);
    setTicketDialogOpen(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'default',
      active: 'primary',
      testing: 'warning',
      completed: 'success',
      on_hold: 'error'
    };
    return colors[status] || 'default';
  };

  const getTicketStatusColor = (status) => {
    const colors = {
      open: 'default',
      in_progress: 'info',
      testing: 'warning',
      code_review: 'secondary',
      done: 'success',
      blocked: 'error'
    };
    return colors[status] || 'default';
  };

  const calculateModuleProgress = (module) => {
    if (!module.tickets || module.tickets.length === 0) return 0;
    const completed = module.tickets.filter(t => t.status === 'done').length;
    return Math.round((completed / module.tickets.length) * 100);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <LinearProgress sx={{ width: '60%' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Modules & Tickets
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setModuleDialogOpen(true)}
        >
          Add Module
        </Button>
      </Box>

      {modules.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" textAlign="center">
              No modules yet. Create your first module to start organizing work.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {modules.map((module) => (
            <Grid item xs={12} key={module._id}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box display="flex" alignItems="center" gap={2} width="100%">
                    <Typography variant="h6" fontWeight="bold">
                      {module.name}
                    </Typography>
                    <Chip
                      label={module.status}
                      color={getStatusColor(module.status)}
                      size="small"
                    />
                    <Box flexGrow={1} />
                    <Typography variant="body2" color="text.secondary">
                      {module.tickets?.length || 0} tickets
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    {module.description && (
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {module.description}
                      </Typography>
                    )}

                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" fontWeight="medium">
                          Progress: {calculateModuleProgress(module)}%
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Add />}
                          onClick={() => handleCreateTicket(module)}
                        >
                          Add Ticket
                        </Button>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={calculateModuleProgress(module)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    {module.tickets && module.tickets.length > 0 ? (
                      <List dense>
                        {module.tickets.map((ticket) => (
                          <ListItem
                            key={ticket._id}
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              mb: 1
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography variant="body2" fontWeight="medium">
                                    {ticket.ticketNumber}
                                  </Typography>
                                  <Typography variant="body1">
                                    {ticket.title}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Box display="flex" gap={1} mt={0.5}>
                                  <Chip
                                    label={ticket.status}
                                    color={getTicketStatusColor(ticket.status)}
                                    size="small"
                                  />
                                  <Chip
                                    label={ticket.priority}
                                    size="small"
                                    variant="outlined"
                                  />
                                  <Chip
                                    label={ticket.type}
                                    size="small"
                                    icon={ticket.type === 'bug' ? <BugReport /> : <Assignment />}
                                  />
                                  {ticket.assignedDeveloper && (
                                    <Chip
                                      label={`Dev: ${ticket.assignedDeveloper.username || 'Assigned'}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                  )}
                                  {ticket.tester && (
                                    <Chip
                                      label={`Tester: ${ticket.tester.username || 'Assigned'}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                        No tickets in this module yet.
                      </Typography>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Module Dialog */}
      <Dialog open={moduleDialogOpen} onClose={() => setModuleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Module</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormInput
                label="Module Name"
                value={newModule.name}
                onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <FormInput
                label="Description"
                value={newModule.description}
                onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <FormSelect
                label="Status"
                value={newModule.status}
                onChange={(e) => setNewModule({ ...newModule, status: e.target.value })}
                fullWidth
              >
                {MODULE_STATUS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </FormSelect>
            </Grid>
            <Grid item xs={6}>
              <FormInput
                label="Start Date"
                type="date"
                value={newModule.startDate}
                onChange={(e) => setNewModule({ ...newModule, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <FormInput
                label="End Date"
                type="date"
                value={newModule.endDate}
                onChange={(e) => setNewModule({ ...newModule, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModuleDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateModule}
            disabled={!newModule.name}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Ticket Dialog */}
      {selectedModule && (
        <TicketForm
          open={ticketDialogOpen}
          onClose={() => {
            setTicketDialogOpen(false);
            setSelectedModule(null);
          }}
          onSuccess={fetchProjectDetails}
          projectId={projectId}
          moduleId={selectedModule._id}
          moduleName={selectedModule.name}
        />
      )}
    </Box>
  );
};

export default ModuleManagement;
