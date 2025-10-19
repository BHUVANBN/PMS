import React from 'react';
import { Paper, Stack, Typography, Chip } from '@mui/material';

const TicketCard = ({ ticket, draggable = true, onDragStart }) => {
  const id = ticket._id || ticket.id;
  const title = ticket.title || ticket.name || 'Untitled Ticket';
  const code = ticket.code || ticket.key || id?.toString()?.slice(-6);
  const priority = ticket.priority;
  const type = ticket.type;
  const assignee = ticket.assignedDeveloper || ticket.assignee || ticket.assignedTo;

  const resolveName = (user) => {
    if (!user) return '';
    if (typeof user === 'string') return user;
    if (typeof user === 'object') {
      const first = (user.firstName || user.name || user.username || '').toString().trim();
      const last = (user.lastName || '').toString().trim();
      const combined = [first, last].filter(Boolean).join(' ').trim();
      if (combined) return combined;
      if (user.email) return user.email;
    }
    return '';
  };

  const developerName = resolveName(assignee);
  const testerName = resolveName(ticket.tester);

  const priorityColor = (p) => {
    const v = (p || '').toString().toLowerCase();
    if (v === 'urgent' || v === 'high') return '#ef4444';
    if (v === 'medium') return '#f59e0b';
    if (v === 'low') return '#10b981';
    return '#3b82f6';
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        cursor: draggable ? 'grab' : 'default',
        borderLeft: `3px solid ${priorityColor(priority)}`,
        transition: 'all .15s ease',
        background: 'linear-gradient(180deg, rgba(250,250,250,1) 0%, rgba(255,255,255,1) 100%)',
        '&:hover': { boxShadow: 2, transform: 'translateY(-1px)' },
      }}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      <Stack spacing={0.5}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {title}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Typography variant="caption" color="text.secondary">#{code}</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {priority && <Chip size="small" label={priority} sx={{ height: 20 }} />}
            {type && <Chip size="small" color="default" label={type} sx={{ height: 20 }} />}
          </Stack>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
          {developerName && (
            <Chip
              size="small"
              variant="outlined"
              label={`Dev: ${developerName}`}
              sx={{ height: 22 }}
              color="primary"
            />
          )}
          {testerName && (
            <Chip
              size="small"
              variant="outlined"
              label={`Tester: ${testerName}`}
              sx={{ height: 22 }}
              color="secondary"
            />
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default TicketCard;
