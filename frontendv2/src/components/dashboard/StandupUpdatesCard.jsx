import React from 'react';
import { Card, CardContent, Typography, Box, List, ListItem, ListItemText, Button, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToEvents } from '../../services/api';

const StandupUpdatesCard = ({ title = 'Standup Updates', maxItems = 5 }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [updates, setUpdates] = React.useState([]);

  const loadFromHistory = React.useCallback(() => {
    try {
      if (!user?._id) return;
      const hKey = `notifications_history_${user._id}`;
      const existing = JSON.parse(localStorage.getItem(hKey) || '[]');
      const standupOnly = (existing || []).filter((n) => typeof n?.id === 'string' && n.id.startsWith('standup.')).slice(0, maxItems);
      setUpdates(standupOnly);
    } catch (err) { String(err); }
  }, [user?._id, maxItems]);

  React.useEffect(() => {
    loadFromHistory();
  }, [loadFromHistory]);

  React.useEffect(() => {
    if (!user?._id) return;
    let unsubscribe;
    let retryTimer;
    let retryDelay = 2000;
    const connect = () => {
      try {
        unsubscribe = subscribeToEvents(
          { userId: user._id },
          (payload) => {
            try {
              const type = payload?.type || '';
              if (type.startsWith('standup.')) {
                const now = new Date();
                const item = {
                  id: `${type}_${now.valueOf()}`,
                  title: type === 'standup.commented' ? 'Standup comment' : type === 'standup.attachment_added' ? 'Standup attachment' : 'Standup update',
                  message: payload?.data?.by ? `${payload.data.by}` : '',
                  time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  read: false,
                  path: '/notifications',
                };
                setUpdates((prev) => [item, ...prev].slice(0, maxItems));
              }
            } catch (err) { String(err); }
          },
          () => {
            try { if (typeof unsubscribe === 'function') unsubscribe(); } catch (err) { String(err); }
            if (retryTimer) clearTimeout(retryTimer);
            retryTimer = setTimeout(connect, retryDelay);
            retryDelay = Math.min(retryDelay * 2, 30000);
          }
        );
      } catch (err) {
        String(err);
        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 30000);
      }
    };
    connect();
    return () => {
      try { if (typeof unsubscribe === 'function') unsubscribe(); } catch (err) { String(err); }
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [user?._id, maxItems]);

  const handleViewAll = () => {
    navigate('/notifications');
  };

  return (
    <Card elevation={0} sx={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '16px' }}>
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
          <Button size="small" variant="outlined" onClick={handleViewAll}>View All</Button>
        </Box>
        <Divider sx={{ mb: 1 }} />
        {updates.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No recent updates to your standups.</Typography>
        ) : (
          <List dense sx={{ py: 0 }}>
            {updates.map((n) => (
              <ListItem key={n.id} disableGutters sx={{ py: 0.5 }} onClick={handleViewAll}>
                <ListItemText
                  primary={n.title}
                  secondary={`${n.message ? n.message + ' • ' : ''}${n.time || ''}`}
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default StandupUpdatesCard;
