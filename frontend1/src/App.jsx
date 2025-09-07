import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/shared'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import SimpleDashboard from './pages/SimpleDashboard'
import { AdminDashboard, UserListPage, UserDetailPage, UserCreatePage, SystemStatsPage, SystemSettingsPage } from './pages/admin'
import { HRDashboard, EmployeeListPage, EmployeeDetailPage, EmployeeCreatePage } from './pages/hr'
import { ManagerDashboard, ProjectListPage, ProjectCreatePage, TeamManagementPage } from './pages/manager'
import { DeveloperDashboard, TaskListPage } from './pages/developer'
import { TesterDashboard, BugTrackerPage } from './pages/tester'
import { EmployeeDashboard } from './pages/employee'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <SimpleDashboard />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes - Protected */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserListPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/users/new" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserCreatePage />
            </ProtectedRoute>
          } />
          <Route path="/admin/users/:id" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/stats" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SystemStatsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SystemSettingsPage />
            </ProtectedRoute>
          } />
          
          {/* HR Routes - Protected */}
          <Route path="/hr/dashboard" element={
            <ProtectedRoute allowedRoles={['hr', 'admin']}>
              <HRDashboard />
            </ProtectedRoute>
          } />
          <Route path="/hr/employees" element={
            <ProtectedRoute allowedRoles={['hr', 'admin']}>
              <EmployeeListPage />
            </ProtectedRoute>
          } />
          <Route path="/hr/employees/new" element={
            <ProtectedRoute allowedRoles={['hr', 'admin']}>
              <EmployeeCreatePage />
            </ProtectedRoute>
          } />
          <Route path="/hr/employees/:id" element={
            <ProtectedRoute allowedRoles={['hr', 'admin']}>
              <EmployeeDetailPage />
            </ProtectedRoute>
          } />
          
          {/* Manager Routes - Protected */}
          <Route path="/manager/dashboard" element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/manager/projects" element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <ProjectListPage />
            </ProtectedRoute>
          } />
          <Route path="/manager/projects/new" element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <ProjectCreatePage />
            </ProtectedRoute>
          } />
          <Route path="/manager/team" element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <TeamManagementPage />
            </ProtectedRoute>
          } />
          
          {/* Developer Routes - Protected */}
          <Route path="/developer/dashboard" element={
            <ProtectedRoute allowedRoles={['developer', 'admin']}>
              <DeveloperDashboard />
            </ProtectedRoute>
          } />
          <Route path="/developer/tasks" element={
            <ProtectedRoute allowedRoles={['developer', 'admin']}>
              <TaskListPage />
            </ProtectedRoute>
          } />
          
          {/* Tester Routes - Protected */}
          <Route path="/tester/dashboard" element={
            <ProtectedRoute allowedRoles={['tester', 'admin']}>
              <TesterDashboard />
            </ProtectedRoute>
          } />
          <Route path="/tester/bugs" element={
            <ProtectedRoute allowedRoles={['tester', 'admin']}>
              <BugTrackerPage />
            </ProtectedRoute>
          } />
          
          {/* Employee Routes - Protected */}
          <Route path="/employee/dashboard" element={
            <ProtectedRoute allowedRoles={['employee', 'admin']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
