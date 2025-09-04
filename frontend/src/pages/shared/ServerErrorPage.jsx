import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

const ServerErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 text-6xl flex items-center justify-center">
            🔧
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            500 - Server Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Something went wrong on our servers. We're working to fix it.
          </p>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                What can you do?
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• Try refreshing the page</li>
                <li>• Check back in a few minutes</li>
                <li>• Contact support if the problem persists</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Refresh Page
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="w-full"
              >
                Go Back
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Error ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerErrorPage;
