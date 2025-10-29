'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth/context.js';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/index.js';
import { USER_ROLES, DEPARTMENTS } from '../../../types/index.js';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: USER_ROLES.STUDENT,
    // Student specific fields
    rollNumber: '',
    department: '',
    graduationYear: new Date().getFullYear(),
    cgpa: ''
  });
  const [errors, setErrors] = useState({});
  const [tempPassword, setTempPassword] = useState('');

  const { register, loading, error, isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Only coordinators can access this page
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (user && user.role !== USER_ROLES.COORDINATOR) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Student specific validation
    if (formData.role === USER_ROLES.STUDENT) {
      if (!formData.rollNumber.trim()) {
        newErrors.rollNumber = 'Roll number is required';
      }

      if (!formData.department) {
        newErrors.department = 'Department is required';
      }

      if (!formData.graduationYear || formData.graduationYear < 2020 || formData.graduationYear > 2030) {
        newErrors.graduationYear = 'Please enter a valid graduation year';
      }

      if (!formData.cgpa || formData.cgpa < 0 || formData.cgpa > 10) {
        newErrors.cgpa = 'CGPA must be between 0 and 10';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await register(formData);

    if (result.success) {
      setTempPassword(result.data.tempPassword);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        role: USER_ROLES.STUDENT,
        rollNumber: '',
        department: '',
        graduationYear: new Date().getFullYear(),
        cgpa: ''
      });
    }
  };

  if (!isAuthenticated || (user && user.role !== USER_ROLES.COORDINATOR)) {
    return null; // Prevent flash while redirecting
  }

  if (tempPassword) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">User Created Successfully!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                <h4 className="font-medium text-green-800 mb-2">Temporary Password:</h4>
                <code className="bg-white px-3 py-2 rounded border text-lg font-mono">
                  {tempPassword}
                </code>
                <p className="text-sm text-green-700 mt-2">
                  Please share this temporary password with the user. They will be required to change it on first login.
                </p>
              </div>
              <Button
                onClick={() => setTempPassword('')}
                className="w-full"
              >
                Create Another User
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create New User
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Add a new student or coordinator to the system
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={USER_ROLES.STUDENT}>Student</option>
                  <option value={USER_ROLES.COORDINATOR}>Coordinator</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  required
                />

                <Input
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  required
                />
              </div>

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />

              {formData.role === USER_ROLES.STUDENT && (
                <>
                  <Input
                    label="Roll Number"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    error={errors.rollNumber}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department *
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Graduation Year"
                      name="graduationYear"
                      type="number"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      error={errors.graduationYear}
                      required
                      min="2020"
                      max="2030"
                    />

                    <Input
                      label="CGPA"
                      name="cgpa"
                      type="number"
                      step="0.01"
                      value={formData.cgpa}
                      onChange={handleChange}
                      error={errors.cgpa}
                      required
                      min="0"
                      max="10"
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Creating User...' : 'Create User'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}