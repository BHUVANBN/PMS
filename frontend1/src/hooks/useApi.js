import { useState, useEffect, useCallback } from 'react';
import { apiHelpers } from '../utils/helpers/apiHelpers.js';

// Custom hook for API calls with loading and error states
export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiHelpers.safeApiCall(apiFunction, ...args);
      if (result.success) {
        setData(result.data);
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorResult = apiHelpers.handleError(err);
      setError(errorResult.message);
      return errorResult;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  return { data, loading, error, execute, setData, setError };
};

// Hook for paginated API calls
export const usePaginatedApi = (apiFunction, initialPage = 1, pageSize = 10) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = useCallback(async (pageNum = page, filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = { page: pageNum, limit: pageSize, ...filters };
      const result = await apiHelpers.safeApiCall(apiFunction, params);
      
      if (result.success) {
        const responseData = result.data;
        setData(pageNum === 1 ? responseData.items : prev => [...prev, ...responseData.items]);
        setTotalPages(responseData.totalPages || 0);
        setTotalItems(responseData.totalItems || 0);
        setHasMore(pageNum < (responseData.totalPages || 0));
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorResult = apiHelpers.handleError(err);
      setError(errorResult.message);
      return errorResult;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, page, pageSize]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage);
    }
  }, [hasMore, loading, page, fetchData]);

  const refresh = useCallback((filters = {}) => {
    setPage(1);
    setData([]);
    fetchData(1, filters);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    hasMore,
    loadMore,
    refresh,
    setError
  };
};

// Hook for form submissions with API calls
export const useApiForm = (apiFunction, onSuccess, onError) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = useCallback(async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiHelpers.safeApiCall(apiFunction, formData);
      
      if (result.success) {
        if (onSuccess) onSuccess(result);
        return result;
      } else {
        setError(result.message);
        if (onError) onError(result);
        return result;
      }
    } catch (err) {
      const errorResult = apiHelpers.handleError(err);
      setError(errorResult.message);
      if (onError) onError(errorResult);
      return errorResult;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  return { submit, loading, error, setError };
};

// Hook for real-time data with polling
export const usePollingApi = (apiFunction, interval = 5000, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  const fetchData = useCallback(async (...args) => {
    if (!isPolling) setLoading(true);
    setError(null);

    try {
      const result = await apiHelpers.safeApiCall(apiFunction, ...args);
      if (result.success) {
        setData(result.data);
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorResult = apiHelpers.handleError(err);
      setError(errorResult.message);
      return errorResult;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, isPolling]);

  const startPolling = useCallback((...args) => {
    setIsPolling(true);
    fetchData(...args);
    
    const intervalId = setInterval(() => {
      fetchData(...args);
    }, interval);

    return () => {
      clearInterval(intervalId);
      setIsPolling(false);
    };
  }, [fetchData, interval]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  return {
    data,
    loading,
    error,
    isPolling,
    fetchData,
    startPolling,
    stopPolling,
    setData,
    setError
  };
};

export default useApi;
