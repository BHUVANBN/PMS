import React from 'react';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  color = 'blue', 
  trend = null, 
  trendDirection = null,
  onClick = null 
}) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    indigo: 'text-indigo-600',
    pink: 'text-pink-600',
    orange: 'text-orange-600'
  };

  const trendColorClasses = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  const CardWrapper = onClick ? 'button' : 'div';
  const cardProps = onClick ? { 
    onClick, 
    className: "bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer w-full text-left" 
  } : { 
    className: "bg-white overflow-hidden shadow rounded-lg" 
  };

  return (
    <CardWrapper {...cardProps}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`h-6 w-6 ${colorClasses[color] || colorClasses.blue}`}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {trend && trendDirection && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${trendColorClasses[trendDirection]}`}>
                    {trendDirection === 'up' && (
                      <svg className="self-center flex-shrink-0 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {trendDirection === 'down' && (
                      <svg className="self-center flex-shrink-0 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="sr-only">{trendDirection === 'up' ? 'Increased' : 'Decreased'} by</span>
                    {trend}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
};

export default StatsCard;
