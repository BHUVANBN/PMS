import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
// import RegisterPage from './pages/auth/RegisterPage';
import Onboard from './pages/Onboard';

// Dashboard pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ActivityLogs from './pages/admin/ActivityLogs';
import UserList from './pages/admin/UserList';
import SystemStats from './pages/admin/SystemStats';
import SystemSettings from './pages/admin/SystemSettings';
import UserCreate from './pages/admin/UserCreate';
import UserEdit from './pages/admin/UserEdit';
import HRDashboard from './pages/hr/HRDashboard';
import EmployeeList from './pages/hr/EmployeeList';
import EmployeeCreate from './pages/hr/EmployeeCreate';
import EmployeeEdit from './pages/hr/EmployeeEdit';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import Projects from './pages/manager/Projects';
import TeamManagement from './pages/manager/TeamManagement';
import Kanban from './pages/manager/Kanban';
import SprintSummary from './pages/manager/SprintSummary';
import ProjectCreate from './pages/manager/ProjectCreate';
import ProjectEdit from './pages/manager/ProjectEdit';
import DeveloperDashboard from './pages/developer/DeveloperDashboard';
import Tasks from './pages/developer/Tasks';
import DevKanban from './pages/developer/Kanban';
import DeveloperKanbanById from './pages/developer/DeveloperKanbanById';
import TesterDashboard from './pages/tester/TesterDashboard';
import Bugs from './pages/tester/Bugs';
import TesterKanban from './pages/tester/Kanban';
import SalesDashboard from './pages/sales/SalesDashboard';
import MarketingDashboard from './pages/marketing/MarketingDashboard';
import InternDashboard from './pages/intern/InternDashboard';

// Generic pages
import Meeting from './pages/Meeting'
import ProjectsPage from './pages/ProjectsPage';
import TicketsPage from './pages/TicketsPage';
import AdminTicketsPage from './pages/AdminTicketsPage';
import TeamPage from './pages/TeamPage';
import SprintsPage from './pages/SprintsPage';
import BugsPage from './pages/BugsPage';
import ReportsPage from './pages/ReportsPage';
import CalendarPage from './pages/CalendarPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import StandupLogout from './pages/StandupLogout.jsx';
import AllStandups from './pages/standup/AllStandups.jsx';
import PublicOnboardingList from './pages/hr/PublicOnboardingList.jsx';
import OnboardingSuccess from './pages/OnboardingSuccess.jsx';

// Shared pages
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
            <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            {/* Signup disabled: only HR creates credentials */}
            {/* <Route path="/register" element={<RegisterPage />} /> */}
            {/* Onboarding route (public UI; uploads require auth) */}
            <Route path="/onboard" element={<Onboard />} />
            {/* Public success page after onboarding submission */}
            <Route path="/onboarding-success" element={<OnboardingSuccess />} />

            {/* Full-screen Standup Logout page (protected, no main layout) */}
            <Route path="/standup-logout" element={<ProtectedRoute><StandupLogout /></ProtectedRoute>} />

            {/* Protected app with layout and nested routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Default redirect to role dashboard */}
              <Route index element={<RoleBasedRedirect />} />

              {/* Dashboards per role (strict role-based guards) */}
              <Route path="admin/dashboard" element={<ProtectedRoute requiredRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="admin/activity-logs" element={<ProtectedRoute requiredRoles={["admin"]}><ActivityLogs /></ProtectedRoute>} />
              <Route path="admin/users" element={<ProtectedRoute requiredRoles={["admin"]}><UserList /></ProtectedRoute>} />
              <Route path="admin/users/new" element={<ProtectedRoute requiredRoles={["admin"]}><UserCreate /></ProtectedRoute>} />
              <Route path="admin/users/:id/edit" element={<ProtectedRoute requiredRoles={["admin"]}><UserEdit /></ProtectedRoute>} />
              <Route path="admin/stats" element={<ProtectedRoute requiredRoles={["admin"]}><SystemStats /></ProtectedRoute>} />
              <Route path="admin/standups" element={<ProtectedRoute requiredRoles={["admin","hr"]}><AllStandups /></ProtectedRoute>} />
              <Route path="admin/settings" element={<ProtectedRoute requiredRoles={["admin"]}><SystemSettings /></ProtectedRoute>} />

              <Route path="hr/dashboard" element={<ProtectedRoute requiredRoles={["hr"]}><HRDashboard /></ProtectedRoute>} />
              <Route path="hr/employees" element={<ProtectedRoute requiredRoles={["hr"]}><EmployeeList /></ProtectedRoute>} />
              <Route path="hr/employees/new" element={<ProtectedRoute requiredRoles={["hr"]}><EmployeeCreate /></ProtectedRoute>} />
              <Route path="hr/employees/:id/edit" element={<ProtectedRoute requiredRoles={["hr"]}><EmployeeEdit /></ProtectedRoute>} />
              <Route path="hr/standups" element={<ProtectedRoute requiredRoles={["hr","admin"]}><AllStandups /></ProtectedRoute>} />
              <Route path="hr/onboarding-public" element={<ProtectedRoute requiredRoles={["hr","admin"]}><PublicOnboardingList /></ProtectedRoute>} />

              <Route path="manager/dashboard" element={<ProtectedRoute requiredRoles={["manager","admin"]}><ManagerDashboard /></ProtectedRoute>} />
              <Route path="manager/projects" element={<ProtectedRoute requiredRoles={["manager","admin"]}><Projects /></ProtectedRoute>} />
              <Route path="manager/projects/new" element={<ProtectedRoute requiredRoles={["manager","admin"]}><ProjectCreate /></ProtectedRoute>} />
              <Route path="manager/projects/:id/edit" element={<ProtectedRoute requiredRoles={["manager","admin"]}><ProjectEdit /></ProtectedRoute>} />
              <Route path="manager/team" element={<ProtectedRoute requiredRoles={["manager","admin"]}><TeamManagement /></ProtectedRoute>} />
              <Route path="manager/kanban" element={<ProtectedRoute requiredRoles={["manager","admin"]}><Kanban /></ProtectedRoute>} />
              <Route path="manager/sprint/:id/summary" element={<ProtectedRoute requiredRoles={["manager","admin"]}><SprintSummary /></ProtectedRoute>} />

              <Route path="developer/dashboard" element={<ProtectedRoute requiredRoles={["developer"]}><DeveloperDashboard /></ProtectedRoute>} />
              <Route path="developer/tasks" element={<ProtectedRoute requiredRoles={["developer"]}><Tasks /></ProtectedRoute>} />
              <Route path="developer/kanban" element={<ProtectedRoute requiredRoles={["developer"]}><DevKanban /></ProtectedRoute>} />
              <Route path="developer/:developerId/kanban" element={<ProtectedRoute requiredRoles={["manager","admin"]}><DeveloperKanbanById /></ProtectedRoute>} />

              <Route path="tester/dashboard" element={<ProtectedRoute requiredRoles={["tester"]}><TesterDashboard /></ProtectedRoute>} />
              <Route path="tester/bugs" element={<ProtectedRoute requiredRoles={["tester"]}><Bugs /></ProtectedRoute>} />
              <Route path="tester/kanban" element={<ProtectedRoute requiredRoles={["tester"]}><TesterKanban /></ProtectedRoute>} />

              <Route path="sales/dashboard" element={<ProtectedRoute requiredRoles={["sales"]}><SalesDashboard /></ProtectedRoute>} />
              <Route path="marketing/dashboard" element={<ProtectedRoute requiredRoles={["marketing"]}><MarketingDashboard /></ProtectedRoute>} />
              <Route path="intern/dashboard" element={<ProtectedRoute requiredRoles={["intern"]}><InternDashboard /></ProtectedRoute>} />

              {/* Generic sections */}
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="tickets" element={<ProtectedRoute requiredRoles={["admin"]}><AdminTicketsPage /></ProtectedRoute>} />
              <Route path="team" element={<TeamPage />} />
              <Route path="sprints" element={<SprintsPage />} />
              <Route path="bugs" element={<BugsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="help" element={<HelpPage />} />
              <Route path="meetings" element={<Meeting/>}/>
            </Route>
            
            {/* 404 page */}
            <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

// Component to redirect users to their appropriate dashboard
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  
  const roleRedirects = {
    admin: '/admin/dashboard',
    hr: '/hr/dashboard',
    manager: '/manager/dashboard',
    developer: '/developer/dashboard',
    tester: '/tester/dashboard',
    sales: '/sales/dashboard',
    marketing: '/marketing/dashboard',
    intern: '/intern/dashboard',
  };
  
  const redirectPath = roleRedirects[user?.role] || '/login';
  return <Navigate to={redirectPath} replace />;
};

export default App;
