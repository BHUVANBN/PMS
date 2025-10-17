import React, { useEffect, useState } from 'react';
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
  Chip,
  Button,
  CircularProgress,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { standupAPI } from '../../services/api';

const truncate = (s, n = 80) => {
  if (!s) return '-';
  return s.length > n ? s.slice(0, n) + '…' : s;
};

export default function ManagerStandups() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);

  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selected, setSelected] = useState(null);
  const [commentSaving, setCommentSaving] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadSaving, setUploadSaving] = useState(false);

  const fetchToday = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await standupAPI.todayAll();
      const items = res?.items || res?.data?.items || [];
      setRows(Array.isArray(items) ? items : []);
    } catch (e) {
      setError(e.message || 'Failed to load today\'s standups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchToday(); }, []);

  const openComment = (row) => {
    setSelected(row);
    setCommentText('');
    setCommentOpen(true);
  };

  const saveComment = async () => {
    if (!selected?._id || !commentText.trim()) return;
    try {
      setCommentSaving(true);
      await standupAPI.addComment(selected._id, commentText.trim());
      setCommentOpen(false);
      fetchToday();
    } catch (e) {
      setError(e.message || 'Failed to add comment');
    } finally {
      setCommentSaving(false);
    }
  };

  const openUpload = (row) => {
    setSelected(row);
    setUploadFile(null);
    setUploadOpen(true);
  };

  const saveUpload = async () => {
    if (!selected?._id || !uploadFile) return;
    try {
      setUploadSaving(true);
      await standupAPI.addAttachment(selected._id, { file: uploadFile, name: uploadFile.name });
      setUploadOpen(false);
      fetchToday();
    } catch (e) {
      setError(e.message || 'Failed to upload attachment');
    } finally {
      setUploadSaving(false);
    }
  };

  const downloadSummary = async () => {
    try {
      const today = new Date();
      const start = new Date(today); start.setHours(0,0,0,0);
      const end = new Date(today); end.setHours(23,59,59,999);
      const res = await standupAPI.summary({ from: start.toISOString(), to: end.toISOString() });
      const { summary } = res?.data || res || {};
      const csv = [
        'Metric,Value',
        `Total,${summary?.total ?? 0}`,
        `TotalHours,${summary?.totalHours ?? 0}`,
        ...Object.entries(summary?.byStatus || {}).map(([k,v]) => `Status:${k},${v}`),
        ...Object.entries(summary?.byPriority || {}).map(([k,v]) => `Priority:${k},${v}`),
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'standup-summary-today.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message || 'Failed to download summary');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Today\'s Standups</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={fetchToday} disabled={loading}>Refresh</Button>
          <Button variant="contained" onClick={downloadSummary}>Download Summary</Button>
        </Stack>
      </Stack>

      {error && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Hours</TableCell>
                  <TableCell>Tasks</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Links</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r._id} hover>
                    <TableCell>{new Date(r.dateTime || r.date).toLocaleString()}</TableCell>
                    <TableCell>{r.name || '-'}</TableCell>
                    <TableCell>{r.status ? <Chip label={r.status} size="small" color="primary" variant="outlined" /> : '-'}</TableCell>
                    <TableCell>{r.priority ? <Chip label={r.priority} size="small" variant="outlined" /> : '-'}</TableCell>
                    <TableCell>{typeof r.working_hours === 'number' ? r.working_hours : '-'}</TableCell>
                    <TableCell title={r.tasks_done || ''}>{truncate(r.tasks_done, 60)}</TableCell>
                    <TableCell title={r.progress || ''}>{truncate(r.progress, 40)}</TableCell>
                    <TableCell title={r.links || ''}>{truncate(r.links, 30)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" variant="outlined" onClick={() => openComment(r)}>Review</Button>
                        <Button size="small" variant="text" onClick={() => openUpload(r)}>Upload</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No standups for today</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Comment dialog */}
      <Dialog open={commentOpen} onClose={() => setCommentOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Review</DialogTitle>
        <DialogContent dividers>
          <textarea
            value={commentText}
            onChange={(e)=>setCommentText(e.target.value)}
            rows={4}
            style={{ width: '100%', resize: 'vertical' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentOpen(false)} disabled={commentSaving}>Cancel</Button>
          <Button variant="contained" onClick={saveComment} disabled={commentSaving || !commentText.trim()}>
            {commentSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Attachment</DialogTitle>
        <DialogContent dividers>
          <Button variant="outlined" component="label">
            Choose File
            <input type="file" hidden onChange={(e)=>setUploadFile(e.target.files?.[0] || null)} />
          </Button>
          <Typography variant="body2" sx={{ ml: 2, display: 'inline-block' }}>{uploadFile?.name || 'No file selected'}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadOpen(false)} disabled={uploadSaving}>Cancel</Button>
          <Button variant="contained" onClick={saveUpload} disabled={uploadSaving || !uploadFile}>
            {uploadSaving ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
