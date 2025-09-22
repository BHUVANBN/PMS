import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControlLabel, Checkbox } from '@mui/material';

const CreateBoardModal = ({ open, onClose, onCreate, projectId }) => {
  const [boardName, setBoardName] = useState('Main Board');
  const [includeTesting, setIncludeTesting] = useState(true);

  const handleCreate = () => {
    const columns = [
      { name: 'To Do', statusMapping: 'open', order: 1, tickets: [] },
      { name: 'In Progress', statusMapping: 'in_progress', order: 2, tickets: [] },
      { name: 'Review', statusMapping: 'code_review', order: 3, tickets: [] },
      ...(includeTesting ? [{ name: 'Testing', statusMapping: 'testing', order: 4, tickets: [] }] : []),
      { name: 'Done', statusMapping: 'done', order: 5, tickets: [] },
    ];
    onCreate && onCreate({ projectId, boardName, columns });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Kanban Board</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Board Name"
          margin="normal"
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
        />
        <FormControlLabel
          control={<Checkbox checked={includeTesting} onChange={(e) => setIncludeTesting(e.target.checked)} />}
          label="Include Testing column"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleCreate} disabled={!boardName}>Create</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateBoardModal;
