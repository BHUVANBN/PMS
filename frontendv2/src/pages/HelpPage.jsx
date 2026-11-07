import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Stack, Accordion,
  AccordionSummary, AccordionDetails, Chip, TextField,
  InputAdornment, Divider, Link, useTheme
} from '@mui/material';
import {
  ExpandMore, Search, QuestionAnswer, Book,
  BugReport, ContactSupport, Email, GitHub,
  Assignment, People, Dashboard, Settings
} from '@mui/icons-material';

const faqs = [
  {
    category: 'Getting Started',
    icon: <Dashboard fontSize="small" />,
    items: [
      {
        q: 'How do I log in?',
        a: 'Use your username or email address along with the password provided by HR. On first login, you may be prompted to complete your onboarding profile.',
      },
      {
        q: 'I forgot my password. What do I do?',
        a: 'Click "Forgot Password" on the login page and enter your registered email address. You\'ll receive a password reset link valid for 1 hour.',
      },
      {
        q: 'How do I update my profile?',
        a: 'Navigate to Profile from the sidebar or top-right avatar menu. You can update your name, contact info, skills, and profile picture.',
      },
    ],
  },
  {
    category: 'Projects & Tickets',
    icon: <Assignment fontSize="small" />,
    items: [
      {
        q: 'How are tickets assigned to me?',
        a: 'Your manager assigns tickets to you within a project module. You\'ll see assigned tickets on your dashboard and in the Kanban board.',
      },
      {
        q: 'How do I update a ticket status?',
        a: 'Open the Kanban board and drag a ticket to the appropriate column, or open the ticket and use the status dropdown.',
      },
      {
        q: 'What is the difference between a Task and a Bug?',
        a: 'A Task is a feature or piece of work to be done. A Bug is a defect found during testing that needs to be fixed.',
      },
    ],
  },
  {
    category: 'Leave Management',
    icon: <People fontSize="small" />,
    items: [
      {
        q: 'How do I apply for leave?',
        a: 'Go to your Profile page and find the Leave section, or use the Leave menu item. Fill in the dates, leave type, and reason, then submit.',
      },
      {
        q: 'Who approves my leave?',
        a: 'Leave requests are reviewed and approved or rejected by HR or your manager.',
      },
      {
        q: 'Can I cancel a leave request after submitting?',
        a: 'Yes — you can cancel pending leave requests before they are reviewed.',
      },
    ],
  },
  {
    category: 'Standups',
    icon: <QuestionAnswer fontSize="small" />,
    items: [
      {
        q: 'Do I need to submit a standup every day?',
        a: 'Yes, daily standup submissions are tracked by your manager and HR. Standups record what you did yesterday, plan to do today, and any blockers.',
      },
      {
        q: 'What happens if I miss a standup?',
        a: 'Missed standups are visible to your manager and HR in the standup logs. Reach out to your manager if you have a valid reason.',
      },
    ],
  },
  {
    category: 'Account & Settings',
    icon: <Settings fontSize="small" />,
    items: [
      {
        q: 'How do I change my theme (dark/light mode)?',
        a: 'Go to Settings and use the Appearance section to switch between Light, Dark, or System Default themes.',
      },
      {
        q: 'My account was deactivated — what should I do?',
        a: 'Contact HR to reactivate your account. Deactivated accounts cannot log in.',
      },
    ],
  },
];

const HelpPage = () => {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);

  const filtered = faqs.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        !search ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Help & Support
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Find answers to common questions or contact support for assistance.
        </Typography>
      </Box>

      {/* Quick contact cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={4}>
        {[
          { icon: <Email />, title: 'Email Support', desc: 'support@yourcompany.com', color: 'primary.main' },
          { icon: <BugReport />, title: 'Report a Bug', desc: 'Create a bug ticket in your project', color: 'error.main' },
          { icon: <ContactSupport />, title: 'Contact HR', desc: 'Reach out to HR for account issues', color: 'success.main' },
        ].map(({ icon, title, desc, color }) => (
          <Card key={title} sx={{ flex: 1, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
            <CardContent>
              <Box sx={{ color, mb: 1 }}>{icon}</Box>
              <Typography fontWeight={600} variant="body1">{title}</Typography>
              <Typography variant="body2" color="text.secondary">{desc}</Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search frequently asked questions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
          sx: { borderRadius: 3 },
        }}
      />

      {/* FAQ Accordions */}
      {filtered.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">No results found for "{search}"</Typography>
        </Box>
      ) : (
        filtered.map((cat) => (
          <Box key={cat.category} mb={3}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <Box sx={{ color: 'primary.main' }}>{cat.icon}</Box>
              <Typography variant="h6" fontWeight={600}>{cat.category}</Typography>
            </Stack>
            {cat.items.map((item, i) => (
              <Accordion
                key={i}
                expanded={expanded === `${cat.category}-${i}`}
                onChange={(_, isExpanded) => setExpanded(isExpanded ? `${cat.category}-${i}` : false)}
                disableGutters
                elevation={0}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '12px !important',
                  mb: 1,
                  '&:before': { display: 'none' },
                  overflow: 'hidden',
                }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="body1" fontWeight={500}>{item.q}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Divider sx={{ mb: 1.5 }} />
                  <Typography variant="body2" color="text.secondary">{item.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        ))
      )}

      <Box mt={4} p={3} sx={{ borderRadius: 3, bgcolor: 'action.hover', textAlign: 'center' }}>
        <Book sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body1" fontWeight={500}>Still need help?</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Reach out to your HR department or system administrator for further assistance.
        </Typography>
      </Box>
    </Box>
  );
};

export default HelpPage;
