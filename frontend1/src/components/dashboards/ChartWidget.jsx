import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../common';

const ChartWidget = ({ 
  title,
  data = [],
  type = 'bar', // 'bar', 'line', 'pie', 'doughnut'
  loading = false,
  error = null,
  className = '',
  height = '300px',
  showLegend = true,
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']
}) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data);
    }
  }, [data]);

  // Simple bar chart implementation
  const renderBarChart = () => {
    if (!chartData.length) return null;

    const maxValue = Math.max(...chartData.map(item => item.value));
    
    return (
      <div className="flex items-end justify-between h-full px-4 pb-4">
        {chartData.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1 mx-1">
            <div 
              className="w-full rounded-t-md transition-all duration-500 hover:opacity-80 relative group"
              style={{ 
                height: `${(item.value / maxValue) * 100}%`,
                backgroundColor: colors[index % colors.length],
                minHeight: '4px'
              }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {item.label}: {item.value}
              </div>
            </div>
            <span className="text-xs text-gray-600 mt-2 text-center truncate w-full">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Simple line chart implementation
  const renderLineChart = () => {
    if (!chartData.length) return null;

    const maxValue = Math.max(...chartData.map(item => item.value));
    const minValue = Math.min(...chartData.map(item => item.value));
    const range = maxValue - minValue || 1;

    const points = chartData.map((item, index) => {
      const x = (index / (chartData.length - 1)) * 100;
      const y = 100 - ((item.value - minValue) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative h-full p-4">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke={colors[0]}
            strokeWidth="2"
            points={points}
            vectorEffect="non-scaling-stroke"
          />
          {chartData.map((item, index) => {
            const x = (index / (chartData.length - 1)) * 100;
            const y = 100 - ((item.value - minValue) / range) * 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={colors[0]}
                vectorEffect="non-scaling-stroke"
                className="hover:r-4 transition-all"
              />
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2">
          {chartData.map((item, index) => (
            <span key={index} className="text-xs text-gray-600 text-center">
              {item.label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Simple pie chart implementation
  const renderPieChart = () => {
    if (!chartData.length) return null;

    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    const slices = chartData.map((item, index) => {
      const percentage = (item.value / total) * 100;
      const angle = (item.value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
      const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
      const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
      const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      const pathData = [
        `M 50 50`,
        `L ${x1} ${y1}`,
        `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');
      
      currentAngle += angle;
      
      return {
        ...item,
        pathData,
        percentage: percentage.toFixed(1),
        color: colors[index % colors.length]
      };
    });

    return (
      <div className="flex items-center h-full">
        <div className="flex-1">
          <svg className="w-full h-full max-w-xs mx-auto" viewBox="0 0 100 100">
            {slices.map((slice, index) => (
              <path
                key={index}
                d={slice.pathData}
                fill={slice.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                title={`${slice.label}: ${slice.value} (${slice.percentage}%)`}
              />
            ))}
          </svg>
        </div>
        
        {showLegend && (
          <div className="ml-4 space-y-2">
            {slices.map((slice, index) => (
              <div key={index} className="flex items-center text-sm">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-gray-700">
                  {slice.label} ({slice.percentage}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart();
      case 'pie':
      case 'doughnut':
        return renderPieChart();
      default:
        return renderBarChart();
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <div className="flex items-center justify-center" style={{ height }}>
          <LoadingSpinner size="md" text="Loading chart..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <div className="flex items-center justify-center text-center" style={{ height }}>
          <div>
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <div className="flex items-center justify-center text-center" style={{ height }}>
          <div>
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {chartData.length} item{chartData.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
      
      <div style={{ height }}>
        {renderChart()}
      </div>
    </div>
  );
};

// Predefined chart components for common use cases
export const TicketStatusChart = ({ data, loading, error }) => (
  <ChartWidget
    title="Tickets by Status"
    data={data}
    type="pie"
    loading={loading}
    error={error}
    colors={['#6B7280', '#3B82F6', '#F59E0B', '#8B5CF6', '#10B981']}
  />
);

export const ProjectProgressChart = ({ data, loading, error }) => (
  <ChartWidget
    title="Project Progress"
    data={data}
    type="bar"
    loading={loading}
    error={error}
    colors={['#10B981', '#3B82F6', '#F59E0B', '#EF4444']}
  />
);

export const BurndownChart = ({ data, loading, error }) => (
  <ChartWidget
    title="Sprint Burndown"
    data={data}
    type="line"
    loading={loading}
    error={error}
    colors={['#EF4444', '#6B7280']}
  />
);

export const TeamVelocityChart = ({ data, loading, error }) => (
  <ChartWidget
    title="Team Velocity"
    data={data}
    type="bar"
    loading={loading}
    error={error}
    colors={['#3B82F6']}
  />
);

export default ChartWidget;
