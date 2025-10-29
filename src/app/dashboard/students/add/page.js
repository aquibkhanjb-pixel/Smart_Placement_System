'use client';

import { useState } from 'react';
import { useAuth } from '../../../../lib/auth/context.js';
import { ProtectedRoute } from '../../../../components/auth/index.js';
import { DashboardLayout } from '../../../../components/dashboard/index.js';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '../../../../components/ui/index.js';
import { USER_ROLES, DEPARTMENTS } from '../../../../types/index.js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddStudentPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    rollNumber: '',
    department: '',
    graduationYear: new Date().getFullYear(),
    demerits: 0,
    phoneNumber: '',
  });
  const currentYear = new Date().getFullYear();
  const graduationYears = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email ||
          !formData.rollNumber || !formData.department) {
        throw new Error('Please fill in all required fields');
      }

      // Validate phone number if provided
      if (formData.phoneNumber) {
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(formData.phoneNumber.replace(/[-\s]/g, ''))) {
          throw new Error('Please enter a valid 10-digit phone number');
        }
      }


      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      const studentData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        role: 'STUDENT',
        rollNumber: formData.rollNumber.trim().toUpperCase(),
        department: formData.department,
        graduationYear: parseInt(formData.graduationYear),
        cgpa: 0.0, // Default CGPA - student will update later
        demerits: parseInt(formData.demerits) || 0,
        skills: [], // Default empty skills array
        currentOffer: null, // Default no current offer
        phoneNumber: formData.phoneNumber.trim() || null,
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(studentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create student');
      }

      setSuccess(`Student created successfully! Temporary password: ${data.tempPassword}`);

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        rollNumber: '',
        department: '',
        graduationYear: new Date().getFullYear(),
        demerits: 0,
        phoneNumber: '',
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== USER_ROLES.COORDINATOR) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-8">
            <p className="text-gray-600">Only coordinators can add students.</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
              <p className="text-gray-600">
                Create a new student account with placement details
              </p>
            </div>
            <Link href="/dashboard/students">
              <Button variant="secondary">
                ← Back to Students
              </Button>
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-800">{success}</p>
              <p className="text-sm text-green-600 mt-2">
                ⚠️ Please share the temporary password securely with the student.
                They will be required to change it on first login.
              </p>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <Input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <Input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="student@college.edu"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Roll Number *
                      </label>
                      <Input
                        type="text"
                        name="rollNumber"
                        value={formData.rollNumber}
                        onChange={handleInputChange}
                        placeholder="CS2024001"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile Number
                      </label>
                      <Input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="9876543210"
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department *
                      </label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                        required
                      >
                        <option value="">Select Department</option>
                        {DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Graduation Year *
                      </label>
                      <select
                        name="graduationYear"
                        value={formData.graduationYear}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                        required
                      >
                        {graduationYears.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Demerits
                      </label>
                      <Input
                        type="number"
                        name="demerits"
                        value={formData.demerits}
                        onChange={handleInputChange}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>


                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Creating Student...' : 'Create Student'}
                  </Button>
                  <Link href="/dashboard/students" className="flex-1">
                    <Button type="button" variant="secondary" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>💡</span>
                <div>
                  <p className="font-medium">Quick Tips:</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>A temporary password will be generated automatically</li>
                    <li>Students must change their password on first login</li>
                    <li>Roll numbers should be unique across the system</li>
                    <li>Students will update their CGPA, skills, and offer details in their profile</li>
                    <li>Only add demerits if there are placement policy violations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}