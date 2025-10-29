'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth/context.js';
import { ProtectedRoute } from '../../../components/auth/index.js';
import { DashboardLayout } from '../../../components/dashboard/index.js';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../../components/ui/index.js';
import { USER_ROLES } from '../../../types/index.js';

const NotificationCard = ({ title, description, children, icon }) => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600 mb-4">{description}</p>
      {children}
    </CardContent>
  </Card>
);

const CompanyNotifications = () => {
  const { token } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [notifyEligibleOnly, setNotifyEligibleOnly] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const sendNotifications = async () => {
    if (!selectedCompany) {
      alert('Please select a company');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/notifications/new-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyId: selectedCompany,
          notifyEligibleOnly,
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        alert(`Notifications sent successfully to ${data.stats.emailsSent} students!`);
      } else {
        alert(data.error || 'Failed to send notifications');
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
      alert('Failed to send notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Company
          </label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">Choose a company...</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name} - ₹{company.ctc} LPA
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notifyEligibleOnly}
                onChange={(e) => setNotifyEligibleOnly(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                Only notify eligible students
              </span>
            </label>
            <p className="text-xs text-gray-500">
              Uncheck to notify all students regardless of eligibility
            </p>
          </div>
        </div>
      </div>

      <Button
        onClick={sendNotifications}
        disabled={loading || !selectedCompany}
        className="mb-4"
      >
        {loading ? 'Sending Notifications...' : 'Send Company Notifications'}
      </Button>

      {result && (
        <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h4 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.success ? 'Notifications Sent Successfully!' : 'Error Sending Notifications'}
          </h4>
          {result.success && (
            <div className="mt-2 text-sm text-green-700">
              <p>Total Students: {result.stats.totalStudents}</p>
              <p>Eligible Students: {result.stats.eligibleStudents}</p>
              <p>Emails Sent: {result.stats.emailsSent}</p>
            </div>
          )}
          {!result.success && (
            <p className="mt-2 text-sm text-red-700">{result.error}</p>
          )}
        </div>
      )}
    </div>
  );
};

const ApplicationStatusUpdater = () => {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/applications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    setUpdating(prev => ({ ...prev, [applicationId]: true }));

    try {
      const response = await fetch('/api/notifications/application-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicationId,
          newStatus,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Status updated and notification sent!');
        fetchApplications(); // Refresh the list
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading applications...</div>;
  }

  return (
    <div>
      {applications.length === 0 ? (
        <p className="text-center text-gray-600">No applications found</p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {app.student?.user?.firstName} {app.student?.user?.lastName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Applied to: {app.company?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Current Status: <span className="font-medium">{app.status}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  {app.status === 'APPLIED' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateApplicationStatus(app.id, 'SHORTLISTED')}
                        disabled={updating[app.id]}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        {updating[app.id] ? 'Updating...' : 'Shortlist'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateApplicationStatus(app.id, 'REJECTED')}
                        disabled={updating[app.id]}
                        variant="danger"
                      >
                        {updating[app.id] ? 'Updating...' : 'Reject'}
                      </Button>
                    </>
                  )}

                  {app.status === 'SHORTLISTED' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateApplicationStatus(app.id, 'SELECTED')}
                        disabled={updating[app.id]}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {updating[app.id] ? 'Updating...' : 'Select'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateApplicationStatus(app.id, 'REJECTED')}
                        disabled={updating[app.id]}
                        variant="danger"
                      >
                        {updating[app.id] ? 'Updating...' : 'Reject'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function NotificationsPage() {
  const { user } = useAuth();

  if (user?.role !== USER_ROLES.COORDINATOR) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-8">
            <p className="text-gray-600">Only coordinators can access notifications.</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Email Notifications</h1>
            <p className="text-gray-600">
              Send automated email notifications to students
            </p>
          </div>

          <NotificationCard
            title="New Company Notifications"
            description="Notify students about new companies added to the placement portal"
            icon="🏢"
          >
            <CompanyNotifications />
          </NotificationCard>

          <NotificationCard
            title="Application Status Updates"
            description="Update application status and automatically notify students"
            icon="📧"
          >
            <ApplicationStatusUpdater />
          </NotificationCard>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">ℹ️</span>
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  <strong>Development Mode:</strong> Emails are sent using test accounts and logged to console.
                </p>
                <p className="mb-2">
                  <strong>Production Setup:</strong> Configure SMTP settings in environment variables:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>EMAIL_HOST</li>
                  <li>EMAIL_USER</li>
                  <li>EMAIL_PASS</li>
                  <li>EMAIL_FROM</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}