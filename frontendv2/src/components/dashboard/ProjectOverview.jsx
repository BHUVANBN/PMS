import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  LinearProgress,
  Grid,
  Avatar,
  AvatarGroup,
  Chip,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { MoreVert, FolderOpen, Group, Schedule } from '@mui/icons-material';

const ProjectOverview = ({ projects = [] }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedProject, setSelectedProject] = React.useState(null);

  const handleMenuClick = (event, project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  // Mock data if no projects provided
  const mockProjects = [
    {
      id: 1,
      name: 'E-Commerce Platform',
      description: 'Complete online shopping solution with payment integration',
      progress: 75,
      status: 'active',
      dueDate: '2024-03-15',
      teamMembers: [
        { id: 1, name: 'John Doe', avatar: '/avatars/john.jpg' },
        { id: 2, name: 'Jane Smith', avatar: '/avatars/jane.jpg' },
        { id: 3, name: 'Mike Johnson', avatar: '/avatars/mike.jpg' },
        { id: 4, name: 'Sarah Wilson', avatar: '/avatars/sarah.jpg' }
      ],
      totalTasks: 45,
      completedTasks: 34,
      priority: 'high'
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'Cross-platform mobile application for iOS and Android',
      progress: 60,
      status: 'active',
      dueDate: '2024-04-20',
      teamMembers: [
        { id: 5, name: 'Alex Brown', avatar: '/avatars/alex.jpg' },
        { id: 6, name: 'Lisa Davis', avatar: '/avatars/lisa.jpg' },
        { id: 7, name: 'Tom Wilson', avatar: '/avatars/tom.jpg' }
      ],
      totalTasks: 32,
      completedTasks: 19,
      priority: 'medium'
    },
    {
      id: 3,
      name: 'Data Analytics Dashboard',
      description: 'Business intelligence dashboard with real-time analytics',
      progress: 90,
      status: 'active',
      dueDate: '2024-02-28',
      teamMembers: [
        { id: 8, name: 'Emma Johnson', avatar: '/avatars/emma.jpg' },
        { id: 9, name: 'David Lee', avatar: '/avatars/david.jpg' }
      ],
      totalTasks: 28,
      completedTasks: 25,
      priority: 'high'
    }
  ];

  const displayProjects = projects.length > 0 ? projects : mockProjects;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'on_hold':
        return 'warning';
      case 'completed':
        return 'primary';
      case 'cancelled':
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Project Overview"
        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
        action={
          <Chip
            label={`${displayProjects.length} active`}
            size="small"
            color="success"
            variant="outlined"
          />
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <Grid container spacing={2}>
          {displayProjects.map((project) => (
            <Grid item xs={12} key={project.id}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                      <FolderOpen fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {project.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {project.description}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton 
                    size="small"
                    onClick={(e) => handleMenuClick(e, project)}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {project.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={project.progress}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'grey.200'
                    }}
                  />
                </Box>

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Group fontSize="small" color="action" />
                      <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
                        {project.teamMembers.map((member) => (
                          <Avatar 
                            key={member.id} 
                            alt={member.name}
                            src={member.avatar}
                            sx={{ bgcolor: 'primary.main' }}
                          >
                            {member.name.charAt(0)}
                          </Avatar>
                        ))}
                      </AvatarGroup>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {project.completedTasks}/{project.totalTasks} tasks completed
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                      <Box display="flex" gap={0.5}>
                        <Chip
                          label={project.priority}
                          size="small"
                          color={getPriorityColor(project.priority)}
                          variant="outlined"
                        />
                        <Chip
                          label={project.status}
                          size="small"
                          color={getStatusColor(project.status)}
                          variant="filled"
                        />
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Schedule fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {getDaysRemaining(project.dueDate)} days left
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
          <MenuItem onClick={handleMenuClose}>Edit Project</MenuItem>
          <MenuItem onClick={handleMenuClose}>View Tasks</MenuItem>
          <MenuItem onClick={handleMenuClose}>Team Members</MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};

export default ProjectOverview;
