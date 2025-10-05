import React, { useState } from 'react';
import { Stack, Button } from '@mui/material';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import { managerAPI, kanbanAPI } from '../../services/api';
import AddTicketModal from '../../components/kanban/AddTicketModal';
import AddModuleModal from '../../components/kanban/AddModuleModal';

const Kanban = () => {
  const [projectId, setProjectId] = useState('');
  const [showAddTicket, setShowAddTicket] = useState(false);
  const [showAddModule, setShowAddModule] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const bumpRefresh = () => setRefreshKey((k) => k + 1);

  const loadProjects = async () => {
    const res = await managerAPI.getAllProjects();
    return res?.projects || res?.data?.projects || res?.data || [];
  };
  const fetchBoard = async (selectedProjectId) => {
    if (!selectedProjectId) return {};
    const res = await managerAPI.getProjectKanban(selectedProjectId);
    const raw = res?.data || res?.kanban || res || {};
    const normalize = (columns = {}) => {
      const getTickets = (keys) => {
        for (const key of keys) {
          const value = columns[key];
          if (Array.isArray(value)) return value;
          if (value?.tickets) return value.tickets;
        }
        return [];
      };

      return {
        todo: getTickets(['todo', 'To Do', 'toDo', 'open']),
        inProgress: getTickets(['inProgress', 'In Progress', 'in_progress']),
        review: getTickets(['review', 'Review', 'code_review', 'ready_for_review', 'Ready for Review']),
        testing: getTickets(['testing', 'Testing', 'ready_for_test', 'Ready for Test']),
        done: getTickets(['done', 'Done', 'closed'])
      };
    };
    return { columns: normalize(raw.columns || raw) };
  };

  // Manager board is read-only; keep handler to satisfy KanbanBoard props but do nothing
  const moveTicket = async () => undefined;

  return (
    <>
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
        onAddModule={(pid) => {
          if (!pid) return;
          setProjectId(pid);
          setShowAddModule(true);
        }}
        onAddTicket={(pid) => {
          if (!pid) return;
          setProjectId(pid);
          setShowAddTicket(true);
        }}
      />

      {/* Modals */}

      <AddTicketModal
        open={showAddTicket}
        onClose={() => setShowAddTicket(false)}
        projectId={projectId}
        onCreated={() => bumpRefresh()}
      />

      <AddModuleModal
        open={showAddModule}
        onClose={() => setShowAddModule(false)}
        projectId={projectId}
        onCreated={() => bumpRefresh()}
      />
    </>
  );
};

export default Kanban;
