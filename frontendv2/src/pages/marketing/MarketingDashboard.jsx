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
  Campaign,
  TrendingUp,
  Visibility,
  Mouse,
  Email,
  Share,
  Refresh,
  MoreVert,
  Analytics,
  People,
  AttachMoney,
  Schedule
} from '@mui/icons-material';
// marketingAPI not used on this page; events widget handles fetching
import MyUpcomingEvents from '../../components/dashboard/MyUpcomingEvents';

const MarketingDashboard = () => {
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data since marketing endpoints might not exist yet
      const mockStats = {
        campaigns: {
          total: 24,
          active: 8,
          completed: 16,
          budget: 85000
        },
        performance: {
          impressions: 1250000,
          clicks: 45600,
          conversions: 1240,
          ctr: 3.65,
          conversionRate: 2.72,
          costPerClick: 1.86
        },
        social: {
          followers: 12500,
          engagement: 4.8,
          reach: 89000,
          shares: 2340
        },
        email: {
          subscribers: 8900,
          openRate: 24.5,
          clickRate: 3.2,
          unsubscribeRate: 0.8
        }
      };

      const mockCampaigns = [
        {
          _id: '1',
          name: 'Summer Product Launch',
          type: 'social',
          status: 'active',
          budget: 15000,
          spent: 8500,
          impressions: 125000,
          clicks: 4200,
          conversions: 89,
          startDate: '2024-01-15',
          endDate: '2024-02-15'
        },
        {
          _id: '2',
          name: 'Email Newsletter Q1',
          type: 'email',
          status: 'active',
          budget: 5000,
          spent: 2800,
          impressions: 45000,
          clicks: 1800,
          conversions: 45,
          startDate: '2024-01-01',
          endDate: '2024-03-31'
        },
        {
          _id: '3',
          name: 'Brand Awareness Campaign',
          type: 'display',
          status: 'completed',
          budget: 20000,
          spent: 19500,
          impressions: 890000,
          clicks: 12000,
          conversions: 234,
          startDate: '2023-12-01',
          endDate: '2024-01-31'
        },
        {
          _id: '4',
          name: 'Holiday Promotion',
          type: 'search',
          status: 'paused',
          budget: 12000,
          spent: 6500,
          impressions: 67000,
          clicks: 2100,
          conversions: 78,
          startDate: '2023-11-15',
          endDate: '2024-01-15'
        },
        {
          _id: '5',
          name: 'Retargeting Campaign',
          type: 'display',
          status: 'active',
          budget: 8000,
          spent: 3200,
          impressions: 34000,
          clicks: 890,
          conversions: 34,
          startDate: '2024-01-20',
          endDate: '2024-02-20'
        }
      ];

      setStats(mockStats);
      setCampaigns(mockCampaigns);
    } catch (err) {
      setError(err.message || 'Failed to fetch marketing data');
      console.error('Marketing Dashboard error:', err);
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
          <Avatar sx={{ bgcolor: `${color}20`, color }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const getStatusColor = (status) => {
    const colors = {
      active: theme.palette.success.main,
      paused: theme.palette.warning.main,
      completed: theme.palette.info.main,
      draft: theme.palette.grey[600]
    };
    return colors[status] || theme.palette.grey[500];
  };

  const getCampaignTypeColor = (type) => {
    const colors = {
      social: theme.palette.primary.main,
      email: theme.palette.secondary.main,
      display: theme.palette.info.main,
      search: theme.palette.warning.main,
      video: theme.palette.error.main
    };
    return colors[type] || theme.palette.grey[500];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <Box>
      {/* Header */}
      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Marketing Dashboard
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <MyUpcomingEvents title="My Upcoming Events" days={14} />
        </Grid>
      </Grid>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Campaigns"
            value={stats?.campaigns?.total || 0}
            icon={<Campaign />}
            color={theme.palette.primary.main}
            subtitle={`${stats?.campaigns?.active || 0} active`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Impressions"
            value={formatNumber(stats?.performance?.impressions || 0)}
            icon={<Visibility />}
            color={theme.palette.info.main}
            trend="+18% this month"
            subtitle="Views across all campaigns"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Click-Through Rate"
            value={`${stats?.performance?.ctr || 0}%`}
            icon={<Mouse />}
            color={theme.palette.success.main}
            trend="+0.8% this month"
            subtitle={`${formatNumber(stats?.performance?.clicks || 0)} total clicks`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Conversions"
            value={formatNumber(stats?.performance?.conversions || 0)}
            icon={<TrendingUp />}
            color={theme.palette.warning.main}
            subtitle={`${stats?.performance?.conversionRate || 0}% conversion rate`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Campaign Performance */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Active Campaigns
              </Typography>
              <Button size="small" color="primary">
                View All
              </Button>
            </Box>
            <TableContainer sx={{ maxHeight: 320 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Campaign</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Budget</TableCell>
                    <TableCell>Performance</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign._id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {campaign.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={campaign.type}
                          size="small"
                          sx={{
                            bgcolor: `${getCampaignTypeColor(campaign.type)}20`,
                            color: getCampaignTypeColor(campaign.type),
                            textTransform: 'capitalize',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={campaign.status}
                          size="small"
                          sx={{
                            bgcolor: `${getStatusColor(campaign.status)}20`,
                            color: getStatusColor(campaign.status),
                            textTransform: 'capitalize',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(campaign.spent / campaign.budget) * 100}
                            sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {campaign.conversions} conversions
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatNumber(campaign.clicks)} clicks
                          </Typography>
                        </Box>
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

        {/* Key Metrics */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Key Performance Metrics
            </Typography>
            <Box>
              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Cost Per Click</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    ${stats?.performance?.costPerClick || 0}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={75}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: theme.palette.success.main,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>

              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Email Open Rate</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {stats?.email?.openRate || 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stats?.email?.openRate || 0}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: theme.palette.info.main,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>

              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Social Engagement</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {stats?.social?.engagement || 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stats?.social?.engagement || 0}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: theme.palette.primary.main,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>

              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Conversion Rate</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {stats?.performance?.conversionRate || 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stats?.performance?.conversionRate || 0}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: theme.palette.warning.main,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Channel Performance */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Channel Performance Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center" p={2}>
                  <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark', mx: 'auto', mb: 1 }}>
                    <Share />
                  </Avatar>
                  <Typography variant="h5" fontWeight={600}>
                    {formatNumber(stats?.social?.followers || 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Social Followers
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center" p={2}>
                  <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.dark', mx: 'auto', mb: 1 }}>
                    <Email />
                  </Avatar>
                  <Typography variant="h5" fontWeight={600}>
                    {formatNumber(stats?.email?.subscribers || 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Email Subscribers
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center" p={2}>
                  <Avatar sx={{ bgcolor: 'info.light', color: 'info.dark', mx: 'auto', mb: 1 }}>
                    <Analytics />
                  </Avatar>
                  <Typography variant="h5" fontWeight={600}>
                    {formatNumber(stats?.social?.reach || 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Social Reach
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center" p={2}>
                  <Avatar sx={{ bgcolor: 'success.light', color: 'success.dark', mx: 'auto', mb: 1 }}>
                    <AttachMoney />
                  </Avatar>
                  <Typography variant="h5" fontWeight={600}>
                    {formatCurrency(stats?.campaigns?.budget || 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Budget
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

export default MarketingDashboard;
