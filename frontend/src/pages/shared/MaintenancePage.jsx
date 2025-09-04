import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

const MaintenancePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 text-6xl flex items-center justify-center">
            🚧
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Under Maintenance
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            We're currently performing scheduled maintenance to improve your experience.
          </p>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                What's happening?
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• System updates and improvements</li>
                <li>• Database optimization</li>
                <li>• Security enhancements</li>
                <li>• Performance improvements</li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-blue-400 text-lg">ℹ️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Estimated completion time
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <p>We expect to be back online within the next 2 hours.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Check Again
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
              >
                Go to Home
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Thank you for your patience. We'll be back soon!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
