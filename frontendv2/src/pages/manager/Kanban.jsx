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
