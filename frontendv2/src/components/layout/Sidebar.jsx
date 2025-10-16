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
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import useViewportSize from '../../utils/useViewportSize';
import logo from '../../assets/skillonx.png';

import { useAuth } from '../../contexts/AuthContext';
import { meetingAPI, calendarAPI, subscribeToEvents } from '../../services/api';

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    boxSizing: 'border-box',
    borderRight: '1px solid rgba(255,255,255,0.4)',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.25) 100%)',
    backdropFilter: 'blur(24px) saturate(120%)',
    WebkitBackdropFilter: 'blur(24px) saturate(120%)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 30px rgba(0,0,0,0.08)',
  },
}));

const ActiveListItem = styled(ListItem)(({ theme }) => ({
  '&.Mui-selected': {
    backgroundColor: 'rgba(99,102,241,0.1)',
    '&:hover': {
      backgroundColor: 'rgba(99,102,241,0.12)',
    },
  },
  '&:hover': {
    backgroundColor: 'rgba(99,102,241,0.06)',
  },
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 1.5),
  width: 'auto',
}));

const Sidebar = ({ mobileOpen, onClose, userRole }) => {
  const theme = useTheme();
  const { metrics } = useViewportSize();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [meetingCount, setMeetingCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);

  const role = (userRole || user?.role || '').toLowerCase();

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
      text: 'Documents',
      icon: <DescriptionIcon />,
      path: role === 'manager' ? '/manager/documents' : (role === 'hr' || role === 'admin' ? '/hr/documents' : '/documents'),
      roles: ['admin', 'hr', 'manager'],
    },
    {
      text: 'My Documents',
      icon: <DescriptionIcon />,
      path: '/documents',
      roles: ['developer', 'tester', 'sales', 'marketing', 'intern'],
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

  const filteredItems = role
    ? menuItems.filter((item) => item.roles.includes(role))
    : menuItems;

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const fetchEvents = async () => {
    try {
      const res = await calendarAPI.getAllEvents();
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

  useEffect(() => {
    if (user?._id) fetchEvents();
    const intervalId = setInterval(fetchEvents, 60000);
    return () => clearInterval(intervalId);
  }, [user?._id]);

  useEffect(() => {
    let unsubscribeFns = [];
    if (user?._id) {
      const unsubscribeCalendar = subscribeToEvents(
        { userId: user._id },
        (msg) => {
          if (msg?.type?.startsWith('calendar.')) {
            fetchEvents();
          }
        }
      );
      const unsubscribeMeetings = subscribeToEvents(
        { userId: user._id },
        (msg) => {
          if (msg?.type?.startsWith('meeting.')) {
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
      unsubscribeFns.forEach((unsub) => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, [user?._id]);

  return (
    <Box
      component='nav'
      sx={{ width: { sm: metrics.left }, flexShrink: { sm: 0 } }}
      aria-label='Navigation drawer'
    >
      <StyledDrawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: { sm: metrics.left },
          '& .MuiDrawer-paper': { width: { sm: metrics.left } }
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 1, width: '100%' }}>
            <Box 
              component="img" 
              src={logo} 
              alt="Skillonx" 
              sx={{ 
                height: 'auto', 
                width: '170px',
                maxWidth: '100%'
              }} 
            />
          </Box>
        </Toolbar>

        <Divider sx={{ opacity: 0.6 }} />
        
        <List sx={{ px: 1, py: 1.5 }}>
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
                <ListItemButton 
                  sx={{ 
                    height: 52,
                    py: 1.5, 
                    px: 2,
                    borderRadius: 1.5,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: 36,
                      '& .MuiSvgIcon-root': { 
                        width: 22, 
                        height: 22,
                        transition: 'transform 0.2s ease',
                      },
                      '&:hover .MuiSvgIcon-root': {
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    {badgeCount > 0 ? (
                      <Badge 
                        badgeContent={badgeCount} 
                        color={badgeColor}
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.625rem',
                            height: 18,
                            minWidth: 18,
                            fontWeight: 600
                          }
                        }}
                      >
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
                      fontWeight: isActive(item.path) ? '600' : '500',
                      fontSize: '0.9375rem',
                      lineHeight: 1.5,
                      letterSpacing: '0.01em',
                      color: isActive(item.path) ? 'primary.main' : 'text.primary',
                      sx: {
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale',
                      }
                    }}
                  />
                </ListItemButton>
              </ActiveListItem>
            );
          })}
        </List>
        
        <Divider sx={{ mt: 'auto', opacity: 0.6 }} />
        
        <List sx={{ px: 1, py: 1.5 }}>
          {bottomMenuItems.map((item) => (
            <ActiveListItem
              key={item.text}
              disablePadding
              selected={isActive(item.path)}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemButton
                sx={{ 
                  height: 52,
                  py: 1.5, 
                  px: 2,
                  borderRadius: 1.5,
                  transition: 'all 0.2s ease'
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 36,
                    '& .MuiSvgIcon-root': { 
                      width: 22, 
                      height: 22,
                      transition: 'transform 0.2s ease',
                    },
                    '&:hover .MuiSvgIcon-root': {
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  {React.cloneElement(item.icon, {
                    color: isActive(item.path) ? 'primary' : 'inherit',
                  })}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? '600' : '500',
                    fontSize: '0.9375rem',
                    lineHeight: 1.5,
                    letterSpacing: '0.01em',
                    color: isActive(item.path) ? 'primary.main' : 'text.primary',
                    sx: {
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                    }
                  }}
                />
              </ListItemButton>
            </ActiveListItem>
          ))}
        </List>
      </StyledDrawer>
    </Box>
  );
};

export default Sidebar;