import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Divider
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import BlockIcon from '@mui/icons-material/Block';
import { employeeAPI } from '../../services/api.js';

const REQUIRED_DOCS = [
  { key: 'aadhar', label: 'Aadhar Card' },
  { key: 'photo', label: 'Passport-size Photo' },
  { key: 'education', label: '10th & 12th / Diploma Certificate' }
];

const STATUS_LABELS = {
  pending_documents: 'Pending Documents',
  pending_verification: 'Pending Verification',
  verified: 'Verified',
  rejected: 'Rejected'
};

const STATUS_COLORS = {
  pending_documents: 'warning',
  pending_verification: 'info',
  verified: 'success',
  rejected: 'error'
};

const OnboardingPage = () => {
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getOnboardingStatus();
      setOnboarding(response.onboarding);
    } catch (err) {
      setError(err.message || 'Failed to fetch onboarding status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleFileChange = async (event, docKey) => {
    if (!event.target.files?.length) return;
    const file = event.target.files[0];

    const formData = new FormData();
    formData.append(docKey, file);

    try {
      setUploading(true);
      setError('');
      setSuccessMessage('');
      const response = await employeeAPI.uploadOnboardingDocuments(formData);
      setOnboarding(response.onboarding);
      setSuccessMessage(`${REQUIRED_DOCS.find((doc) => doc.key === docKey)?.label || 'Document'} uploaded successfully`);
    } catch (err) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const allDocumentsUploaded = useMemo(() => {
    if (!onboarding) return false;
    return REQUIRED_DOCS.every((doc) => onboarding.employeeDocuments?.[doc.key]);
  }, [onboarding]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !onboarding) {
    return (
      <Alert severity="error">
        {error}
        <Button onClick={fetchStatus} sx={{ ml: 2 }} variant="outlined" size="small">
          Retry
        </Button>
      </Alert>
    );
  }

  const status = onboarding?.status || 'pending_documents';
  const statusLabel = STATUS_LABELS[status] || status;
  const statusColor = STATUS_COLORS[status] || 'info';

  const renderStatusIcon = () => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon color="success" sx={{ fontSize: 48 }} />;
      case 'pending_verification':
        return <HourglassBottomIcon color="info" sx={{ fontSize: 48 }} />;
      case 'rejected':
        return <BlockIcon color="error" sx={{ fontSize: 48 }} />;
      default:
        return <CloudUploadIcon color="warning" sx={{ fontSize: 48 }} />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Employee Onboarding
      </Typography>

      {error && (
        <Box mb={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {successMessage && (
        <Box mb={2}>
          <Alert severity="success">{successMessage}</Alert>
        </Box>
      )}

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2} alignItems="center">
          {renderStatusIcon()}
          <Chip label={statusLabel} color={statusColor} sx={{ fontSize: '1rem', px: 2 }} />
          <Typography variant="body1" align="center">
            {status === 'verified' && 'Your onboarding is complete. You now have full access.'}
            {status === 'pending_verification' && 'HR is reviewing your documents. Please wait for verification.'}
            {status === 'rejected' && (onboarding?.hrVerification?.remarks || 'Your onboarding was rejected. Please contact HR for details.')}
            {status === 'pending_documents' && 'Please upload the required documents to proceed with onboarding.'}
          </Typography>
        </Stack>
      </Paper>

      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Required Documents
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3}>
          {REQUIRED_DOCS.map((doc) => {
            const uploadedDoc = onboarding?.employeeDocuments?.[doc.key];
            return (
              <Grid item xs={12} md={4} key={doc.key}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Stack spacing={2}>
                    <Typography variant="subtitle1">{doc.label}</Typography>
                    <Box>
                      {uploadedDoc ? (
                        <Stack spacing={1}>
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
                            View Document
                          </Button>
                        </Stack>
                      ) : (
                        <Chip label="Not uploaded" color="warning" size="small" />
                      )}
                    </Box>

                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                      disabled={uploading || status === 'verified'}
                    >
                      {uploadedDoc ? 'Replace' : 'Upload'}
                      <input
                        type="file"
                        hidden
                        accept="image/*,.pdf,.jpeg,.png,.jpg"
                        onChange={(event) => handleFileChange(event, doc.key)}
                      />
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        <Box mt={3}>
          <Alert severity={allDocumentsUploaded ? 'success' : 'info'}>
            {allDocumentsUploaded
              ? 'All documents uploaded. Waiting for HR verification.'
              : 'Please ensure all required documents are uploaded to proceed.'}
          </Alert>
        </Box>
      </Paper>
    </Box>
  );
};

export default OnboardingPage;
