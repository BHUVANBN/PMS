import React, { useState } from 'react';
import { USER_ROLES } from '../../utils/constants/api.js';
import { apiUtils } from '../../utils/helpers/apiHelpers.js';

const Sidebar = ({ isOpen, onClose, user }) => {
  const [expandedSections, setExpandedSections] = useState({
    projects: true,
    tasks: false,
    reports: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const userRole = user?.role || USER_ROLES.EMPLOYEE;

  const navigationItems = {
    [USER_ROLES.ADMIN]: [
      {
        title: 'Dashboard',
        icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
        href: '/admin/dashboard'
      },
      {
        title: 'User Management',
        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
        expandable: true,
        section: 'users',
        children: [
          { title: 'All Users', href: '/admin/users' },
          { title: 'Create User', href: '/admin/users/create' },
          { title: 'Roles & Permissions', href: '/admin/roles' }
        ]
      },
      {
        title: 'System Settings',
        icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
        href: '/admin/settings'
      },
      {
        title: 'Analytics',
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        href: '/admin/analytics'
      }
    ],
    [USER_ROLES.MANAGER]: [
      {
        title: 'Dashboard',
        icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
        href: '/manager/dashboard'
      },
      {
        title: 'Projects',
        icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
        expandable: true,
        section: 'projects',
        children: [
          { title: 'All Projects', href: '/manager/projects' },
          { title: 'Create Project', href: '/manager/projects/create' },
          { title: 'Project Templates', href: '/manager/templates' }
        ]
      },
      {
        title: 'Team Management',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
        href: '/manager/team'
      },
      {
        title: 'Reports',
        icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        expandable: true,
        section: 'reports',
        children: [
          { title: 'Project Reports', href: '/manager/reports/projects' },
          { title: 'Team Performance', href: '/manager/reports/team' },
          { title: 'Time Tracking', href: '/manager/reports/time' }
        ]
      }
    ],
    [USER_ROLES.DEVELOPER]: [
      {
        title: 'Dashboard',
        icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
        href: '/developer/dashboard'
      },
      {
        title: 'My Tasks',
        icon: 'M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m2 0h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m-2 4h6',
        expandable: true,
        section: 'tasks',
        children: [
          { title: 'Active Tasks', href: '/developer/tasks/active' },
          { title: 'Completed Tasks', href: '/developer/tasks/completed' },
          { title: 'Code Reviews', href: '/developer/code-reviews' }
        ]
      },
      {
        title: 'Projects',
        icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
        href: '/developer/projects'
      },
      {
        title: 'Time Tracking',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        href: '/developer/timesheet'
      }
    ],
    [USER_ROLES.TESTER]: [
      {
        title: 'Dashboard',
        icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
        href: '/tester/dashboard'
      },
      {
        title: 'Test Cases',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        href: '/tester/test-cases'
      },
      {
        title: 'Bug Tracking',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
        expandable: true,
        section: 'bugs',
        children: [
          { title: 'All Bugs', href: '/tester/bugs' },
          { title: 'Report Bug', href: '/tester/bugs/create' },
          { title: 'Bug Reports', href: '/tester/reports' }
        ]
      },
      {
        title: 'Test Reports',
        icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        href: '/tester/reports'
      }
    ],
    [USER_ROLES.HR]: [
      {
        title: 'Dashboard',
        icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
        href: '/hr/dashboard'
      },
      {
        title: 'Employees',
        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
        expandable: true,
        section: 'employees',
        children: [
          { title: 'All Employees', href: '/hr/employees' },
          { title: 'Add Employee', href: '/hr/employees/create' },
          { title: 'Employee Reports', href: '/hr/reports' }
        ]
      },
      {
        title: 'Leave Management',
        icon: 'M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1h4z',
        href: '/hr/leave-management'
      },
      {
        title: 'Performance',
        icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
        href: '/hr/performance'
      }
    ],
    [USER_ROLES.EMPLOYEE]: [
      {
        title: 'Dashboard',
        icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
        href: '/employee/dashboard'
      },
      {
        title: 'My Profile',
        icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
        href: '/employee/profile'
      },
      {
        title: 'Timesheet',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        href: '/employee/timesheet'
      },
      {
        title: 'Leave Requests',
        icon: 'M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1h4z',
        href: '/employee/leave'
      }
    ]
  };

  const currentNavItems = navigationItems[userRole] || navigationItems[USER_ROLES.EMPLOYEE];

  const renderNavItem = (item, index) => {
    const isExpanded = expandedSections[item.section];
    
    return (
      <div key={index} className="mb-1">
        {item.expandable ? (
          <div>
            <button
              onClick={() => toggleSection(item.section)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span>{item.title}</span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {isExpanded && (
              <div className="ml-8 mt-1 space-y-1">
                {item.children.map((child, childIndex) => (
                  <a
                    key={childIndex}
                    href={child.href}
                    className="block px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    {child.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          <a
            href={item.href}
            className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span>{item.title}</span>
          </a>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PM</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">Menu</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user ? apiUtils.formatUserName(user).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user ? apiUtils.formatUserName(user) : 'User'}
                </p>
                <p className="text-xs text-blue-600 capitalize">{userRole}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {currentNavItems.map((item, index) => renderNavItem(item, index))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Need help? Contact support</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
