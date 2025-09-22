import React from 'react';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import { kanbanAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const TesterKanban = () => {
  const { user } = useAuth();

  const fetchBoard = async () => {
    return kanbanAPI.getTesterPersonalBoard();
  };

  const moveTicket = async ({ ticket, toKey }) => {
    const statusMap = { review: 'code_review', testing: 'testing', done: 'done' };
    const newStatus = statusMap[toKey];
    if (newStatus && ticket.projectId) {
      await kanbanAPI.updateTicketStatus(ticket.projectId, ticket._id || ticket.id, { status: newStatus });
    }
  };

  return (
    <KanbanBoard
      title="Testing Kanban"
      description="Move tickets through testing workflow."
      fetchBoard={fetchBoard}
      moveTicket={moveTicket}
      columnsOrder={['review', 'testing', 'done']}
      sseParams={user?._id || user?.id ? { userId: user._id || user.id } : undefined}
    />
  );
};

export default TesterKanban;
