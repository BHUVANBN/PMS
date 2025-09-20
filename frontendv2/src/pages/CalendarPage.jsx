import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Avatar,
  IconButton,
  Fab
} from '@mui/material';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import DashboardCard from '../components/dashboard/DashboardCard';
import Badge from '../components/ui/Badge';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [events, setEvents] = useState([]);
  const [todayEvents, setTodayEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    fetchCalendarData();
  }, []);

  useEffect(() => {
    // Filter events for selected date
    const dayEvents = events.filter(event => 
      dayjs(event.date).isSame(selectedDate, 'day')
    );
    setTodayEvents(dayEvents);

    // Filter upcoming events (next 7 days)
    const upcoming = events.filter(event => 
      dayjs(event.date).isAfter(dayjs(), 'day') && 
      dayjs(event.date).isBefore(dayjs().add(7, 'day'))
    );
    setUpcomingEvents(upcoming);
  }, [selectedDate, events]);

  const fetchCalendarData = async () => {
    // Mock data for demonstration
    const mockEvents = [
      {
        id: 1,
        title: 'Sprint Planning Meeting',
        date: dayjs().format('YYYY-MM-DD'),
        time: '09:00 AM',
        duration: '2 hours',
        type: 'meeting',
        attendees: ['John Doe', 'Jane Smith', 'Mike Johnson'],
        location: 'Conference Room A'
      },
      {
        id: 2,
        title: 'Code Review Session',
        date: dayjs().format('YYYY-MM-DD'),
        time: '02:00 PM',
        duration: '1 hour',
        type: 'review',
        attendees: ['Sarah Wilson', 'Tom Brown'],
        location: 'Virtual'
      },
      {
        id: 3,
        title: 'Project Deadline',
        date: dayjs().add(2, 'day').format('YYYY-MM-DD'),
        time: '11:59 PM',
        duration: 'All day',
        type: 'deadline',
        attendees: [],
        location: 'N/A'
      },
      {
        id: 4,
        title: 'Team Standup',
        date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
        time: '09:30 AM',
        duration: '30 minutes',
        type: 'standup',
        attendees: ['All Team Members'],
        location: 'Main Office'
      },
      {
        id: 5,
        title: 'Client Presentation',
        date: dayjs().add(3, 'day').format('YYYY-MM-DD'),
        time: '03:00 PM',
        duration: '1.5 hours',
        type: 'presentation',
        attendees: ['Client Team', 'Project Manager'],
        location: 'Client Office'
      }
    ];
    setEvents(mockEvents);
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'meeting': return 'primary';
      case 'review': return 'info';
      case 'deadline': return 'error';
      case 'standup': return 'success';
      case 'presentation': return 'warning';
      default: return 'secondary';
    }
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'meeting': return <UserGroupIcon className="h-4 w-4" />;
      case 'review': return <ClockIcon className="h-4 w-4" />;
      case 'deadline': return <CalendarDaysIcon className="h-4 w-4" />;
      case 'standup': return <UserGroupIcon className="h-4 w-4" />;
      case 'presentation': return <CalendarDaysIcon className="h-4 w-4" />;
      default: return <CalendarDaysIcon className="h-4 w-4" />;
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Calendar
          </Typography>
          <Button
            variant="contained"
            startIcon={<PlusIcon className="h-4 w-4" />}
            sx={{ borderRadius: 2 }}
          >
            Add Event
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Calendar Widget */}
          <Grid item xs={12} md={4}>
            <DashboardCard title="Calendar" className="h-fit">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {currentMonth.format('MMMM YYYY')}
                </Typography>
                <Box>
                  <IconButton size="small" onClick={handlePrevMonth}>
                    <ChevronLeftIcon className="h-4 w-4" />
                  </IconButton>
                  <IconButton size="small" onClick={handleNextMonth}>
                    <ChevronRightIcon className="h-4 w-4" />
                  </IconButton>
                </Box>
              </Box>
              <DateCalendar
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                views={['day']}
                sx={{
                  '& .MuiPickersCalendarHeader-root': {
                    display: 'none'
                  },
                  '& .MuiDayCalendar-root': {
                    width: '100%'
                  }
                }}
              />
            </DashboardCard>
          </Grid>

          {/* Today's Events */}
          <Grid item xs={12} md={8}>
            <DashboardCard 
              title={`Events for ${selectedDate.format('MMMM D, YYYY')}`}
              className="h-fit"
            >
              {todayEvents.length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  {todayEvents.map((event) => (
                    <Card key={event.id} sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ 
                            mr: 2, 
                            bgcolor: `${getEventTypeColor(event.type)}.main`,
                            width: 32,
                            height: 32
                          }}>
                            {getEventTypeIcon(event.type)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {event.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {event.time} • {event.duration}
                            </Typography>
                          </Box>
                        </Box>
                        <Badge variant={getEventTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          📍 {event.location}
                        </Typography>
                        {event.attendees.length > 0 && (
                          <Typography variant="body2" color="text.secondary">
                            👥 {event.attendees.join(', ')}
                          </Typography>
                        )}
                      </Box>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CalendarDaysIcon className="h-12 w-12 mx-auto mb-2 text-neutral-400" />
                  <Typography variant="body1" color="text.secondary">
                    No events scheduled for this day
                  </Typography>
                </Box>
              )}
            </DashboardCard>
          </Grid>

          {/* Upcoming Events */}
          <Grid item xs={12}>
            <DashboardCard title="Upcoming Events (Next 7 Days)">
              {upcomingEvents.length > 0 ? (
                <List dense>
                  {upcomingEvents.map((event) => (
                    <ListItem key={event.id} sx={{ px: 0, py: 1 }}>
                      <Avatar sx={{ 
                        mr: 2, 
                        bgcolor: `${getEventTypeColor(event.type)}.main`,
                        width: 32,
                        height: 32
                      }}>
                        {getEventTypeIcon(event.type)}
                      </Avatar>
                      <ListItemText
                        primary={event.title}
                        secondary={`${dayjs(event.date).format('MMM D')} at ${event.time} • ${event.location}`}
                      />
                      <Badge variant={getEventTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CalendarDaysIcon className="h-12 w-12 mx-auto mb-2 text-neutral-400" />
                  <Typography variant="body1" color="text.secondary">
                    No upcoming events in the next 7 days
                  </Typography>
                </Box>
              )}
            </DashboardCard>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                    {events.filter(e => dayjs(e.date).isSame(dayjs(), 'month')).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Events This Month
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
                    {events.filter(e => e.type === 'meeting').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Meetings
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main" sx={{ fontWeight: 600 }}>
                    {events.filter(e => e.type === 'deadline').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Deadlines
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main" sx={{ fontWeight: 600 }}>
                    {events.filter(e => e.type === 'review').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reviews
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add event"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
          }}
        >
          <PlusIcon className="h-6 w-6" />
        </Fab>
      </Box>
    </LocalizationProvider>
  );
};

export default CalendarPage;
