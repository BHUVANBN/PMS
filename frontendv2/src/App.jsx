import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserList from './pages/admin/UserList';
import SystemStats from './pages/admin/SystemStats';
import SystemSettings from './pages/admin/SystemSettings';
import UserCreate from './pages/admin/UserCreate';
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
import TesterDashboard from './pages/tester/TesterDashboard';
import Bugs from './pages/tester/Bugs';
import SalesDashboard from './pages/sales/SalesDashboard';
import MarketingDashboard from './pages/marketing/MarketingDashboard';
import InternDashboard from './pages/intern/InternDashboard';

// Generic pages
import ProjectsPage from './pages/ProjectsPage';
import TicketsPage from './pages/TicketsPage';
import TeamPage from './pages/TeamPage';
import SprintsPage from './pages/SprintsPage';
import BugsPage from './pages/BugsPage';
import ReportsPage from './pages/ReportsPage';
import CalendarPage from './pages/CalendarPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';

// Shared pages
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

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

              {/* Dashboards per role */}
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="admin/users" element={<UserList />} />
              <Route path="admin/users/new" element={<UserCreate />} />
              <Route path="admin/stats" element={<SystemStats />} />
              <Route path="admin/settings" element={<SystemSettings />} />
              <Route path="hr/dashboard" element={<HRDashboard />} />
              <Route path="hr/employees" element={<EmployeeList />} />
              <Route path="hr/employees/new" element={<EmployeeCreate />} />
              <Route path="hr/employees/:id/edit" element={<EmployeeEdit />} />
              <Route path="manager/dashboard" element={<ManagerDashboard />} />
              <Route path="manager/projects" element={<Projects />} />
              <Route path="manager/projects/new" element={<ProjectCreate />} />
              <Route path="manager/projects/:id/edit" element={<ProjectEdit />} />
              <Route path="manager/team" element={<TeamManagement />} />
              <Route path="manager/kanban" element={<Kanban />} />
              <Route path="manager/sprint/:id/summary" element={<SprintSummary />} />
              <Route path="developer/dashboard" element={<DeveloperDashboard />} />
              <Route path="developer/tasks" element={<Tasks />} />
              <Route path="developer/kanban" element={<DevKanban />} />
              <Route path="tester/dashboard" element={<TesterDashboard />} />
              <Route path="tester/bugs" element={<Bugs />} />
              <Route path="sales/dashboard" element={<SalesDashboard />} />
              <Route path="marketing/dashboard" element={<MarketingDashboard />} />
              <Route path="intern/dashboard" element={<InternDashboard />} />

              {/* Generic sections */}
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="tickets" element={<TicketsPage />} />
              <Route path="team" element={<TeamPage />} />
              <Route path="sprints" element={<SprintsPage />} />
              <Route path="bugs" element={<BugsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="help" element={<HelpPage />} />
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
