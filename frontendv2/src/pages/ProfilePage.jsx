import React, { useEffect, useMemo, useState } from 'react';
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
import { employeeAPI, hrAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PDFPreview = ({ url, label }) => {
  const [src, setSrc] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl = '';
    const load = async () => {
      try {
        setError(false);
        setSrc('');
        const isExternal = /^https?:\/\//i.test(url) && !url.includes('/api/');
        if (isExternal) {
          // Direct external URL (e.g., Cloudinary) - avoid fetch+blob to bypass CORS
          setSrc(url);
          return;
        }
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!response.ok) throw new Error('Failed to fetch PDF');
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      } catch {
        setError(true);
      }
    };
    load();
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
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

const ProfilePage = () => {
  const { user } = useAuth();
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [docsOpen, setDocsOpen] = useState(false);
  const [modalFilter, setModalFilter] = useState({ type: 'all', key: null });

  const openWithAuth = async (url) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error('Failed to fetch file');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank', 'noopener,noreferrer');
      // Revoke after a delay to allow the new window to read it
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (e) {
      // Optional: surface error somewhere
      console.error('Open with auth failed:', e?.message || e);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await employeeAPI.getOnboardingStatus();
        setOnboarding(response?.onboarding || null);
      } catch (e) {
        setOnboarding(null);
        setError(e?.message || 'Failed to load profile information');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const employeeDetailsEntries = useMemo(() => {
    const details = onboarding?.employeeDetails || {};
    const formatDate = (value) => {
      const date = value ? new Date(value) : null;
      return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : '';
    };
    return [
      ['Address', details.address],
      ['Mobile', details.mobile],
      ['Date of Birth', formatDate(details.dateOfBirth)],
      ['PAN', details.pan],
      ['Emergency Contact Name', details.emergencyContactName],
      ['Emergency Contact Phone', details.emergencyContactPhone],
      ['Bank Account Number', details.bankAccountNumber],
      ['IFSC', details.ifsc],
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
        return { key, label, hasDoc: false };
      }
      const userId = user?._id;
      const previewUrl = userId ? hrAPI.getOnboardingDocumentUrl(userId, 'employee', key) : doc.url;
      const downloadUrl = userId ? hrAPI.getOnboardingDocumentUrl(userId, 'employee', key, { download: 1 }) : doc.url;
      const isPdf = doc.url.toLowerCase().includes('.pdf');
      return {
        key,
        label,
        hasDoc: true,
        previewUrl,
        downloadUrl,
        isPdf,
        uploadedAt: doc.uploadedAt || '',
      };
    });
  }, [onboarding]);

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
        return { key, label, hasDoc: false };
      }
      const userId = user?._id;
      const previewUrl = userId ? hrAPI.getOnboardingDocumentUrl(userId, 'hr', key) : doc.url;
      const downloadUrl = userId ? hrAPI.getOnboardingDocumentUrl(userId, 'hr', key, { download: 1 }) : doc.url;
      const isPdf = true; // HR docs are PDFs
      return {
        key,
        label,
        hasDoc: true,
        previewUrl,
        downloadUrl,
        isPdf,
        uploadedAt: doc.uploadedAt || '',
      };
    });
  }, [onboarding, user?._id]);

  const genericDocs = useMemo(() => {
    if (!Array.isArray(onboarding?.hrDocumentsList)) return [];
    return onboarding.hrDocumentsList.map((doc) => {
      if (!doc?.file?.url) {
        return { ...doc, hasDoc: false };
      }
      const userId = user?._id;
      const previewUrl = userId ? hrAPI.getOnboardingDocumentUrl(userId, 'generic', doc._id) : doc.file.url;
      const downloadUrl = userId ? hrAPI.getOnboardingDocumentUrl(userId, 'generic', doc._id, { download: 1 }) : doc.file.url;
      const lower = (doc.file.url || '').toLowerCase();
      const isPdf = /\.pdf(?:\?|$)/.test(lower) || /\/raw\//.test(lower);
      return {
        ...doc,
        hasDoc: true,
        previewUrl,
        downloadUrl,
        isPdf,
      };
    });
  }, [onboarding, user?._id]);

  const hasDocuments = employeeDocEntries.some((d) => d.hasDoc) || hrDocEntries.some((d) => d.hasDoc) || genericDocs.some((d) => d?.hasDoc);

  const modalEntries = useMemo(() => {
    const list = [];
    employeeDocEntries.forEach((doc) => {
      if (!doc.hasDoc) return;
      list.push({
        id: `employee-${doc.key}`,
        type: 'employee',
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
        id: `hr-${doc.key}`,
        type: 'hr',
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
        id: `generic-${doc._id}`,
        type: 'generic',
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>My Profile</Typography>

      {loading && (
        <Box py={4} display="flex" justifyContent="center"><CircularProgress /></Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {!loading && !error && (
        <Stack spacing={3}>
          {/* Basic User Information */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Basic Information</Typography>
            <Stack spacing={1.5}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Full Name</Typography>
                <Typography>{user?.firstName || ''} {user?.lastName || ''}</Typography>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography>{user?.email || ''}</Typography>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Role</Typography>
                <Typography>{user?.role || ''}</Typography>
              </Stack>
            </Stack>
          </Paper>

          {/* Onboarding Information */}
          {onboarding && (
            <>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Onboarding Information</Typography>
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
            </>
          )}

          {!onboarding && !loading && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">No onboarding information available.</Typography>
            </Paper>
          )}
        </Stack>
      )}

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
                <Button onClick={() => openWithAuth(entry.downloadUrl)} sx={{ mt: 1 }} size="small">Open in New Tab</Button>
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

export default ProfilePage;
