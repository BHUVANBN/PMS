import React from 'react';
import { useParams } from 'react-router-dom';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import { developerAPI, kanbanAPI } from '../../services/api';

const DeveloperKanbanById = () => {
  const { developerId } = useParams();

  const fetchBoard = async () => {
    if (!developerId) return { columns: {} };
    return developerAPI.getKanbanBoardById(developerId);
  };

  const moveTicket = async ({ ticket, toKey, statusMap }) => {
    const newStatus = statusMap[toKey];
    if (newStatus && ticket.projectId) {
      await kanbanAPI.updateTicketStatus(ticket.projectId, ticket._id || ticket.id, { status: newStatus });
    }
  };

  return (
    <KanbanBoard
      title="Developer Kanban"
      description={`Viewing developer board for ${developerId}`}
      fetchBoard={fetchBoard}
      moveTicket={moveTicket}
      columnsOrder={['todo', 'inProgress', 'review', 'testing', 'done']}
      sseParams={developerId ? { userId: developerId } : undefined}
    />
  );
};

export default DeveloperKanbanById;
