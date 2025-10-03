import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  ArrowBack,
  Search,
  Assignment,
  BugReport,
  CheckCircle,
  Person,
  Schedule,
  Comment,
  FilterList
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ActivityLogs = () => {
  const navigate = useNavigate();
  const { user, authLoading, isAuthenticated } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      fetchActivityLogs();
    }
  }, [authLoading, isAuthenticated, user, page, filterType]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminAPI.getActivityLogs();
      console.log('Activity logs response:', response);
      
      // Normalize activities response
      let activityList = [];
      if (Array.isArray(response)) {
        activityList = response;
      } else if (response?.activities) {
        activityList = response.activities;
      } else if (response?.data?.activities) {
        activityList = response.data.activities;
      } else if (response?.data && Array.isArray(response.data)) {
        activityList = response.data;
      }

      // Filter activities based on type
      if (filterType !== 'all') {
        activityList = activityList.filter(activity => activity.type === filterType);
      }

      // Filter activities based on search term
      if (searchTerm.trim()) {
        activityList = activityList.filter(activity =>
          activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.user?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Sort by timestamp (newest first)
      activityList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Calculate pagination
      const total = Math.ceil(activityList.length / itemsPerPage);
      setTotalPages(total);

      // Get current page items
      const startIndex = (page - 1) * itemsPerPage;
      const paginatedActivities = activityList.slice(startIndex, startIndex + itemsPerPage);

      setActivities(paginatedActivities);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setError('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

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

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActivityTypeLabel = (type) => {
    switch (type) {
      case 'ticket_created':
        return 'Ticket Created';
      case 'bug_reported':
        return 'Bug Reported';
      case 'task_completed':
        return 'Task Completed';
      case 'user_joined':
        return 'User Joined';
      case 'comment_added':
        return 'Comment Added';
      default:
        return 'Activity';
    }
  };

  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
    fetchActivityLogs();
  };

  const handleFilterChange = (newFilter) => {
    setFilterType(newFilter);
    setPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <Box p={3}>
        <Alert severity="error">Access denied. Admin privileges required.</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/admin/dashboard')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          Activity Logs
        </Typography>
      </Box>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
            
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                label="Filter by Type"
                onChange={(e) => handleFilterChange(e.target.value)}
                startAdornment={<FilterList sx={{ mr: 1 }} />}
              >
                <MenuItem value="all">All Activities</MenuItem>
                <MenuItem value="ticket_created">Tickets Created</MenuItem>
                <MenuItem value="bug_reported">Bugs Reported</MenuItem>
                <MenuItem value="task_completed">Tasks Completed</MenuItem>
                <MenuItem value="user_joined">Users Joined</MenuItem>
                <MenuItem value="comment_added">Comments Added</MenuItem>
              </Select>
            </FormControl>

            <Button variant="contained" onClick={handleSearch}>
              Search
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Activity Logs Table */}
      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : activities.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Schedule sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No activity logs found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Activity logs will appear here as users interact with the system'
                }
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Activity</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Timestamp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activities.map((activity) => (
                      <TableRow key={activity.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              sx={{
                                bgcolor: `${getActivityColor(activity.type)}.main`,
                                width: 40,
                                height: 40,
                              }}
                            >
                              {getActivityIcon(activity.type)}
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium">
                              {activity.title}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getActivityTypeLabel(activity.type)}
                            color={getActivityColor(activity.type)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {activity.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {activity.user}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDateTime(activity.timestamp)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ActivityLogs;
