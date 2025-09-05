import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { useResponsive } from '../../utils/responsive';

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

  return (
    <header className="bg-gray-900 border-b border-gray-700 px-4 md:px-6 flex justify-between items-center text-gray-200 sticky top-0 z-30 w-full box-border">
      <div className="flex items-center gap-4">
        <button 
          className={`bg-transparent border-none text-gray-200 text-xl cursor-pointer p-2 rounded ${showMenuButton ? 'block' : 'hidden'}`}
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <div className="text-xl font-bold text-indigo-500">
          {screenSize === 'xs' ? 'PMS' : 'Project Management System'}
        </div>
      </div>
      
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
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
