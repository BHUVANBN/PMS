import React, { useState, useEffect } from 'react';
import { StatsCard } from '../../components/dashboards/StatsCard';
import { ProjectTable } from '../../components/tables/ProjectTable';
import { RecentActivity } from '../../components/dashboards/RecentActivity';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import api from '../../services/api';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalUsers: 0,
    totalTickets: 0,
    activeSprints: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch system stats
      try {
        const statsResponse = await api.admin.getSystemStats();
        setStats({
          totalProjects: statsResponse.totalProjects || 0,
          totalUsers: statsResponse.totalUsers || 0,
          totalTickets: statsResponse.totalTickets || 0,
          activeSprints: statsResponse.activeSprints || 0
        });
      } catch (statsError) {
        console.warn('Failed to fetch system stats:', statsError);
        // Use default stats if API fails
        setStats({
          totalProjects: 0,
          totalUsers: 0,
          totalTickets: 0,
          activeSprints: 0
        });
      }

      // Fetch recent projects (limit to 5)
      try {
        const projectsResponse = await api.project.getProjects();
        const recentProjectsData = projectsResponse.projects?.slice(0, 5) || [];
        setRecentProjects(recentProjectsData);
      } catch (projectsError) {
        console.warn('Failed to fetch recent projects:', projectsError);
        setRecentProjects([]);
      }

      // Fetch recent activity (mock data for now since activity API might not be available)
      const mockActivity = [
        {
          id: 1,
          type: 'project_created',
          message: 'created a new project',
          user: { name: 'John Doe' },
          project: 'E-commerce Platform',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          type: 'user_joined',
          message: 'joined the system',
          user: { name: 'Jane Smith' },
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          type: 'task_completed',
          message: 'completed a task',
          user: { name: 'Mike Johnson' },
          project: 'Mobile App',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 4,
          type: 'bug_reported',
          message: 'reported a bug',
          user: { name: 'Sarah Wilson' },
          project: 'Web Portal',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 5,
          type: 'comment_added',
          message: 'added a comment',
          user: { name: 'David Brown' },
          project: 'API Integration',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        }
      ];
      setRecentActivity(mockActivity);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      // Check if it's an authentication error
      if (err.message?.includes('401') || err.message?.includes('Authentication') || err.message?.includes('token')) {
        setError('Authentication failed. Please log in again.');
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(err.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProjectView = (project) => {
    // Navigate to project detail page
    window.location.href = `/manager/projects/${project.id}`;
  };

  const handleProjectEdit = (project) => {
    // Navigate to project edit page
    window.location.href = `/manager/projects/${project.id}/edit`;
  };

  const handleProjectDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.project.deleteProject(projectId);
        // Refresh the projects list
        const projectsResponse = await api.project.getProjects();
        setRecentProjects(projectsResponse.projects?.slice(0, 5) || []);
      } catch (err) {
        console.error('Error deleting project:', err);
        alert('Failed to delete project');
      }
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        backgroundColor: '#111827'
      }}>
        <LoadingSpinner size="lg" color="blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#111827',
        color: '#ef4444',
        textAlign: 'center',
        borderRadius: '8px',
        border: '1px solid #374151'
      }}>
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button
          onClick={fetchDashboardData}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const containerStyles = {
    padding: '24px',
    backgroundColor: '#111827',
    minHeight: '100vh',
    color: '#e5e7eb'
  };

  const headerStyles = {
    marginBottom: '32px'
  };

  const titleStyles = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#e5e7eb',
    marginBottom: '8px'
  };

  const subtitleStyles = {
    fontSize: '16px',
    color: '#9ca3af',
    margin: 0
  };

  const statsGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  };

  const contentGridStyles = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
    '@media (max-width: 1024px)': {
      gridTemplateColumns: '1fr'
    }
  };

  const sectionStyles = {
    backgroundColor: '#111827'
  };

  const sectionTitleStyles = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: '16px'
  };

  return (
    <ErrorBoundary>
      <div style={containerStyles}>
        {/* Header */}
        <div style={headerStyles}>
          <h1 style={titleStyles}>Admin Dashboard</h1>
          <p style={subtitleStyles}>
            Welcome to the system administration panel. Monitor system performance and manage resources.
          </p>
        </div>

        {/* Stats Cards */}
        <div style={statsGridStyles}>
          <StatsCard
            title="Total Projects"
            value={stats.totalProjects}
            subtitle="Active and completed projects"
            icon="🚀"
            color="blue"
            trend="up"
            trendValue="+12%"
          />
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            subtitle="Registered system users"
            icon="👥"
            color="green"
            trend="up"
            trendValue="+8%"
          />
          <StatsCard
            title="Total Tickets"
            value={stats.totalTickets}
            subtitle="All project tickets"
            icon="🎫"
            color="yellow"
            trend="neutral"
            trendValue="0%"
          />
          <StatsCard
            title="Active Sprints"
            value={stats.activeSprints}
            subtitle="Currently running sprints"
            icon="🏃"
            color="purple"
            trend="up"
            trendValue="+3%"
          />
        </div>

        {/* Main Content Grid */}
        <div style={contentGridStyles}>
          {/* Recent Projects */}
          <div style={sectionStyles}>
            <h2 style={sectionTitleStyles}>Recent Projects</h2>
            <ProjectTable
              projects={recentProjects}
              onView={handleProjectView}
              onEdit={handleProjectEdit}
              onDelete={handleProjectDelete}
            />
          </div>

          {/* Recent Activity */}
          <div style={sectionStyles}>
            <h2 style={sectionTitleStyles}>Recent Activity</h2>
            <RecentActivity
              activities={recentActivity}
              maxItems={8}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AdminDashboard;