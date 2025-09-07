import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Simple LogoutButton component
const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
    >
      Logout
    </button>
  );
};


const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [count, setCount] = useState(0);
  const [activeDemo, setActiveDemo] = useState('home'); // 'home', 'api', 'components'

  const renderContent = () => {
    switch (activeDemo) {
      case 'api':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">API Integration Demo</h3>
            <p className="text-gray-600">API demo components will be available soon.</p>
          </div>
        );
      case 'components':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">UI Components Showcase</h3>
            <p className="text-gray-600">Component showcase will be available soon.</p>
          </div>
        );
      default:
        return (
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <div className="flex justify-center items-center space-x-8 mb-8">
                <div className="w-42 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-4xl font-bold shadow-lg hover:shadow-xl transition-all duration-300">      SkillonX       </div>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Project Management System
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                A comprehensive project management solution built with React, Vite, and Tailwind CSS. 
                Features role-based access control, real-time collaboration, and modern UI components.
              </p>

              {/* Authentication Status */}
              {isAuthenticated ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-green-800">Welcome back, {user?.firstName}!</h3>
                  </div>
                  <p className="text-green-700 mb-4">You are signed in as {user?.role}</p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto mb-8">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">Get Started</h3>
                  <p className="text-blue-700 mb-4">Sign in to access your projects and collaborate with your team.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      to="/login"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center"
                    >
                      Sign In
                    </Link>
                    {/* <Link
                      to="/login"
                      className="flex-1 bg-white hover:bg-gray-50 text-blue-600 font-medium py-2 px-4 rounded-lg border border-blue-600 transition-colors text-center"
                    >
                      Sign Up
                    </Link> */}
                  </div>
                </div>
              )}

            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setActiveDemo('home')}
                className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
              >
                Project Management System
              </button>
            </div>
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setActiveDemo('home')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeDemo === 'home'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveDemo('components')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeDemo === 'components'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Components
              </button>
              <button
                onClick={() => setActiveDemo('api')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeDemo === 'api'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                API Demo
              </button>
              
              {/* Auth Buttons */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
                  <span className="text-sm text-gray-600">Hi, {user?.firstName}</span>
                  <Link
                    to="/dashboard"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <LogoutButton />
                </div>
              ) : (
                <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/login"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default HomePage;
