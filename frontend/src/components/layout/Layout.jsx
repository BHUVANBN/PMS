import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useResponsive } from '../../utils/responsive';

const Layout = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const screenSize = useResponsive();
  const isMobile = screenSize === 'xs' || screenSize === 'sm';

  return (
    <div className="flex min-h-screen w-full bg-slate-900 relative m-0">
      {/* Mobile overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 ${isMobile && sidebarOpen ? 'block' : 'hidden'}`}
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
      
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header 
          user={user} 
          onLogout={onLogout}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMenuButton={isMobile}
        />
        <main className="flex-1 p-0 overflow-auto bg-slate-900 w-full min-h-0 box-border">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
