import React from 'react';

const Breadcrumb = ({ items = [], separator = '/' }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z" />
      </svg>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-gray-400 select-none">
              {separator === '/' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              ) : (
                separator
              )}
            </span>
          )}
          
          {item.href && index < items.length - 1 ? (
            <a
              href={item.href}
              className="hover:text-blue-600 transition-colors font-medium"
            >
              {item.label}
            </a>
          ) : (
            <span className={index === items.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-600'}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// Auto-generate breadcrumb from URL path
export const AutoBreadcrumb = ({ customItems = [], basePath = '' }) => {
  const path = window.location.pathname;
  const segments = path.split('/').filter(segment => segment);
  
  const items = [
    { label: 'Home', href: '/' },
    ...customItems
  ];

  // Generate breadcrumb items from URL segments
  let currentPath = basePath;
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    
    items.push({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      href: isLast ? undefined : currentPath
    });
  });

  return <Breadcrumb items={items} />;
};

export default Breadcrumb;
