import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import EmployeeForm from './EmployeeForm';
import { hrAPI } from '../../services/api';

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
          throw new Error('Failed to fetch PDF');
        }
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      } catch {
        setError(true);
      }
    };
    fetchPdf();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  if (error) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
        <Typography variant="body2" color="error">Failed to preview {label}</Typography>
      </Box>
    );
  }

  if (!src) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <iframe title={label} src={src} style={{ width: '100%', height: '100%', border: 'none' }} />
  );
};

const EmployeeEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [docsOpen, setDocsOpen] = useState(false);
  const [modalFilter, setModalFilter] = useState({ type: 'all', key: null });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await hrAPI.getOnboardingDetails(id);
        setOnboarding(response?.onboarding || null);
      } catch (e) {
        setOnboarding(null);
        setError(e?.message || 'Failed to load onboarding details');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      load();
    }
  }, [id]);

  const employeeDetailsEntries = useMemo(() => {
    const details = onboarding?.employeeDetails || {};
    const formatDate = (value) => {
      const date = value ? new Date(value) : null;
      return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : '';
    };
    return [
      ['Status', onboarding?.status ? onboarding.status.replace(/_/g, ' ') : ''],
      ['Address', details.address],
      ['Mobile', details.mobile],
      ['Date of Birth', formatDate(details.dateOfBirth)],
      ['PAN', details.pan],
      ['Emergency Contact Name', details.emergencyContactName],
      ['Emergency Contact Phone', details.emergencyContactPhone],
      ['Bank Account Number', details.bankAccountNumber],
      ['IFSC', details.ifsc],
      ['Onboarding Updated', formatDate(onboarding?.updatedAt)],
    ];
  }, [onboarding]);

  const employeeDocEntries = useMemo(() => {
    if (!onboarding?.employeeDocuments) return [];
    const order = [
      ['aadhar', 'Aadhar Card'],
      ['photo', 'Passport-size Photo'],
      ['passbook', 'Passbook Photo'],
      ['tenth', '10th Marks Card'],
      ['twelfth', '12th Marks Card'],
      ['diploma', 'Diploma Certificate'],
    ];
    return order.map(([key, label]) => {
      const doc = onboarding.employeeDocuments?.[key] || null;
      if (!doc?.url) {
        return { key, label, hasDoc: false, type: 'employee' };
      }
      const previewUrl = hrAPI.getOnboardingDocumentUrl(id, 'employee', key);
      const downloadUrl = hrAPI.getOnboardingDocumentUrl(id, 'employee', key, { download: 1 });
      const isPdf = doc.url.toLowerCase().includes('.pdf');
      return {
        id: `employee-${key}`,
        type: 'employee',
        key,
        label,
        hasDoc: true,
        previewUrl,
        downloadUrl,
        isPdf,
        uploadedAt: doc.uploadedAt || '',
      };
    });
  }, [id, onboarding]);

  const hrDocEntries = useMemo(() => {
    if (!onboarding?.hrDocuments) return [];
    const order = [
      ['codeOfConduct', 'Code of Conduct'],
      ['nda', 'Non-Disclosure Agreement'],
      ['employmentAgreement', 'Employment Agreement'],
    ];
    return order.map(([key, label]) => {
      const doc = onboarding.hrDocuments?.[key] || null;
      if (!doc?.url) {
        return { key, label, hasDoc: false, type: 'hr' };
      }
      const previewUrl = hrAPI.getOnboardingDocumentUrl(id, 'hr', key);
      const downloadUrl = hrAPI.getOnboardingDocumentUrl(id, 'hr', key, { download: 1 });
      const isPdf = doc.url.toLowerCase().includes('.pdf');
      return {
        id: `hr-${key}`,
        type: 'hr',
        key,
        label,
        hasDoc: true,
        previewUrl,
        downloadUrl,
        isPdf,
        uploadedAt: doc.uploadedAt || '',
      };
    });
  }, [id, onboarding]);

  const genericDocs = useMemo(() => {
    if (!Array.isArray(onboarding?.hrDocumentsList)) return [];
    return onboarding.hrDocumentsList.map((doc) => {
      if (!doc?.file?.url) {
        return { ...doc, hasDoc: false, type: 'generic', id: `generic-${doc._id}` };
      }
      const previewUrl = hrAPI.getOnboardingDocumentUrl(id, 'generic', doc._id);
      const downloadUrl = hrAPI.getOnboardingDocumentUrl(id, 'generic', doc._id, { download: 1 });
      const isPdf = doc.file.url.toLowerCase().includes('.pdf');
      return {
        ...doc,
        id: `generic-${doc._id}`,
        type: 'generic',
        hasDoc: true,
        previewUrl,
        downloadUrl,
        isPdf,
      };
    });
  }, [id, onboarding]);

  const hasDocuments = employeeDocEntries.some((d) => d.hasDoc) || hrDocEntries.some((d) => d.hasDoc) || genericDocs.some((d) => d?.hasDoc);

  const modalEntries = useMemo(() => {
    const list = [];
    employeeDocEntries.forEach((doc) => {
      if (!doc.hasDoc) return;
      list.push({
        id: doc.id,
        type: doc.type,
        key: doc.key,
        label: doc.label,
        previewUrl: doc.previewUrl,
        downloadUrl: doc.downloadUrl,
        isPdf: doc.isPdf,
      });
    });
    hrDocEntries.forEach((doc) => {
      if (!doc.hasDoc) return;
      list.push({
        id: doc.id,
        type: doc.type,
        key: doc.key,
        label: doc.label,
        previewUrl: doc.previewUrl,
        downloadUrl: doc.downloadUrl,
        isPdf: doc.isPdf,
      });
    });
    genericDocs.forEach((doc) => {
      if (!doc.hasDoc) return;
      list.push({
        id: doc.id,
        type: doc.type,
        key: doc._id,
        label: doc.name || 'Document',
        previewUrl: doc.previewUrl,
        downloadUrl: doc.downloadUrl,
        isPdf: doc.isPdf,
      });
    });
    return list;
  }, [employeeDocEntries, hrDocEntries, genericDocs]);

  const modalEntriesFiltered = useMemo(() => {
    if (modalFilter.type === 'all') {
      return modalEntries;
    }
    return modalEntries.filter((entry) => {
      if (entry.type !== modalFilter.type) return false;
      if (modalFilter.key) {
        return entry.key === modalFilter.key;
      }
      return true;
    });
  }, [modalEntries, modalFilter]);

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>Edit Employee</Typography>
      <EmployeeForm
        mode="edit"
        employeeId={id}
        onCancel={() => navigate('/hr/employees')}
        onSuccess={() => navigate('/hr/employees')}
      />

      <Box mt={4}>
        <Typography variant="h5" gutterBottom>Onboarding Information</Typography>
        {loading && (
          <Box py={4} display="flex" justifyContent="center"><CircularProgress /></Box>
        )}
        {!loading && error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        {!loading && !error && onboarding && (
          <Stack spacing={3}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Employee Details</Typography>
              <Stack spacing={1.5}>
                {employeeDetailsEntries.map(([label, value]) => (
                  <Stack key={label} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography>{value || '-'}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                <Box>
                  <Typography variant="h6">Documents</Typography>
                  <Typography variant="body2" color="text.secondary">View and download all files submitted during onboarding.</Typography>
                </Box>
                <Button
                  variant="contained"
                  disabled={!hasDocuments}
                  onClick={() => {
                    setModalFilter({ type: 'all' });
                    setDocsOpen(true);
                  }}
                >
                  See Documents
                </Button>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1.5}>
                {employeeDocEntries.map((doc) => (
                  <Stack key={doc.key} direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2}>
                    <Stack spacing={0.5}>
                      <Typography fontWeight={600}>{doc.label}</Typography>
                      {doc.uploadedAt && (
                        <Typography variant="caption" color="text.secondary">{new Date(doc.uploadedAt).toLocaleString()}</Typography>
                      )}
                      {!doc.hasDoc && (
                        <Typography variant="body2" color="text.secondary">Document not uploaded.</Typography>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={!doc.hasDoc}
                        onClick={() => {
                          if (!doc.hasDoc) return;
                          setModalFilter({ type: 'employee', key: doc.key });
                          setDocsOpen(true);
                        }}
                      >
                        Preview
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={!doc.hasDoc}
                        component="a"
                        href={doc.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </Button>
                    </Stack>
                  </Stack>
                ))}

                {hrDocEntries.length > 0 && <Divider />}
                {hrDocEntries.map((doc) => (
                  <Stack key={doc.key} direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2}>
                    <Stack spacing={0.5}>
                      <Typography fontWeight={600}>{doc.label}</Typography>
                      {doc.uploadedAt && (
                        <Typography variant="caption" color="text.secondary">{new Date(doc.uploadedAt).toLocaleString()}</Typography>
                      )}
                      {!doc.hasDoc && (
                        <Typography variant="body2" color="text.secondary">Document not uploaded.</Typography>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={!doc.hasDoc}
                        onClick={() => {
                          if (!doc.hasDoc) return;
                          setModalFilter({ type: 'hr', key: doc.key });
                          setDocsOpen(true);
                        }}
                      >
                        Preview
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={!doc.hasDoc}
                        component="a"
                        href={doc.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </Button>
                    </Stack>
                  </Stack>
                ))}

                {genericDocs.length > 0 && <Divider />}
                {genericDocs.map((doc) => (
                  <Stack key={doc._id} direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2}>
                    <Stack spacing={0.5}>
                      <Typography fontWeight={600}>{doc.name || 'Document'}</Typography>
                      {doc.description && <Typography variant="body2" color="text.secondary">{doc.description}</Typography>}
                      {doc.file?.uploadedAt && (
                        <Typography variant="caption" color="text.secondary">{new Date(doc.file.uploadedAt).toLocaleString()}</Typography>
                      )}
                      {!doc.hasDoc && (
                        <Typography variant="body2" color="text.secondary">Document not uploaded.</Typography>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={!doc.hasDoc}
                        onClick={() => {
                          if (!doc.hasDoc) return;
                          setModalFilter({ type: 'generic', key: doc._id });
                          setDocsOpen(true);
                        }}
                      >
                        Preview
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={!doc.hasDoc}
                        component="a"
                        href={doc.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </Button>
                    </Stack>
                  </Stack>
                ))}

                {!hasDocuments && (
                  <Typography variant="body2" color="text.secondary">No documents uploaded.</Typography>
                )}
              </Stack>
            </Paper>
          </Stack>
        )}
      </Box>

      <Dialog open={docsOpen} onClose={() => setDocsOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Onboarding Documents</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            {modalEntriesFiltered.map((entry) => (
              <Box key={entry.id}>
                <Typography variant="subtitle1" gutterBottom>{entry.label}</Typography>
                <Box sx={{ border: '1px solid #ddd', borderRadius: 1, height: 500 }}>
                  {entry.isPdf ? (
                    <PDFPreview url={entry.previewUrl} label={entry.label} />
                  ) : (
                    <img src={entry.previewUrl} alt={entry.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  )}
                </Box>
                <Button href={entry.downloadUrl} target="_blank" rel="noopener noreferrer" sx={{ mt: 1 }} size="small">Open in New Tab</Button>
              </Box>
            ))}
            {modalEntriesFiltered.length === 0 && (
              <Typography variant="body2" color="text.secondary">No documents available.</Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeEdit;
