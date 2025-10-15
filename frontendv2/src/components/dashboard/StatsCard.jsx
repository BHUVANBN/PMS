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
  subtitle,
  sx: sxProp
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
      sx={[
        { 
          height: '100%',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          }
        },
        sxProp,
      ]}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
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
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
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
