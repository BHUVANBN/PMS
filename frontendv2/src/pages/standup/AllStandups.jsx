import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Pagination,
  CircularProgress
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { standupAPI } from '../../services/api';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

const truncate = (s, n = 80) => {
  if (!s) return '-';
  return s.length > n ? s.slice(0, n) + '…' : s;
};

export default function AllStandups() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [q, setQ] = useState('');
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);

  // Comment dialog
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selected, setSelected] = useState(null);
  const [commentSaving, setCommentSaving] = useState(false);

  // Upload dialog
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadSaving, setUploadSaving] = useState(false);

  const fetchList = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page, limit };
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (q) params.q = q;
      if (from) params.from = from.toISOString();
      if (to) params.to = to.toISOString();
      const res = await standupAPI.list(params);
      const items = res?.items || res?.data?.items || [];
      setRows(Array.isArray(items) ? items : []);
      setTotal(res?.total || res?.data?.total || items.length || 0);
    } catch (e) {
      setError(e.message || 'Failed to load standups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchList();
  };

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
      fetchList();
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
      fetchList();
    } catch (e) {
      setError(e.message || 'Failed to upload attachment');
    } finally {
      setUploadSaving(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>All Standups</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <FormControl sx={{ minWidth: 160 }} size="small">
              <InputLabel id="status-filter">Status</InputLabel>
              <Select labelId="status-filter" label="Status" value={status} onChange={(e)=>setStatus(e.target.value)}>
                <MenuItem value=""><em>Any</em></MenuItem>
                <MenuItem value="Delayed">Delayed</MenuItem>
                <MenuItem value="On Track">On Track</MenuItem>
                <MenuItem value="Under Review">Under Review</MenuItem>
                <MenuItem value="Done">Done</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 160 }} size="small">
              <InputLabel id="priority-filter">Priority</InputLabel>
              <Select labelId="priority-filter" label="Priority" value={priority} onChange={(e)=>setPriority(e.target.value)}>
                <MenuItem value=""><em>Any</em></MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>

            <DatePicker label="From" value={from} onChange={(v)=>setFrom(v)} slotProps={{ textField: { size: 'small' } }} />
            <DatePicker label="To" value={to} onChange={(v)=>setTo(v)} slotProps={{ textField: { size: 'small' } }} />

            <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1, flex: 1 }}>
              <TextField size="small" fullWidth placeholder="Search (name, tasks, blockers, next steps)" value={q} onChange={(e)=>setQ(e.target.value)} />
              <Button type="submit" variant="contained">Apply</Button>
            </Box>
          </Stack>
        </LocalizationProvider>
      </Paper>

      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ p: 2 }}>{error}</Typography>
        ) : (
          <>
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
                      <TableCell>
                        {r.status ? <Chip label={r.status} size="small" color="primary" variant="outlined" /> : '-'}
                      </TableCell>
                      <TableCell>
                        {r.priority ? <Chip label={r.priority} size="small" variant="outlined" /> : '-'}
                      </TableCell>
                      <TableCell>{typeof r.working_hours === 'number' ? r.working_hours : '-'}</TableCell>
                      <TableCell title={r.tasks_done || ''}>{truncate(r.tasks_done, 60)}</TableCell>
                      <TableCell title={r.progress || ''}>{truncate(r.progress, 40)}</TableCell>
                      <TableCell title={r.links || ''}>{truncate(r.links, 30)}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button size="small" variant="outlined" onClick={() => openComment(r)}>Comment</Button>
                          <Button size="small" variant="text" onClick={() => openUpload(r)}>Upload</Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No results</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="page-size">Rows</InputLabel>
                <Select labelId="page-size" label="Rows" value={limit} onChange={(e)=>{ setLimit(e.target.value); setPage(1); }}>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
              <Pagination
                count={Math.max(1, Math.ceil(total / limit))}
                page={page}
                onChange={(_, p)=>setPage(p)}
                color="primary"
              />
            </Stack>
          </>
        )}
      </Paper>

      {/* Comment dialog */}
      <Dialog open={commentOpen} onClose={() => setCommentOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Comment"
            value={commentText}
            onChange={(e)=>setCommentText(e.target.value)}
            fullWidth
            multiline
            minRows={3}
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
