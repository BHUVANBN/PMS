import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const PageHeader = ({ 
  title, 
  subtitle, 
  breadcrumbs = [], 
  actions = [], 
  showLogout = true,
  backButton = null 
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="py-2 border-b border-gray-200">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index}>
                    <div className="flex items-center">
                      {index > 0 && (
                        <svg className="flex-shrink-0 h-5 w-5 text-gray-300 mr-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {crumb.href ? (
                        <button
                          onClick={() => navigate(crumb.href)}
                          className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {crumb.name}
                        </button>
                      ) : (
                        <span className="text-sm font-medium text-gray-900">{crumb.name}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        )}

        {/* Main Header */}
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center min-w-0 flex-1">
            {backButton && (
              <button
                onClick={() => navigate(backButton.href)}
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title={backButton.title || 'Go back'}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold text-gray-900 truncate">{title}</h1>
              {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Custom Actions */}
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  action.variant === 'primary' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : action.variant === 'secondary'
                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    : action.variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {action.label}
              </button>
            ))}
            
            {/* Logout Button */}
            {showLogout && (
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
