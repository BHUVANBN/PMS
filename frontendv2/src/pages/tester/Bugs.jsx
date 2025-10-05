import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { testerAPI } from '../../services/api';

const Bugs = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [bugs, setBugs] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingBugs, setLoadingBugs] = useState(false);
  const [error, setError] = useState(null);

  const loadProjects = useCallback(async () => {
    try {
      setLoadingProjects(true);
      setError(null);
      const res = await testerAPI.getProjects();
      const list = res?.projects || res?.data?.projects || res?.data || [];
      const normalized = list.map((p) => ({
        id: (p._id || p.id || '').toString(),
        name: p.name,
      }));
      setProjects(normalized);
      if (!selectedProject && normalized.length) {
        setSelectedProject(normalized[0].id);
      } else if (selectedProject && !normalized.some((proj) => proj.id === selectedProject)) {
        // Previously selected project no longer available, reset to first
        setSelectedProject(normalized[0]?.id || '');
      }
    } catch (err) {
      console.error('Failed to load projects', err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoadingProjects(false);
    }
  }, [selectedProject]);

  const loadBugs = useCallback(async (projectId) => {
    if (!projectId) {
      setBugs([]);
      return;
    }
    try {
      setLoadingBugs(true);
      setError(null);
      const res = await testerAPI.getProjectBugs(projectId, { sortBy: 'createdAt', sortOrder: 'desc', limit: 100 });
      const bugPayload = res?.data?.bugs || res?.data || res?.bugs || [];
      setBugs(Array.isArray(bugPayload) ? bugPayload : []);
    } catch (err) {
      console.error('Failed to load bugs', err);
      setError(err.message || 'Failed to load bugs');
    } finally {
      setLoadingBugs(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (selectedProject) {
      loadBugs(selectedProject);
    }
  }, [selectedProject, loadBugs]);

  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
  };

  const projectName = useMemo(() => {
    return projects.find((proj) => proj.id === selectedProject)?.name || 'Select a project';
  }, [projects, selectedProject]);

  const severityColor = (severity) => {
    switch ((severity || '').toLowerCase()) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
      default:
        return 'success';
    }
  };

  const statusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'new':
      case 'open':
        return 'warning';
      case 'assigned':
      case 'in_progress':
      case 'in-progress':
        return 'info';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'default';
      case 'reopened':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderDetailRow = (label, value) => (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
      <Typography variant="caption" color="text.secondary" sx={{ width: { sm: 180 } }}>
        {label}
      </Typography>
      <Typography variant="body2">{value || '-'}</Typography>
    </Stack>
  );

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Project Bug Tracker</Typography>
          <Typography variant="body2" color="text.secondary">
            View comprehensive bug reports for a selected project.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 220 }} disabled={loadingProjects}>
            <InputLabel id="project-select-label">Project</InputLabel>
            <Select
              labelId="project-select-label"
              label="Project"
              value={selectedProject}
              onChange={handleProjectChange}
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => selectedProject && loadBugs(selectedProject)}
            disabled={!selectedProject || loadingBugs}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loadingProjects && (
        <Stack alignItems="center" py={6}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" mt={2}>
            Loading projects...
          </Typography>
        </Stack>
      )}

      {!loadingProjects && !projects.length && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">No projects assigned.</Typography>
          <Typography variant="body2" color="text.secondary">
            You will see bug details here once you are part of a project.
          </Typography>
        </Paper>
      )}

      {selectedProject && !loadingProjects && (
        <Paper sx={{ p: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} mb={2}>
            <Box>
              <Typography variant="h6" fontWeight={600}>{projectName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {bugs.length ? `${bugs.length} bug${bugs.length === 1 ? '' : 's'} found` : 'No bugs recorded yet'}
              </Typography>
            </Box>
            {loadingBugs && <CircularProgress size={24} />}
          </Stack>

          {!loadingBugs && bugs.length === 0 && (
            <Box py={6} textAlign="center">
              <Typography variant="body1">No bug reports available for this project.</Typography>
              <Typography variant="body2" color="text.secondary">
                Newly reported bugs will appear here automatically.
              </Typography>
            </Box>
          )}

          {bugs.map((bug, index) => (
            <Accordion key={bug._id || bug.id || index} defaultExpanded={index === 0} sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ width: '100%' }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ flexGrow: 1 }}>
                    {bug.bugNumber || bug.title || 'Untitled Bug'}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
                    {bug.severity && (
                      <Chip label={`Severity: ${bug.severity}`} color={severityColor(bug.severity)} size="small" />
                    )}
                    {bug.status && (
                      <Chip label={`Status: ${bug.status}`} color={statusColor(bug.status)} size="small" />
                    )}
                    {bug.bugType && (
                      <Chip label={bug.bugType} variant="outlined" size="small" />
                    )}
                  </Stack>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
                    <Typography variant="subtitle2" color="text.secondary">
                      Bug Title:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {bug.title || '-'}
                    </Typography>
                  </Stack>

                  <Divider flexItem />

                  <Stack spacing={1.5}>
                    {renderDetailRow('Reported By', `${bug.reportedBy?.firstName || ''} ${bug.reportedBy?.lastName || ''}`.trim() || bug.reportedBy?.username || '-')}
                    {renderDetailRow('Assigned To', bug.assignedTo ? `${bug.assignedTo.firstName || ''} ${bug.assignedTo.lastName || ''}`.trim() || bug.assignedTo.username : 'Unassigned')}
                    {renderDetailRow('Created At', bug.createdAt ? new Date(bug.createdAt).toLocaleString() : '-')}
                    {renderDetailRow('Updated At', bug.updatedAt ? new Date(bug.updatedAt).toLocaleString() : '-')}
                    {renderDetailRow('Found In Version', bug.foundInVersion)}
                    {renderDetailRow('Fixed In Version', bug.fixedInVersion)}
                  </Stack>

                  {bug.description && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>Description</Typography>
                      <Typography variant="body2" color="text.secondary">{bug.description}</Typography>
                    </Box>
                  )}

                  {(bug.expectedBehavior || bug.actualBehavior) && (
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      {bug.expectedBehavior && (
                        <Box flex={1}>
                          <Typography variant="subtitle2" gutterBottom>Expected Behaviour</Typography>
                          <Typography variant="body2" color="text.secondary">{bug.expectedBehavior}</Typography>
                        </Box>
                      )}
                      {bug.actualBehavior && (
                        <Box flex={1}>
                          <Typography variant="subtitle2" gutterBottom>Actual Behaviour</Typography>
                          <Typography variant="body2" color="text.secondary">{bug.actualBehavior}</Typography>
                        </Box>
                      )}
                    </Stack>
                  )}

                  {Array.isArray(bug.stepsToReproduce) && bug.stepsToReproduce.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>Steps to Reproduce</Typography>
                      <Stack spacing={0.5}>
                        {bug.stepsToReproduce
                          .sort((a, b) => (a.order || 0) - (b.order || 0))
                          .map((step, idx) => (
                            <Typography key={step.order || idx} variant="body2" color="text.secondary">
                              {`${step.order || idx + 1}. ${step.step}`}
                            </Typography>
                          ))}
                      </Stack>
                    </Box>
                  )}

                  {Array.isArray(bug.comments) && bug.comments.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>Comments</Typography>
                      <Stack spacing={1}>
                        {bug.comments.slice().reverse().map((comment) => (
                          <Paper key={comment.commentId || comment._id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              {comment.comment || '-'}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                              {new Date(comment.createdAt || bug.createdAt).toLocaleString()}
                            </Typography>
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {Array.isArray(bug.watchers) && bug.watchers.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>Watchers</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {bug.watchers.map((watcher) => (
                          <Chip
                            key={watcher._id || watcher.id}
                            label={`${watcher.firstName || ''} ${watcher.lastName || ''}`.trim() || watcher.username || 'Unknown'}
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {Array.isArray(bug.attachments) && bug.attachments.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>Attachments</Typography>
                      <Stack spacing={0.5}>
                        {bug.attachments.map((file, idx) => (
                          <Typography key={idx} component="a" href={file} target="_blank" rel="noopener noreferrer" variant="body2" color="primary.main">
                            {file}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default Bugs;
