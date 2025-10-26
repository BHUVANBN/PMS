import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  Avatar,
  Chip,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  TrendingUp,
  AttachMoney,
  People,
  Assignment,
  Phone,
  Email,
  Refresh,
  MoreVert,
  CheckCircle,
  Schedule,
  Cancel,
  Star
} from '@mui/icons-material';
// salesAPI not used on this page; events widget handles fetching
import MyUpcomingEvents from '../../components/dashboard/MyUpcomingEvents';

const SalesDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data since sales endpoints might not exist yet
      const mockStats = {
        revenue: {
          total: 125000,
          monthly: 45000,
          growth: 15.2
        },
        leads: {
          total: 324,
          qualified: 89,
          converted: 23,
          pending: 67
        },
        deals: {
          active: 45,
          closed: 23,
          pipeline: 890000
        },
        performance: {
          conversionRate: 7.1,
          avgDealSize: 5435,
          salesCycle: 28
        }
      };

      const mockLeads = [
        {
          _id: '1',
          name: 'John Smith',
          company: 'Tech Corp',
          email: 'john@techcorp.com',
          phone: '+1-555-0123',
          status: 'qualified',
          value: 15000,
          priority: 'high'
        },
        {
          _id: '2',
          name: 'Sarah Johnson',
          company: 'StartupXYZ',
          email: 'sarah@startupxyz.com',
          phone: '+1-555-0124',
          status: 'contacted',
          value: 8500,
          priority: 'medium'
        },
        {
          _id: '3',
          name: 'Mike Wilson',
          company: 'Enterprise Ltd',
          email: 'mike@enterprise.com',
          phone: '+1-555-0125',
          status: 'proposal',
          value: 25000,
          priority: 'high'
        },
        {
          _id: '4',
          name: 'Lisa Brown',
          company: 'Growth Inc',
          email: 'lisa@growth.com',
          phone: '+1-555-0126',
          status: 'negotiation',
          value: 12000,
          priority: 'medium'
        },
        {
          _id: '5',
          name: 'David Lee',
          company: 'Innovation Co',
          email: 'david@innovation.com',
          phone: '+1-555-0127',
          status: 'new',
          value: 6500,
          priority: 'low'
        }
      ];

      setStats(mockStats);
      setRecentLeads(mockLeads);
    } catch (err) {
      setError(err.message || 'Failed to fetch sales data');
      console.error('Sales Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  const StatCard = ({ title, value, icon, color, trend, subtitle }) => (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 600, color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}20`, color: '#fff' }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const getStatusColor = (status) => {
    const colors = {
      new: theme.palette.info.main,
      contacted: theme.palette.warning.main,
      qualified: theme.palette.primary.main,
      proposal: theme.palette.secondary.main,
      negotiation: theme.palette.warning.main,
      closed: theme.palette.success.main,
      lost: theme.palette.error.main
    };
    return colors[status] || theme.palette.grey[500];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: theme.palette.error.main,
      medium: theme.palette.warning.main,
      low: theme.palette.success.main
    };
    return colors[priority] || theme.palette.grey[500];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box>
      {/* Header */}
      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid item xs={12} md={8}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              color: 'text.primary',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              letterSpacing: '-0.02em',
              mb: 1.5
            }}
          >
            Sales Dashboard
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 400,
              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
              lineHeight: 1.6,
              letterSpacing: '0.01em'
            }}
          >
            Your sales performance overview and pipeline at a glance.
          </Typography>
        </Grid>
      </Grid>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats?.revenue?.total || 0)}
            icon={<AttachMoney />}
            color={theme.palette.success.main}
            trend={`+${stats?.revenue?.growth || 0}% this month`}
            subtitle={`${formatCurrency(stats?.revenue?.monthly || 0)} monthly`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Leads"
            value={stats?.leads?.total || 0}
            icon={<People />}
            color={theme.palette.primary.main}
            subtitle={`${stats?.leads?.qualified || 0} qualified`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Deals"
            value={stats?.deals?.active || 0}
            icon={<Assignment />}
            color={theme.palette.info.main}
            subtitle={`${formatCurrency(stats?.deals?.pipeline || 0)} pipeline`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Conversion Rate"
            value={`${stats?.performance?.conversionRate || 0}%`}
            icon={<TrendingUp />}
            color={theme.palette.warning.main}
            subtitle={`${stats?.performance?.salesCycle || 0} days avg cycle`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Lead Status Distribution */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Lead Status Distribution
            </Typography>
            <Box>
              {stats?.leads && Object.entries(stats.leads).filter(([key]) => key !== 'total').map(([status, count]) => (
                <Box key={status} mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {status}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {count}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(count / (stats?.leads?.total || 1)) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getStatusColor(status),
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Leads */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Leads
              </Typography>
              <Button size="small" color="primary">
                View All
              </Button>
            </Box>
            <TableContainer sx={{ maxHeight: 320 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Contact</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentLeads.map((lead) => (
                    <TableRow key={lead._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              mr: 1,
                              bgcolor: getPriorityColor(lead.priority),
                              fontSize: '0.875rem'
                            }}
                          >
                            {lead.name?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {lead.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {lead.company}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={lead.status}
                          size="small"
                          sx={{
                            bgcolor: `${getStatusColor(lead.status)}20`,
                            color: getStatusColor(lead.status),
                            textTransform: 'capitalize',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(lead.value)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Sales Performance Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center" p={2}>
                  <Avatar sx={{ bgcolor: 'success.light', color: '#fff', mx: 'auto', mb: 1 }}>
                    <CheckCircle />
                  </Avatar>
                  <Typography variant="h5" fontWeight={600}>
                    {stats?.deals?.closed || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Deals Closed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center" p={2}>
                  <Avatar sx={{ bgcolor: 'info.light', color: '#fff', mx: 'auto', mb: 1 }}>
                    <AttachMoney />
                  </Avatar>
                  <Typography variant="h5" fontWeight={600}>
                    {formatCurrency(stats?.performance?.avgDealSize || 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Avg Deal Size
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center" p={2}>
                  <Avatar sx={{ bgcolor: 'warning.light', color: '#fff', mx: 'auto', mb: 1 }}>
                    <Schedule />
                  </Avatar>
                  <Typography variant="h5" fontWeight={600}>
                    {stats?.performance?.salesCycle || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Days Sales Cycle
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center" p={2}>
                  <Avatar sx={{ bgcolor: 'primary.light', color: '#fff', mx: 'auto', mb: 1 }}>
                    <Star />
                  </Avatar>
                  <Typography variant="h5" fontWeight={600}>
                    {stats?.performance?.conversionRate || 0}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Conversion Rate
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalesDashboard;
