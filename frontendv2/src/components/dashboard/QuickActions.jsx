import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Box,
  Typography,
  Avatar,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const QuickActions = ({ actions = [] }) => {
  const navigate = useNavigate();

  const handleActionClick = (action) => {
    if (action.path) {
      navigate(action.path);
    } else if (action.onClick) {
      action.onClick();
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Quick Actions"
        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Grid container spacing={2}>
          {actions.map((action, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateY(-2px)',
                  }
                }}
                onClick={() => handleActionClick(action)}
              >
                <Avatar
                  sx={{
                    bgcolor: `${action.color || 'primary'}.main`,
                    width: 48,
                    height: 48,
                    mb: 1
                  }}
                >
                  {action.icon}
                </Avatar>
                <Typography
                  variant="body2"
                  textAlign="center"
                  fontWeight="medium"
                >
                  {action.title}
                </Typography>
                {action.subtitle && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    textAlign="center"
                  >
                    {action.subtitle}
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
