import React, { useEffect, useState } from 'react';
import { calendarAPI, usersAPI, hrAPI, projectsAPI, managerAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Alert,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Autocomplete,
} from '@mui/material';

export default function CalendarEventModal({
  open,
  onClose,
  event,
  onSubmitted,
}) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectTeam, setProjectTeam] = useState([]);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    meetLink: '',
    location: 'Virtual',
    attendeeIds: [],
    eventType: 'meeting',
    isAllDay: false,
    reminder: true,
    reminderTime: 15,
    scopeType: 'individual', // 'project' | 'team' | 'individual'
    scopeProjectId: '',
    scopeTeamMemberIds: [],
  });

  const loadUsers = async () => {
    try {
      // 1) Prefer HR route: /hr/employees
      const hr = await hrAPI.getAllEmployees();
      const hrList = Array.isArray(hr?.employees) ? hr.employees : (Array.isArray(hr) ? hr : []);
      if (hrList.length > 0) { setUsers(hrList); return; }

      // 2) Fallback: calendar attendees endpoint
      const res = await calendarAPI.getUsersForAttendees();
      if (res?.success && Array.isArray(res.users) && res.users.length > 0) {
        setUsers(res.users);
        return;
      }

      // 3) Final fallback: global users list
      const all = await usersAPI.getAllUsers();
      const list = Array.isArray(all?.users) ? all.users : (Array.isArray(all) ? all : []);
      setUsers(list);
    } catch {
      // Leave empty on error
    }
  };

  const loadProjects = async () => {
    try {
      const res = await projectsAPI.getAllProjects();
      const list = res?.projects || res?.data?.projects || res?.data || [];
      setProjects(Array.isArray(list) ? list : []);
    } catch {
      setProjects([]);
    }
  };

  const loadProjectTeam = async (projectId) => {
    if (!projectId) { setProjectTeam([]); return; }
    try {
      const res = await managerAPI.getProjectTeam(projectId);
      const team = res?.team || res?.data?.team || res?.data || [];
      setProjectTeam(Array.isArray(team) ? team : []);
    } catch {
      setProjectTeam([]);
    }
  };

  useEffect(() => {
    if (open) {
      setError('');
      loadUsers();
      loadProjects();
      (async () => {
        // Load full event (with attendees) if necessary
        const loadEventIfNeeded = async () => {
          if (!event) return null;
          const eventId = event._id || event.id;
          if (!event.attendees || typeof event.attendees[0] !== 'object') {
            try {
              const full = await calendarAPI.getEventById(eventId);
              return full?.event || null;
            } catch {
              return null;
            }
          }
          return event;
        };

        const ev = await loadEventIfNeeded();
        if (ev) {
          setForm({
            title: ev.title || '',
            description: ev.description || '',
            eventDate: ev.eventDate ? String(ev.eventDate).split('T')[0] : '',
            startTime: ev.startTime || '',
            endTime: ev.endTime || '',
            meetLink: ev.meetLink || '',
            location: ev.location || 'Virtual',
            attendeeIds: Array.isArray(ev.attendees) ? ev.attendees.map(a => a?._id).filter(Boolean) : [],
            eventType: ev.eventType || 'meeting',
            isAllDay: ev.isAllDay || false,
            reminder: ev.reminder !== undefined ? ev.reminder : true,
            reminderTime: ev.reminderTime || 15,
            scopeType: 'individual',
            scopeProjectId: '',
            scopeTeamMemberIds: [],
          });
        } else {
          setForm({
            title: '',
            description: '',
            eventDate: '',
            startTime: '',
            endTime: '',
            meetLink: '',
            location: 'Virtual',
            attendeeIds: [],
            eventType: 'meeting',
            isAllDay: false,
            reminder: true,
            reminderTime: 15,
            scopeType: 'individual',
            scopeProjectId: '',
            scopeTeamMemberIds: [],
          });
        }
      })();
    }
  }, [open, event]);

  // When scope project changes, load its team
  useEffect(() => {
    if (!open) return;
    if (form.scopeType === 'project' || form.scopeType === 'team') {
      loadProjectTeam(form.scopeProjectId);
    } else {
      setProjectTeam([]);
    }
  }, [open, form.scopeType, form.scopeProjectId]);

  const validate = () => {
    if (!form.title.trim()) return 'Event title is required';
    if (!form.eventDate) return 'Event date is required';
    if (!form.startTime) return 'Start time is required';
    if (!form.endTime) return 'End time is required';

    if (form.startTime >= form.endTime) return 'Start time must be before end time';
    // Validate based on scope
    if (form.scopeType === 'project') {
      if (!form.scopeProjectId) return 'Select a project for project-scoped event';
      if (!projectTeam || projectTeam.length === 0) return 'Selected project has no team members';
    } else if (form.scopeType === 'team') {
      if (!form.scopeProjectId) return 'Select a project for team-scoped event';
      if (!form.scopeTeamMemberIds || form.scopeTeamMemberIds.length === 0) return 'Select at least one team member';
    } else {
      if (!form.attendeeIds || form.attendeeIds.length === 0) return 'Select at least one attendee';
    }

    return '';
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Compute attendeeIds based on scope
      let attendeeIds = form.attendeeIds || [];
      if (form.scopeType === 'project') {
        attendeeIds = projectTeam.map(u => u._id).filter(Boolean);
      } else if (form.scopeType === 'team') {
        attendeeIds = form.scopeTeamMemberIds;
      }

      const eventData = {
        title: form.title,
        description: form.description,
        eventDate: form.eventDate,
        startTime: form.startTime,
        endTime: form.endTime,
        meetLink: form.meetLink,
        location: form.location,
        attendeeIds,
        eventType: form.eventType,
        isAllDay: form.isAllDay,
        reminder: form.reminder,
        reminderTime: form.reminderTime,
      };

      if (event) {
        // Update existing event
        await calendarAPI.updateEvent(event._id, eventData);
        toast.success('Event updated successfully!');
      } else {
        // Create new event
        await calendarAPI.createEvent(eventData);
        toast.success('Event created successfully!');
      }

      onSubmitted && onSubmitted();
    } catch (e) {
      setError(e.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  // no attendee selection in standup-like form

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>{event ? 'Edit Event' : 'Create New Event'}</DialogTitle>
      <DialogContent dividers sx={{ p: 3.5 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="medium">
              <InputLabel id="scope-type-label">Scope</InputLabel>
              <Select
                labelId="scope-type-label"
                label="Scope"
                value={form.scopeType}
                onChange={(e) => setForm(f => ({ ...f, scopeType: e.target.value, // reset selections on scope change
                  scopeProjectId: '', scopeTeamMemberIds: [], attendeeIds: [] }))}
              >
                <MenuItem value="project">Specific Project</MenuItem>
                <MenuItem value="team">Specific Team</MenuItem>
                <MenuItem value="individual">Individual Employee</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {(form.scopeType === 'project' || form.scopeType === 'team') && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="medium">
                <InputLabel id="project-select-label">Project</InputLabel>
                <Select
                  labelId="project-select-label"
                  label="Project"
                  value={form.scopeProjectId}
                  onChange={(e) => setForm(f => ({ ...f, scopeProjectId: e.target.value, scopeTeamMemberIds: [] }))}
                >
                  {projects.map(p => (
                    <MenuItem key={p._id || p.id} value={p._id || p.id}>{p.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {form.scopeType === 'project' && (
            <Grid item xs={12}>
              <Alert severity={projectTeam.length ? 'info' : 'warning'}>
                {form.scopeProjectId ? (
                  projectTeam.length ? `${projectTeam.length} team members will be invited automatically from the selected project.` : 'This project has no team members.'
                ) : 'Select a project to auto-invite its team.'}
              </Alert>
            </Grid>
          )}

          {form.scopeType === 'team' && (
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={projectTeam}
                getOptionLabel={(u) => {
                  const name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
                  return name || u.email || '';
                }}
                isOptionEqualToValue={(o, v) => (o._id || o.id) === (v._id || v.id)}
                value={projectTeam.filter(u => form.scopeTeamMemberIds.includes(u._id || u.id))}
                onChange={(_, newVal) => setForm(f => ({ ...f, scopeTeamMemberIds: newVal.map(u => u._id || u.id) }))}
                openOnFocus
                disableCloseOnSelect
                filterSelectedOptions
                noOptionsText={form.scopeProjectId ? 'No team members found' : 'Select a project first'}
                fullWidth
                ListboxProps={{ sx: { maxHeight: 480, width: '100%' } }}
                sx={{
                  width: '100%',
                  '& .MuiAutocomplete-inputRoot': { minHeight: 56 },
                  '& .MuiChip-root': { maxWidth: 'none' },
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Select Team Members" placeholder="Type to search team members" size="medium" fullWidth />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option._id || option.id}>
                    {option.firstName} {option.lastName} ({option.email})
                  </li>
                )}
                disabled={!form.scopeProjectId}
              />
            </Grid>
          )}

          {form.scopeType === 'individual' && (
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={users}
                getOptionLabel={(u) => {
                  const name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
                  return name || u.email || '';
                }}
                isOptionEqualToValue={(o, v) => o._id === v._id}
                value={users.filter(u => form.attendeeIds.includes(u._id))}
                onChange={(_, newVal) => setForm(f => ({ ...f, attendeeIds: newVal.map(u => u._id) }))}
                openOnFocus
                disableCloseOnSelect
                filterSelectedOptions
                noOptionsText="No employees found"
                fullWidth
                ListboxProps={{ sx: { maxHeight: 480, width: '100%' } }}
                sx={{
                  width: '100%',
                  '& .MuiAutocomplete-inputRoot': { minHeight: 56 },
                  '& .MuiChip-root': { maxWidth: 'none' },
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Invite Employees" placeholder="Type to search employees" size="medium" fullWidth />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option._id}>
                    {option.firstName} {option.lastName} ({option.email})
                  </li>
                )}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField
              label="Event Name"
              fullWidth
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Enter event title"
              required
              size="medium"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Details"
              fullWidth
              multiline
              minRows={3}
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Enter event description"
              size="medium"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              type="date"
              label="Event Date"
              fullWidth
              value={form.eventDate}
              onChange={(e) => setForm(f => ({ ...f, eventDate: e.target.value }))}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              required
              size="medium"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              type="time"
              label="Start Time"
              fullWidth
              value={form.startTime}
              onChange={(e) => setForm(f => ({ ...f, startTime: e.target.value }))}
              required
              size="medium"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              type="time"
              label="End Time"
              fullWidth
              value={form.endTime}
              onChange={(e) => setForm(f => ({ ...f, endTime: e.target.value }))}
              required
              size="medium"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="medium">
              <InputLabel id="event-type-label">Event Type</InputLabel>
              <Select
                labelId="event-type-label"
                label="Event Type"
                value={form.eventType}
                onChange={(e) => setForm(f => ({ ...f, eventType: e.target.value }))}
              >
                <MenuItem value="meeting">Meeting</MenuItem>
                <MenuItem value="review">Review</MenuItem>
                <MenuItem value="training">Training</MenuItem>
                <MenuItem value="event">Event</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Location"
              fullWidth
              value={form.location}
              onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="Virtual or physical location"
              size="medium"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Meet Link"
              fullWidth
              value={form.meetLink}
              onChange={(e) => setForm(f => ({ ...f, meetLink: e.target.value }))}
              placeholder="Google Meet, Zoom, etc."
              size="medium"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={<Checkbox checked={form.isAllDay} onChange={(e) => setForm(f => ({ ...f, isAllDay: e.target.checked }))} />}
              label="All Day Event"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={<Checkbox checked={form.reminder} onChange={(e) => setForm(f => ({ ...f, reminder: e.target.checked }))} />}
              label="Enable Reminder"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="medium" disabled={!form.reminder}>
              <InputLabel id="reminder-time-label">Reminder (mins)</InputLabel>
              <Select
                labelId="reminder-time-label"
                label="Reminder (mins)"
                value={form.reminderTime}
                onChange={(e) => setForm(f => ({ ...f, reminderTime: parseInt(e.target.value) }))}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={15}>15</MenuItem>
                <MenuItem value={30}>30</MenuItem>
                <MenuItem value={60}>60</MenuItem>
                <MenuItem value={120}>120</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
