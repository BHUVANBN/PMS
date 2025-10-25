import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tab,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  FolderIcon,
  CalendarDaysIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import DashboardCard from '../components/dashboard/DashboardCard';
import Badge from '../components/ui/Badge';
import { projectsAPI, managerAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDeveloper = user?.role === 'developer';
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState(''); // maps to backend lowercase statuses
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalProjects: 0, hasNext: false, hasPrev: false });
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const tabs = ['All Projects', 'Active', 'Planning', 'Completed', 'On Hold'];

  const statusMapTabToBackend = {
    1: 'active',
    2: 'planning',
    3: 'completed',
    4: 'on_hold'
  };

  useEffect(() => {
    // Reset page to 1 when filters change (except page itself)
    setPage(1);
  }, [selectedTab, statusFilter, searchTerm, sortBy, sortOrder, limit]);

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab, statusFilter, searchTerm, sortBy, sortOrder, page, limit]);

  // Removed client-side filter; server handles filtering/searching

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        limit,
        sortBy,
        sortOrder,
      };
      // Determine status predicate from tab or explicit filter
      const tabStatus = statusMapTabToBackend[selectedTab] || '';
      const effectiveStatus = statusFilter || tabStatus;
      if (effectiveStatus) params.status = effectiveStatus;
      if (searchTerm) params.search = searchTerm;

      let res;
      try {
        // Try projectsAPI first (should work for admin to see all projects)
        res = await projectsAPI.getAllProjects(params);
      } catch (projectsError) {
        console.warn('projectsAPI failed, trying managerAPI fallback:', projectsError);
        // Fallback to managerAPI to ensure admin can see manager-created projects
        res = await managerAPI.getAllProjects();
        // Transform managerAPI response to match expected format
        if (res && !res.data) {
          res = { data: { projects: res.projects || res.data?.projects || res || [] } };
        }
      }

      const { data } = res || {};
      const proj = data?.projects || res?.projects || res?.data || [];
      setProjects(Array.isArray(proj) ? proj : []);
      if (data?.pagination) setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err?.message || 'Failed to load projects. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'planning': return 'warning';
      case 'completed': return 'primary';
      case 'on_hold': return 'error';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'info';
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const computeProjectProgress = (project) => {
    if (!project?.modules?.length) return 0;
    const sum = project.modules.reduce((acc, m) => acc + (m.completionPercentage || 0), 0);
    return Math.round(sum / project.modules.length);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }} className="page-header">
        <Typography variant="h1" className="page-title" sx={{ fontSize: { xs: '1.75rem', md: '2rem' }, fontWeight: 700, mb: 0 }}>
          Projects
        </Typography>
        {!isDeveloper && (
          <Button
            variant="contained"
            startIcon={<PlusIcon className="h-4 w-4" />}
            sx={{ borderRadius: 2 }}
            onClick={() => navigate('/manager/projects/new')}
          >
            New Project
          </Button>
        )}
      </Box>

      {/* Search, Filters, Sort (hidden for developers) */}
      {!isDeveloper && (
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
              <Grid container spacing={2} justifyContent="flex-end">
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="medium">
                    <InputLabel id="status-filter-label">Status</InputLabel>
                    <Select
                      labelId="status-filter-label"
                      label="Status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="planning">Planning</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="on_hold">On Hold</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="medium">
                    <InputLabel id="sort-by-label">Sort By</InputLabel>
                    <Select
                      labelId="sort-by-label"
                      label="Sort By"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <MenuItem value="createdAt">Created</MenuItem>
                      <MenuItem value="name">Name</MenuItem>
                      <MenuItem value="startDate">Start Date</MenuItem>
                      <MenuItem value="endDate">End Date</MenuItem>
                      <MenuItem value="status">Status</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="medium">
                    <InputLabel id="sort-order-label">Order</InputLabel>
                    <Select
                      labelId="sort-order-label"
                      label="Order"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <MenuItem value="desc">Desc</MenuItem>
                      <MenuItem value="asc">Asc</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Tabs (hidden for developers) */}
      {!isDeveloper && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab} />
            ))}
          </Tabs>
        </Box>
      )}

      {/* Project Stats (hidden for developers) */}
      {!isDeveloper && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'primary.main' }}>
                {projects.length}
              </Typography>
              <Typography variant="body2" className="text-secondary" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                Total Projects
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'success.main' }}>
                {projects.filter(p => p.status === 'active').length}
              </Typography>
              <Typography variant="body2" className="text-secondary" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                Active Projects
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'info.main' }}>
                {projects.filter(p => p.status === 'completed').length}
              </Typography>
              <Typography variant="body2" className="text-secondary" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                Completed
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'warning.main' }}>
                {projects.filter(p => p.status === 'planning').length}
              </Typography>
              <Typography variant="body2" className="text-secondary" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                In Planning
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Projects Grid */}
      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={3} lg={3} key={project._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      <FolderIcon className="h-5 w-5" />
                    </Avatar> */}
                    <Box>
                      <Typography variant="h3" className="card-title" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 0.5 }}>
                        {project.name}
                      </Typography>
                      {project.projectManager && (
                        <Typography variant="body2" color="text.secondary">
                          PM: {project.projectManager.firstName} {project.projectManager.lastName}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Badge variant={getStatusColor(project.status)}>
                      {project.status?.replace('_', ' ')}
                    </Badge>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, project)}
                    >
                      <EllipsisVerticalIcon className="h-4 w-4" />
                    </IconButton>
                  </Box>
                </Box>

                {project.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.description}
                  </Typography>
                )}

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">Progress</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {computeProjectProgress(project)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={computeProjectProgress(project)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarDaysIcon className="h-4 w-4 mr-1" />
                    <Typography variant="body2" color="text.secondary">
                      {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No end date'}
                    </Typography>
                  </Box>
                  <Badge variant={getPriorityColor(project.priority)}>
                    {project.modules?.length || 0} modules
                  </Badge>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
                    {(project.teamMembers || []).slice(0, 5).map((member, index) => (
                      <Avatar key={member._id || index} sx={{ bgcolor: 'primary.main' }}>
                        {member.firstName ? `${member.firstName[0] || ''}${member.lastName ? member.lastName[0] : ''}`.toUpperCase() : 'U'}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Chip label={`Team: ${(project.teamMembers || []).length}`} size="small" variant="outlined" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button variant="outlined" disabled={!pagination.hasPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
          <Typography variant="body2">Page {pagination.currentPage} of {pagination.totalPages}</Typography>
          <Button variant="outlined" disabled={!pagination.hasNext} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="limit-label">Per Page</InputLabel>
          <Select labelId="limit-label" label="Per Page" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            <MenuItem value={6}>6</MenuItem>
            <MenuItem value={9}>9</MenuItem>
            <MenuItem value={12}>12</MenuItem>
            <MenuItem value={24}>24</MenuItem>
          </Select>
        </FormControl>
      </Box>

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

      {projects.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <FolderIcon className="h-16 w-16 mx-auto mb-4 text-neutral-400" />
          <Typography variant="h3" className="sub-heading" sx={{ fontSize: '1.125rem', fontWeight: 600, mb: 1, color: 'text.secondary' }}>
            No projects found
          </Typography>
          <Typography variant="body2" className="text-secondary" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first project to get started'}
          </Typography>
        </Box>
      )}

      {error && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="error.main">{error}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProjectsPage;
