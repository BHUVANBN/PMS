import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './store/auth.js'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import Login from './pages/auth/Login.jsx'
import AdminDashboard from './pages/dashboard/AdminDashboard.jsx'
import ProjectsList from './pages/projects/ProjectsList.jsx'
import ProjectDetail from './pages/projects/ProjectDetail.jsx'
import KanbanBoard from './pages/kanban/KanbanBoard.jsx'
import UsersList from './pages/users/UsersList.jsx'
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard.jsx'

function RequireAuth() {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<RequireAuth />}> 
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<AdminDashboard />} />

            <Route path="/projects" element={<ProjectsList />} />
            <Route path="/projects/:projectId" element={<ProjectDetail />} />

            <Route path="/kanban" element={<KanbanBoard />} />

            <Route path="/users" element={<UsersList />} />

            <Route path="/analytics" element={<AnalyticsDashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}
