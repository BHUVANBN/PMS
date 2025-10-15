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
  Box,
  Badge,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  BugReport as BugReportIcon,
  Settings as SettingsIcon,
  GroupWork as GroupWorkIcon,
  List as ListIcon,
  BarChart as BarChartIcon,
  Help as HelpIcon,
  VideoCall as VideoCallIcon,
  CalendarMonth as CalendarMonthIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

import { useAuth } from '../../contexts/AuthContext'; // Your auth context
import { meetingAPI, calendarAPI, subscribeToEvents } from '../../services/api';

const drawerWidth = 240;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
}));

const ActiveListItem = styled(ListItem)(({ theme }) => ({
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
  const [eventCount, setEventCount] = useState(0);

  // Role-based filtering
  const role = (userRole || user?.role || '').toLowerCase();

  // MENU items
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: `/${role}/dashboard`,
      roles: ['admin', 'hr', 'manager', 'developer', 'tester', 'sales', 'marketing', 'intern'],
    },
    {
      text: role === 'hr' ? 'Employees' : 'Users',
      icon: <PeopleIcon />,
      path: role === 'admin' ? '/admin/users' : role === 'hr' ? '/hr/employees' : '/users',
      roles: ['admin', 'hr'],
    },
    {
      text: 'Projects',
      icon: <WorkIcon />,
      path: role === 'manager' ? '/manager/projects' : '/projects',
      roles: ['admin', 'manager', 'developer', 'tester'],
    },
    {
      text: 'Tickets',
      icon: <ListIcon />,
      path: role ? (role === 'manager' ? '/manager/kanban' : '/tickets') : '/tickets',
      roles: ['manager', 'developer', 'tester'],
    },
    {
      text: 'Team',
      icon: <PeopleIcon />,
      path: role === 'manager' ? '/manager/team' : '/team',
      roles: ['admin', 'hr', 'manager'],
    },
    {
      text: 'Meetings',
      icon: <VideoCallIcon />,
      path: '/meetings',
      roles: ['admin', 'hr', 'manager', 'developer', 'tester', 'intern'],
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
      roles: ['developer', 'tester', 'manager'],
    },
    {
      text: 'Calendar',
      icon: <CalendarMonthIcon />,
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
      roles: ['admin', 'hr'],
    },
  ];

  const bottomMenuItems = [
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Help & Support', icon: <HelpIcon />, path: '/help' },
  ];

  // Filter menu items based on role
  const filteredItems = role
    ? menuItems.filter((item) => item.roles.includes(role))
    : menuItems;

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) onClose();
  };

  // Fetch meeting count
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await meetingAPI.getUserMeetings();
        const meetings = res?.meetings || res?.data || [];
        const now = new Date();
        const activeMeetings = meetings.filter((m) => new Date(m.endTime || m.end) > now);
        setMeetingCount(activeMeetings.length);
      } catch (err) {
        console.error('Failed to fetch meetings:', err);
      }
    };
    fetchMeetings();
    const intervalId = setInterval(fetchMeetings, 60000);
    return () => clearInterval(intervalId);
  }, [user?._id]);

  // Fetch calendar events count
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await calendarAPI.getAllEvents();
        console.log('Fetching calendar events...');
        console.log('API Response:', res);
        const events = res?.events || res?.data || res || [];
        const now = new Date();
        const upcomingEvents = events.filter((e) => {
          const endDate = new Date(e.endTime || e.end || e.eventDate);
          return !isNaN(endDate) && endDate > now;
        });
        setEventCount(upcomingEvents.length);
      } catch (err) {
        console.error('Failed to fetch calendar events:', err);
      }
    };
    if (user?._id) fetchEvents();
    const intervalId = setInterval(fetchEvents, 60000);
    return () => clearInterval(intervalId);
  }, [user?._id]);

  // Optional: Subscribe to real-time updates for instant sync (for calendar and meetings)
  useEffect(() => {
    let unsubscribeFns = [];
    if (user?._id) {
      const unsubscribeCalendar = subscribeToEvents(
        { userId: user._id },
        (msg) => {
          if (msg?.type?.startsWith('calendar.')) {
            fetchEvents(); // Reload calendar events
          }
        }
      );
      const unsubscribeMeetings = subscribeToEvents(
        { userId: user._id },
        (msg) => {
          if (msg?.type?.startsWith('meeting.')) {
            // Reload meetings count
            meetingAPI.getUserMeetings().then((res) => {
              const meetings = res?.meetings || res?.data || [];
              const now = new Date();
              const activeMeetings = meetings.filter((m) => new Date(m.endTime || m.end) > now);
              setMeetingCount(activeMeetings.length);
            });
          }
        }
      );
      unsubscribeFns = [unsubscribeCalendar, unsubscribeMeetings];
    }
    return () => {
      // Cleanup for SSE
      unsubscribeFns.forEach((unsub) => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, [user?._id]);

  return (
    <Box
      component='nav'
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label='Navigation drawer'
    >
      <StyledDrawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 1, width: '100%' }}>
            <Typography variant='h6' fontWeight={600}>
              PMS
            </Typography>
          </Box>
        </Toolbar>
        <Divider />
        <List>
          {filteredItems.map((item) => {
            let badgeCount = 0;
            let badgeColor = 'error';

            if (item.text === 'Meetings' && meetingCount > 0) {
              badgeCount = meetingCount;
              badgeColor = 'error';
            }
            if (item.text === 'Calendar' && eventCount > 0) {
              badgeCount = eventCount;
              badgeColor = 'secondary';
            }

            return (
              <ActiveListItem
                key={item.text}
                disablePadding
                selected={isActive(item.path)}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemButton>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {badgeCount > 0 ? (
                      <Badge badgeContent={badgeCount} color={badgeColor}>
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
                      fontWeight: isActive(item.path) ? 'medium' : 'normal',
                    }}
                  />
                </ListItemButton>
              </ActiveListItem>
            );
          })}
        </List>
        <Divider sx={{ mt: 'auto' }} />
        <List>
          {bottomMenuItems.map((item) => (
            <ActiveListItem
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
            </ActiveListItem>
          ))}
        </List>
      </StyledDrawer>
    </Box>
  );
};

export default Sidebar;