import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Select, InputLabel, FormControl, TextField, Stack, Alert } from '@mui/material';
import { kanbanAPI } from '../../services/api';

const ColumnSettingsModal = ({ open, onClose, boardId, onUpdated }) => {
  const [board, setBoard] = useState(null);
  const [columnId, setColumnId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [wipLimit, setWipLimit] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBoard = async () => {
      if (!boardId) return;
      setError(null);
      try {
        const res = await kanbanAPI.getBoard(boardId);
        const data = res?.data || res?.board || res || null;
        setBoard(data);
        if (data?.columns?.[0]?._id || data?.columns?.[0]?.id) {
          const first = data.columns[0];
          setColumnId(first._id || first.id);
          setName(first.name || first.title || '');
          setDescription(first.description || '');
          setWipLimit(first.wipLimit ?? '');
        }
      } catch (e) {
        setError(e.message || 'Failed to load board');
      }
    };
    if (open) loadBoard();
  }, [open, boardId]);

  useEffect(() => {
    if (!board || !columnId) return;
    const col = board.columns.find(c => (c._id || c.id) === columnId);
    if (!col) return;
    setName(col.name || col.title || '');
    setDescription(col.description || '');
    setWipLimit(col.wipLimit ?? '');
  }, [columnId, board]);

  const handleSave = async () => {
    if (!boardId || !columnId) return;
    try {
      setSaving(true);
      setError(null);
      await kanbanAPI.updateColumn(boardId, columnId, {
        name: name || undefined,
        description,
        wipLimit: wipLimit === '' ? undefined : Number(wipLimit),
      });
      onUpdated && onUpdated();
      onClose && onClose();
    } catch (e) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(() => board?.columns || [], [board]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Column Settings</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <FormControl fullWidth margin="normal">
          <InputLabel id="column-select">Column</InputLabel>
          <Select
            labelId="column-select"
            label="Column"
            value={columnId}
            onChange={(e) => setColumnId(e.target.value)}
          >
            {columns.map(c => (
              <MenuItem key={c._id || c.id} value={c._id || c.id}>{c.name || c.title}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField fullWidth label="Name" margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField fullWidth label="Description" margin="normal" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Stack direction="row" spacing={2}>
          <TextField fullWidth type="number" label="WIP Limit" margin="normal" value={wipLimit} onChange={(e) => setWipLimit(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={!columnId || saving}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColumnSettingsModal;
