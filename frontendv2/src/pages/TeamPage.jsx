import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Stack, Chip, Avatar, AvatarGroup,
  Grid, Paper, Button, LinearProgress, IconButton, Collapse
} from '@mui/material';
import { 
  Groups, ExpandMore, ExpandLess, Person, Business, 
  Assignment, Refresh 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { managerAPI, projectsAPI } from '../services/api';

const TeamPage = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProjects, setExpandedProjects] = useState({});

  const fetchTeamsAndProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all projects to get team information
      const projectsRes = await projectsAPI.getAllProjects();
      const projectsList = projectsRes?.data?.projects || projectsRes?.projects || projectsRes?.data || [];
      
      // For each project, fetch detailed team information
      const projectsWithTeams = await Promise.all(
        projectsList.map(async (project) => {
          try {
            const teamRes = await managerAPI.getProjectTeam(project._id || project.id);
            const teamMembers = teamRes?.team || teamRes?.data?.team || teamRes?.data || [];
            return {
              ...project,
              teamMembers: Array.isArray(teamMembers) ? teamMembers : []
            };
          } catch (e) {
            console.warn(`Failed to fetch team for project ${project.name}:`, e);
            return {
              ...project,
              teamMembers: []
            };
          }
        })
      );
      
      setProjects(projectsWithTeams);
      
      // Create a flattened teams view
      const allTeams = projectsWithTeams.flatMap(project => 
        project.teamMembers.map(member => ({
          ...member,
          projectId: project._id || project.id,
          projectName: project.name,
          projectStatus: project.status
        }))
      );
      setTeams(allTeams);
      
    } catch (e) {
      setError(e.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamsAndProjects();
  }, []);

  const toggleProjectExpansion = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'planning': return 'warning';
      case 'completed': return 'primary';
      case 'on_hold': return 'error';
      default: return 'default';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'manager': return 'primary';
      case 'developer': return 'info';
      case 'tester': return 'warning';
      case 'designer': return 'secondary';
      default: return 'default';
    }
  };

  // Calculate team statistics
  const totalTeamMembers = teams.length;
  const uniqueMembers = new Set(teams.map(t => t._id || t.id)).size;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalProjects = projects.length;

  if (loading) {
    return (
      <Box>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading teams...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <div>
          <Typography variant="h4" fontWeight="bold">Teams Overview</Typography>
          <Typography variant="body2" color="text.secondary">
            View all project teams created by managers (Read-only)
          </Typography>
        </div>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchTeamsAndProjects}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      {/* Team Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent>
              <Groups sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {uniqueMembers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unique Team Members
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent>
              <Assignment sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {totalTeamMembers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Assignments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent>
              <Business sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {activeProjects}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent>
              <Person sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {totalProjects}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Paper sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {/* Projects and Teams */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Projects & Teams
      </Typography>
      
      <Grid container spacing={2}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project._id || project.id}>
            <Card sx={{ overflow: 'visible', height: '100%' }}>
              <CardContent>
                <Stack 
                  direction="row" 
                  justifyContent="space-between" 
                  alignItems="center"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => toggleProjectExpansion(project._id || project.id)}
                >
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography variant="h6" fontWeight="bold">
                        {project.name}
                      </Typography>
                      <Chip 
                        label={project.status} 
                        color={getStatusColor(project.status)}
                        size="small"
                      />
                      <Chip 
                        label={`${project.teamMembers.length} members`}
                        variant="outlined"
                        size="small"
                      />
                    </Stack>
                    {project.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {project.description}
                      </Typography>
                    )}
                  </Box>
                  <IconButton>
                    {expandedProjects[project._id || project.id] ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Stack>

                <Collapse in={expandedProjects[project._id || project.id]}>
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    {project.teamMembers.length > 0 ? (
                      <Grid container spacing={2}>
                        {project.teamMembers.map((member) => (
                          <Grid item xs={12} sm={6} md={4} key={member._id || member.id}>
                            <Paper sx={{ p: 2 }}>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                  {(member.name || member.firstName || 'U')[0].toUpperCase()}
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="subtitle2">
                                    {member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim()}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {member.email}
                                  </Typography>
                                  <Chip 
                                    label={member.role} 
                                    color={getRoleColor(member.role)}
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                  />
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        No team members assigned to this project
                      </Typography>
                    )}
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {projects.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Groups sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No teams found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Teams will appear here once managers create projects and assign team members
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default TeamPage;
