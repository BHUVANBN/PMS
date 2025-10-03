import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Select, InputLabel, FormControl, Stack, Alert, Typography, Avatar, Divider } from '@mui/material';
import { projectsAPI, managerAPI } from '../../services/api';

const AddTicketModal = ({ open, onClose, projectId, onCreated }) => {
  const [modules, setModules] = useState([]);
  const [moduleId, setModuleId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [type, setType] = useState('feature');
  const [developers, setDevelopers] = useState([]);
  const [testers, setTesters] = useState([]);
  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const [selectedTester, setSelectedTester] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!projectId) return;
      try {
        setLoading(true);
        setError('');
        
        // Load modules
        const res = await projectsAPI.getProjectModules(projectId);
        const list = res?.modules || res?.data?.modules || res?.data || [];
        setModules(list);
        if (list.length > 0) {
          setModuleId(list[0]._id || list[0].id);
        } else {
          setError('No modules found. Please create a module first before adding tickets.');
        }
        
        // Load developers and testers via manager endpoint (role-scoped)
        const [devRes, testRes] = await Promise.all([
          managerAPI.getEmployees({ role: 'developer' }),
          managerAPI.getEmployees({ role: 'tester' })
        ]);

        const devs = devRes?.data || devRes?.employees || [];
        const tests = testRes?.data || testRes?.employees || [];

        setDevelopers(Array.isArray(devs) ? devs : []);
        setTesters(Array.isArray(tests) ? tests : []);
        
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    if (open) loadData();
  }, [open, projectId]);

  const handleCreate = async () => {
    if (!projectId || !moduleId || !title) return;
    try {
      setSubmitting(true);
      
      // Create ticket
      const ticketRes = await projectsAPI.addTicket(projectId, moduleId, { 
        title, 
        description, 
        priority, 
        type 
      });
      
      // If developer or tester selected, assign them
      if (selectedDeveloper || selectedTester) {
        const ticketId = ticketRes?.data?._id || ticketRes?.data?.ticket?._id;
        if (ticketId) {
          const assignmentData = {};
          if (selectedDeveloper) assignmentData.assignedDeveloper = selectedDeveloper;
          if (selectedTester) assignmentData.tester = selectedTester;
          
          await managerAPI.assignTicket(projectId, moduleId, ticketId, assignmentData);
        }
      }
      
      onCreated && onCreated();
      onClose && onClose();
      
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedDeveloper('');
      setSelectedTester('');
      
    } catch (err) {
      setError(err.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Ticket</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Typography>Loading modules...</Typography>
        ) : (
          <>
            <FormControl fullWidth margin="normal" disabled={modules.length === 0}>
              <InputLabel id="module-label">Module</InputLabel>
              <Select labelId="module-label" label="Module" value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
                {modules.length === 0 && <MenuItem value="">No modules available</MenuItem>}
                {modules.map((m) => (
                  <MenuItem key={m._id || m.id} value={m._id || m.id}>{m.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
        <TextField fullWidth label="Title" margin="normal" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextField fullWidth multiline minRows={3} label="Description" margin="normal" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="priority-label">Priority</InputLabel>
            <Select labelId="priority-label" label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="type-label">Type</InputLabel>
            <Select labelId="type-label" label="Type" value={type} onChange={(e) => setType(e.target.value)}>
              <MenuItem value="feature">Feature</MenuItem>
              <MenuItem value="bug">Bug</MenuItem>
              <MenuItem value="task">Task</MenuItem>
              <MenuItem value="improvement">Improvement</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          Assign Team Members (Optional)
        </Typography>
        
        <FormControl fullWidth margin="normal">
          <InputLabel id="developer-assign-label">Assign Developer</InputLabel>
          <Select 
            labelId="developer-assign-label" 
            label="Assign Developer" 
            value={selectedDeveloper} 
            onChange={(e) => setSelectedDeveloper(e.target.value)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {developers.map((dev) => (
              <MenuItem key={dev._id} value={dev._id}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar sx={{ width: 24, height: 24 }}>
                    {(dev.firstName || dev.username || '?')[0].toUpperCase()}
                  </Avatar>
                  <Typography>
                    {dev.firstName} {dev.lastName}
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl fullWidth margin="normal">
          <InputLabel id="tester-assign-label">Assign Tester</InputLabel>
          <Select 
            labelId="tester-assign-label" 
            label="Assign Tester" 
            value={selectedTester} 
            onChange={(e) => setSelectedTester(e.target.value)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {testers.map((tester) => (
              <MenuItem key={tester._id} value={tester._id}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar sx={{ width: 24, height: 24 }}>
                    {(tester.firstName || tester.username || '?')[0].toUpperCase()}
                  </Avatar>
                  <Typography>
                    {tester.firstName} {tester.lastName}
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleCreate} disabled={!title || !moduleId || submitting || modules.length === 0}>
          {submitting ? 'Creating...' : 'Create Ticket'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTicketModal;
