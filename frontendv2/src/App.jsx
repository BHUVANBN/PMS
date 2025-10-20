import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import { Toaster } from 'react-hot-toast';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';
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
import ManagerStandups from './pages/manager/ManagerStandups.jsx';
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
import OnboardingPage from './pages/employee/OnboardingPage.jsx';
import EmployeeDetails from './pages/employee/EmployeeDetails.jsx';
import HRDocuments from './pages/hr/HRDocuments.jsx';
import MyDocuments from './pages/MyDocuments.jsx';
import UserDocuments from './pages/UserDocuments.jsx';
import ManagerDocuments from './pages/manager/ManagerDocuments.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';

// Shared pages
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <Router>
          <div style={{ minHeight: '100vh', position: 'relative' }}>
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1,
                pointerEvents: 'none',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 248, 255, 0.7) 40%, rgba(176, 224, 230, 0.6) 70%, rgba(135, 206, 250, 0.8) 100%)'
              }}
            />
            <Toaster position="top-right" gutter={8} />
            <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
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
              <Route path="hr/documents" element={<ProtectedRoute requiredRoles={["hr","admin","manager"]}><HRDocuments /></ProtectedRoute>} />
              <Route path="manager/documents" element={<ProtectedRoute requiredRoles={["manager","admin"]}><ManagerDocuments /></ProtectedRoute>} />

              <Route path="manager/dashboard" element={<ProtectedRoute requiredRoles={["manager","admin"]}><ManagerDashboard /></ProtectedRoute>} />
              <Route path="manager/standups" element={<ProtectedRoute requiredRoles={["manager","admin"]}><ManagerStandups /></ProtectedRoute>} />
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
              <Route path="documents" element={<ProtectedRoute><MyDocuments /></ProtectedRoute>} />
              <Route path="hr/employee/details" element={<ProtectedRoute requiredRoles={["admin","hr"]}><EmployeeDetails /></ProtectedRoute>} />
              <Route path="employee/details" element={<ProtectedRoute requiredRoles={["manager","developer","tester","sales","marketing","intern"]}><EmployeeDetails /></ProtectedRoute>} />
              <Route path="hr/employees/:id/details" element={<ProtectedRoute requiredRoles={["admin","hr"]}><EmployeeDetails /></ProtectedRoute>} />
              <Route path="admin/:id/details" element={<ProtectedRoute requiredRoles={["admin","hr"]}><EmployeeDetails /></ProtectedRoute>} />
              <Route path="notifications" element={<NotificationsPage />} />

              {/* Role-based user documents viewing (Admin/HR/Manager only) */}
              <Route path="admin/:id/documents" element={<ProtectedRoute requiredRoles={['admin','hr','manager']}><UserDocuments /></ProtectedRoute>} />
              <Route path="hr/:id/documents" element={<ProtectedRoute requiredRoles={['admin','hr','manager']}><UserDocuments /></ProtectedRoute>} />
              <Route path="manager/:id/documents" element={<ProtectedRoute requiredRoles={['admin','hr','manager']}><UserDocuments /></ProtectedRoute>} />
              <Route path="developer/:id/documents" element={<ProtectedRoute requiredRoles={['admin','hr','manager']}><UserDocuments /></ProtectedRoute>} />
              <Route path="tester/:id/documents" element={<ProtectedRoute requiredRoles={['admin','hr','manager']}><UserDocuments /></ProtectedRoute>} />
              <Route path="sales/:id/documents" element={<ProtectedRoute requiredRoles={['admin','hr','manager']}><UserDocuments /></ProtectedRoute>} />
              <Route path="marketing/:id/documents" element={<ProtectedRoute requiredRoles={['admin','hr','manager']}><UserDocuments /></ProtectedRoute>} />
              <Route path="intern/:id/documents" element={<ProtectedRoute requiredRoles={['admin','hr','manager']}><UserDocuments /></ProtectedRoute>} />
            </Route>
            
            {/* 404 page */}
            <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
      </Router>
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
