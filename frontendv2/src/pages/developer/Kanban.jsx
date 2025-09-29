import React from 'react';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import { developerAPI, kanbanAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const DevKanban = () => {
  const { user } = useAuth();

  const fetchBoard = async () => {
    return developerAPI.getKanbanBoard();
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
      fetchBoard={fetchBoard}
      moveTicket={moveTicket}
      columnsOrder={['todo', 'inProgress', 'review', 'testing', 'done']}
      sseParams={user?._id || user?.id ? { userId: user._id || user.id } : undefined}
    />
  );
};

export default DevKanban;
