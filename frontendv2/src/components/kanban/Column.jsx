import React from 'react';
import { Paper, Stack, Typography, Chip } from '@mui/material';
import TicketCard from './TicketCard';

const Column = ({
  title,
  columnKey,
  columnId,
  tickets = [],
  onDragStart,
  onDrop,
  headerExtras,
  renderTicket,
}) => {
  const handleDragOver = (e) => e.preventDefault();

  const headerColor = (key) => {
    switch (key) {
      case 'todo': return '#0ea5e9';
      case 'inProgress': return '#f59e0b';
      case 'review': return '#8b5cf6';
      case 'testing': return '#22c55e';
      case 'done': return '#10b981';
      default: return '#64748b';
    }
  };

  return (
    <Paper
      sx={{
        p: 2,
        minWidth: 320,
        background: 'linear-gradient(180deg, rgba(248,250,252,1) 0%, rgba(255,255,255,1) 100%)',
        borderRadius: 3,
        border: '1px solid rgba(148,163,184,0.2)',
        transition: 'background .15s ease',
        '&:hover': { background: 'linear-gradient(180deg, rgba(244,247,250,1) 0%, rgba(255,255,255,1) 100%)' },
      }}
      elevation={1}
      onDragOver={handleDragOver}
      onDrop={(e) => onDrop && onDrop(e, { key: columnKey, id: columnId })}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 9999, background: headerColor(columnKey) }} />
          <Typography variant="subtitle1" fontWeight={800}>
            {title}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip size="small" label={tickets.length} />
          {headerExtras}
        </Stack>
      </Stack>
      <Stack spacing={1} sx={{ minHeight: 80 }}>
        {tickets.length === 0 ? (
          <Typography variant="caption" color="text.secondary">No tickets</Typography>
        ) : (
          tickets.map((t, idx) => {
            const key = t._id || t.id || idx;
            const dragHandler = (e) => onDragStart && onDragStart(e, { ticket: t, from: columnKey, fromId: columnId, index: idx });
            if (renderTicket) {
              return renderTicket({ key, ticket: t, columnKey, columnId, index: idx, onDragStart: dragHandler });
            }

            return (
              <TicketCard
                key={key}
                ticket={t}
                onDragStart={dragHandler}
              />
            );
          })
        )}
      </Stack>
    </Paper>
  );
};

export default Column;
