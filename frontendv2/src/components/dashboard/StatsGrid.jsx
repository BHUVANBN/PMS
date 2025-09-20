import React from 'react';
import { Grid } from '@mui/material';
import DashboardCard from './DashboardCard';

const StatsGrid = ({ stats = [], className = '' }) => {
  return (
    <Grid container spacing={3} className={className}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <DashboardCard
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            trend={stat.trend}
            trendValue={stat.trendValue}
            color={stat.color}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsGrid;
