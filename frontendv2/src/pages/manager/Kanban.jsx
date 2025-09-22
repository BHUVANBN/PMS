import React, { useCallback, useEffect, useState } from 'react';
import { Stack, Select, MenuItem, Typography, Button } from '@mui/material';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import { managerAPI, kanbanAPI } from '../../services/api';
import CreateBoardModal from '../../components/kanban/CreateBoardModal';
import AddTicketModal from '../../components/kanban/AddTicketModal';
import ColumnSettingsModal from '../../components/kanban/ColumnSettingsModal';

const Kanban = () => {
  const [projectId, setProjectId] = useState('');
  const [boards, setBoards] = useState([]);
  const [boardId, setBoardId] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showAddTicket, setShowAddTicket] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const bumpRefresh = () => setRefreshKey((k) => k + 1);

  const loadProjects = async () => {
    const res = await managerAPI.getAllProjects();
    return res?.projects || res?.data?.projects || res?.data || [];
  };

  const fetchBoard = async (projectId) => {
    if (!projectId) return {};
    const res = await managerAPI.getProjectKanban(projectId);
    const raw = res?.data || res?.kanban || res || {};
    const normalize = (columns = {}) => {
      const get = (keys) => {
        for (const k of keys) {
          if (Array.isArray(columns[k])) return columns[k];
          if (columns[k]?.tickets) return columns[k].tickets;
        }
        return [];
      };
      return {
        todo: get(['todo', 'To Do', 'toDo', 'open']),
        inProgress: get(['inProgress', 'In Progress', 'in_progress']),
        review: get(['review', 'Code Review', 'Testing', 'testing', 'code_review']),
        done: get(['done', 'Done', 'closed'])
      };
    };
    return { columns: normalize(raw.columns || raw) };
  };

  const moveTicket = async ({ ticket, toKey, projectId, statusMap }) => {
    const newStatus = statusMap[toKey];
    if (newStatus && projectId) {
      await kanbanAPI.updateTicketStatus(projectId, ticket._id || ticket.id, { status: newStatus });
    }
  };

  const loadBoards = useCallback(async (pid) => {
    if (!pid) { setBoards([]); setBoardId(''); return; }
    const res = await kanbanAPI.getProjectBoards(pid);
    const list = res?.data || res?.boards || res || [];
    setBoards(list);
    if (list.length && !boardId) setBoardId(list[0]._id || list[0].id);
  }, [boardId]);

  useEffect(() => { loadBoards(projectId); }, [projectId, loadBoards, refreshKey]);

  return (
    <>
      {/* Board selector appears when a project is picked */}
      {projectId && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">Board:</Typography>
          <Select size="small" value={boardId} onChange={(e) => setBoardId(e.target.value)} displayEmpty sx={{ minWidth: 220 }}>
            {boards.length === 0 && <MenuItem value="" disabled>No boards</MenuItem>}
            {boards.map((b) => (
              <MenuItem key={b._id || b.id} value={b._id || b.id}>{b.boardName || b.name}</MenuItem>
            ))}
          </Select>
          <Button size="small" onClick={() => setShowColumnSettings(true)} disabled={!boardId}>Column Settings</Button>
        </Stack>
      )}

      <KanbanBoard
        title="Project Kanban"
        description="Select a project and manage its tickets."
        loadProjects={loadProjects}
        fetchBoard={fetchBoard}
        moveTicket={moveTicket}
        showProjectSelector
        onProjectChange={(pid) => setProjectId(pid)}
        refreshKey={refreshKey}
        sseParams={projectId ? { projectId } : undefined}
        onCreateBoard={(pid) => {
          if (!pid) return;
          setProjectId(pid);
          setShowCreate(true);
        }}
        onAddTicket={(pid) => {
          if (!pid) return;
          setProjectId(pid);
          setShowAddTicket(true);
        }}
        onColumnSettings={() => {
          if (!boardId) return;
          setShowColumnSettings(true);
        }}
      />

      {/* Modals */}
      <CreateBoardModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        projectId={projectId}
        onCreate={async (payload) => {
          await kanbanAPI.createBoard(payload);
          setShowCreate(false);
          bumpRefresh();
        }}
      />

      <AddTicketModal
        open={showAddTicket}
        onClose={() => setShowAddTicket(false)}
        projectId={projectId}
        onCreated={() => bumpRefresh()}
      />

      <ColumnSettingsModal
        open={showColumnSettings}
        onClose={() => setShowColumnSettings(false)}
        boardId={boardId}
        onUpdated={() => bumpRefresh()}
      />
    </>
  );
};

export default Kanban;
