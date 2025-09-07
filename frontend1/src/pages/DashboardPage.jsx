// This file has been deprecated in favor of role-specific dashboards
// Users are now redirected to their appropriate role-based dashboard via SimpleDashboard.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';

const DashboardPage = () => {
  // Redirect to SimpleDashboard which handles role-based routing
  return <Navigate to="/dashboard" replace />;
};

export default DashboardPage;
