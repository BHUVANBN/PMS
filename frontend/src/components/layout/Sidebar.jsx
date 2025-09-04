import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ user, isOpen = true, isMobile = false, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarStyles = {
    width: '250px',
    backgroundColor: '#0f172a',
    borderRight: '1px solid #374151',
    minHeight: '100vh',
    padding: '20px 0',
    color: '#e5e7eb',
    position: isMobile ? 'fixed' : 'sticky',
    top: 0,
    left: isMobile ? (isOpen ? '0' : '-250px') : '0',
    zIndex: 40,
    transition: 'left 0.3s ease',
    overflowY: 'auto',
    flexShrink: 0
  };

  const menuItemStyles = {
    padding: '12px 20px',
    cursor: 'pointer',
    borderLeft: '3px solid transparent',
    transition: 'all 0.2s ease-in-out',
    fontSize: '14px'
  };

  const activeMenuItemStyles = {
    ...menuItemStyles,
    backgroundColor: '#1e293b',
    borderLeftColor: '#4f46e5',
    color: '#4f46e5'
  };

  const getMenuItems = (role) => {
    const commonItems = [
      { path: `/${role}/dashboard`, label: 'Dashboard', icon: '📊' }
    ];

    const roleSpecificItems = {
      admin: [
        { path: '/admin/users', label: 'User Management', icon: '👥' },
        { path: '/admin/system', label: 'System Settings', icon: '⚙️' },
        { path: '/admin/stats', label: 'System Stats', icon: '📈' }
      ],
      hr: [
        { path: '/hr/employees', label: 'Employees', icon: '👤' },
        { path: '/hr/stats', label: 'HR Analytics', icon: '📊' }
      ],
      manager: [
        { path: '/manager/projects', label: 'Projects', icon: '📁' },
        { path: '/manager/team', label: 'Team', icon: '👥' },
        { path: '/manager/planning', label: 'Planning', icon: '📋' }
      ],
      developer: [
        { path: '/developer/projects', label: 'My Projects', icon: '💻' },
        { path: '/developer/tickets', label: 'My Tickets', icon: '🎫' },
        { path: '/developer/kanban', label: 'Kanban Board', icon: '📋' }
      ],
      tester: [
        { path: '/tester/projects', label: 'Projects', icon: '🧪' },
        { path: '/tester/bugs', label: 'Bug Reports', icon: '🐛' }
      ],
      employee: [
        { path: '/employee/profile', label: 'My Profile', icon: '👤' }
      ]
    };

    return [...commonItems, ...(roleSpecificItems[role] || [])];
  };

  const menuItems = user ? getMenuItems(user.role) : [];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <div style={sidebarStyles}>
      <div style={{ padding: '0 20px', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#9ca3af' }}>
          {user?.role?.toUpperCase()} PANEL
        </h3>
      </div>
      
      <nav>
        {menuItems.map((item) => (
          <div
            key={item.path}
            style={location.pathname === item.path ? activeMenuItemStyles : menuItemStyles}
            onClick={() => handleNavigation(item.path)}
          >
            <span style={{ marginRight: '8px' }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
