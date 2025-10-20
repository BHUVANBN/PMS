import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { publicAPI } from '../../services/api';

const PDFPreview = ({ url, label }) => {
  const [src, setSrc] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl = '';

    const fetchPdf = async () => {
      try {
        setError(false);
        setSrc('');
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status}`);
        }
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      } catch (err) {
        console.error('PDF preview error:', err);
        setError(true);
      }
    };

    fetchPdf();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url]);

  if (error) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Alert severity="info" sx={{ width: '100%' }}>
          PDF preview unavailable. Use "Open in New Tab" to view or download the document.
        </Alert>
      </Box>
    );
  }

  if (!src) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <iframe
      src={src}
      width="100%"
      height="100%"
      style={{ border: 'none' }}
      title={`${label} PDF`}
    />
  );
};

export default function PublicOnboardingList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingId, setApprovingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  // Removed inline create dialog in favor of redirect with prefill
  const [docsOpen, setDocsOpen] = useState(false);
  const [docsRecord, setDocsRecord] = useState(null);

  const ROLE_OPTIONS = useMemo(() => [
    { value: 'employee', label: 'Employee' },
    { value: 'manager', label: 'Manager' },
    { value: 'developer', label: 'Developer' },
    { value: 'tester', label: 'Tester' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'intern', label: 'Intern' },
  ], []);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await publicAPI.listPublicOnboarding();
      setRows(res.onboarding || []);
    } catch (e) {
      setError(e.message || 'Failed to load onboarding submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id) => {
    try {
      setApprovingId(id);
      await publicAPI.approvePublicOnboarding(id);
      await load();
    } catch (e) {
      setError(e.message || 'Approve failed');
    } finally {
      setApprovingId(null);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this public onboarding submission? This cannot be undone.');
    if (!ok) return;
    try {
      setDeletingId(id);
      await publicAPI.deletePublicOnboarding(id);
      await load();
    } catch (e) {
      setError(e.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const redirectToCreateEmployee = (record) => {
    const email = record?.email || '';
    const username = email.includes('@') ? email.split('@')[0] : (record?.fullName || 'user').toLowerCase().replace(/\s+/g, '.');
    const [firstName, ...rest] = (record?.fullName || '').trim().split(' ');
    const lastName = rest.join(' ');
    const params = new URLSearchParams({
      firstName: firstName || '',
      lastName: lastName || '',
      email,
      username,
      role: 'employee',
      publicId: record?._id || '',
    }).toString();
    // Absolute URL as requested
    window.location.href = `http://localhost:5173/hr/employees/new?${params}`;
  };

  const openDocsDialog = (record) => {
    setDocsRecord(record);
    setDocsOpen(true);
  };

  const docEntries = useMemo(() => {
    const r = docsRecord;
    if (!r) return [];
    const map = r.employeeDocuments || {};
    const order = [
      ['aadhar', 'Aadhar'],
      ['photo', 'Photo'],
      ['passbook', 'Passbook'],
      ['tenth', '10th'],
      ['twelfth', '12th'],
      ['diploma', 'Diploma'],
    ];
    return order
      .map(([key, label]) => {
        const originalUrl = map?.[key]?.url;
        const hasDoc = originalUrl;
        if (!hasDoc) return null;
        const streamUrl = publicAPI.getOnboardingDocumentUrl(r._id, key);
        const downloadUrl = publicAPI.getOnboardingDocumentUrl(r._id, key, { download: 1 });
        const lowerUrl = (originalUrl || '').toLowerCase();
        const isPdf = lowerUrl.includes('.pdf');
        return { key, label, streamUrl, downloadUrl, isPdf };
      })
      .filter(Boolean);
  }, [docsRecord]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Public Onboarding Submissions
      </Typography>

      {error && (
        <Box mb={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      <Paper variant="outlined">
        {loading ? (
          <Box p={4} display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Docs</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r._id} hover>
                    <TableCell>{r.fullName}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.mobile}</TableCell>
                    <TableCell>{r.address}</TableCell>
                    <TableCell>
                      <Button variant="outlined" size="small" onClick={() => openDocsDialog(r)}>See Documents</Button>
                    </TableCell>
                    <TableCell>
                      <Chip label={r.status} size="small" color={r.status === 'submitted' ? 'warning' : r.status === 'reviewed' ? 'info' : 'success'} />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleApprove(r._id)}
                        disabled={approvingId === r._id || r.status !== 'submitted'}
                      >
                        {approvingId === r._id ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        sx={{ ml: 1 }}
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => handleDelete(r._id)}
                        disabled={deletingId === r._id}
                      >
                        {deletingId === r._id ? 'Deleting...' : 'Delete'}
                      </Button>
                      <Button
                        sx={{ ml: 1 }}
                        variant="text"
                        size="small"
                        onClick={() => redirectToCreateEmployee(r)}
                      >
                        Create Employee
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No submissions yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={docsOpen} onClose={() => setDocsOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Documents</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {docEntries.length === 0 && (
              <Alert severity="info">No documents uploaded.</Alert>
            )}
            {docEntries.map((d) => (
              <Box key={d.key}>
                <Typography variant="h6" gutterBottom>{d.label}</Typography>
                <Box sx={{ height: '600px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  {d.isPdf ? (
                    <PDFPreview url={d.streamUrl} label={d.label} />
                  ) : (
                    <img
                      src={d.streamUrl}
                      alt={d.label}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  )}
                </Box>
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                  <Button component="a" href={d.downloadUrl} target="_blank" rel="noopener noreferrer" size="small">
                    Open in New Tab
                  </Button>
                </Box>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create Employee dialog removed; redirection used instead */}
    </Box>
  );
}
