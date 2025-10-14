import React, { useEffect, useState } from "react";
import { useAuth } from '../store/auth.js';
import { meetingAPI } from "../services/api.js";
import {
    Calendar,
    Clock,
    Link,
    Bell,
    AlertCircle,
    CheckCircle,
    ExternalLink,
    Video,
    MapPin
} from "lucide-react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    CircularProgress,
    Alert,
    Container,
    Stack,
    IconButton,
    Divider,
    Tooltip,
    Badge
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Date formatting utilities
const format = (date, formatStr) => {
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;

    if (formatStr === "h:mm a") {
        return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }
    if (formatStr === "MMM d, yyyy h:mm a") {
        return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }
    if (formatStr === "MMM d, h:mm a") {
        return `${months[d.getMonth()]} ${d.getDate()}, ${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }
    return d.toLocaleString();
};

const differenceInMinutes = (date1, date2) => {
    return Math.floor((date1 - date2) / 60000);
};

const differenceInSeconds = (date1, date2) => {
    return Math.floor((date1 - date2) / 1000);
};

// Styled components
const PulseDot = styled(Box)(({ theme }) => ({
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: theme.palette.success.main,
    animation: 'pulse 2s infinite',
    '@keyframes pulse': {
        '0%, 100%': {
            opacity: 1,
            transform: 'scale(1)'
        },
        '50%': {
            opacity: 0.5,
            transform: 'scale(1.1)'
        }
    }
}));

const StyledCard = styled(Card)(({ theme, variant }) => ({
    marginBottom: theme.spacing(2),
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4]
    },
    ...(variant === 'ongoing' && {
        borderLeft: `4px solid ${theme.palette.success.main}`,
        backgroundColor: theme.palette.success.light + '10'
    }),
    ...(variant === 'urgent' && {
        borderLeft: `4px solid ${theme.palette.warning.main}`,
        backgroundColor: theme.palette.warning.light + '10'
    }),
    ...(variant === 'past' && {
        opacity: 0.7
    })
}));

const Meetings = () => {
    const { user, role } = useAuth();
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [notificationsSent, setNotificationsSent] = useState(new Set());

    useEffect(() => {
        fetchUserMeetings();

        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        meetings.forEach(meeting => {
            const startTime = new Date(meeting.startTime);
            const minutesUntil = differenceInMinutes(startTime, currentTime);

            if (minutesUntil <= 10 && minutesUntil > 0 && !notificationsSent.has(meeting._id)) {
                sendMeetingNotification(meeting);
                setNotificationsSent(prev => new Set(prev).add(meeting._id));
            }
        });
    }, [meetings, currentTime, notificationsSent]);

    const fetchUserMeetings = async () => {
        try {
            setLoading(true);
            const res = await meetingAPI.getUserMeetings();
            setMeetings(res.meetings || res.data || []);
        } catch (err) {
            console.error("Error fetching user meetings:", err);
            setError("Failed to load meetings.");
        } finally {
            setLoading(false);
        }
    };
    const handleEndMeeting = async (id) => {
        if (window.confirm("Are you sure you want to end this meeting now?")) {
            try {
                const res = await meetingAPI.endMeeting(id);
                alert(res.message);
                fetchUserMeetings(); // refresh list after ending
            } catch (err) {
                console.error("Error ending meeting:", err);
                alert(err.message || "Failed to end meeting");
            }
        }
    };

    const sendMeetingNotification = async (meeting) => {
        try {
            await meetingAPI.sendMeetingReminder(meeting._id);

            if ("Notification" in window && Notification.permission === "granted") {
                new Notification(`Meeting in ${differenceInMinutes(new Date(meeting.startTime), new Date())} minutes`, {
                    body: `${meeting.title}\n${format(new Date(meeting.startTime), "h:mm a")}`,
                    icon: "/meeting-icon.png",
                    tag: meeting._id
                });
            }
        } catch (err) {
            console.error("Failed to send notification:", err);
        }
    };

    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    const getMeetingStatus = (meeting) => {
        const startTime = new Date(meeting.startTime);
        const endTime = new Date(meeting.endTime);
        const minutesUntil = differenceInMinutes(startTime, currentTime);

        if (currentTime >= startTime && currentTime <= endTime) {
            return { status: 'ongoing', label: 'In Progress', color: 'success' };
        } else if (minutesUntil <= 5 && minutesUntil > 0) {
            return { status: 'starting-soon', label: 'Starting Soon', color: 'warning' };
        } else if (minutesUntil > 5 && minutesUntil <= 30) {
            return { status: 'upcoming', label: 'Upcoming', color: 'info' };
        } else if (minutesUntil > 0) {
            return { status: 'scheduled', label: 'Scheduled', color: 'default' };
        } else {
            return { status: 'past', label: 'Ended', color: 'default' };
        }
    };

    const canJoinMeeting = (meeting) => {
        const startTime = new Date(meeting.startTime);
        const minutesUntil = differenceInMinutes(startTime, currentTime);

        return minutesUntil <= 5 && minutesUntil > -60;
    };

    const getCountdown = (meeting) => {
        const startTime = new Date(meeting.startTime);
        const totalSeconds = differenceInSeconds(startTime, currentTime);

        if (totalSeconds <= 0) {
            const endTime = new Date(meeting.endTime);
            const secondsLeft = differenceInSeconds(endTime, currentTime);
            if (secondsLeft > 0) {
                const minutes = Math.floor(secondsLeft / 60);
                const seconds = secondsLeft % 60;
                return {
                    text: `${minutes}m ${seconds}s remaining`,
                    urgent: false
                };
            }
            return { text: 'Meeting ended', urgent: false };
        }

        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (days > 0) {
            return { text: `${days}d ${hours}h ${minutes}m`, urgent: false };
        } else if (hours > 0) {
            return { text: `${hours}h ${minutes}m ${seconds}s`, urgent: false };
        } else if (minutes > 10) {
            return { text: `${minutes}m ${seconds}s`, urgent: false };
        } else {
            return { text: `${minutes}m ${seconds}s`, urgent: true };
        }
    };

    const now = new Date();
    const upcoming = meetings
        .filter(m => new Date(m.startTime) > now)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    const past = meetings
        .filter(m => new Date(m.endTime) <= now)
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    const ongoing = meetings
        .filter(m => new Date(m.startTime) <= now && new Date(m.endTime) > now);

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>Loading your meetings...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error" icon={<AlertCircle />}>
                    <Typography variant="h6">Error Loading Meetings</Typography>
                    <Typography>{error}</Typography>
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Video size={32} />
                    <Typography variant="h3" component="h1" fontWeight="bold">
                        My Meetings
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Chip
                        label={`Upcoming: ${upcoming.length}`}
                        color="info"
                        variant="outlined"
                    />
                    <Chip
                        label={`Ongoing: ${ongoing.length}`}
                        color="success"
                        variant="outlined"
                    />
                    <Chip
                        label={`Past: ${past.length}`}
                        color="default"
                        variant="outlined"
                    />
                </Stack>
            </Box>

            {/* Ongoing Meetings */}
            {ongoing.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <PulseDot />
                        <Typography variant="h5" component="h2" fontWeight="600">
                            Ongoing Meetings
                        </Typography>
                    </Stack>

                    {ongoing.map(meeting => {
                        const countdown = getCountdown(meeting);
                        const status = getMeetingStatus(meeting);

                        return (
                            <StyledCard key={meeting._id} variant="ongoing">
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Box sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                bgcolor: 'success.main',
                                                animation: 'pulse 2s infinite'
                                            }} />
                                            <Chip label={status.label} color={status.color} size="small" />
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary" fontWeight="600">
                                            {countdown.text}
                                        </Typography>
                                    </Stack>

                                    <Typography variant="h6" gutterBottom fontWeight="600">
                                        {meeting.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {meeting.description}
                                    </Typography>

                                    <Stack spacing={1} sx={{ mb: 2 }}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Calendar size={16} />
                                            <Typography variant="body2">{meeting.projectId?.name || "N/A"}</Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Clock size={16} />
                                            <Typography variant="body2">
                                                {format(new Date(meeting.startTime), "MMM d, h:mm a")}
                                            </Typography>
                                        </Stack>
                                        {meeting.location && (
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <MapPin size={16} />
                                                <Typography variant="body2">{meeting.location}</Typography>
                                            </Stack>
                                        )}
                                    </Stack>

                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<ExternalLink size={18} />}
                                        href={meeting.meetingLink || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        fullWidth
                                    >
                                        Join Now
                                    </Button>
                                    {role === "manager" && (
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => handleEndMeeting(meeting._id)}
                                            fullWidth
                                            sx={{
                                                mt: 2,
                                                backgroundColor: '#e53935',
                                                '&:hover': {
                                                    backgroundColor: '#d32f2f',
                                                },
                                                fontWeight: 600,
                                                py: 1.2,
                                            }}
                                        >
                                            End Meeting
                                        </Button>
                                    )}

                                </CardContent>
                            </StyledCard>
                        );
                    })}
                </Box>
            )}

            {/* Upcoming Meetings */}
            <Box sx={{ mb: 4 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Calendar size={24} />
                    <Typography variant="h5" component="h2" fontWeight="600">
                        Upcoming Meetings
                    </Typography>
                </Stack>

                {upcoming.length > 0 ? (
                    upcoming.map(meeting => {
                        const countdown = getCountdown(meeting);
                        const status = getMeetingStatus(meeting);
                        const joinEnabled = canJoinMeeting(meeting);
                        const minutesUntil = differenceInMinutes(new Date(meeting.startTime), currentTime);

                        return (
                            <StyledCard
                                key={meeting._id}
                                variant={countdown.urgent ? 'urgent' : 'default'}
                            >
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                            <Chip label={status.label} color={status.color} size="small" />
                                            {minutesUntil <= 10 && (
                                                <Chip
                                                    icon={<Bell size={14} />}
                                                    label="Reminder sent"
                                                    size="small"
                                                    variant="outlined"
                                                    color="warning"
                                                />
                                            )}
                                        </Stack>
                                        <Typography
                                            variant="body2"
                                            color={countdown.urgent ? "warning.main" : "text.secondary"}
                                            fontWeight="600"
                                        >
                                            {countdown.text}
                                        </Typography>
                                    </Stack>

                                    <Typography variant="h6" gutterBottom fontWeight="600">
                                        {meeting.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {meeting.description}
                                    </Typography>

                                    <Stack spacing={1} sx={{ mb: 2 }}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Calendar size={16} />
                                            <Typography variant="body2">{meeting.projectId?.name || "N/A"}</Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Clock size={16} />
                                            <Typography variant="body2">
                                                {format(new Date(meeting.startTime), "MMM d, h:mm a")}
                                            </Typography>
                                        </Stack>
                                        {meeting.location && (
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <MapPin size={16} />
                                                <Typography variant="body2">{meeting.location}</Typography>
                                            </Stack>
                                        )}
                                    </Stack>

                                    {minutesUntil <= 30 && (
                                        <Alert severity="info" icon={<Clock size={16} />} sx={{ mb: 2 }}>
                                            <Typography variant="body2">
                                                Starting in: <strong>{countdown.text}</strong>
                                            </Typography>
                                            {!joinEnabled && (
                                                <Typography variant="caption" display="block">
                                                    Join button enables 5 minutes before start
                                                </Typography>
                                            )}
                                        </Alert>
                                    )}

                                    <Stack spacing={1}>
                                        <Tooltip title={!joinEnabled ? "Join button will be enabled 5 minutes before the meeting" : ""}>
                                            <span>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    startIcon={<Link size={18} />}
                                                    href={meeting.meetingLink || "#"}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    disabled={!joinEnabled}
                                                    fullWidth
                                                >
                                                    Join Meeting
                                                </Button>
                                            </span>
                                        </Tooltip>
                                        {meeting.meetingLink && (
                                            <Button
                                                variant="text"
                                                size="small"
                                                href={meeting.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Copy meeting link
                                            </Button>
                                        )}
                                    </Stack>
                                </CardContent>
                            </StyledCard>
                        );
                    })
                ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Calendar size={48} style={{ opacity: 0.3 }} />
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                            No upcoming meetings scheduled
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Past Meetings */}
            <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <CheckCircle size={24} />
                    <Typography variant="h5" component="h2" fontWeight="600">
                        Past Meetings
                    </Typography>
                </Stack>

                {past.length > 0 ? (
                    <>
                        {past.slice(0, 10).map(meeting => (
                            <StyledCard key={meeting._id} variant="past">
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" gutterBottom fontWeight="600">
                                                {meeting.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                {meeting.description}
                                            </Typography>
                                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <Clock size={14} />
                                                    <Typography variant="caption">
                                                        {format(new Date(meeting.startTime), "MMM d, yyyy h:mm a")}
                                                    </Typography>
                                                </Stack>
                                                <Typography variant="caption">•</Typography>
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <Calendar size={14} />
                                                    <Typography variant="caption">
                                                        {meeting.projectId?.name || "N/A"}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        </Box>
                                        <Chip label="Completed" size="small" />
                                    </Stack>
                                </CardContent>
                            </StyledCard>
                        ))}
                        {past.length > 10 && (
                            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
                                Showing 10 of {past.length} past meetings
                            </Typography>
                        )}
                    </>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <CheckCircle size={48} style={{ opacity: 0.3 }} />
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                            No past meetings yet
                        </Typography>
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default Meetings;