'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth/context.js';
import { Button } from '../components/ui/index.js';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Prevent flash while redirecting
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="mt-6 text-4xl font-extrabold text-gray-900">
            Smart Placement System
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Intelligent placement management for educational institutions
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 text-center">
                Welcome
              </h2>
              <p className="mt-2 text-sm text-gray-600 text-center">
                Sign in to access your placement dashboard
              </p>
            </div>

            <div className="space-y-4">
              <Button
                className="w-full"
                onClick={() => router.push('/auth/login')}
              >
                Sign In
              </Button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    System Features
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900">🎯 Smart Eligibility</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Automated eligibility checking with complex business rules
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900">📊 Real-time Tracking</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Track applications, placements, and student progress
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900">🔐 Role-based Access</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Separate dashboards for students and coordinators
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Students: Contact your placement coordinator for access
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
