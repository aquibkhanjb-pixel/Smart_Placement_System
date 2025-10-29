'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/context.js';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }

      if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        router.push('/dashboard'); // Redirect to appropriate dashboard
        return;
      }
    }
  }, [isAuthenticated, user, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Prevent flash while redirecting
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return null; // Prevent flash while redirecting
  }

  return children;
};

export default ProtectedRoute;