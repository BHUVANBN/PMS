import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import UploadIcon from '@mui/icons-material/UploadFile';
import RefreshIcon from '@mui/icons-material/Refresh';
import { managerAPI } from '../../services/api';
import DataTable from '../../components/shared/DataTable';

const ManagerDocuments = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [statusFilter, setStatusFilter] = useState(''); // '', 'active', etc.

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await managerAPI.getAllProjects?.();
      // managerAPI has getAllProjects -> '/manager/projects'
      const list = res?.data || res?.projects || res || [];
      const normalized = Array.isArray(list)
        ? list.map((p) => ({
            id: p._id || p.id,
            name: p.name || '-',
            status: p.status || '-',
            startDate: p.startDate ? new Date(p.startDate).toLocaleDateString() : '-',
            endDate: p.endDate ? new Date(p.endDate).toLocaleDateString() : '-',
          }))
        : [];
      setProjects(normalized);
    } catch (e) {
      setError(e.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openUpload = (row) => {
    setSelectedProject(row);
    setName('');
    setDesc('');
    setFile(null);
    setFeedback({ type: '', message: '' });
    setUploadOpen(true);
  };

  const closeUpload = () => {
    if (uploading) return;
    setUploadOpen(false);
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const handleUpload = async () => {
    if (!selectedProject?.id) return;
    if (!name.trim() || !file) {
      return setFeedback({ type: 'error', message: 'Name and file are required' });
    }
    try {
      setUploading(true);
      setFeedback({ type: '', message: '' });
      await managerAPI.sendTeamDocument(selectedProject.id, { name: name.trim(), description: desc, file });
      setFeedback({ type: 'success', message: 'Document sent to project team members' });
      setTimeout(() => {
        setUploadOpen(false);
      }, 600);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to send document' });
    } finally {
      setUploading(false);
    }
  };

  const columns = useMemo(
    () => [
      { field: 'name', headerName: 'Project', sortable: true },
      { field: 'status', headerName: 'Status', sortable: true },
      { field: 'startDate', headerName: 'Start' },
      { field: 'endDate', headerName: 'End' },
      {
        field: 'actions',
        headerName: 'Send Document',
        render: (row) => (
          <IconButton size="small" color="primary" onClick={() => openUpload(row)}>
            <UploadIcon fontSize="small" />
          </IconButton>
        ),
      },
    ],
    []
  );

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <div>
          <Typography variant="h4" fontWeight="bold">Manager Documents</Typography>
          <Typography variant="body2" color="text.secondary">Upload and distribute documents to your project team members</Typography>
        </div>
        <Button variant="outlined" onClick={fetchProjects} startIcon={<RefreshIcon />}>Refresh</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            select
            label="Project Status"
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="planning">Planning</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="on_hold">On Hold</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {error && (
        <Paper sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      <DataTable
        columns={columns}
        data={projects.filter((p) => !statusFilter || p.status === statusFilter)}
        loading={loading}
        initialPageSize={10}
        enableSearch
        searchableKeys={["name", "status"]}
        emptyMessage="No projects found"
      />

      <Dialog open={uploadOpen} onClose={closeUpload} fullWidth maxWidth="sm">
        <DialogTitle>Send Team Document</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Project: {selectedProject ? selectedProject.name : '-'}
            </Typography>
            {feedback.message && <Alert severity={feedback.type}>{feedback.message}</Alert>}
            <TextField
              label="Document Name"
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              label="Description / Notes"
              size="small"
              multiline
              minRows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <Button component="label" variant="outlined" disabled={uploading}>
              {file ? file.name : 'Choose File'}
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeUpload} disabled={uploading}>Cancel</Button>
          <Button onClick={handleUpload} variant="contained" disabled={uploading || !name.trim() || !file}>
            {uploading ? <CircularProgress size={20} /> : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagerDocuments;
