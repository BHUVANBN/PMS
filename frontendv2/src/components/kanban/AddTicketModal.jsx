import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Select, InputLabel, FormControl, Stack } from '@mui/material';
import { projectsAPI } from '../../services/api';

const AddTicketModal = ({ open, onClose, projectId, onCreated }) => {
  const [modules, setModules] = useState([]);
  const [moduleId, setModuleId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [type, setType] = useState('feature');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadModules = async () => {
      if (!projectId) return;
      const res = await projectsAPI.getProjectModules(projectId);
      const list = res?.modules || res?.data?.modules || res?.data || [];
      setModules(list);
      if (list[0]) setModuleId(list[0]._id || list[0].id);
    };
    if (open) loadModules();
  }, [open, projectId]);

  const handleCreate = async () => {
    if (!projectId || !moduleId || !title) return;
    try {
      setSubmitting(true);
      await projectsAPI.addTicket(projectId, moduleId, { title, description, priority, type });
      onCreated && onCreated();
      onClose && onClose();
      setTitle('');
      setDescription('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Ticket</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel id="module-label">Module</InputLabel>
          <Select labelId="module-label" label="Module" value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleCreate} disabled={!title || !moduleId || submitting}>Create</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTicketModal;
