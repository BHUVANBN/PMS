import React from 'react';
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
  Collapse
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  BugReport as BugReportIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  StarBorder,
  List as ListIcon,
  CalendarMonth as CalendarIcon,
  GroupWork as GroupWorkIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Chat as ChatIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';

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

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const role = (userRole || user?.role || '').toLowerCase();

  const dashboardPath = role ? `/${role}/dashboard` : '/dashboard';
  const usersPath = role === 'admin' ? '/admin/users' : role === 'hr' ? '/hr/employees' : '/users';

  const projectsPath = role === 'manager' ? '/manager/projects' : '/projects';
  const teamPath = role === 'manager' ? '/manager/team' : '/team';
  // Route Tickets menu to Kanban for dev/tester, project Kanban for manager
  const ticketsPath = role === 'developer'
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
      text: 'Users',
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
      roles: ['admin', 'manager', 'developer', 'tester'],
    },
    {
      text: 'Team',
      icon: <PeopleIcon />,
      path: teamPath,
      roles: ['admin', 'hr', 'manager'],
    },
    {
      text: 'Sprints',
      icon: <GroupWorkIcon />,
      path: '/sprints',
      roles: ['admin', 'manager', 'developer', 'tester'],
    },
    {
      text: 'Bug Tracker',
      icon: <BugReportIcon />,
      path: '/bugs',
      roles: ['admin', 'tester', 'developer', 'manager'],
    },
    {
      text: 'Reports',
      icon: <AssessmentIcon />,
      path: '/reports',
      roles: ['admin', 'hr', 'manager'],
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
  ];

  const bottomMenuItems = [
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Help & Support', icon: <HelpIcon />, path: '/help' },
  ];

  const effectiveRole = (userRole || user?.role || '').toLowerCase();
  const filteredMenuItems = effectiveRole
    ? menuItems.filter((item) => item.roles.includes(effectiveRole))
    : menuItems; // if no role yet, show all to avoid empty sidebar; access still protected by routes

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
                {React.cloneElement(item.icon, {
                  color: isActive(item.path) ? 'primary' : 'inherit',
                })}
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
      aria-label="mailbox folders"
    >
      <StyledDrawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </StyledDrawer>
    </Box>
  );
};

export default Sidebar;
