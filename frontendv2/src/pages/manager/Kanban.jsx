import React, { useEffect, useState } from 'react';
import {
  Stack,
  Button,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import { managerAPI, kanbanAPI } from '../../services/api';
import AddTicketModal from '../../components/kanban/AddTicketModal';
import AddModuleModal from '../../components/kanban/AddModuleModal';

const Kanban = () => {
  const [projectId, setProjectId] = useState('');
  const [showAddTicket, setShowAddTicket] = useState(false);
  const [showAddModule, setShowAddModule] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [ticketLogs, setTicketLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState('');

  const bumpRefresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!projectId) {
        setTicketLogs([]);
        setLogsError('');
        return;
      }

      try {
        setLogsLoading(true);
        setLogsError('');
        const response = await managerAPI.getTicketLogs(projectId);
        const logs = response?.data || response?.logs || response || [];
        setTicketLogs(Array.isArray(logs) ? logs : []);
      } catch (error) {
        setLogsError(error?.message || 'Unable to load ticket logs');
        setTicketLogs([]);
      } finally {
        setLogsLoading(false);
      }
    };

    fetchLogs();
  }, [projectId, refreshKey]);

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

      <Paper sx={{ mt: 4, p: 2, borderRadius: 3 }} variant="outlined">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Ticket Movement Timeline
          </Typography>
          {logsLoading && <CircularProgress size={20} />}
        </Stack>
        <Divider sx={{ mb: 2 }} />

        {!projectId && (
          <Typography color="text.secondary">
            Select a project to view ticket movement history.
          </Typography>
        )}

        {projectId && logsError && (
          <Typography color="error.main">{logsError}</Typography>
        )}

        {projectId && !logsError && !logsLoading && ticketLogs.length === 0 && (
          <Typography color="text.secondary">
            No ticket movement logs recorded yet for this project.
          </Typography>
        )}

        {projectId && !logsError && ticketLogs.length > 0 && (
          <List disablePadding>
            {ticketLogs.map((log) => {
              const ticketLabel = log?.metadata?.ticketNumber
                ? `Ticket #${log.metadata.ticketNumber}`
                : `Ticket ID: ${log.entityId}`;
              const movedAt = log?.createdAt ? new Date(log.createdAt).toLocaleString() : 'Unknown time';
              const userName = log?.userId
                ? `${log.userId.firstName || ''} ${log.userId.lastName || ''}`.trim() || 'Team member'
                : 'Team member';

              return (
                <ListItem key={log._id} disableGutters divider>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography fontWeight={600}>{ticketLabel}</Typography>
                        {log?.metadata?.fromStatus && log?.metadata?.toStatus && (
                          <Typography variant="body2" color="text.secondary">
                            {`${log.metadata.fromStatus} → ${log.metadata.toStatus}`}
                          </Typography>
                        )}
                      </Stack>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.primary" sx={{ mb: 0.5 }}>
                          {log.description || 'Status updated'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {`${movedAt} • ${userName}`}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </Paper>
    </>
  );
};

export default Kanban;
