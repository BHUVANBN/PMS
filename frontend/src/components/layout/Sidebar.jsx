import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ user, isOpen = true, isMobile = false, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

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

  const sidebarClasses = `
    w-64 bg-slate-900 border-r border-gray-700 min-h-screen py-5 text-gray-200
    ${isMobile ? 'fixed' : 'sticky'} top-0 z-40 transition-all duration-300 ease-in-out
    overflow-y-auto flex-shrink-0
    ${isMobile ? (isOpen ? 'left-0' : '-left-64') : 'left-0'}
  `;

  return (
    <div className={sidebarClasses}>
      <div className="px-5 mb-5">
        <h3 className="m-0 text-base text-gray-400">
          {user?.role?.toUpperCase()} PANEL
        </h3>
      </div>
      
      <nav>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const menuItemClasses = `
            px-5 py-3 cursor-pointer border-l-3 border-transparent
            transition-all duration-200 ease-in-out text-sm
            ${isActive 
              ? 'bg-slate-800 border-l-indigo-500 text-indigo-500' 
              : 'hover:bg-slate-800 hover:text-gray-300'
            }
          `;
          
          return (
            <div
              key={item.path}
              className={menuItemClasses}
              onClick={() => handleNavigation(item.path)}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
