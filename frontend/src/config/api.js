// Central API configuration

export const API_ORIGIN = import.meta.env.VITE_API_URL || 'http://localhost:5001';
export const BASE_URL = API_ORIGIN;

export function withBase(path = '') {
  if (!path) return BASE_URL;
  const hasLeadingSlash = path.startsWith('/');
  return `${BASE_URL}${hasLeadingSlash ? '' : '/'}${path}`;
}


