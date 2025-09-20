import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box,
  Button,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import {
  TicketIcon,
  UserIcon,
  CalendarDaysIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChatBubbleLeftIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import { ticketsAPI } from '../services/api';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const tabs = ['All Tickets', 'Open', 'In Progress', 'Review', 'Closed'];

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchTerm, selectedTab]);

  const fetchTickets = async () => {
    try {
      // Mock data for demonstration
      const mockTickets = [
        {
          id: 'TASK-001',
          title: 'Implement user authentication system',
          description: 'Create a secure authentication system with JWT tokens and password hashing',
          status: 'In Progress',
          priority: 'High',
          type: 'Feature',
          assignee: { name: 'John Doe', avatar: 'JD', email: 'john@company.com' },
          reporter: { name: 'Jane Smith', avatar: 'JS', email: 'jane@company.com' },
          project: 'E-commerce Platform',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-18',
          dueDate: '2024-01-25',
          estimatedHours: 16,
          loggedHours: 8,
          comments: 3,
          attachments: 2,
          tags: ['Authentication', 'Security', 'Backend']
        },
        {
          id: 'TASK-002',
          title: 'Fix responsive design on mobile devices',
          description: 'Address layout issues on mobile screens, particularly on iOS Safari',
          status: 'Open',
          priority: 'Medium',
          type: 'Bug',
          assignee: { name: 'Alice Brown', avatar: 'AB', email: 'alice@company.com' },
          reporter: { name: 'Bob Wilson', avatar: 'BW', email: 'bob@company.com' },
          project: 'Mobile App Redesign',
          createdAt: '2024-01-16',
          updatedAt: '2024-01-16',
          dueDate: '2024-01-22',
          estimatedHours: 8,
          loggedHours: 0,
          comments: 1,
          attachments: 1,
          tags: ['CSS', 'Mobile', 'Bug']
        },
        {
          id: 'TASK-003',
          title: 'Optimize database queries for better performance',
          description: 'Review and optimize slow database queries identified in the performance audit',
          status: 'Review',
          priority: 'High',
          type: 'Improvement',
          assignee: { name: 'Mike Johnson', avatar: 'MJ', email: 'mike@company.com' },
          reporter: { name: 'Sarah Davis', avatar: 'SD', email: 'sarah@company.com' },
          project: 'API Integration',
          createdAt: '2024-01-10',
          updatedAt: '2024-01-17',
          dueDate: '2024-01-20',
          estimatedHours: 12,
          loggedHours: 12,
          comments: 5,
          attachments: 0,
          tags: ['Database', 'Performance', 'Backend']
        },
        {
          id: 'TASK-004',
          title: 'Create user onboarding flow',
          description: 'Design and implement a step-by-step onboarding process for new users',
          status: 'In Progress',
          priority: 'Medium',
          type: 'Feature',
          assignee: { name: 'Emma Taylor', avatar: 'ET', email: 'emma@company.com' },
          reporter: { name: 'David Lee', avatar: 'DL', email: 'david@company.com' },
          project: 'E-commerce Platform',
          createdAt: '2024-01-12',
          updatedAt: '2024-01-18',
          dueDate: '2024-01-28',
          estimatedHours: 20,
          loggedHours: 6,
          comments: 2,
          attachments: 3,
          tags: ['UX', 'Frontend', 'Onboarding']
        },
        {
          id: 'TASK-005',
          title: 'Setup automated testing pipeline',
          description: 'Configure CI/CD pipeline with automated testing for all environments',
          status: 'Closed',
          priority: 'Low',
          type: 'Task',
          assignee: { name: 'Tom Brown', avatar: 'TB', email: 'tom@company.com' },
          reporter: { name: 'Lisa Wilson', avatar: 'LW', email: 'lisa@company.com' },
          project: 'DevOps',
          createdAt: '2024-01-05',
          updatedAt: '2024-01-15',
          dueDate: '2024-01-15',
          estimatedHours: 24,
          loggedHours: 22,
          comments: 8,
          attachments: 1,
          tags: ['DevOps', 'Testing', 'CI/CD']
        }
      ];
      setTickets(mockTickets);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setLoading(false);
    }
  };

  const filterTickets = () => {
    let filtered = tickets;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.assignee.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tab
    if (selectedTab > 0) {
      const statusMap = {
        1: 'Open',
        2: 'In Progress',
        3: 'Review',
        4: 'Closed'
      };
      filtered = filtered.filter(ticket => ticket.status === statusMap[selectedTab]);
    }

    setFilteredTickets(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'secondary';
      case 'In Progress': return 'primary';
      case 'Review': return 'warning';
      case 'Closed': return 'success';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'secondary';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Bug': return 'error';
      case 'Feature': return 'primary';
      case 'Improvement': return 'info';
      case 'Task': return 'secondary';
      default: return 'secondary';
    }
  };

  const handleMenuClick = (event, ticket) => {
    setAnchorEl(event.currentTarget);
    setSelectedTicket(ticket);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTicket(null);
  };

  const handleViewDetails = () => {
    setDetailsOpen(true);
    handleMenuClose();
  };

  const calculateProgress = (logged, estimated) => {
    return estimated > 0 ? Math.min((logged / estimated) * 100, 100) : 0;
  };

  const renderGridView = () => (
    <Grid container spacing={3}>
      {filteredTickets.map((ticket) => (
        <Grid item xs={12} md={6} lg={4} key={ticket.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {ticket.id}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {ticket.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ticket.project}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuClick(e, ticket)}
                >
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </IconButton>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {ticket.description.length > 100 
                  ? `${ticket.description.substring(0, 100)}...` 
                  : ticket.description}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Badge variant={getStatusColor(ticket.status)}>
                  {ticket.status}
                </Badge>
                <Badge variant={getPriorityColor(ticket.priority)}>
                  {ticket.priority}
                </Badge>
                <Badge variant={getTypeColor(ticket.type)}>
                  {ticket.type}
                </Badge>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                  {ticket.assignee.avatar}
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  {ticket.assignee.name}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarDaysIcon className="h-4 w-4 mr-1" />
                  <Typography variant="body2" color="text.secondary">
                    Due: {ticket.dueDate}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <Typography variant="body2" color="text.secondary">
                    {ticket.loggedHours}h / {ticket.estimatedHours}h
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                    <Typography variant="body2" color="text.secondary">
                      {ticket.comments}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PaperClipIcon className="h-4 w-4 mr-1" />
                    <Typography variant="body2" color="text.secondary">
                      {ticket.attachments}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {Math.round(calculateProgress(ticket.loggedHours, ticket.estimatedHours))}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderTableView = () => (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Ticket</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell>Priority</Table.HeaderCell>
          <Table.HeaderCell>Assignee</Table.HeaderCell>
          <Table.HeaderCell>Due Date</Table.HeaderCell>
          <Table.HeaderCell>Progress</Table.HeaderCell>
          <Table.HeaderCell>Actions</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {filteredTickets.map((ticket) => (
          <Table.Row key={ticket.id}>
            <Table.Cell>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {ticket.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {ticket.title}
                </Typography>
              </Box>
            </Table.Cell>
            <Table.Cell>
              <Badge variant={getStatusColor(ticket.status)}>
                {ticket.status}
              </Badge>
            </Table.Cell>
            <Table.Cell>
              <Badge variant={getPriorityColor(ticket.priority)}>
                {ticket.priority}
              </Badge>
            </Table.Cell>
            <Table.Cell>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                  {ticket.assignee.avatar}
                </Avatar>
                {ticket.assignee.name}
              </Box>
            </Table.Cell>
            <Table.Cell>{ticket.dueDate}</Table.Cell>
            <Table.Cell>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  {Math.round(calculateProgress(ticket.loggedHours, ticket.estimatedHours))}%
                </Typography>
                <Box sx={{ width: 60, height: 4, bgcolor: 'grey.300', borderRadius: 2 }}>
                  <Box
                    sx={{
                      width: `${calculateProgress(ticket.loggedHours, ticket.estimatedHours)}%`,
                      height: '100%',
                      bgcolor: 'primary.main',
                      borderRadius: 2
                    }}
                  />
                </Box>
              </Box>
            </Table.Cell>
            <Table.Cell>
              <IconButton
                size="small"
                onClick={(e) => handleMenuClick(e, ticket)}
              >
                <EllipsisVerticalIcon className="h-4 w-4" />
              </IconButton>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Tickets
        </Typography>
        <Button
          variant="contained"
          startIcon={<PlusIcon className="h-4 w-4" />}
          sx={{ borderRadius: 2 }}
        >
          New Ticket
        </Button>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </InputAdornment>
                ),
              }}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('grid')}
                size="small"
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'table' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('table')}
                size="small"
              >
                Table
              </Button>
              <Button
                variant="outlined"
                startIcon={<FunnelIcon className="h-4 w-4" />}
                sx={{ borderRadius: 2 }}
              >
                Filters
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab} />
          ))}
        </Tabs>
      </Box>

      {/* Ticket Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
              {tickets.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Tickets
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 600 }}>
              {tickets.filter(t => t.status === 'Open').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Open Tickets
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main" sx={{ fontWeight: 600 }}>
              {tickets.filter(t => t.status === 'In Progress').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              In Progress
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
              {tickets.filter(t => t.status === 'Closed').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Closed
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Tickets Display */}
      {viewMode === 'grid' ? renderGridView() : renderTableView()}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Edit Ticket</MenuItem>
        <MenuItem onClick={handleMenuClose}>Assign to Me</MenuItem>
        <MenuItem onClick={handleMenuClose}>Change Status</MenuItem>
        <MenuItem onClick={handleMenuClose}>Add Comment</MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          Delete Ticket
        </MenuItem>
      </Menu>

      {/* Ticket Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedTicket && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedTicket.id}</Typography>
                <Badge variant={getStatusColor(selectedTicket.status)}>
                  {selectedTicket.status}
                </Badge>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                {selectedTicket.title}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {selectedTicket.description}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Priority</Typography>
                  <Badge variant={getPriorityColor(selectedTicket.priority)}>
                    {selectedTicket.priority}
                  </Badge>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Type</Typography>
                  <Badge variant={getTypeColor(selectedTicket.type)}>
                    {selectedTicket.type}
                  </Badge>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Assignee</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                      {selectedTicket.assignee.avatar}
                    </Avatar>
                    <Typography variant="body2">{selectedTicket.assignee.name}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Reporter</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                      {selectedTicket.reporter.avatar}
                    </Avatar>
                    <Typography variant="body2">{selectedTicket.reporter.name}</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {selectedTicket.tags.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" variant="outlined" />
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              <Button variant="contained">Edit Ticket</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {filteredTickets.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <TicketIcon className="h-16 w-16 mx-auto mb-4 text-neutral-400" />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No tickets found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first ticket to get started'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TicketsPage;
