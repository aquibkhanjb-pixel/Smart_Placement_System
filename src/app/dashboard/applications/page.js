'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth/context.js';
import { Button, Card } from '../../../components/ui/index.js';
import Link from 'next/link';

const ApplicationsPage = () => {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const url = user?.role === 'STUDENT' && user?.student?.id
        ? `/api/applications?studentId=${user.student.id}`
        : '/api/applications';

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      APPLIED: 'bg-blue-100 text-blue-800',
      SHORTLISTED: 'bg-yellow-100 text-yellow-800',
      SELECTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const colors = {
      ELITE: 'bg-purple-100 text-purple-800',
      SUPER_DREAM: 'bg-blue-100 text-blue-800',
      DREAM: 'bg-green-100 text-green-800',
      NORMAL: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[category]}`}>
        {category.replace('_', ' ')}
      </span>
    );
  };

  const handleWithdrawApplication = async (applicationId) => {
    if (!confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to withdraw application');
      }

      fetchApplications(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusUpdate = (application) => {
    setSelectedApplication(application);
    setNewStatus(application.status);
    setShowStatusModal(true);
  };

  const handleNotesUpdate = (application) => {
    setSelectedApplication(application);
    setNotes(application.notes || '');
    setShowNotesModal(true);
  };

  const updateApplicationStatus = async () => {
    if (!selectedApplication || !newStatus) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/applications/${selectedApplication.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          notes: notes || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application');
      }

      setShowStatusModal(false);
      setSelectedApplication(null);
      fetchApplications(); // Refresh the list
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const updateApplicationNotes = async () => {
    if (!selectedApplication) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/applications/${selectedApplication.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          notes: notes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update notes');
      }

      setShowNotesModal(false);
      setSelectedApplication(null);
      fetchApplications(); // Refresh the list
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        {user?.role === 'STUDENT' && (
          <Link href="/dashboard/companies">
            <Button>Browse Companies</Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {applications.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">
              {user?.role === 'STUDENT'
                ? 'You have not applied to any companies yet'
                : 'No applications found'}
            </p>
            {user?.role === 'STUDENT' && (
              <Link href="/dashboard/companies">
                <Button>Browse Companies</Button>
              </Link>
            )}
          </Card>
        ) : (
          applications.map((application) => (
            <Card key={application.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.company?.name}
                    </h3>
                    {getCategoryBadge(application.company?.category)}
                    {getStatusBadge(application.status)}
                  </div>

                  <p className="text-gray-600 mb-3">{application.company?.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">CTC:</span>
                      <p className="text-gray-900">₹{application.company?.ctc} LPA</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Applied On:</span>
                      <p className="text-gray-900">
                        {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <p className="text-gray-900">{application.company?.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <p className="text-gray-900">{application.status}</p>
                    </div>
                  </div>

                  {user?.role === 'COORDINATOR' && application.student && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <span className="font-medium text-gray-700">Student:</span>
                      <p className="text-gray-900">
                        {application.student.user?.firstName} {application.student.user?.lastName}
                        ({application.student.rollNumber})
                      </p>
                    </div>
                  )}

                  {application.interviewDate && (
                    <div className="mt-3">
                      <span className="font-medium text-gray-700">Interview Date:</span>
                      <p className="text-gray-900">
                        {new Date(application.interviewDate).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {application.notes && (
                    <div className="mt-3">
                      <span className="font-medium text-gray-700">Notes:</span>
                      <p className="text-gray-900">{application.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {user?.role === 'COORDINATOR' && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStatusUpdate(application)}
                      >
                        Update Status
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleNotesUpdate(application)}
                      >
                        Add Notes
                      </Button>
                    </>
                  )}

                  {user?.role === 'STUDENT' && application.status === 'APPLIED' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleWithdrawApplication(application.id)}
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {applications.length > 0 && (
        <Card className="p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {applications.filter(app => app.status === 'APPLIED').length}
              </div>
              <div className="text-sm text-gray-600">Applied</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {applications.filter(app => app.status === 'SHORTLISTED').length}
              </div>
              <div className="text-sm text-gray-600">Shortlisted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {applications.filter(app => app.status === 'SELECTED').length}
              </div>
              <div className="text-sm text-gray-600">Selected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {applications.filter(app => app.status === 'REJECTED').length}
              </div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>
        </Card>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Update Application Status
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company: {selectedApplication?.company?.name}
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student: {selectedApplication?.student?.user?.firstName} {selectedApplication?.student?.user?.lastName}
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="APPLIED">Applied</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="SELECTED">Selected</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional):
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                  rows="3"
                  placeholder="Add any notes about this status update..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                onClick={updateApplicationStatus}
                disabled={updating}
                className="flex-1"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowStatusModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Update Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Add/Update Notes
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company: {selectedApplication?.company?.name}
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student: {selectedApplication?.student?.user?.firstName} {selectedApplication?.student?.user?.lastName}
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes:
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                  rows="4"
                  placeholder="Add notes about this application..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                onClick={updateApplicationNotes}
                disabled={updating}
                className="flex-1"
              >
                {updating ? 'Saving...' : 'Save Notes'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowNotesModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;