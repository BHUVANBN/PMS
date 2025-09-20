import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  AvatarGroup,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import {
  FolderIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import DashboardCard from '../components/dashboard/DashboardCard';
import Badge from '../components/ui/Badge';
import { projectsAPI } from '../services/api';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const tabs = ['All Projects', 'Active', 'Planning', 'Completed', 'On Hold'];

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, selectedTab]);

  const fetchProjects = async () => {
    try {
      // Mock data for demonstration
      const mockProjects = [
        {
          id: 1,
          name: 'E-commerce Platform',
          description: 'Modern e-commerce platform with React and Node.js',
          status: 'Active',
          progress: 75,
          startDate: '2024-01-01',
          endDate: '2024-03-15',
          budget: '$50,000',
          spent: '$37,500',
          team: [
            { name: 'John Doe', avatar: 'JD', role: 'Lead Developer' },
            { name: 'Jane Smith', avatar: 'JS', role: 'UI/UX Designer' },
            { name: 'Mike Johnson', avatar: 'MJ', role: 'Backend Developer' },
            { name: 'Sarah Wilson', avatar: 'SW', role: 'QA Engineer' }
          ],
          priority: 'High',
          client: 'TechCorp Inc.',
          tags: ['React', 'Node.js', 'MongoDB']
        },
        {
          id: 2,
          name: 'Mobile App Redesign',
          description: 'Complete redesign of the mobile application',
          status: 'Planning',
          progress: 25,
          startDate: '2024-02-01',
          endDate: '2024-05-30',
          budget: '$30,000',
          spent: '$7,500',
          team: [
            { name: 'Alice Brown', avatar: 'AB', role: 'UI/UX Designer' },
            { name: 'Bob Davis', avatar: 'BD', role: 'Mobile Developer' },
            { name: 'Carol White', avatar: 'CW', role: 'Product Manager' }
          ],
          priority: 'Medium',
          client: 'StartupXYZ',
          tags: ['React Native', 'UI/UX', 'Mobile']
        },
        {
          id: 3,
          name: 'API Integration',
          description: 'Integration with third-party APIs and services',
          status: 'Active',
          progress: 90,
          startDate: '2023-12-01',
          endDate: '2024-01-15',
          budget: '$15,000',
          spent: '$13,500',
          team: [
            { name: 'David Lee', avatar: 'DL', role: 'Backend Developer' },
            { name: 'Emma Taylor', avatar: 'ET', role: 'DevOps Engineer' }
          ],
          priority: 'High',
          client: 'Enterprise Solutions',
          tags: ['API', 'Integration', 'Backend']
        },
        {
          id: 4,
          name: 'Dashboard Analytics',
          description: 'Advanced analytics dashboard with real-time data',
          status: 'Completed',
          progress: 100,
          startDate: '2023-10-01',
          endDate: '2023-12-31',
          budget: '$25,000',
          spent: '$24,000',
          team: [
            { name: 'Frank Miller', avatar: 'FM', role: 'Full Stack Developer' },
            { name: 'Grace Chen', avatar: 'GC', role: 'Data Analyst' },
            { name: 'Henry Wilson', avatar: 'HW', role: 'Frontend Developer' }
          ],
          priority: 'Medium',
          client: 'DataCorp',
          tags: ['Analytics', 'Dashboard', 'React']
        },
        {
          id: 5,
          name: 'Security Audit',
          description: 'Comprehensive security audit and improvements',
          status: 'On Hold',
          progress: 40,
          startDate: '2024-01-15',
          endDate: '2024-04-15',
          budget: '$20,000',
          spent: '$8,000',
          team: [
            { name: 'Ivan Rodriguez', avatar: 'IR', role: 'Security Engineer' },
            { name: 'Julia Kim', avatar: 'JK', role: 'Backend Developer' }
          ],
          priority: 'Low',
          client: 'SecureTech',
          tags: ['Security', 'Audit', 'Backend']
        }
      ];
      setProjects(mockProjects);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tab
    if (selectedTab > 0) {
      const statusMap = {
        1: 'Active',
        2: 'Planning',
        3: 'Completed',
        4: 'On Hold'
      };
      filtered = filtered.filter(project => project.status === statusMap[selectedTab]);
    }

    setFilteredProjects(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Planning': return 'warning';
      case 'Completed': return 'primary';
      case 'On Hold': return 'error';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'secondary';
    }
  };

  const handleMenuClick = (event, project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const calculateBudgetPercentage = (spent, budget) => {
    const spentAmount = parseFloat(spent.replace('$', '').replace(',', ''));
    const budgetAmount = parseFloat(budget.replace('$', '').replace(',', ''));
    return (spentAmount / budgetAmount) * 100;
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading projects...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<PlusIcon className="h-4 w-4" />}
          sx={{ borderRadius: 2 }}
        >
          New Project
        </Button>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </InputAdornment>
                ),
              }}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<FunnelIcon className="h-4 w-4" />}
                sx={{ borderRadius: 2 }}
              >
                Filters
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab} />
          ))}
        </Tabs>
      </Box>

      {/* Project Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
              {projects.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Projects
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
              {projects.filter(p => p.status === 'Active').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Projects
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main" sx={{ fontWeight: 600 }}>
              {projects.filter(p => p.status === 'Completed').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 600 }}>
              {projects.filter(p => p.status === 'Planning').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              In Planning
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Projects Grid */}
      <Grid container spacing={3}>
        {filteredProjects.map((project) => (
          <Grid item xs={12} md={6} lg={4} key={project.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      <FolderIcon className="h-5 w-5" />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {project.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {project.client}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Badge variant={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, project)}
                    >
                      <EllipsisVerticalIcon className="h-4 w-4" />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {project.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">Progress</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {project.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={project.progress}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarDaysIcon className="h-4 w-4 mr-1" />
                    <Typography variant="body2" color="text.secondary">
                      {project.endDate}
                    </Typography>
                  </Box>
                  <Badge variant={getPriorityColor(project.priority)}>
                    {project.priority}
                  </Badge>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Budget: {project.spent} / {project.budget}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={calculateBudgetPercentage(project.spent, project.budget)}
                    sx={{ width: 60, height: 4, borderRadius: 2 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
                    {project.team.map((member, index) => (
                      <Avatar key={index} sx={{ bgcolor: 'primary.main' }}>
                        {member.avatar}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {project.tags.slice(0, 2).map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                    {project.tags.length > 2 && (
                      <Chip label={`+${project.tags.length - 2}`} size="small" variant="outlined" />
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Edit Project</MenuItem>
        <MenuItem onClick={handleMenuClose}>Manage Team</MenuItem>
        <MenuItem onClick={handleMenuClose}>View Reports</MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          Archive Project
        </MenuItem>
      </Menu>

      {filteredProjects.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <FolderIcon className="h-16 w-16 mx-auto mb-4 text-neutral-400" />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No projects found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first project to get started'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProjectsPage;
