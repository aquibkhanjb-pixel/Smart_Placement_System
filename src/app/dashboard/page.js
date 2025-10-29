'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth/context.js';
import { ProtectedRoute } from '../../components/auth/index.js';
import { DashboardLayout } from '../../components/dashboard/index.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/index.js';
import { USER_ROLES } from '../../types/index.js';
import Link from 'next/link';

const StudentDashboard = ({ user }) => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    applications: 0,
    eligibleCompanies: 0,
    recentApplications: [],
    loading: true,
  });

  useEffect(() => {
    fetchStudentStats();
  }, []);

  const fetchStudentStats = async () => {
    try {
      if (!user?.student?.id) return;

      const [applicationsRes, eligibilityRes] = await Promise.all([
        fetch(`/api/applications?studentId=${user.student.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/eligibility/check', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const applicationsData = await applicationsRes.json();
      const eligibilityData = await eligibilityRes.json();

      setStats({
        applications: applicationsData.applications?.length || 0,
        eligibleCompanies: eligibilityData.eligibility?.totalEligible || 0,
        recentApplications: applicationsData.applications?.slice(0, 3) || [],
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching student stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-gray-600">
          Your placement dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">Profile Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Roll Number: {user.student?.rollNumber}</p>
              <p className="text-sm text-gray-600">CGPA: {user.student?.cgpa}</p>
              <p className="text-sm text-gray-600">Department: {user.student?.department}</p>
              <div className="mt-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Profile Complete
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {stats.loading ? '...' : stats.applications}
              </div>
              <p className="text-sm text-gray-600">Active Applications</p>
              <Link href="/dashboard/companies" className="mt-2 text-blue-600 text-sm hover:underline">
                Browse Companies
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-purple-600">Eligibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {stats.loading ? '...' : stats.eligibleCompanies}
              </div>
              <p className="text-sm text-gray-600">Eligible Companies</p>
              <Link href="/dashboard/eligibility" className="mt-2 text-blue-600 text-sm hover:underline">
                Check Eligibility
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/dashboard/profile" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block">
              <h3 className="font-medium text-gray-900">Update Profile</h3>
              <p className="text-sm text-gray-600">Keep your information current</p>
            </Link>
            <Link href="/dashboard/resumes" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block">
              <h3 className="font-medium text-gray-900">Upload Resume</h3>
              <p className="text-sm text-gray-600">Add or update your resume</p>
            </Link>
            <Link href="/dashboard/companies" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block">
              <h3 className="font-medium text-gray-900">View Companies</h3>
              <p className="text-sm text-gray-600">Browse available opportunities</p>
            </Link>
            <Link href="/dashboard/eligibility" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block">
              <h3 className="font-medium text-gray-900">Check Eligibility</h3>
              <p className="text-sm text-gray-600">See which companies you qualify for</p>
            </Link>
            <a
              href={process.env.NEXT_PUBLIC_INTERVIEW_PREP_URL || "https://interview-intelligence-frontend.vercel.app"}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:from-blue-100 hover:to-indigo-100 text-left block transition-all duration-200"
            >
              <h3 className="font-medium text-blue-900 flex items-center">
                Interview Preparation
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </h3>
              <p className="text-sm text-blue-700">Practice with real interview experiences</p>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Recent Applications */}
      {stats.recentApplications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentApplications.map((app) => (
                <div key={app.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <h4 className="font-medium text-gray-900">{app.company?.name}</h4>
                    <p className="text-sm text-gray-600">
                      Applied on {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    app.status === 'APPLIED' ? 'bg-blue-100 text-blue-800' :
                    app.status === 'SHORTLISTED' ? 'bg-yellow-100 text-yellow-800' :
                    app.status === 'SELECTED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {app.status}
                  </span>
                </div>
              ))}
              <Link href="/dashboard/applications" className="text-blue-600 text-sm hover:underline">
                View all applications →
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const CoordinatorDashboard = ({ user }) => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    companies: 0,
    applications: 0,
    placements: 0,
    loading: true,
  });

  useEffect(() => {
    fetchCoordinatorStats();
  }, []);

  const fetchCoordinatorStats = async () => {
    try {
      const [studentsRes, companiesRes, applicationsRes] = await Promise.all([
        fetch('/api/students', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/companies', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/applications', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const studentsData = await studentsRes.json();
      const companiesData = await companiesRes.json();
      const applicationsData = await applicationsRes.json();

      setStats({
        students: studentsData.students?.length || 0,
        companies: companiesData.companies?.length || 0,
        applications: applicationsData.applications?.length || 0,
        placements: applicationsData.applications?.filter(app => app.status === 'SELECTED').length || 0,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching coordinator stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Coordinator Dashboard
        </h1>
        <p className="text-gray-600">
          Manage placement activities and students
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {stats.loading ? '...' : stats.students}
              </div>
              <p className="text-sm text-gray-600">Registered Students</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Active Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {stats.loading ? '...' : stats.companies}
              </div>
              <p className="text-sm text-gray-600">Companies Recruiting</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-purple-600">Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {stats.loading ? '...' : stats.applications}
              </div>
              <p className="text-sm text-gray-600">Total Applications</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">Placements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {stats.loading ? '...' : stats.placements}
              </div>
              <p className="text-sm text-gray-600">Successful Placements</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/students/add" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block">
              <h3 className="font-medium text-gray-900">Add Student</h3>
              <p className="text-sm text-gray-600">Register new student</p>
            </Link>
            <Link href="/dashboard/companies/create" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block">
              <h3 className="font-medium text-gray-900">Add Company</h3>
              <p className="text-sm text-gray-600">Register new company</p>
            </Link>
            <Link href="/dashboard/applications" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block">
              <h3 className="font-medium text-gray-900">View Applications</h3>
              <p className="text-sm text-gray-600">Manage student applications</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {user?.role === USER_ROLES.COORDINATOR ? (
          <CoordinatorDashboard user={user} />
        ) : (
          <StudentDashboard user={user} />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}