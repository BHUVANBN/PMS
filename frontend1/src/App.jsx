import React, { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ApiExample from './components/examples/ApiExample'
import ComponentShowcase from './components/examples/ComponentShowcase'
import ErrorBoundary from './components/common/ErrorBoundary'

function App() {
  const [count, setCount] = useState(0)
  const [activeDemo, setActiveDemo] = useState('home') // 'home', 'api', 'components'

  const renderContent = () => {
    switch (activeDemo) {
      case 'api':
        return <ApiExample />
      case 'components':
        return <ComponentShowcase />
      default:
        return (
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <div className="flex justify-center items-center space-x-8 mb-8">
                <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
                  <img src={viteLogo} className="h-24 w-24 hover:drop-shadow-lg transition-all duration-300" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
                  <img src={reactLogo} className="h-24 w-24 animate-spin-slow hover:animate-spin transition-all duration-300" alt="React logo" />
                </a>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Project Management System
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                A comprehensive project management solution built with React, Vite, and Tailwind CSS. 
                Features role-based access control, real-time collaboration, and modern UI components.
              </p>

              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto mb-12">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Interactive Counter</h2>
                <button
                  onClick={() => setCount((count) => count + 1)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Count is {count}
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  Click the button to increment the counter
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="text-indigo-600 text-3xl mb-3">🚀</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Development</h3>
                  <p className="text-gray-600 text-sm">Built with Vite for lightning-fast development and hot module replacement.</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="text-indigo-600 text-3xl mb-3">🎨</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Modern UI</h3>
                  <p className="text-gray-600 text-sm">Styled with Tailwind CSS for responsive and beautiful user interfaces.</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="text-indigo-600 text-3xl mb-3">⚡</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">React Powered</h3>
                  <p className="text-gray-600 text-sm">Component-based architecture with modern React hooks and patterns.</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Explore Our Components</h2>
                <p className="text-gray-600 mb-6">
                  Check out our comprehensive UI component library and API integration examples.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setActiveDemo('components')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    View UI Components
                  </button>
                  <button
                    onClick={() => setActiveDemo('api')}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    API Integration Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <ErrorBoundary>
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
              <nav className="flex space-x-2">
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
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {renderContent()}
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default App
