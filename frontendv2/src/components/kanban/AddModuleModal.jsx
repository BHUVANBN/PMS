import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Typography
} from '@mui/material';
import { projectsAPI } from '../../services/api';

const AddModuleModal = ({ open, onClose, projectId, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!projectId || !name) return;
    try {
      setSubmitting(true);
      setError('');
      
      const moduleData = {
        name,
        description,
        status: 'planning'
      };
      
      await projectsAPI.addModule(projectId, moduleData);
      onCreated && onCreated();
      onClose && onClose();
      
      // Reset form
      setName('');
      setDescription('');
      
      
    } catch (err) {
      setError(err.message || 'Failed to create module');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setError('');
    onClose && onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Module</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
          Module Details
        </Typography>
        
        <TextField 
          fullWidth 
          label="Module Name" 
          margin="normal" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
        <TextField 
          fullWidth 
          multiline 
          minRows={3} 
          label="Description" 
          margin="normal" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
        />
        
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleCreate} 
          disabled={!name || submitting}
        >
          {submitting ? 'Creating...' : 'Create Module'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddModuleModal;
