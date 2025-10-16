import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  icon: Icon,
  color = 'primary',
  subtitle 
}) => {
  const getChangeColor = () => {
    if (changeType === 'positive') return 'success.main';
    if (changeType === 'negative') return 'error.main';
    return 'text.secondary';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return <TrendingUp fontSize="small" />;
    if (changeType === 'negative') return <TrendingDown fontSize="small" />;
    return null;
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        minHeight: 160,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)',
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" gutterBottom sx={{ fontSize: 14, fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography component="div" fontWeight="bold" sx={{ fontSize: { xs: 28, md: 32 }, lineHeight: 1.2 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
            {change && (
              <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  sx={{ color: getChangeColor() }}
                >
                  {getChangeIcon()}
                  <Typography sx={{ ml: 0.5, fontSize: 13 }}>
                    {change}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
          {Icon && (
            <Avatar
              sx={{
                bgcolor: `${color}.main`,
                width: 56,
                height: 56,
              }}
            >
              <Icon />
            </Avatar>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
