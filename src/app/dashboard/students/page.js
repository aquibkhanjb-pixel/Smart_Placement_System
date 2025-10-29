'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth/context.js';
import { ProtectedRoute } from '../../../components/auth/index.js';
import { DashboardLayout } from '../../../components/dashboard/index.js';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '../../../components/ui/index.js';
import { USER_ROLES, DEPARTMENTS } from '../../../types/index.js';
import Link from 'next/link';

const StudentCard = ({ student, onViewApplications }) => (
  <Card className="mb-4">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {student.user.firstName} {student.user.lastName}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              student.user.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {student.user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <p className="text-gray-900">{student.user.email}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Roll Number:</span>
              <p className="text-gray-900">{student.rollNumber}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Department:</span>
              <p className="text-gray-900">{student.department}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Graduation:</span>
              <p className="text-gray-900">{student.graduationYear}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">CGPA:</span>
              <p className="text-gray-900">{student.cgpa}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Demerits:</span>
              <p className={`font-medium ${
                student.demerits === 0 ? 'text-green-600' :
                student.demerits <= 2 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {student.demerits}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Applications:</span>
              <p className="text-gray-900">{student._count?.applications || 0}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Current Offer:</span>
              <p className="text-gray-900">
                {student.currentOffer ? `₹${student.currentOffer} LPA` : 'None'}
              </p>
            </div>
          </div>

          {student.skills && (
            <div className="mt-3">
              <span className="font-medium text-gray-700">Skills:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {JSON.parse(student.skills).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 ml-4">
          <Button
            size="sm"
            onClick={() => onViewApplications(student)}
            variant="secondary"
          >
            View Applications
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function StudentsPage() {
  const { user, token } = useAuth();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showApplications, setShowApplications] = useState(false);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (user?.role === USER_ROLES.COORDINATOR) {
      fetchStudents();
    }
  }, [user]);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, departmentFilter]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data.students || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter(student => student.department === departmentFilter);
    }

    setFilteredStudents(filtered);
  };

  const handleViewApplications = async (student) => {
    setSelectedStudent(student);
    setShowApplications(true);

    try {
      const response = await fetch(`/api/applications?studentId=${student.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const getDepartments = () => {
    // Use predefined departments list instead of extracting from student data
    return DEPARTMENTS.sort();
  };

  if (user?.role !== USER_ROLES.COORDINATOR) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-8">
            <p className="text-gray-600">Only coordinators can access student management.</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-8">
            <p className="text-gray-600">Loading students...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-8">
            <p className="text-red-600">Error loading students: {error}</p>
            <Button onClick={fetchStudents} className="mt-4">
              Retry
            </Button>
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
              <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
              <p className="text-gray-600">
                Manage all registered students and their profiles
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/students/bulk-import">
                <Button variant="secondary">
                  📁 Bulk Import
                </Button>
              </Link>
              <Link href="/dashboard/students/add">
                <Button>
                  ➕ Add Student
                </Button>
              </Link>
            </div>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Students
                  </label>
                  <Input
                    type="text"
                    placeholder="Search by name, email, or roll number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Department
                  </label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="">All Departments</option>
                    {getDepartments().map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <div className="text-sm text-gray-600">
                    <p>Total Students: {students.length}</p>
                    <p>Showing: {filteredStudents.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students List */}
          <div>
            {filteredStudents.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No students found matching your criteria.</p>
                  {students.length === 0 && (
                    <Link href="/dashboard/students/add" className="mt-4 inline-block">
                      <Button>Add First Student</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onViewApplications={handleViewApplications}
                />
              ))
            )}
          </div>

          {/* Applications Modal */}
          {showApplications && selectedStudent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Applications - {selectedStudent.user.firstName} {selectedStudent.user.lastName}
                  </h3>
                  <Button
                    variant="secondary"
                    onClick={() => setShowApplications(false)}
                  >
                    ✕ Close
                  </Button>
                </div>

                {applications.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">
                    No applications found for this student.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {app.company?.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Package: ₹{app.company?.ctc} LPA • {app.company?.category}
                            </p>
                            <p className="text-sm text-gray-600">
                              Applied: {new Date(app.appliedAt).toLocaleDateString()}
                            </p>
                            {app.resumeName && (
                              <p className="text-sm text-gray-600">
                                Resume: {app.resumeName}
                              </p>
                            )}
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}