import React from 'react';
import { Button } from '../ui/Button';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  className = '',
  ...props
}) => {
  const getVisiblePages = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  const containerStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    justifyContent: 'center'
  };

  const pageButtonStyles = {
    minWidth: '32px',
    height: '32px',
    padding: '0 8px'
  };

  if (totalPages <= 1) return null;

  return (
    <div style={containerStyles} className={className} {...props}>
      {showFirstLast && currentPage > 1 && (
        <Button
          variant="outline"
          size="sm"
          style={pageButtonStyles}
          onClick={() => onPageChange(1)}
        >
          First
        </Button>
      )}
      
      {showPrevNext && currentPage > 1 && (
        <Button
          variant="outline"
          size="sm"
          style={pageButtonStyles}
          onClick={() => onPageChange(currentPage - 1)}
        >
          ←
        </Button>
      )}
      
      {visiblePages[0] > 1 && (
        <>
          <Button
            variant="outline"
            size="sm"
            style={pageButtonStyles}
            onClick={() => onPageChange(1)}
          >
            1
          </Button>
          {visiblePages[0] > 2 && <span style={{ color: '#6b7280' }}>...</span>}
        </>
      )}
      
      {visiblePages.map(page => (
        <Button
          key={page}
          variant={page === currentPage ? 'primary' : 'outline'}
          size="sm"
          style={pageButtonStyles}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}
      
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span style={{ color: '#6b7280' }}>...</span>
          )}
          <Button
            variant="outline"
            size="sm"
            style={pageButtonStyles}
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </Button>
        </>
      )}
      
      {showPrevNext && currentPage < totalPages && (
        <Button
          variant="outline"
          size="sm"
          style={pageButtonStyles}
          onClick={() => onPageChange(currentPage + 1)}
        >
          →
        </Button>
      )}
      
      {showFirstLast && currentPage < totalPages && (
        <Button
          variant="outline"
          size="sm"
          style={pageButtonStyles}
          onClick={() => onPageChange(totalPages)}
        >
          Last
        </Button>
      )}
    </div>
  );
};

export default Pagination;
