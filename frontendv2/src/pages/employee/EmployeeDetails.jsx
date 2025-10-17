import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Paper, Grid, List, ListItem, ListItemText, CircularProgress, Alert, Button } from '@mui/material';
import { employeeAPI, hrAPI, publicAPI, subscribeToEvents } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useParams } from 'react-router-dom';

const Field = ({ label, value }) => (
  <ListItem dense disableGutters>
    <ListItemText primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }} primary={label} secondary={value || '—'} />
  </ListItem>
);

export default function EmployeeDetails() {
  const { user } = useAuth();
  const { id: routeUserId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [details, setDetails] = useState(null);
  const [listLoading, setListLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [selected, setSelected] = useState(null);
  const role = useMemo(() => (user?.role || '').toLowerCase(), [user?.role]);
  const canEdit = role === 'admin' || role === 'hr';

  const formatTs = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    if (isNaN(d)) return '—';
    return d.toLocaleString();
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        let res;
        if (routeUserId) {
          res = await hrAPI.getOnboardingDetails(routeUserId);
        } else {
          // HR/Admin route without :id should not call employee self API
          if (role === 'admin' || role === 'hr') {
            setLoading(false);
            return; // HR/Admin list handled by another effect
          } else {
            res = await employeeAPI.getOnboardingStatus();
          }
        }
        if (!mounted) return;
        setDetails(res?.data || res || null);
      } catch {
        if (!mounted) return;
        setError('Failed to load employee details');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    setLoading(true);
    load();
    // Polling fallback every 60s
    const intervalId = setInterval(load, 60000);
    return () => { mounted = false; clearInterval(intervalId); };
  }, [routeUserId, user?._id, role]);

  // HR/Admin list for public onboarding submissions at /hr/employee/details
  useEffect(() => {
    if (!(!routeUserId && (role === 'admin' || role === 'hr'))) return;
    let mounted = true;
    const loadList = async () => {
      try {
        setListLoading(true);
        const res = await publicAPI.listPublicOnboarding();
        if (!mounted) return;
        const rows = res?.onboarding || res?.data || res?.items || [];
        setSubmissions(Array.isArray(rows) ? rows : []);
      } catch {
        if (!mounted) return;
      } finally {
        if (mounted) setListLoading(false);
      }
    };
    loadList();
    const id = setInterval(loadList, 60000);
    return () => { mounted = false; clearInterval(id); };
  }, [routeUserId, role]);

  // Realtime: refresh when onboarding data changes for this user or list
  useEffect(() => {
    const targetUserId = routeUserId || user?._id;
    if (!targetUserId && !(!routeUserId && (role === 'admin' || role === 'hr'))) return;
    const unsubscribe = subscribeToEvents(
      { userId: targetUserId },
      (msg) => {
        const t = msg?.type || '';
        if (
          t.startsWith('onboarding.') ||
          t.includes('employee') ||
          t.includes('onboarding')
        ) {
          if (!routeUserId && (role === 'admin' || role === 'hr')) {
            publicAPI.listPublicOnboarding()
              .then((res) => {
                const rows = res?.onboarding || res?.data || res?.items || [];
                setSubmissions(Array.isArray(rows) ? rows : []);
              })
              .catch(() => {});
          } else if (routeUserId) {
            hrAPI.getOnboardingDetails(routeUserId)
              .then((res) => setDetails(res?.data || res || null))
              .catch(() => {});
          } else {
            // Self view: refresh from employee API
            employeeAPI.getOnboardingStatus()
              .then((res) => setDetails(res?.data || res || null))
              .catch(() => {});
          }
        }
      }
    );
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, [routeUserId, user?._id, role]);

  // If HR/Admin on /hr/employee/details (no :id), render public onboarding list
  if (!routeUserId && (role === 'admin' || role === 'hr')) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Employee Onboarding Submissions</Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          {listLoading ? (
            <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : submissions.length === 0 ? (
            <Typography variant="body2">No submissions found.</Typography>
          ) : (
            <List dense>
              {submissions.map((item, idx) => (
                <ListItem key={item?._id || idx} secondaryAction={
                  <Button size="small" variant="contained" onClick={() => setSelected(item)}>View Details</Button>
                }>
                  <ListItemText primary={item.fullName || item.email || `Submission ${idx+1}`} secondary={[item.email, item.status].filter(Boolean).join(' • ')} />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
        {selected && (
          <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Submission Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <List dense>
                  <Field label="Full Name" value={selected.fullName} />
                  <Field label="Email" value={selected.email} />
                  <Field label="Mobile" value={selected.mobile} />
                  <Field label="Address" value={selected.address} />
                  <Field label="Status" value={selected.status} />
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <List dense>
                  {(() => {
                    const docs = selected?.employeeDocuments || {};
                    const entries = [
                      ['aadhar', 'Aadhar'],
                      ['photo', 'Photo'],
                      ['passbook', 'Passbook'],
                      ['tenth', '10th'],
                      ['twelfth', '12th'],
                      ['diploma', 'Diploma'],
                    ];
                    return entries.map(([k, label]) => {
                      const meta = docs?.[k] || {};
                      const url = meta.url;
                      const ts = meta.updatedAt || meta.uploadedAt || meta.createdAt;
                      const uploaded = Boolean(url);
                      return (
                        <ListItem key={k} dense disableGutters>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 1, flexWrap: 'wrap' }}>
                            <ListItemText
                              primary={label}
                              secondary={uploaded ? `Uploaded • Updated: ${formatTs(ts)}` : '—'}
                              sx={{ mr: 2 }}
                            />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button size="small" variant="outlined" component={uploaded ? 'a' : 'button'} href={uploaded ? url : undefined} target={uploaded ? '_blank' : undefined} rel={uploaded ? 'noopener noreferrer' : undefined} disabled={!uploaded}>Open</Button>
                              {canEdit && (
                                <label>
                                  <input type="file" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) { /* placeholder hook for edit in HR view if needed */ } e.target.value=''; }} />
                                  <Button component="span" size="small" variant="contained">Edit</Button>
                                </label>
                              )}
                            </Box>
                          </Box>
                        </ListItem>
                      );
                    });
                  })()}
                </List>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const basic = details?.basic || details?.onboarding || details || {};
  const contact = details?.contact || basic?.contact || {};
  const address = details?.address || basic?.address || {};
  const arrayDocs = details?.documents || basic?.documents || [];
  const mapDocs = (details?.employeeDocuments || details?.onboarding?.employeeDocuments || {}) || {};
  const mapDocEntries = Object.entries(mapDocs).map(([key, val]) => ({ name: key, type: key, url: val?.url, status: val?.status, fileName: val?.fileName, description: val?.description }));
  const docs = [...arrayDocs, ...mapDocEntries];

  const onboardingRaw = details?.onboarding || {};
  const shownKeys = new Set(['fullName','firstName','lastName','email','phone','mobile','dob','gender','department','role']);
  const onboardingDetails = Object.entries(onboardingRaw)
    .filter(([k, v]) => !shownKeys.has(k) && v !== null && v !== undefined && typeof v !== 'object')
    .map(([k, v]) => ({ label: k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()), value: String(v) }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Employee Details</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Basic Information</Typography>
            <List dense>
              <Field label="Full Name" value={basic.fullName || `${basic.firstName || ''} ${basic.lastName || ''}`.trim()} />
              <Field label="Email" value={basic.email} />
              <Field label="Phone" value={basic.phone || contact.phone || basic.mobile} />
              <Field label="Date of Birth" value={basic.dob} />
              <Field label="Gender" value={basic.gender} />
              <Field label="Department" value={basic.department} />
              <Field label="Role" value={basic.role} />
            </List>
          </Paper>
        </Grid>
        {onboardingDetails.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Onboarding Details</Typography>
              <List dense>
                {onboardingDetails.map((item, idx) => (
                  <Field key={idx} label={item.label} value={item.value} />
                ))}
              </List>
            </Paper>
          </Grid>
        )}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Address</Typography>
            <List dense>
              <Field label="Line 1" value={address.line1} />
              <Field label="Line 2" value={address.line2} />
              <Field label="City" value={address.city} />
              <Field label="State" value={address.state} />
              <Field label="Postal Code" value={address.postalCode || address.zip} />
              <Field label="Country" value={address.country} />
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Emergency Contact</Typography>
            <List dense>
              <Field label="Name" value={contact.emergencyName || contact.emergencyContactName} />
              <Field label="Relationship" value={contact.emergencyRelation || contact.emergencyRelationship} />
              <Field label="Phone" value={contact.emergencyPhone || contact.emergencyContactPhone} />
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Documents</Typography>
            {Array.isArray(docs) && docs.length > 0 ? (
              <List dense>
                {docs.map((d, idx) => {
                  const url = d?.url || d?.link || d?.fileUrl;
                  const title = d?.name || d?.type || `Document ${idx + 1}`;
                  const ts = d?.updatedAt || d?.uploadedAt || d?.createdAt;
                  const subtitleParts = [d?.status || d?.description || d?.fileName];
                  if (ts) subtitleParts.push(`Updated: ${formatTs(ts)}`);
                  const subtitle = subtitleParts.filter(Boolean).join(' • ');
                  return (
                    <ListItem key={idx} dense disableGutters>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 1, flexWrap: 'wrap' }}>
                        <ListItemText primary={title} secondary={subtitle} sx={{ mr: 2 }} />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" variant="outlined" component={url ? 'a' : 'button'} href={url || undefined} target={url ? '_blank' : undefined} rel={url ? 'noopener noreferrer' : undefined} disabled={!url}>Open</Button>
                          {canEdit && (
                            <label>
                              <input type="file" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) { /* upload via API if needed */ } e.target.value=''; }} />
                              <Button component="span" size="small" variant="contained">Edit</Button>
                            </label>
                          )}
                        </Box>
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              <Typography variant="body2">No documents available</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

    </Box>
  );
}
