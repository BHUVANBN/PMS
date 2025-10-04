import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { standupAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Alert,
  Typography,
  Box,
  Divider,
  ListSubheader
} from '@mui/material';

export default function StandupLogout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [error, setError] = useState('');

  const now = useMemo(() => new Date(), []);
  const name = user?.firstName || user?.lastName ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : (user?.name || user?.username || '');

  const [form, setForm] = useState({
    status: '',
    priority: '',
    working_hours: '',
    tasks_done: '',
    activity_type: '',
    links: '',
    progress: '',
    blockers: '',
    collaboration: '',
    next_steps: '',
  });

  useEffect(() => {
    // Exclude admins entirely
    if ((user?.role || '').toLowerCase() === 'admin') {
      navigate('/login');
      return;
    }
    let mounted = true;
    const check = async () => {
      try {
        const res = await standupAPI.getTodayStatus();
        if (!mounted) return;
        if (res?.submitted) setAlreadySubmitted(true);
      } catch (e) {
        setError(e.message || 'Failed to check today\'s standup status');
      }
    };
    check();
    return () => { mounted = false; };
  }, [navigate, user]);

  const validate = () => {
    const required = ['status', 'priority', 'working_hours', 'tasks_done'];
    for (const key of required) {
      if (!String(form[key] ?? '').trim()) return `${key.replace('_', ' ')} is required`;
    }
    if (isNaN(Number(form.working_hours))) return 'Working hours must be a number';
    return '';
  };

  const proceedLogout = async () => {
    try {
      await logout();
    } catch (e) { void e; }
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const v = validate();
    if (v) { setError(v); return; }
    try {
      setLoading(true);
      setError('');
      await standupAPI.submit({ ...form, working_hours: Number(form.working_hours) });
      await proceedLogout();
    } catch (e) {
      setError(e.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f1f3f4', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Dialog open onClose={() => navigate(-1)} maxWidth="sm" fullWidth>
        <DialogTitle>Daily Standup</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Fill out this form to complete your logout for today.
          </Typography>

          {/* Read-only identity row */}
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField label="Name" fullWidth value={name} InputProps={{ readOnly: true }} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Date & Time" fullWidth value={now.toLocaleString()} InputProps={{ readOnly: true }} variant="outlined" size="small" />
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}

          {alreadySubmitted ? (
            <>
              <Alert severity="success" sx={{ mb: 2 }}>You already submitted today.</Alert>
            </>
          ) : (
            <>
              <Grid container spacing={2}>
                {/* Row 2: Status & Priority side-by-side */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="medium" sx={{ minWidth: 0 }}>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      label="Status"
                      value={form.status}
                      onChange={(e)=>setForm(f=>({...f,status:e.target.value}))}
                      required
                      sx={{
                        '& .MuiSelect-select': {
                          whiteSpace: 'normal',
                          lineHeight: 1.4,
                          py: 1.2
                        }
                      }}
                    >
                      <ListSubheader disableSticky>Status</ListSubheader>
                      <MenuItem value="" disabled><em>Select</em></MenuItem>
                      <MenuItem value="Delayed">Delayed</MenuItem>
                      <MenuItem value="On Track">On Track</MenuItem>
                      <MenuItem value="Under Review">Under Review</MenuItem>
                      <MenuItem value="Done">Done</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="medium" sx={{ minWidth: 0 }}>
                    <InputLabel id="priority-label">Priority</InputLabel>
                    <Select
                      labelId="priority-label"
                      label="Priority"
                      value={form.priority}
                      onChange={(e)=>setForm(f=>({...f,priority:e.target.value}))}
                      required
                      sx={{
                        '& .MuiSelect-select': {
                          whiteSpace: 'normal',
                          lineHeight: 1.4,
                          py: 1.2
                        }
                      }}
                    >
                      <ListSubheader disableSticky>Priority</ListSubheader>
                      <MenuItem value="" disabled><em>Select</em></MenuItem>
                      <MenuItem value="High">High</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="Low">Low</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Row 3: Working Hours & Activity Type */}
                <Grid item xs={12} sm={6}>
                  <TextField type="number" inputProps={{ step: 0.5, min: 0 }} label="Working Hours" fullWidth required value={form.working_hours} onChange={(e)=>setForm(f=>({...f,working_hours:e.target.value}))} size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Activity Type" fullWidth value={form.activity_type} onChange={(e)=>setForm(f=>({...f,activity_type:e.target.value}))} size="small" />
                </Grid>

                {/* Row 4: Tasks Done Today & Links */}
                <Grid item xs={12} sm={6}>
                  <TextField label="Tasks Done Today" multiline minRows={3} fullWidth required value={form.tasks_done} onChange={(e)=>setForm(f=>({...f,tasks_done:e.target.value}))} size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Links" fullWidth value={form.links} onChange={(e)=>setForm(f=>({...f,links:e.target.value}))} size="small" placeholder="GitHub / Docs / Reports" />
                </Grid>

                {/* Row 5: Progress & Blockers */}
                <Grid item xs={12} sm={6}>
                  <TextField label="Progress Done So Far" fullWidth value={form.progress} onChange={(e)=>setForm(f=>({...f,progress:e.target.value}))} size="small" placeholder="e.g. 60% or details" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Blockers or Issues" multiline minRows={2} fullWidth value={form.blockers} onChange={(e)=>setForm(f=>({...f,blockers:e.target.value}))} size="small" />
                </Grid>

                {/* Row 6: Collaboration & Next Steps */}
                <Grid item xs={12} sm={6}>
                  <TextField label="Collaboration" multiline minRows={2} fullWidth value={form.collaboration} onChange={(e)=>setForm(f=>({...f,collaboration:e.target.value}))} size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Next Steps" multiline minRows={2} fullWidth value={form.next_steps} onChange={(e)=>setForm(f=>({...f,next_steps:e.target.value}))} size="small" />
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>navigate(-1)}>Back</Button>
          {alreadySubmitted ? (
            <Button variant="contained" onClick={proceedLogout}>Proceed to Logout</Button>
          ) : (
            <>
              <Button color="secondary" onClick={proceedLogout}>Skip and Logout</Button>
              <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting…' : 'Submit and Logout'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
