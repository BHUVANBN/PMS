import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Chip,
  Box,
  Divider
} from '@mui/material';
import {
  Assignment,
  BugReport,
  CheckCircle,
  Person,
  Schedule,
  Comment
} from '@mui/icons-material';

const RecentActivity = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'ticket_created':
        return <Assignment />;
      case 'bug_reported':
        return <BugReport />;
      case 'task_completed':
        return <CheckCircle />;
      case 'user_joined':
        return <Person />;
      case 'comment_added':
        return <Comment />;
      default:
        return <Schedule />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'ticket_created':
        return 'primary';
      case 'bug_reported':
        return 'error';
      case 'task_completed':
        return 'success';
      case 'user_joined':
        return 'info';
      case 'comment_added':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Mock data if no activities provided
  const mockActivities = [
    {
      id: 1,
      type: 'ticket_created',
      title: 'New ticket created',
      description: 'User authentication bug reported',
      user: 'John Doe',
      timestamp: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      id: 2,
      type: 'task_completed',
      title: 'Task completed',
      description: 'Dashboard UI implementation finished',
      user: 'Jane Smith',
      timestamp: new Date(Date.now() - 45 * 60 * 1000)
    },
    {
      id: 3,
      type: 'bug_reported',
      title: 'Bug reported',
      description: 'Login form validation issue',
      user: 'Mike Johnson',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 4,
      type: 'comment_added',
      title: 'Comment added',
      description: 'Added review comments on PR #123',
      user: 'Sarah Wilson',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
    },
    {
      id: 5,
      type: 'user_joined',
      title: 'New team member',
      description: 'Alex Brown joined the development team',
      user: 'System',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ];

  const displayActivities = activities.length > 0 ? activities.slice(0, 5) : mockActivities;

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Recent Activity"
        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
        action={
          activities.length > 0 && (
            <Chip 
              label="Live" 
              size="small" 
              color="success" 
              variant="outlined"
            />
          )
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <List sx={{ p: 0 }}>
          {displayActivities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: `${getActivityColor(activity.type)}.main`,
                      width: 40,
                      height: 40,
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight="medium">
                        {activity.title}
                      </Typography>
                      <Chip
                        label={formatTimeAgo(activity.timestamp)}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {activity.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        by {activity.user}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < displayActivities.length - 1 && <Divider variant="inset" />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
