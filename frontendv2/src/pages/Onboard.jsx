import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import OnboardingModal from '../components/onboarding/OnboardingModal';
import OnboardingManager from './hr/OnboardingManager';

export default function Onboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If authenticated HR/Admin, show manager view
  if (isAuthenticated && (user?.role === 'hr' || user?.role === 'admin')) {
    return <OnboardingManager />;
  }

  // Otherwise show the onboarding dialog (works pre-login with limited actions)
  return (
    <div className="min-h-screen bg-neutral-50">
      <OnboardingModal open={true} onClose={() => navigate('/login', { replace: true })} user={user} />
    </div>
  );
}
