import { useEffect, useState } from 'react';
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
} from '@mui/material';
import { publicAPI } from '../../services/api';

export default function PublicOnboardingList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingId, setApprovingId] = useState(null);

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
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {r.employeeDocuments?.aadhar?.url && (
                          <Button component="a" href={r.employeeDocuments.aadhar.url} target="_blank" rel="noopener noreferrer" size="small">Aadhar</Button>
                        )}
                        {r.employeeDocuments?.photo?.url && (
                          <Button component="a" href={r.employeeDocuments.photo.url} target="_blank" rel="noopener noreferrer" size="small">Photo</Button>
                        )}
                        {r.employeeDocuments?.passbook?.url && (
                          <Button component="a" href={r.employeeDocuments.passbook.url} target="_blank" rel="noopener noreferrer" size="small">Passbook</Button>
                        )}
                        {r.employeeDocuments?.tenth?.url && (
                          <Button component="a" href={r.employeeDocuments.tenth.url} target="_blank" rel="noopener noreferrer" size="small">10th</Button>
                        )}
                        {r.employeeDocuments?.twelfth?.url && (
                          <Button component="a" href={r.employeeDocuments.twelfth.url} target="_blank" rel="noopener noreferrer" size="small">12th</Button>
                        )}
                        {r.employeeDocuments?.diploma?.url && (
                          <Button component="a" href={r.employeeDocuments.diploma.url} target="_blank" rel="noopener noreferrer" size="small">Diploma</Button>
                        )}
                      </Stack>
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
    </Box>
  );
}
