import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../common';
import KanbanColumn from './KanbanColumn';
import KanbanFilters from './KanbanFilters';
import { kanbanAPI } from '../../services/api';
import { TICKET_STATUS } from '../../utils/constants/api';

const KanbanBoard = ({ 
  projectId, 
  className = '',
  onTicketClick,
  onTicketUpdate 
}) => {
  const [board, setBoard] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    assignee: '',
    priority: '',
    type: ''
  });

  const defaultColumns = [
    { id: 'open', title: 'To Do', status: TICKET_STATUS.OPEN, color: 'bg-gray-100' },
    { id: 'in_progress', title: 'In Progress', status: TICKET_STATUS.IN_PROGRESS, color: 'bg-blue-100' },
    { id: 'in_review', title: 'In Review', status: TICKET_STATUS.IN_REVIEW, color: 'bg-yellow-100' },
    { id: 'testing', title: 'Testing', status: TICKET_STATUS.TESTING, color: 'bg-purple-100' },
    { id: 'done', title: 'Done', status: TICKET_STATUS.DONE, color: 'bg-green-100' }
  ];

  useEffect(() => {
    loadBoard();
  }, [projectId]);

  const loadBoard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await kanbanAPI.getBoard(projectId);
      setBoard(response.board);
      setTickets(response.tickets || []);
    } catch (err) {
      console.error('Failed to load kanban board:', err);
      setError('Failed to load kanban board');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, ticket) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(ticket));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    
    try {
      const ticketData = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      if (ticketData.status === targetStatus) return;

      // Optimistically update UI
      setTickets(prev => prev.map(ticket => 
        ticket._id === ticketData._id 
          ? { ...ticket, status: targetStatus }
          : ticket
      ));

      // Update on server
      await kanbanAPI.moveCard(ticketData._id, targetStatus);
      
      onTicketUpdate?.(ticketData._id, { status: targetStatus });
    } catch (err) {
      console.error('Failed to move ticket:', err);
      // Revert optimistic update
      loadBoard();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filters.search && !ticket.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.assignee && ticket.assignedTo?._id !== filters.assignee) {
      return false;
    }
    if (filters.priority && ticket.priority !== filters.priority) {
      return false;
    }
    if (filters.type && ticket.type !== filters.type) {
      return false;
    }
    return true;
  });

  const getTicketsForColumn = (status) => {
    return filteredTickets.filter(ticket => ticket.status === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading kanban board..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-red-800 mb-2">Failed to Load Board</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadBoard}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Filters */}
      <div className="mb-6">
        <KanbanFilters
          filters={filters}
          onFiltersChange={setFilters}
          projectId={projectId}
        />
      </div>

      {/* Board Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kanban Board</h2>
          <p className="text-gray-600">
            {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
            {filters.search || filters.assignee || filters.priority || filters.type ? ' (filtered)' : ''}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={loadBoard}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh board"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex space-x-6 h-full min-w-max pb-6">
          {defaultColumns.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              tickets={getTicketsForColumn(column.status)}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onTicketClick={onTicketClick}
              className="flex-shrink-0 w-80"
            />
          ))}
        </div>
      </div>

      {/* Board Stats */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          {defaultColumns.map(column => {
            const count = getTicketsForColumn(column.status).length;
            return (
              <div key={column.id} className="bg-white rounded-lg p-3">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">{column.title}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
