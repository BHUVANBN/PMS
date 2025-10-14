import React, { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  Card,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Fab,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import DashboardCard from "../components/dashboard/DashboardCard";
import Badge from "../components/ui/Badge";
import { meetingAPI } from "../services/api";
import { toast } from "react-hot-toast";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [events, setEvents] = useState([]);
  const [todayEvents, setTodayEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Utility functions for color/icon mapping
  const getEventTypeColor = (type) => {
    switch (type) {
      case "meeting":
        return "primary";
      case "review":
        return "info";
      case "deadline":
        return "error";
      default:
        return "secondary";
    }
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case "meeting":
        return <UserGroupIcon className="h-4 w-4" />;
      case "review":
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <CalendarDaysIcon className="h-4 w-4" />;
    }
  };

  const handlePrevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
  const handleNextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));

  // Fetch meetings directly from backend
  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const res = await meetingAPI.getUserMeetings();
      const meetings = res.meetings || res.data || [];

      const mappedEvents = meetings.map((m) => ({
        id: m._id,
        title: m.title,
        date: dayjs(m.startTime).format("YYYY-MM-DD"),
        time: dayjs(m.startTime).format("h:mm A"),
        duration: `${dayjs(m.endTime).diff(dayjs(m.startTime), "minute")} mins`,
        type: "meeting",
        attendees: m.participants?.map((p) => p.name) || [],
        location: m.location || "Virtual",
      }));

      setEvents(mappedEvents);
    } catch (err) {
      console.error("Error fetching meetings:", err);
      toast.error("Failed to fetch meetings.");
    } finally {
      setLoading(false);
    }
  };

  // Load data initially
  useEffect(() => {
    fetchMeetings();
  }, []);

  // Update daily and upcoming events dynamically
  useEffect(() => {
    const dayEvents = events.filter((event) =>
      dayjs(event.date).isSame(selectedDate, "day")
    );
    setTodayEvents(dayEvents);

    const upcoming = events
      .filter(
        (event) =>
          dayjs(event.date).isAfter(dayjs(), "day") &&
          dayjs(event.date).isBefore(dayjs().add(7, "day"))
      )
      .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

    setUpcomingEvents(upcoming);
  }, [selectedDate, events]);

  // Show notification for next meeting
  useEffect(() => {
    if (upcomingEvents.length > 0) {
      const nextMeeting = upcomingEvents[0];
      toast.success(
        `📅 Upcoming Meeting: "${nextMeeting.title}" on ${dayjs(nextMeeting.date).format(
          "MMM D"
        )} at ${nextMeeting.time}`
      );
    }
  }, [upcomingEvents]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
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
            <DashboardCard title="Calendar">
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <IconButton onClick={handlePrevMonth}>
                  <ChevronLeftIcon className="h-5 w-5" />
                </IconButton>
                <Typography variant="h6">
                  {currentMonth.format("MMMM YYYY")}
                </Typography>
                <IconButton onClick={handleNextMonth}>
                  <ChevronRightIcon className="h-5 w-5" />
                </IconButton>
              </Box>
              <DateCalendar
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
              />
            </DashboardCard>
          </Grid>

          {/* Today's Events */}
          <Grid item xs={12} md={8}>
            <DashboardCard
              title={`Events for ${selectedDate.format("MMMM D, YYYY")}`}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : todayEvents.length > 0 ? (
                todayEvents.map((event) => (
                  <Card key={event.id} sx={{ mb: 2, p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          sx={{
                            mr: 2,
                            bgcolor: `${getEventTypeColor(event.type)}.main`,
                            width: 32,
                            height: 32,
                          }}
                        >
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

                    <Typography variant="body2" color="text.secondary">
                      📍 {event.location}
                    </Typography>
                    {event.attendees.length > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        👥 {event.attendees.join(", ")}
                      </Typography>
                    )}
                  </Card>
                ))
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
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
              {loading && <CircularProgress size={24} sx={{ mb: 2 }} />}
              {upcomingEvents.length > 0 ? (
                <List dense>
                  {upcomingEvents.map((event) => (
                    <ListItem key={event.id} sx={{ px: 0, py: 1 }}>
                      <Avatar
                        sx={{
                          mr: 2,
                          bgcolor: `${getEventTypeColor(event.type)}.main`,
                          width: 32,
                          height: 32,
                        }}
                      >
                        {getEventTypeIcon(event.type)}
                      </Avatar>
                      <ListItemText
                        primary={event.title}
                        secondary={`${dayjs(event.date).format("MMM D")} at ${
                          event.time
                        } • ${event.location}`}
                      />
                      <Badge variant={getEventTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <CalendarDaysIcon className="h-12 w-12 mx-auto mb-2 text-neutral-400" />
                  <Typography variant="body1" color="text.secondary">
                    No upcoming meetings in the next 7 days
                  </Typography>
                </Box>
              )}
            </DashboardCard>
          </Grid>
        </Grid>

        {/* Floating Add Button */}
        <Fab
          color="primary"
          aria-label="add event"
          sx={{
            position: "fixed",
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
