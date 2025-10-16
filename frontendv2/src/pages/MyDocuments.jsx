import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { employeeAPI } from '../services/api.js';

const MyDocuments = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDocs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await employeeAPI.getMyHRDocs();
      const list = res?.documents || [];
      setDocs(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <div>
          <Typography variant="h4" fontWeight={700}>My Documents</Typography>
          <Typography variant="body2" color="text.secondary">Documents sent to you by Admin, HR, or Manager</Typography>
        </div>
        <Button startIcon={<RefreshIcon />} onClick={fetchDocs} variant="outlined">Refresh</Button>
      </Stack>

      {error && (
        <Box mb={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          {docs.length === 0 && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">No documents available.</Typography>
            </Paper>
          )}

          {docs.map((d) => (
            <Paper key={d._id} variant="outlined" sx={{ p: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                <Stack spacing={0.5}>
                  <Typography fontWeight={600}>{d.name || 'Document'}</Typography>
                  {d.description && (
                    <Typography variant="body2" color="text.secondary">{d.description}</Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {d.file?.uploadedAt ? new Date(d.file.uploadedAt).toLocaleString() : ''}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip size="small" color={d.file?.url ? 'success' : 'warning'} label={d.file?.url ? 'Available' : 'Missing'} />
                  {d.file?.url && (
                    <Button href={d.file.url} target="_blank" rel="noopener noreferrer" size="small" startIcon={<VisibilityIcon fontSize="small" />}>View</Button>
                  )}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default MyDocuments;
