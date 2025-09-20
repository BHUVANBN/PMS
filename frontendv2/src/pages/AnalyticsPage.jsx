import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box,
  Button,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress
} from '@mui/material';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import StatsGrid from '../components/dashboard/StatsGrid';
import DashboardCard from '../components/dashboard/DashboardCard';
import { analyticsAPI } from '../services/api';

const AnalyticsPage = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [timeRange, setTimeRange] = useState('30d');
  const [stats, setStats] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = ['Overview', 'Projects', 'Team Performance', 'Tickets', 'Time Tracking'];
  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      // Mock data for demonstration
      setStats([
        {
          title: 'Total Projects',
          value: '24',
          subtitle: 'Active projects',
          icon: <ChartBarIcon className="h-6 w-6" />,
          trend: 'up',
          trendValue: '+12%',
          color: 'primary'
        },
        {
          title: 'Completed Tasks',
          value: '156',
          subtitle: 'This month',
          icon: <ArrowTrendingUpIcon className="h-6 w-6" />,
          trend: 'up',
          trendValue: '+23%',
          color: 'success'
        },
        {
          title: 'Team Velocity',
          value: '42',
          subtitle: 'Story points/sprint',
          icon: <UserGroupIcon className="h-6 w-6" />,
          trend: 'up',
          trendValue: '+8%',
          color: 'info'
        },
        {
          title: 'Bug Rate',
          value: '2.3%',
          subtitle: 'Of total tickets',
          icon: <ArrowTrendingDownIcon className="h-6 w-6" />,
          trend: 'down',
          trendValue: '-1.2%',
          color: 'warning'
        }
      ]);

      setPerformanceData([
        { name: 'Jan', tasks: 65, bugs: 8, velocity: 38 },
        { name: 'Feb', tasks: 78, bugs: 12, velocity: 42 },
        { name: 'Mar', tasks: 90, bugs: 6, velocity: 45 },
        { name: 'Apr', tasks: 81, bugs: 9, velocity: 41 },
        { name: 'May', tasks: 95, bugs: 4, velocity: 48 },
        { name: 'Jun', tasks: 88, bugs: 7, velocity: 44 }
      ]);

      setProjectData([
        { name: 'E-commerce Platform', progress: 75, budget: 85, team: 8 },
        { name: 'Mobile App Redesign', progress: 45, budget: 60, team: 5 },
        { name: 'API Integration', progress: 90, budget: 95, team: 3 },
        { name: 'Dashboard Analytics', progress: 100, budget: 98, team: 6 },
        { name: 'Security Audit', progress: 30, budget: 40, team: 4 }
      ]);

      setTeamData([
        { name: 'Frontend', value: 35, hours: 280 },
        { name: 'Backend', value: 28, hours: 224 },
        { name: 'DevOps', value: 15, hours: 120 },
        { name: 'QA', value: 12, hours: 96 },
        { name: 'Design', value: 10, hours: 80 }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading analytics...</Typography>
      </Box>
    );
  }

  const renderOverview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <StatsGrid stats={stats} />
      </Grid>
      
      <Grid item xs={12} lg={8}>
        <DashboardCard title="Performance Trends">
          <Box sx={{ height: 300, mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Monthly performance metrics showing task completion and bug rates
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 12, height: 12, bgcolor: 'primary.main', mr: 1 }} />
                <Typography variant="body2">Tasks Completed</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 12, height: 12, bgcolor: 'error.main', mr: 1 }} />
                <Typography variant="body2">Bugs Found</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', mr: 1 }} />
                <Typography variant="body2">Team Velocity</Typography>
              </Box>
            </Box>
          </Box>
        </DashboardCard>
      </Grid>

      <Grid item xs={12} lg={4}>
        <DashboardCard title="Team Distribution">
          <Box sx={{ height: 300, mt: 2 }}>
            {teamData.map((item, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{item.name}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.value}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={item.value}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            ))}
          </Box>
        </DashboardCard>
      </Grid>
    </Grid>
  );

  const renderProjects = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <DashboardCard title="Project Progress Overview">
          <Box sx={{ mt: 2 }}>
            {projectData.map((project, index) => (
              <Card key={index} sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {project.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    <Typography variant="body2">{project.team} members</Typography>
                  </Box>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Progress: {project.progress}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={project.progress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Budget Used: {project.budget}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={project.budget}
                      color={project.budget > 90 ? 'error' : project.budget > 75 ? 'warning' : 'primary'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Grid>
                </Grid>
              </Card>
            ))}
          </Box>
        </DashboardCard>
      </Grid>
    </Grid>
  );

  const renderTeamPerformance = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <DashboardCard title="Team Workload Distribution">
          <Box sx={{ mt: 2 }}>
            {teamData.map((team, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {team.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {team.hours}h
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={team.value}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {team.value}% of total workload
                </Typography>
              </Box>
            ))}
          </Box>
        </DashboardCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <DashboardCard title="Performance Metrics">
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                    94%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    On-time Delivery
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
                    4.8
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quality Score
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main" sx={{ fontWeight: 600 }}>
                    42
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Velocity
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main" sx={{ fontWeight: 600 }}>
                    2.3%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bug Rate
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </DashboardCard>
      </Grid>
    </Grid>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 0: return renderOverview();
      case 1: return renderProjects();
      case 2: return renderTeamPerformance();
      case 3: return renderOverview(); // Placeholder for tickets
      case 4: return renderTeamPerformance(); // Placeholder for time tracking
      default: return renderOverview();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Analytics & Reports
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            {timeRanges.map((range) => (
              <MenuItem key={range.value} value={range.value}>
                {range.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab} />
          ))}
        </Tabs>
      </Box>

      {/* Content */}
      {renderContent()}
    </Box>
  );
};

export default AnalyticsPage;
