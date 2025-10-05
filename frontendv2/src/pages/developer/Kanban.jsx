import React from 'react';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import { developerAPI, kanbanAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const DevKanban = () => {
  const { user } = useAuth();

  const loadProjects = async () => {
    const res = await developerAPI.getProjects();
    const list = res?.projects || res?.data?.projects || res?.data || [];
    return list.map((p) => ({
      _id: p._id || p.id,
      id: p._id || p.id,
      name: p.name,
    }));
  };

  const fetchBoard = async (projectId) => {
    return developerAPI.getKanbanBoard(projectId);
  };

  const moveTicket = async ({ ticket, toKey, statusMap }) => {
    const newStatus = statusMap[toKey];
    if (newStatus && ticket.projectId) {
      await kanbanAPI.updateTicketStatus(ticket.projectId, ticket._id || ticket.id, { status: newStatus });
    }
  };

  return (
    <KanbanBoard
      title="My Kanban"
      description="Drag tickets across columns to update status."
      loadProjects={loadProjects}
      fetchBoard={fetchBoard}
      moveTicket={moveTicket}
      columnsOrder={['todo', 'inProgress', 'review', 'testing', 'done']}
      showProjectSelector
      sseParams={projectId => {
        if (!(user?._id || user?.id)) return undefined;
        const params = { userId: user._id || user.id, role: 'developer' };
        if (projectId) return { ...params, projectId };
        return params;
      }}
    />
  );
};

export default DevKanban;
