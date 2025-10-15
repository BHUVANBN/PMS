import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Box,
  Badge,
} from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  BugReport as BugReportIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  CalendarMonth as CalendarIcon,
  GroupWork as GroupWorkIcon,
  List as ListIcon,
  BarChart as BarChartIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';
import { meetingAPI } from '../../services/api.js'; // adjust path

const drawerWidth = 240;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
    backgroundColor: theme.palette.background.paper,
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  '&.Mui-selected': {
    backgroundColor: theme.palette.action.selected,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 2),
  width: 'auto',
}));

const Sidebar = ({ mobileOpen, onClose, userRole }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [meetingCount, setMeetingCount] = useState(0);

  const role = (userRole || user?.role || '').toLowerCase();

  const dashboardPath = role ? `/${role}/dashboard` : '/dashboard';
  const usersPath =
    role === 'admin' ? '/admin/users' : role === 'hr' ? '/hr/employees' : '/users';
  const projectsPath = role === 'manager' ? '/manager/projects' : '/projects';
  const teamPath = role === 'manager' ? '/manager/team' : '/team';
  const ticketsPath =
    role === 'developer'
      ? '/developer/kanban'
      : role === 'tester'
      ? '/tester/kanban'
      : role === 'manager'
      ? '/manager/kanban'
      : '/tickets';

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: dashboardPath,
      roles: ['admin', 'hr', 'manager', 'developer', 'tester', 'sales', 'marketing', 'intern'],
    },
    {
      text: role === 'hr' ? 'Employees' : 'Users',
      icon: <PeopleIcon />,
      path: usersPath,
      roles: ['admin', 'hr'],
    },
    {
      text: 'Projects',
      icon: <WorkIcon />,
      path: projectsPath,
      roles: ['admin', 'manager', 'developer', 'tester'],
    },
    {
      text: 'Tickets',
      icon: <ListIcon />,
      path: ticketsPath,
      roles: ['manager', 'developer', 'tester'],
    },
    {
      text: 'Team',
      icon: <PeopleIcon />,
      path: teamPath,
      roles: ['admin', 'hr', 'manager'],
    },
    {
      text: 'Meetings',
      icon: <VideoCallIcon />,
      path: '/meetings',
      roles: ['manager', 'developer', 'tester', 'hr', 'intern', 'admin'],
    },
    {
      text: 'Sprints',
      icon: <GroupWorkIcon />,
      path: '/sprints',
      roles: ['developer', 'tester'],
    },
    {
      text: 'Bug Tracker',
      icon: <BugReportIcon />,
      path: '/bugs',
      roles: ['tester', 'developer', 'manager'],
    },
    {
      text: 'Calendar',
      icon: <CalendarIcon />,
      path: '/calendar',
      roles: ['admin', 'hr', 'manager', 'developer', 'tester'],
    },
    {
      text: 'Analytics',
      icon: <BarChartIcon />,
      path: '/analytics',
      roles: ['admin', 'hr', 'manager'],
    },
    {
      text: 'Onboarding (Public)',
      icon: <PeopleIcon />,
      path: '/hr/onboarding-public',
      roles: ['hr', 'admin'],
    },
  ];

  const bottomMenuItems = [
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Help & Support', icon: <HelpIcon />, path: '/help' },
  ];

  const filteredMenuItems = role
    ? menuItems.filter((item) => item.roles.includes(role))
    : menuItems;

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) onClose();
  };

  // Fetch meetings for notification badge
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await meetingAPI.getUserMeetings();
        const meetings = res.meetings || res.data || [];
        const now = new Date();
        const activeMeetings = meetings.filter((m) => new Date(m.endTime) > now);
        setMeetingCount(activeMeetings.length);
      } catch (err) {
        console.error('Failed to fetch meetings for sidebar:', err);
      }
    };

    fetchMeetings();

    // Poll every 1 min
    const interval = setInterval(fetchMeetings, 60000);
    return () => clearInterval(interval);
  }, []);

  const drawer = (
    <>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1, width: '100%' }}>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            PMS
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <StyledListItem
            key={item.text}
            disablePadding
            selected={isActive(item.path)}
            onClick={() => handleNavigation(item.path)}
          >
            <ListItemButton>
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.text === 'Meetings' && meetingCount > 0 ? (
                  <Badge badgeContent={meetingCount} color="error">
                    {React.cloneElement(item.icon, {
                      color: isActive(item.path) ? 'primary' : 'inherit',
                    })}
                  </Badge>
                ) : (
                  React.cloneElement(item.icon, {
                    color: isActive(item.path) ? 'primary' : 'inherit',
                  })
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isActive(item.path) ? 'medium' : 'regular',
                }}
              />
            </ListItemButton>
          </StyledListItem>
        ))}
      </List>
      <Divider sx={{ mt: 'auto' }} />
      <List>
        {bottomMenuItems.map((item) => (
          <StyledListItem
            key={item.text}
            disablePadding
            selected={isActive(item.path)}
            onClick={() => handleNavigation(item.path)}
          >
            <ListItemButton>
              <ListItemIcon sx={{ minWidth: 40 }}>
                {React.cloneElement(item.icon, {
                  color: isActive(item.path) ? 'primary' : 'inherit',
                })}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </StyledListItem>
        ))}
      </List>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="navigation drawer"
    >
      <StyledDrawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
      >
        {drawer}
      </StyledDrawer>
    </Box>
  );
};

export default Sidebar;
