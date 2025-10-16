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
  Chip,
} from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import UploadIcon from '@mui/icons-material/UploadFile';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { hrAPI } from '../../services/api';
import DataTable from '../../components/shared/DataTable';

// Generic HR documents will be handled via name/description/file

const ROLE_OPTIONS = [
  { label: 'All Roles', value: '' },
  { label: 'Employee', value: 'employee' },
  { label: 'Manager', value: 'manager' },
  { label: 'Developer', value: 'developer' },
  { label: 'Tester', value: 'tester' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Sales', value: 'sales' },
  { label: 'Intern', value: 'intern' },
];

const HRDocuments = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [genName, setGenName] = useState('');
  const [genDesc, setGenDesc] = useState('');
  const [genFile, setGenFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' | 'Active' | 'Inactive'

  const [viewOpen, setViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState('');
  const [viewDocs, setViewDocs] = useState([]); // generic docs list

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await hrAPI.getAllEmployees();
      let employees = [];
      if (Array.isArray(res)) employees = res;
      else if (res?.employees) employees = res.employees;
      else if (Array.isArray(res?.data)) employees = res.data;
      else if (Array.isArray(res?.data?.employees)) employees = res.data.employees;

      const normalized = employees.map((e) => ({
        id: e._id || e.id,
        name: e.name || `${e.firstName || ''} ${e.lastName || ''}`.trim() || 'N/A',
        email: e.email || '-',
        role: e.role || '-',
        isActive: e.isActive !== false ? 'Active' : 'Inactive',
      }));
      setRows(normalized);
    } catch (err) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openUpload = (row) => {
    setSelectedEmployee(row);
    setGenName('');
    setGenDesc('');
    setGenFile(null);
    setFeedback({ type: '', message: '' });
    setUploadOpen(true);
  };

  const closeUpload = () => {
    if (uploading) return;
    setUploadOpen(false);
  };

  const handleGenFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setGenFile(file);
  };

  const handleUpload = async () => {
    if (!selectedEmployee?.id) return;
    if (!genName.trim() || !genFile) {
      return setFeedback({ type: 'error', message: 'Name and file are required' });
    }
    try {
      setUploading(true);
      setFeedback({ type: '', message: '' });
      await hrAPI.addHRGenericDocument(selectedEmployee.id, { name: genName.trim(), description: genDesc, file: genFile });
      setFeedback({ type: 'success', message: 'Document uploaded successfully' });
      setTimeout(() => {
        setUploadOpen(false);
      }, 600);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to upload document' });
    } finally {
      setUploading(false);
    }
  };

  const columns = useMemo(() => [
    { field: 'name', headerName: 'Name', sortable: true },
    { field: 'email', headerName: 'Email', sortable: true },
    { field: 'role', headerName: 'Role', type: 'chip' },
    { field: 'isActive', headerName: 'Status', type: 'status' },
    {
      field: 'docs',
      headerName: 'View',
      render: (row) => (
        <IconButton size="small" onClick={() => openView(row)}>
          <VisibilityIcon fontSize="small" />
        </IconButton>
      ),
    },
    {
      field: 'actions',
      headerName: 'Upload',
      render: (row) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" color="primary" onClick={() => openUpload(row)}>
            <UploadIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ], []);

  const openView = async (row) => {
    setSelectedEmployee(row);
    setViewOpen(true);
    setViewLoading(true);
    setViewError('');
    setViewDocs([]);
    try {
      const res = await hrAPI.getHRGenericDocuments(row.id);
      const docs = res?.documents || [];
      setViewDocs(docs);
    } catch (e) {
      setViewError(e.message || 'Failed to load documents');
    } finally {
      setViewLoading(false);
    }
  };

  const handleDeleteGeneric = async (docId) => {
    if (!selectedEmployee?.id) return;
    const ok = window.confirm('Delete this document?');
    if (!ok) return;
    try {
      await hrAPI.deleteHRGenericDocument(selectedEmployee.id, docId);
      // Reload list
      const res = await hrAPI.getHRGenericDocuments(selectedEmployee.id);
      setViewDocs(res?.documents || []);
    } catch (e) {
      alert(e.message || 'Failed to delete');
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <div>
          <Typography variant="h4" fontWeight="bold">HR Documents</Typography>
          <Typography variant="body2" color="text.secondary">Upload and view generic HR documents with a custom name and notes</Typography>
        </div>
        <Button variant="outlined" onClick={fetchEmployees} startIcon={<RefreshIcon />}>Refresh</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            select
            label="Role"
            size="small"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            {ROLE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value || 'all'} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Status"
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
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
        data={rows.filter(r => (!roleFilter || r.role === roleFilter) && (!statusFilter || r.isActive === statusFilter))}
        loading={loading}
        initialPageSize={10}
        enableSearch
        searchableKeys={["name", "email", "role"]}
        emptyMessage="No employees found"
      />

      <Dialog open={uploadOpen} onClose={closeUpload} fullWidth maxWidth="sm">
        <DialogTitle>Upload HR Document</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Employee: {selectedEmployee ? `${selectedEmployee.name} (${selectedEmployee.email})` : '-'}
            </Typography>
            {feedback.message && <Alert severity={feedback.type}>{feedback.message}</Alert>}
            <TextField
              label="Document Name"
              size="small"
              value={genName}
              onChange={(e) => setGenName(e.target.value)}
              required
            />
            <TextField
              label="Description / Notes"
              size="small"
              multiline
              minRows={2}
              value={genDesc}
              onChange={(e) => setGenDesc(e.target.value)}
            />
            <Button component="label" variant="outlined" disabled={uploading}>
              {genFile ? genFile.name : 'Choose File'}
              <input type="file" hidden onChange={handleGenFileChange} />
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeUpload} disabled={uploading}>Cancel</Button>
          <Button onClick={handleUpload} variant="contained" disabled={uploading || !genName.trim() || !genFile}>
            {uploading ? <CircularProgress size={20} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>HR Documents</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Employee: {selectedEmployee ? `${selectedEmployee.name} (${selectedEmployee.email})` : '-'}
            </Typography>
            {viewLoading && <CircularProgress size={24} />}
            {viewError && <Alert severity="error">{viewError}</Alert>}
            {!viewLoading && !viewError && (
              <Stack spacing={2}>
                {viewDocs.length === 0 && (
                  <Typography variant="body2" color="text.secondary">No documents uploaded yet.</Typography>
                )}
                {viewDocs.map((d) => (
                  <Paper key={d._id} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" justifyContent="space-between">
                      <Stack spacing={0.5}>
                        <Typography fontWeight={600}>{d.name}</Typography>
                        {d.description && (
                          <Typography variant="body2" color="text.secondary">{d.description}</Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {d.file?.uploadedAt ? new Date(d.file.uploadedAt).toLocaleString() : ''}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip size="small" color={d.file?.url ? 'success' : 'warning'} label={d.file?.url ? 'Uploaded' : 'Missing'} />
                        {d.file?.url && (
                          <Button href={d.file.url} target="_blank" rel="noopener noreferrer" size="small">View</Button>
                        )}
                        <IconButton size="small" color="error" onClick={() => handleDeleteGeneric(d._id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HRDocuments;
