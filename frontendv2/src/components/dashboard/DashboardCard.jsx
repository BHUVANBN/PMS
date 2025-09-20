import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

const DashboardCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'primary',
  className = '',
  children,
  ...props
}) => {
  const theme = useTheme();

  const getColorStyles = (colorName) => {
    const colors = {
      primary: {
        bg: theme.palette.primary.light + '20',
        color: theme.palette.primary.main,
      },
      secondary: {
        bg: theme.palette.secondary.light + '20',
        color: theme.palette.secondary.main,
      },
      success: {
        bg: theme.palette.success.light + '20',
        color: theme.palette.success.main,
      },
      warning: {
        bg: theme.palette.warning.light + '20',
        color: theme.palette.warning.main,
      },
      error: {
        bg: theme.palette.error.light + '20',
        color: theme.palette.error.main,
      },
      info: {
        bg: theme.palette.info.light + '20',
        color: theme.palette.info.main,
      },
    };
    return colors[colorName] || colors.primary;
  };

  const getTrendIcon = (trendType) => {
    switch (trendType) {
      case 'up': return <TrendingUp fontSize="small" />;
      case 'down': return <TrendingDown fontSize="small" />;
      default: return <TrendingFlat fontSize="small" />;
    }
  };

  const getTrendColor = (trendType) => {
    switch (trendType) {
      case 'up': return theme.palette.success.main;
      case 'down': return theme.palette.error.main;
      default: return theme.palette.text.secondary;
    }
  };

  const colorStyles = getColorStyles(color);

  return (
    <Card 
      className={className} 
      sx={{ 
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        }
      }} 
      {...props}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            {title && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ mb: 1, fontWeight: 500 }}
              >
                {title}
              </Typography>
            )}
            {value && (
              <Typography 
                variant="h4" 
                sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}
              >
                {value}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend && trendValue && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: getTrendColor(trend),
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}>
                  {getTrendIcon(trend)}
                  <Typography 
                    variant="body2" 
                    sx={{ ml: 0.5, fontWeight: 500, color: 'inherit' }}
                  >
                    {trendValue}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
          {icon && (
            <Box sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: colorStyles.bg,
              color: colorStyles.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 48,
              minHeight: 48,
            }}>
              {icon}
            </Box>
          )}
        </Box>
        {children && (
          <Box sx={{ mt: 3 }}>
            {children}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
