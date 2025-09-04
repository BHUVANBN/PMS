import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/useAuthContext';
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';

// Dashboard Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import HRDashboard from '../pages/hr/HRDashboard';
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import DeveloperDashboard from '../pages/developer/DeveloperDashboard';
import TesterDashboard from '../pages/tester/TesterDashboard';
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';

// Admin Pages
import UserListPage from '../pages/admin/UserListPage';
import UserCreatePage from '../pages/admin/UserCreatePage';
import SystemStatsPage from '../pages/admin/SystemStatsPage';
import UserDetailPage from '../pages/admin/UserDetailPage';
import SystemSettingsPage from '../pages/admin/SystemSettingsPage';

// HR Pages
import EmployeeListPage from '../pages/hr/EmployeeListPage';
import EmployeeDetailPage from '../pages/hr/EmployeeDetailPage';
import EmployeeCreatePage from '../pages/hr/EmployeeCreatePage';
import HRStatsPage from '../pages/hr/HRStatsPage';
import LeaveManagementPage from '../pages/hr/LeaveManagementPage';

// Manager Pages
import ProjectListPage from '../pages/manager/ProjectListPage';
import ProjectCreatePage from '../pages/manager/ProjectCreatePage';
import ProjectDetailPage from '../pages/manager/ProjectDetailPage';
import ProjectTeamPage from '../pages/manager/ProjectTeamPage';
import ResourcePlanningPage from '../pages/manager/ResourcePlanningPage';

// Developer Pages
import MyWorkPage from '../pages/developer/MyWorkPage';
import CodeReviewPage from '../pages/developer/CodeReviewPage';
import TimeTrackingPage from '../pages/developer/TimeTrackingPage';

// Tester Pages
import BugTrackingPage from '../pages/tester/BugTrackingPage';
import QAWorkspacePage from '../pages/tester/QAWorkspacePage';
import TestReportsPage from '../pages/tester/TestReportsPage';

// Employee Pages
import ProfilePage from '../pages/employee/ProfilePage';
import TimesheetPage from '../pages/employee/TimesheetPage';

// Project Pages
import ProjectsListPage from '../pages/projects/ProjectsListPage';
import TicketListPage from '../pages/projects/TicketListPage';

// Shared Pages
import NotFoundPage from '../pages/shared/NotFoundPage';
import UnauthorizedPage from '../pages/shared/UnauthorizedPage';
import ServerErrorPage from '../pages/shared/ServerErrorPage';
import MaintenancePage from '../pages/shared/MaintenancePage';

const AppRoutes = () => {
  const { user, isAuthenticated, logout } = useAuthContext();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? 
            <Navigate to={`/${user.role}/dashboard`} replace /> : 
            <LoginPage />
        } 
      />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout user={user} onLogout={logout}>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout user={user} onLogout={logout}>
              <UserListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/create"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout user={user} onLogout={logout}>
              <UserCreatePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stats"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout user={user} onLogout={logout}>
              <SystemStatsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:id"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout user={user} onLogout={logout}>
              <UserDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout user={user} onLogout={logout}>
              <SystemSettingsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* HR Routes */}
      <Route
        path="/hr/dashboard"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <Layout user={user} onLogout={logout}>
              <HRDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/employees"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <Layout user={user} onLogout={logout}>
              <EmployeeListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/employees/:id"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <Layout user={user} onLogout={logout}>
              <EmployeeDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/employees/create"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <Layout user={user} onLogout={logout}>
              <EmployeeCreatePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/stats"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <Layout user={user} onLogout={logout}>
              <HRStatsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/leave-management"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <Layout user={user} onLogout={logout}>
              <LeaveManagementPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Manager Routes */}
      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <Layout user={user} onLogout={logout}>
              <ManagerDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/projects"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <Layout user={user} onLogout={logout}>
              <ProjectListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/projects/create"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <Layout user={user} onLogout={logout}>
              <ProjectCreatePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/projects/:id"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <Layout user={user} onLogout={logout}>
              <ProjectDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/projects/:id/team"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <Layout user={user} onLogout={logout}>
              <ProjectTeamPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/resource-planning"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <Layout user={user} onLogout={logout}>
              <ResourcePlanningPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Developer Routes */}
      <Route
        path="/developer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['developer']}>
            <Layout user={user} onLogout={logout}>
              <DeveloperDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/developer/work"
        element={
          <ProtectedRoute allowedRoles={['developer']}>
            <Layout user={user} onLogout={logout}>
              <MyWorkPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/developer/code-review"
        element={
          <ProtectedRoute allowedRoles={['developer']}>
            <Layout user={user} onLogout={logout}>
              <CodeReviewPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/developer/time-tracking"
        element={
          <ProtectedRoute allowedRoles={['developer']}>
            <Layout user={user} onLogout={logout}>
              <TimeTrackingPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Tester Routes */}
      <Route
        path="/tester/dashboard"
        element={
          <ProtectedRoute allowedRoles={['tester']}>
            <Layout user={user} onLogout={logout}>
              <TesterDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tester/bugs"
        element={
          <ProtectedRoute allowedRoles={['tester']}>
            <Layout user={user} onLogout={logout}>
              <BugTrackingPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tester/qa-workspace"
        element={
          <ProtectedRoute allowedRoles={['tester']}>
            <Layout user={user} onLogout={logout}>
              <QAWorkspacePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tester/reports"
        element={
          <ProtectedRoute allowedRoles={['tester']}>
            <Layout user={user} onLogout={logout}>
              <TestReportsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Employee Routes */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <Layout user={user} onLogout={logout}>
              <EmployeeDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/profile"
        element={
          <ProtectedRoute allowedRoles={['employee', 'developer', 'tester', 'manager', 'hr', 'admin']}>
            <Layout user={user} onLogout={logout}>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/timesheet"
        element={
          <ProtectedRoute allowedRoles={['employee', 'developer', 'tester']}>
            <Layout user={user} onLogout={logout}>
              <TimesheetPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Project Routes */}
      <Route
        path="/projects"
        element={
          <ProtectedRoute allowedRoles={['manager', 'developer', 'tester', 'admin']}>
            <Layout user={user} onLogout={logout}>
              <ProjectsListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id/tickets"
        element={
          <ProtectedRoute allowedRoles={['manager', 'developer', 'tester', 'admin']}>
            <Layout user={user} onLogout={logout}>
              <TicketListPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Default Routes */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? 
            <Navigate to={`/${user.role}/dashboard`} replace /> : 
            <Navigate to="/login" replace />
        } 
      />

      {/* Shared Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
      <Route path="/maintenance" element={<MaintenancePage />} />

      {/* Catch all route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
