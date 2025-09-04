import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useResponsive } from '../../utils/responsive';

const Layout = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const screenSize = useResponsive();
  const isMobile = screenSize === 'xs' || screenSize === 'sm';

  const layoutStyles = {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#0f172a',
    position: 'relative',
    margin: 0
  };

  const mainContentStyles = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    width: '100%'
  };

  const contentAreaStyles = {
    flex: 1,
    padding: 0,
    overflow: 'auto',
    backgroundColor: '#0f172a',
    width: '100%',
    minHeight: 0,
    boxSizing: 'border-box'
  };

  const overlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 40,
    display: isMobile && sidebarOpen ? 'block' : 'none'
  };

  return (
    <div style={layoutStyles}>
      {/* Mobile overlay */}
      <div 
        style={overlayStyles} 
        onClick={() => setSidebarOpen(false)}
      />
      
      {user && (
        <Sidebar 
          user={user} 
          isOpen={sidebarOpen}
          isMobile={isMobile}
          onClose={() => setSidebarOpen(false)}
        />
      )}
      
      <div style={mainContentStyles}>
        <Header 
          user={user} 
          onLogout={onLogout}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMenuButton={isMobile}
        />
        <main style={contentAreaStyles}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
