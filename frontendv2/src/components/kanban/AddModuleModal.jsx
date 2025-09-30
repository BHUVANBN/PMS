import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Avatar,
  Stack,
  Divider
} from '@mui/material';
import { projectsAPI, usersAPI } from '../../services/api';

const AddModuleModal = ({ open, onClose, projectId, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [moduleLead, setModuleLead] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTeamMembers = async () => {
      if (!open) return;
      try {
        setLoading(true);
        const usersRes = await usersAPI.getAllUsers();
        const allUsers = usersRes?.data || usersRes?.users || [];
        
        // Filter active developers and testers
        const team = allUsers.filter(u => 
          ['developer', 'tester'].includes(u.role) && u.isActive !== false
        );
        
        setTeamMembers(team);
      } catch (err) {
        console.error('Failed to load team members:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadTeamMembers();
  }, [open]);

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
      
      if (moduleLead) {
        moduleData.moduleLead = moduleLead;
      }
      
      if (selectedTeamMembers.length > 0) {
        moduleData.teamMembers = selectedTeamMembers;
      }
      
      await projectsAPI.addModule(projectId, moduleData);
      onCreated && onCreated();
      onClose && onClose();
      
      // Reset form
      setName('');
      setDescription('');
      setModuleLead('');
      setSelectedTeamMembers([]);
      
    } catch (err) {
      setError(err.message || 'Failed to create module');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setModuleLead('');
    setSelectedTeamMembers([]);
    setError('');
    onClose && onClose();
  };

  const handleTeamMemberToggle = (memberId) => {
    setSelectedTeamMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
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
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
          Assign Team (Optional)
        </Typography>
        
        {loading ? (
          <Typography variant="body2" color="text.secondary">Loading team members...</Typography>
        ) : (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel id="module-lead-label">Module Lead</InputLabel>
              <Select
                labelId="module-lead-label"
                label="Module Lead"
                value={moduleLead}
                onChange={(e) => setModuleLead(e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {teamMembers.map((member) => (
                  <MenuItem key={member._id} value={member._id}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 24, height: 24 }}>
                        {(member.firstName || member.username || '?')[0].toUpperCase()}
                      </Avatar>
                      <Typography>
                        {member.firstName} {member.lastName} ({member.role})
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
              Team Members
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {teamMembers.length === 0 ? (
                <Typography variant="caption" color="text.secondary">
                  No team members available
                </Typography>
              ) : (
                teamMembers.map((member) => (
                  <Chip
                    key={member._id}
                    avatar={
                      <Avatar>
                        {(member.firstName || member.username || '?')[0].toUpperCase()}
                      </Avatar>
                    }
                    label={`${member.firstName} ${member.lastName} (${member.role})`}
                    onClick={() => handleTeamMemberToggle(member._id)}
                    color={selectedTeamMembers.includes(member._id) ? 'primary' : 'default'}
                    variant={selectedTeamMembers.includes(member._id) ? 'filled' : 'outlined'}
                  />
                ))
              )}
            </Box>
            {selectedTeamMembers.length > 0 && (
              <Typography variant="caption" color="primary">
                {selectedTeamMembers.length} team member(s) selected
              </Typography>
            )}
          </>
        )}
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
