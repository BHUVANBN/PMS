import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { useResponsive, getResponsiveSpacing } from '../../utils/responsive';

const Header = ({ user, onLogout, onMenuClick, showMenuButton = false }) => {
  const navigate = useNavigate();
  const screenSize = useResponsive();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('rememberMe');
    if (onLogout) onLogout();
    navigate('/login');
  };

  const headerStyles = {
    backgroundColor: '#111827',
    borderBottom: '1px solid #374151',
    padding: `16px ${getResponsiveSpacing('md', screenSize)}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 30,
    width: '100%',
    boxSizing: 'border-box'
  };

  const leftSectionStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  };

  const menuButtonStyles = {
    background: 'none',
    border: 'none',
    color: '#e5e7eb',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '4px',
    display: showMenuButton ? 'block' : 'none'
  };

  const logoStyles = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#4f46e5'
  };

  const userInfoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  };

  const userNameStyles = {
    fontSize: '14px',
    color: '#9ca3af'
  };

  return (
    <header style={headerStyles}>
      <div style={leftSectionStyles}>
        <button 
          style={menuButtonStyles}
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <div style={logoStyles}>
          {screenSize === 'xs' ? 'PMS' : 'Project Management System'}
        </div>
      </div>
      
      {user && (
        <div style={userInfoStyles}>
          <span style={userNameStyles}>
            {screenSize === 'xs' ? user.role : `Welcome, ${user.role || 'User'}`}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
          >
            {screenSize === 'xs' ? '↗' : 'Logout'}
          </Button>
        </div>
      )}
    </header>
  );
};

export default Header;
