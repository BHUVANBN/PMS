import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  List, 
  Settings, 
  BarChart3, 
  User, 
  FolderOpen, 
  Users2, 
  Calendar,
  Code,
  Ticket,
  Kanban,
  FlaskConical,
  Bug,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

const Sidebar = ({ user, isOpen = true, isMobile = false, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const getMenuItems = (role) => {
    const commonItems = [
      { path: `/${role}/dashboard`, label: 'Dashboard', icon: BarChart3 }
    ];

    const roleSpecificItems = {
      admin: [
        { 
          type: 'submenu',
          label: 'User Management', 
          icon: Users,
          items: [
            { path: '/admin/users', label: 'User List', icon: List },
            { path: '/admin/users/create', label: 'Create User', icon: UserPlus },
            { path: '/admin/users/project-wise', label: 'Project-wise Users', icon: Users2 }
          ]
        },
        { path: '/admin/settings', label: 'System Settings', icon: Settings },
        { path: '/admin/stats', label: 'System Stats', icon: BarChart3 }
      ],
      hr: [
        { path: '/hr/employees', label: 'Employees', icon: User },
        { path: '/hr/stats', label: 'HR Analytics', icon: BarChart3 }
      ],
      manager: [
        { path: '/manager/projects', label: 'Projects', icon: FolderOpen },
        { path: '/manager/team', label: 'Team', icon: Users2 },
        { path: '/manager/planning', label: 'Planning', icon: Calendar }
      ],
      developer: [
        { path: '/developer/projects', label: 'My Projects', icon: Code },
        { path: '/developer/tickets', label: 'My Tickets', icon: Ticket },
        { path: '/developer/kanban', label: 'Kanban Board', icon: Kanban }
      ],
      tester: [
        { path: '/tester/projects', label: 'Projects', icon: FlaskConical },
        { path: '/tester/bugs', label: 'Bug Reports', icon: Bug }
      ],
      employee: [
        { path: '/employee/profile', label: 'My Profile', icon: User }
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

  const toggleSubmenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const isSubmenuActive = (items) => {
    return items.some(item => location.pathname === item.path);
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
        {menuItems.map((item, index) => {
          if (item.type === 'submenu') {
            const menuKey = `${item.label}-${index}`;
            const isExpanded = expandedMenus[menuKey];
            const isActive = isSubmenuActive(item.items);
            
            const submenuClasses = `
              px-5 py-3 cursor-pointer border-l-3 border-transparent
              transition-all duration-200 ease-in-out text-sm
              ${isActive 
                ? 'bg-slate-800 border-l-indigo-500 text-indigo-500' 
                : 'hover:bg-slate-800 hover:text-gray-300'
              }
            `;
            
            return (
              <div key={menuKey}>
                <div
                  className={submenuClasses}
                  onClick={() => toggleSubmenu(menuKey)}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.label}
                  {isExpanded ? (
                    <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200" />
                  )}
                </div>
                {isExpanded && (
                  <div className="ml-4 border-l border-gray-700">
                    {item.items.map((subItem) => {
                      const isSubActive = location.pathname === subItem.path;
                      const subItemClasses = `
                        px-5 py-2 cursor-pointer border-l-3 border-transparent
                        transition-all duration-200 ease-in-out text-sm
                        ${isSubActive 
                          ? 'bg-slate-800 border-l-indigo-500 text-indigo-500' 
                          : 'hover:bg-slate-800 hover:text-gray-300'
                        }
                      `;
                      
                      return (
                        <div
                          key={subItem.path}
                          className={subItemClasses}
                          onClick={() => handleNavigation(subItem.path)}
                        >
                          <subItem.icon className="mr-3 h-4 w-4" />
                          {subItem.label}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          } else {
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
                <item.icon className="mr-3 h-4 w-4" />
                {item.label}
              </div>
            );
          }
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
