import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Divider,
  TextField,
  MenuItem,
  List,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { hrAPI } from '../../services/api.js';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending_documents', label: 'Pending Documents' },
  { value: 'pending_verification', label: 'Pending Verification' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' }
];

const STATUS_CHIP_PROPS = {
  pending_documents: { color: 'warning', label: 'Pending Documents' },
  pending_verification: { color: 'info', label: 'Pending Verification' },
  verified: { color: 'success', label: 'Verified' },
  rejected: { color: 'error', label: 'Rejected' }
};

const EMPLOYEE_DOCS = [
  { key: 'aadhar', label: 'Aadhar Card' },
  { key: 'photo', label: 'Passport-size Photo' },
  { key: 'education', label: '10th & 12th / Diploma Certificate' }
];

const HR_DOCS = [
  { key: 'codeOfConduct', label: 'Code of Conduct' },
  { key: 'nda', label: 'Non-Disclosure Agreement' },
  { key: 'employmentAgreement', label: 'Employment Agreement' }
];

const OnboardingManager = () => {
  const [filterStatus, setFilterStatus] = useState('');
  const [summary, setSummary] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [list, setList] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [hrFiles, setHrFiles] = useState({});
  const [hrUploadLoading, setHrUploadLoading] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [verifyDecision, setVerifyDecision] = useState('verified');
  const [verifyRemarks, setVerifyRemarks] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const summaryMap = useMemo(() => {
    return summary.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
  }, [summary]);

  const selectedListItem = useMemo(() => {
    return list.find((item) => item.user?._id === selectedUserId) || null;
  }, [list, selectedUserId]);

  const reloadSummary = async () => {
    try {
      setSummaryLoading(true);
      const response = await hrAPI.getOnboardingSummary();
      setSummary(response.summary || []);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Failed to load summary' });
    } finally {
      setSummaryLoading(false);
    }
  };

  const reloadList = async () => {
    try {
      setListLoading(true);
      setListError('');
      const response = await hrAPI.getOnboardingList(filterStatus ? { status: filterStatus } : undefined);
      setList(response.onboarding || []);
    } catch (error) {
      setListError(error.message || 'Failed to load onboarding list');
      setList([]);
    } finally {
      setListLoading(false);
    }
  };

  const reloadDetails = async (userId) => {
    if (!userId) return;
    try {
      setDetailsLoading(true);
      setDetailsError('');
      const response = await hrAPI.getOnboardingDetails(userId);
      setDetails(response.onboarding || null);
    } catch (error) {
      setDetails(null);
      setDetailsError(error.message || 'Failed to load onboarding details');
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    reloadSummary();
  }, []);

  useEffect(() => {
    reloadList();
  }, [filterStatus]);

  useEffect(() => {
    if (!selectedUserId && list.length > 0) {
      setSelectedUserId(list[0].user?._id || null);
    }
  }, [list, selectedUserId]);

  useEffect(() => {
    if (selectedUserId) {
      reloadDetails(selectedUserId);
    }
  }, [selectedUserId]);

  const handleSelectCandidate = (userId) => {
    setSelectedUserId(userId);
  };

  const handleFileSelection = (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setHrFiles((prev) => ({ ...prev, [field]: file }));
  };

  const handleUploadHrDocs = async () => {
    if (!selectedUserId) return;
    if (!Object.values(hrFiles).some(Boolean)) {
      setFeedback({ type: 'error', message: 'Select at least one document to upload' });
      return;
    }

    const formData = new FormData();
    Object.entries(hrFiles).forEach(([field, file]) => {
      if (file) {
        formData.append(field, file);
      }
    });

    try {
      setHrUploadLoading(true);
      const response = await hrAPI.uploadOnboardingDocuments(selectedUserId, formData);
      setDetails(response.onboarding || details);
      setFeedback({ type: 'success', message: 'HR documents uploaded successfully' });
      setHrFiles({});
      reloadList();
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Failed to upload documents' });
    } finally {
      setHrUploadLoading(false);
    }
  };

  const openVerifyDialog = (decision) => {
    setVerifyDecision(decision);
    setVerifyRemarks('');
    setVerifyDialogOpen(true);
  };

  const handleVerifySubmit = async () => {
    if (!selectedUserId) return;
    if (verifyDecision === 'rejected' && !verifyRemarks.trim()) {
      setFeedback({ type: 'error', message: 'Remarks are required when rejecting onboarding' });
      return;
    }

    try {
      setVerifyLoading(true);
      const response = await hrAPI.verifyOnboarding(selectedUserId, {
        decision: verifyDecision,
        remarks: verifyRemarks.trim()
      });
      setDetails(response.onboarding || details);
      setFeedback({
        type: 'success',
        message: `Onboarding ${verifyDecision === 'verified' ? 'verified' : 'rejected'} successfully`
      });
      setVerifyDialogOpen(false);
      reloadSummary();
      reloadList();
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Failed to update onboarding status' });
    } finally {
      setVerifyLoading(false);
    }
  };

  const renderStatusChip = (status) => {
    const props = STATUS_CHIP_PROPS[status] || { color: 'default', label: status };
    return <Chip label={props.label} color={props.color} size="small" />;
  };

  const renderDocumentSection = (documents, config, actions = []) => {
    return (
      <Stack spacing={2}>
        {config.map((doc) => {
          const uploadedDoc = documents?.[doc.key];
          return (
            <Paper key={doc.key} variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle1">{doc.label}</Typography>
                {uploadedDoc ? (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip label="Uploaded" color="success" size="small" />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(uploadedDoc.uploadedAt).toLocaleString()}
                    </Typography>
                    <Button
                      href={uploadedDoc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="text"
                      size="small"
                    >
                      View
                    </Button>
                  </Stack>
                ) : (
                  <Chip label="Not uploaded" color="warning" size="small" />
                )}
                {actions.find((action) => action.field === doc.key)?.render()}
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    );
  };

  const employeeDocActions = [];
  const hrDocActions = HR_DOCS.map((doc) => ({
    field: doc.key,
    render: () => (
      <Button
        component="label"
        variant="outlined"
        size="small"
        startIcon={<CloudUploadIcon fontSize="small" />}
        disabled={hrUploadLoading}
      >
        {hrFiles[doc.key] ? hrFiles[doc.key].name : 'Upload'}
        <input
          type="file"
          hidden
          accept="application/pdf,image/*"
          onChange={(event) => handleFileSelection(event, doc.key)}
        />
      </Button>
    )
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Onboarding Management
      </Typography>

      {feedback.message && (
        <Box mb={2}>
          <Alert severity={feedback.type}>{feedback.message}</Alert>
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Summary</Typography>
                <IconButton size="small" onClick={reloadSummary} disabled={summaryLoading}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Stack>
              {summaryLoading ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {STATUS_OPTIONS.filter((opt) => opt.value).map((opt) => (
                    <Stack key={opt.value} direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">{opt.label}</Typography>
                      <Chip label={summaryMap[opt.value] || 0} color={STATUS_CHIP_PROPS[opt.value]?.color || 'default'} size="small" />
                    </Stack>
                  ))}
                </Stack>
              )}
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6">Employees</Typography>
                  <Tooltip title="Refresh list">
                    <span>
                      <IconButton size="small" onClick={reloadList} disabled={listLoading}>
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
                <TextField
                  select
                  label="Filter by status"
                  size="small"
                  value={filterStatus}
                  onChange={(event) => setFilterStatus(event.target.value)}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value || 'all'} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                {listError && <Alert severity="error">{listError}</Alert>}
                {listLoading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <List dense sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    {list.map((item) => (
                      <ListItemButton
                        key={item.user?._id || Math.random()}
                        selected={selectedUserId === item.user?._id}
                        onClick={() => handleSelectCandidate(item.user?._id)}
                      >
                        <ListItemText
                          primary={`${item.user?.firstName || ''} ${item.user?.lastName || ''}`.trim() || 'Unnamed'}
                          secondary={item.user?.email}
                        />
                        <ListItemSecondaryAction>
                          {renderStatusChip(item.status)}
                        </ListItemSecondaryAction>
                      </ListItemButton>
                    ))}
                    {list.length === 0 && (
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                        No onboarding records found.
                      </Typography>
                    )}
                  </List>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 3, minHeight: 520 }}>
            {detailsLoading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
              </Box>
            ) : detailsError ? (
              <Alert severity="error">{detailsError}</Alert>
            ) : !details ? (
              <Typography variant="body1" color="text.secondary">
                Select an employee to view onboarding details.
              </Typography>
            ) : (
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                  <Box>
                    <Typography variant="h5">
                      {`${details.user?.firstName || ''} ${details.user?.lastName || ''}`.trim()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {details.user?.email}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {renderStatusChip(details.status)}
                    {details.hrVerification?.verifiedBy && (
                      <Tooltip title={`Verified at ${details.hrVerification?.verifiedAt ? new Date(details.hrVerification.verifiedAt).toLocaleString() : ''}`}>
                        <AssignmentTurnedInIcon color="success" />
                      </Tooltip>
                    )}
                  </Stack>
                </Stack>

                <Divider />

                <Typography variant="h6">Employee Documents</Typography>
                {renderDocumentSection(details.employeeDocuments, EMPLOYEE_DOCS, employeeDocActions)}

                <Divider />

                <Typography variant="h6">HR Documents</Typography>
                {renderDocumentSection(details.hrDocuments, HR_DOCS, hrDocActions)}

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    onClick={handleUploadHrDocs}
                    disabled={hrUploadLoading || !Object.values(hrFiles).some(Boolean)}
                  >
                    {hrUploadLoading ? 'Uploading...' : 'Upload Selected Documents'}
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => setHrFiles({})}
                    disabled={hrUploadLoading || !Object.values(hrFiles).some(Boolean)}
                  >
                    Clear Selection
                  </Button>
                </Stack>

                {details.hrVerification?.remarks && (
                  <Alert severity={details.status === 'rejected' ? 'error' : 'info'}>
                    {details.hrVerification.remarks}
                  </Alert>
                )}

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<DoneAllIcon />}
                    onClick={() => openVerifyDialog('verified')}
                    disabled={details.status === 'verified'}
                  >
                    Mark as Verified
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CloseIcon />}
                    onClick={() => openVerifyDialog('rejected')}
                  >
                    Mark as Rejected
                  </Button>
                </Stack>
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={verifyDialogOpen} onClose={() => setVerifyDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{verifyDecision === 'verified' ? 'Verify Onboarding' : 'Reject Onboarding'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              {verifyDecision === 'verified'
                ? 'Confirm that all documents are correct before verifying.'
                : 'Provide clear remarks explaining the reason for rejection.'}
            </Alert>
            <TextField
              label="Remarks"
              multiline
              minRows={3}
              value={verifyRemarks}
              onChange={(event) => setVerifyRemarks(event.target.value)}
              placeholder={verifyDecision === 'verified' ? 'Optional remarks' : 'Required remarks'}
              required={verifyDecision === 'rejected'}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialogOpen(false)} disabled={verifyLoading}>Cancel</Button>
          <Button
            onClick={handleVerifySubmit}
            variant="contained"
            color={verifyDecision === 'verified' ? 'success' : 'error'}
            startIcon={verifyDecision === 'verified' ? <DoneAllIcon /> : <CloseIcon />}
            disabled={verifyLoading}
          >
            {verifyLoading ? 'Processing...' : verifyDecision === 'verified' ? 'Confirm Verification' : 'Confirm Rejection'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OnboardingManager;
