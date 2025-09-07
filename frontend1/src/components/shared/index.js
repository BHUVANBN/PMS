// Shared components exports
export { default as StatsCard } from './StatsCard';
export { default as PageHeader } from './PageHeader';
export { default as LoadingSpinner, SkeletonLoader, CardSkeleton } from './LoadingSpinner';
export { default as ErrorMessage } from './ErrorMessage';
export { 
  default as ProtectedRoute,
  withRoleProtection,
  AdminRoute,
  ManagerRoute,
  HRRoute,
  DeveloperRoute,
  TesterRoute,
  EmployeeRoute
} from './ProtectedRoute';
