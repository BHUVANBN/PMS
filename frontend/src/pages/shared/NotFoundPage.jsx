import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 dark:text-gray-600">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={() => navigate(-1)}
            className="w-full"
          >
            Go Back
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
