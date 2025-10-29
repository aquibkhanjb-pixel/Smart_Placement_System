'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth/context.js';
import { Button, Input, Card } from '../../../components/ui/index.js';
import Link from 'next/link';

const ProfilePage = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [studentData, setStudentData] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    rollNumber: '',
    cgpa: '',
    department: '',
    graduationYear: '',
    skills: '',
    currentOffer: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleViewResume = (resumeUrl) => {
    window.open(resumeUrl, '_blank');
  };

  const handleRemoveResume = async (resumeIndex) => {
    if (!confirm('Are you sure you want to remove this resume?')) {
      return;
    }

    try {
      const resumes = JSON.parse(studentData.resumeUrls || '[]');
      const updatedResumes = resumes.filter((_, index) => index !== resumeIndex);

      const response = await fetch(`/api/students/${user.student.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeUrls: JSON.stringify(updatedResumes),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove resume');
      }

      setSuccess('Resume removed successfully');
      fetchProfile(); // Refresh data
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (user?.role === 'STUDENT' && user?.student?.id) {
        const response = await fetch(`/api/students/${user.student.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setStudentData(data);

        // Populate form
        setFormData({
          firstName: data.user?.firstName || '',
          lastName: data.user?.lastName || '',
          email: data.user?.email || '',
          rollNumber: data.rollNumber || '',
          cgpa: data.cgpa?.toString() || '',
          department: data.department || '',
          graduationYear: data.graduationYear?.toString() || '',
          skills: data.skills ? JSON.parse(data.skills).join(', ') : '',
          currentOffer: data.currentOffer?.toString() || '',
        });
      } else {
        // For coordinators, just use user data
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          rollNumber: '',
          cgpa: '',
          department: '',
          graduationYear: '',
          skills: '',
          currentOffer: '',
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Prepare data for submission
      const profileUpdate = {
        firstName: formData.firstName,
        lastName: formData.lastName,
      };

      if (user?.role === 'STUDENT') {
        const studentUpdate = {
          cgpa: parseFloat(formData.cgpa),
          department: formData.department,
          graduationYear: parseInt(formData.graduationYear),
          skills: JSON.stringify(
            formData.skills
              .split(',')
              .map(skill => skill.trim())
              .filter(skill => skill.length > 0)
          ),
          currentOffer: formData.currentOffer ? parseFloat(formData.currentOffer) : null,
        };

        // Update student profile
        const response = await fetch(`/api/students/${user.student.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...profileUpdate,
            ...studentUpdate,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update profile');
        }
      }

      setSuccess('Profile updated successfully');
      fetchProfile(); // Refresh data
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }

      setSuccess('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Management</h1>
        <p className="text-gray-600 mt-1">Update your personal information and settings</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="grid gap-6">
        {/* Profile Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name *"
                name="firstName"
                value={formData.firstName}
                onChange={handleFormChange}
                required
              />
              <Input
                label="Last Name *"
                name="lastName"
                value={formData.lastName}
                onChange={handleFormChange}
                required
              />
            </div>

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              disabled
              help="Email cannot be changed. Contact coordinator if needed."
            />

            {user?.role === 'STUDENT' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Roll Number"
                    name="rollNumber"
                    value={formData.rollNumber}
                    disabled
                    help="Roll number cannot be changed"
                  />
                  <Input
                    label="CGPA *"
                    name="cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.cgpa}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Department *"
                    name="department"
                    value={formData.department}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g. Computer Science"
                  />
                  <Input
                    label="Graduation Year *"
                    name="graduationYear"
                    type="number"
                    min="2020"
                    max="2030"
                    value={formData.graduationYear}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g. 2024"
                  />
                </div>

                <Input
                  label="Skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleFormChange}
                  placeholder="JavaScript, Python, React, Node.js (comma separated)"
                  help="Enter your technical skills separated by commas"
                />

                <Input
                  label="Current Offer (LPA)"
                  name="currentOffer"
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.currentOffer}
                  onChange={handleFormChange}
                  placeholder="e.g. 8.5"
                  help="Leave empty if no current offer"
                />

                {studentData && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-700">Demerits:</span>
                      <p className="text-gray-900">{studentData.demerits || 0}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Category Jump Attempts:</span>
                        <div className="group relative">
                          <span className="text-gray-400 text-sm cursor-help">ℹ️</span>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            Number of attempts to apply for higher category companies. Students can apply to higher paying categories (Normal → Dream → Super Dream → Elite) up to 3 times total. This tracks career progression opportunities.
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-900">{studentData.categoryJumpAttempts || 0}/3</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Last Offer Date:</span>
                      <p className="text-gray-900">
                        {studentData.lastOfferDate
                          ? new Date(studentData.lastOfferDate).toLocaleDateString()
                          : 'None'}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                loading={saving}
                disabled={saving}
              >
                Update Profile
              </Button>
            </div>
          </form>
        </Card>

        {/* Password Change */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <Input
              label="Current Password *"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
            />
            <Input
              label="New Password *"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              help="Minimum 6 characters"
            />
            <Input
              label="Confirm New Password *"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
            />

            <div className="pt-4">
              <Button
                type="submit"
                loading={saving}
                disabled={saving}
              >
                Change Password
              </Button>
            </div>
          </form>
        </Card>

        {/* Resume Management - For Students */}
        {user?.role === 'STUDENT' && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume Management</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Upload and manage your resume versions. You can have multiple versions for different types of companies.
              </p>

              {studentData?.resumeUrls && JSON.parse(studentData.resumeUrls).length > 0 ? (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">Current Resumes:</h3>
                  {JSON.parse(studentData.resumeUrls).map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Resume {index + 1}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleViewResume(url)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleRemoveResume(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No resumes uploaded yet</p>
              )}

              <div className="pt-2">
                <Link href="/dashboard/resumes">
                  <Button variant="outline">
                    Upload New Resume
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;