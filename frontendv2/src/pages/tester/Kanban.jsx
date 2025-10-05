import React from 'react';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import { kanbanAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const TesterKanban = () => {
  const { user } = useAuth();

  const loadProjects = async () => {
    const res = await testerAPI.getProjects();
    const list = res?.projects || res?.data?.projects || res?.data || [];
    return list.map((p) => ({
      _id: p._id || p.id,
      id: p._id || p.id,
      name: p.name,
    }));
  };

  const fetchBoard = async (projectId) => {
    return kanbanAPI.getTesterPersonalBoard(projectId);
  };

  const moveTicket = async ({ ticket, toKey }) => {
    const statusMap = { testing: 'testing', done: 'done' };
    const newStatus = statusMap[toKey];
    if (newStatus && ticket.projectId) {
      await kanbanAPI.updateTicketStatus(ticket.projectId, ticket._id || ticket.id, { status: newStatus });
    }
  };

  return (
    <KanbanBoard
      title="Testing Kanban"
      description="Move tickets through testing workflow."
      loadProjects={loadProjects}
      fetchBoard={fetchBoard}
      moveTicket={moveTicket}
      columnsOrder={['testing', 'done']}
      showProjectSelector
      sseParams={(projectId) => {
        if (!(user?._id || user?.id)) return undefined;
        const params = { userId: user._id || user.id, role: 'tester' };
        if (projectId) return { ...params, projectId };
        return params;
      }}
    />
  );
};

export default TesterKanban;
