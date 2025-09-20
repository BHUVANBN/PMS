import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar
} from '@mui/material';
import { Circle } from '@mui/icons-material';

const TaskProgress = ({ tasks = [] }) => {
  // Mock data if no tasks provided
  const mockTasks = [
    {
      id: 1,
      title: 'User Authentication Module',
      progress: 85,
      status: 'in_progress',
      dueDate: '2024-01-25',
      assignee: 'John Doe',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Dashboard UI Components',
      progress: 100,
      status: 'completed',
      dueDate: '2024-01-20',
      assignee: 'Jane Smith',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'API Integration',
      progress: 60,
      status: 'in_progress',
      dueDate: '2024-01-30',
      assignee: 'Mike Johnson',
      priority: 'high'
    },
    {
      id: 4,
      title: 'Testing & Bug Fixes',
      progress: 30,
      status: 'in_progress',
      dueDate: '2024-02-05',
      assignee: 'Sarah Wilson',
      priority: 'medium'
    },
    {
      id: 5,
      title: 'Documentation',
      progress: 15,
      status: 'todo',
      dueDate: '2024-02-10',
      assignee: 'Alex Brown',
      priority: 'low'
    }
  ];

  const displayTasks = tasks.length > 0 ? tasks : mockTasks;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'todo':
        return 'default';
      case 'blocked':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'primary';
    if (progress >= 25) return 'warning';
    return 'error';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Task Progress"
        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
        action={
          <Chip
            label={`${displayTasks.length} tasks`}
            size="small"
            variant="outlined"
          />
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <List sx={{ p: 0 }}>
          {displayTasks.map((task, index) => (
            <ListItem key={task.id} sx={{ px: 0, py: 2 }}>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="body1" fontWeight="medium">
                      {task.title}
                    </Typography>
                    <Box display="flex" gap={0.5}>
                      <Chip
                        label={task.priority}
                        size="small"
                        color={getPriorityColor(task.priority)}
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                      <Chip
                        label={task.status.replace('_', ' ')}
                        size="small"
                        color={getStatusColor(task.status)}
                        variant="filled"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>
                  </Box>
                }
                secondary={
                  <Box>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        {task.assignee}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color={isOverdue(task.dueDate) ? 'error.main' : 'text.secondary'}
                        fontWeight={isOverdue(task.dueDate) ? 'bold' : 'normal'}
                      >
                        Due: {formatDate(task.dueDate)}
                        {isOverdue(task.dueDate) && ' (Overdue)'}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinearProgress
                        variant="determinate"
                        value={task.progress}
                        color={getProgressColor(task.progress)}
                        sx={{ 
                          flexGrow: 1, 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: 'grey.200'
                        }}
                      />
                      <Typography variant="body2" color="text.secondary" minWidth={40}>
                        {task.progress}%
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default TaskProgress;
