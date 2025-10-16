import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Stack,
  List,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { hrAPI } from '../../services/api';

const DOC_ORDER = [
  ['aadhar', 'Aadhar Card'],
  ['photo', 'Passport-size Photo'],
  ['passbook', 'Passbook Photo'],
  ['tenth', '10th Marks Card'],
  ['twelfth', '12th Marks Card'],
  ['diploma', 'Diploma Certificate'],
];

export default function EmployeeDocuments() {
  const location = useLocation();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  const loadList = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await hrAPI.listEmployeeDocuments();
      const rows = res?.employees || [];
      setList(rows);
    } catch (e) {
      setError(e.message || 'Failed to load employees');
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDetails = async (userId) => {
    if (!userId) return;
    try {
      setDetailsLoading(true);
      setDetailsError('');
      const res = await hrAPI.getEmployeeDocuments(userId);
      setDetails(res?.employee || null);
    } catch {
      // Fallback: if archive not found, try onboarding details
      try {
        const fallback = await hrAPI.getOnboardingDetails(userId);
        const ob = fallback?.onboarding;
        if (ob) {
          const transformed = {
            user: ob.user || null,
            employeeDetails: ob.employeeDetails || {},
            employeeDocuments: ob.employeeDocuments || {},
            hrDocuments: ob.hrDocuments || {},
            hrDocumentsList: Array.isArray(ob.hrDocumentsList) ? ob.hrDocumentsList : [],
          };
          setDetails(transformed);
          setDetailsError('');
          return;
        }
        setDetails(null);
        setDetailsError('Failed to load employee documents');
      } catch (e2) {
        setDetails(null);
        setDetailsError(e2?.message || 'Failed to load employee documents');
      }
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const preselectId = params.get('userId');
    if (preselectId) {
      // If the preselected user exists in list, select it; otherwise fallback to first
      const exists = list.some((item) => item.user?._id === preselectId);
      if (!exists) {
        // Inject the user into list so UI shows them while archive list updates
        (async () => {
          try {
            const empRes = await hrAPI.getEmployeeById(preselectId);
            const u = empRes?.employee || null;
            if (u) {
              setList((prev) => [{ user: u }, ...prev]);
            }
          } catch { /* ignore */ }
        })();
      }
      setSelectedUserId(preselectId);
    } else if (!selectedUserId && list.length > 0) {
      setSelectedUserId(list[0]?.user?._id || null);
    }
  }, [list, selectedUserId, location.search]);

  useEffect(() => {
    if (selectedUserId) loadDetails(selectedUserId);
  }, [selectedUserId]);

  const employeeDocEntries = useMemo(() => {
    if (!details?.employeeDocuments) return [];
    return DOC_ORDER.map(([key, label]) => ({
      key,
      label,
      url: details.employeeDocuments?.[key]?.url || null,
      uploadedAt: details.employeeDocuments?.[key]?.uploadedAt || null,
    }));
  }, [details]);

  const hrDocEntries = useMemo(() => {
    if (!details?.hrDocuments) return [];
    const map = details.hrDocuments || {};
    const order = [
      ['codeOfConduct', 'Code of Conduct'],
      ['nda', 'Non-Disclosure Agreement'],
      ['employmentAgreement', 'Employment Agreement'],
    ];
    return order.map(([key, label]) => ({
      key,
      label,
      url: map?.[key]?.url || null,
      uploadedAt: map?.[key]?.uploadedAt || null,
    }));
  }, [details]);

  const genericDocs = useMemo(() => {
    return Array.isArray(details?.hrDocumentsList) ? details.hrDocumentsList : [];
  }, [details]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Employee Documents
      </Typography>

      {error && (
        <Box mb={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Paper sx={{ p: 2, flex: 1, minWidth: 280 }} variant="outlined">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">Employees</Typography>
            <Button size="small" onClick={loadList} disabled={loading}>Refresh</Button>
          </Stack>
          {loading ? (
            <Box p={3} display="flex" justifyContent="center"><CircularProgress /></Box>
          ) : (
            <List dense sx={{ maxHeight: 500, overflowY: 'auto' }}>
              {list.map((item) => (
                <ListItemButton
                  key={item.user?._id}
                  selected={selectedUserId === item.user?._id}
                  onClick={() => setSelectedUserId(item.user?._id)}
                >
                  <ListItemText primary={`${item.user?.firstName || ''} ${item.user?.lastName || ''}`.trim() || 'Unnamed'} secondary={item.user?.email} />
                </ListItemButton>
              ))}
              {list.length === 0 && null}
            </List>
          )}
        </Paper>

        <Paper sx={{ p: 3, flex: 2, minHeight: 520 }} variant="outlined">
          {detailsLoading ? (
            <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
          ) : detailsError ? (
            <Alert severity="error">{detailsError}</Alert>
          ) : !details ? (
            <Typography variant="body2" color="text.secondary">Select an employee to view documents.</Typography>
          ) : (
            <Stack spacing={3}>
              <Box>
                <Typography variant="h5">{`${details.user?.firstName || ''} ${details.user?.lastName || ''}`.trim()}</Typography>
                <Typography variant="body2" color="text.secondary">{details.user?.email}</Typography>
              </Box>

              <Divider />

              <Typography variant="h6">Employee Details</Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Address</Typography>
                    <Typography>{details.employeeDetails?.address || '-'}</Typography>
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Mobile</Typography>
                    <Typography>{details.employeeDetails?.mobile || '-'}</Typography>
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                    <Typography>{details.employeeDetails?.dateOfBirth ? new Date(details.employeeDetails.dateOfBirth).toLocaleDateString() : '-'}</Typography>
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">PAN</Typography>
                    <Typography>{details.employeeDetails?.pan || '-'}</Typography>
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Emergency Contact Name</Typography>
                    <Typography>{details.employeeDetails?.emergencyContactName || '-'}</Typography>
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Emergency Contact Phone</Typography>
                    <Typography>{details.employeeDetails?.emergencyContactPhone || '-'}</Typography>
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Bank Account Number</Typography>
                    <Typography>{details.employeeDetails?.bankAccountNumber || '-'}</Typography>
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">IFSC</Typography>
                    <Typography>{details.employeeDetails?.ifsc || '-'}</Typography>
                  </Stack>
                </Stack>
              </Paper>

              <Divider />

              <Typography variant="h6">Employee Onboarding Documents</Typography>
              <Stack spacing={1.5}>
                {employeeDocEntries.map((d) => (
                  <Paper key={d.key} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between">
                      <Stack>
                        <Typography fontWeight={600}>{d.label}</Typography>
                        {d.uploadedAt && (
                          <Typography variant="caption" color="text.secondary">{new Date(d.uploadedAt).toLocaleString()}</Typography>
                        )}
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip size="small" color={d.url ? 'success' : 'warning'} label={d.url ? 'Uploaded' : 'Missing'} />
                        {d.url && (
                          <Button href={d.url} target="_blank" rel="noopener noreferrer" size="small">Open</Button>
                        )}
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>

              <Divider />

              <Typography variant="h6">HR Documents</Typography>
              <Stack spacing={1.5}>
                {hrDocEntries.map((d) => (
                  <Paper key={d.key} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between">
                      <Stack>
                        <Typography fontWeight={600}>{d.label}</Typography>
                        {d.uploadedAt && (
                          <Typography variant="caption" color="text.secondary">{new Date(d.uploadedAt).toLocaleString()}</Typography>
                        )}
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip size="small" color={d.url ? 'success' : 'warning'} label={d.url ? 'Uploaded' : 'Missing'} />
                        {d.url && (
                          <Button href={d.url} target="_blank" rel="noopener noreferrer" size="small">Open</Button>
                        )}
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>

              <Divider />

              <Typography variant="h6">HR Documents (Other)</Typography>
              <Stack spacing={1.5}>
                {genericDocs.length === 0 && (
                  <Typography variant="body2" color="text.secondary">No additional HR documents uploaded.</Typography>
                )}
                {genericDocs.map((doc) => (
                  <Paper key={doc._id} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between">
                      <Stack>
                        <Typography fontWeight={600}>{doc.name || 'Untitled'}</Typography>
                        {doc.description && (
                          <Typography variant="body2" color="text.secondary">{doc.description}</Typography>
                        )}
                        {doc.file?.uploadedAt && (
                          <Typography variant="caption" color="text.secondary">{new Date(doc.file.uploadedAt).toLocaleString()}</Typography>
                        )}
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip size="small" color={doc.file?.url ? 'success' : 'warning'} label={doc.file?.url ? 'Uploaded' : 'Missing'} />
                        {doc.file?.url && (
                          <Button href={doc.file.url} target="_blank" rel="noopener noreferrer" size="small">Open</Button>
                        )}
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>

            </Stack>
          )}
        </Paper>
      </Stack>
    </Box>
  );
}
