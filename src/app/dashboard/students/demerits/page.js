'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../lib/auth/context.js';
import { Button, Card, Input } from '../../../../components/ui/index.js';
import { DEPARTMENTS } from '../../../../types/index.js';

const DemeritManagementPage = () => {
  const { user, token } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [demeritData, setDemeritData] = useState({
    demerits: 0,
    reason: ''
  });

  useEffect(() => {
    if (user?.role === 'COORDINATOR') {
      fetchStudents();
    }
  }, [user]);

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

  const handleAddDemerit = (student) => {
    setSelectedStudent(student);
    setDemeritData({
      demerits: 1,
      reason: ''
    });
    setShowAddModal(true);
  };

  const handleUpdateDemerits = (student) => {
    setSelectedStudent(student);
    setDemeritData({
      demerits: student.demerits || 0,
      reason: ''
    });
    setShowAddModal(true);
  };

  const submitDemeritUpdate = async () => {
    if (!selectedStudent) return;

    if (!demeritData.reason.trim()) {
      setError('Please provide a reason for the demerit change');
      return;
    }

    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/students/${selectedStudent.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          demerits: parseInt(demeritData.demerits),
          demeritReason: demeritData.reason.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update demerits');
      }

      setSuccess(`Demerits updated successfully for ${selectedStudent.user?.firstName} ${selectedStudent.user?.lastName}`);
      setShowAddModal(false);
      setSelectedStudent(null);
      setDemeritData({ demerits: 0, reason: '' });
      fetchStudents(); // Refresh data
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const getDemeritBadge = (demerits) => {
    if (demerits === 0) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">No Demerits</span>;
    } else if (demerits <= 2) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">{demerits} Demerits</span>;
    } else {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">{demerits} Demerits</span>;
    }
  };

  const getBlockStatus = (demerits) => {
    if (demerits >= 6) return '5 companies';
    if (demerits >= 4) return '3 companies';
    if (demerits >= 2) return '1 company';
    return 'None';
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = departmentFilter === '' || student.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  // Use predefined departments list instead of extracting from student data
  const departments = DEPARTMENTS;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user?.role !== 'COORDINATOR') {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">Demerit management is only available for coordinators.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demerit Management</h1>
          <p className="text-gray-600 mt-1">Manage student demerits for policy violations</p>
        </div>
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

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Students</label>
            <Input
              type="text"
              placeholder="Name, email, or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 h-10"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => {
                setSearchTerm('');
                setDepartmentFilter('');
              }}
              variant="secondary"
              className="h-10 px-6"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Demerit Rules Info */}
      <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Demerit System Rules</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• <strong>2 demerits</strong> → Block next 1 company application</p>
          <p>• <strong>4 demerits</strong> → Block next 3 company applications</p>
          <p>• <strong>6+ demerits</strong> → Block next 5 company applications</p>
        </div>
      </Card>

      {/* Students List */}
      <div className="grid gap-4">
        {filteredStudents.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No students found matching your criteria</p>
          </Card>
        ) : (
          filteredStudents.map((student) => (
            <Card key={student.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {student.user?.firstName} {student.user?.lastName}
                    </h3>
                    {getDemeritBadge(student.demerits || 0)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <p className="text-gray-900">{student.user?.email}</p>
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
                      <span className="font-medium text-gray-700">CGPA:</span>
                      <p className="text-gray-900">{student.cgpa}</p>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Current Demerits:</span>
                        <p className={`font-semibold ${
                          student.demerits === 0 ? 'text-green-600' :
                          student.demerits <= 2 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {student.demerits || 0}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Block Status:</span>
                        <p className="text-gray-900">{getBlockStatus(student.demerits || 0)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAddDemerit(student)}
                  >
                    Add Demerit
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleUpdateDemerits(student)}
                  >
                    Update Demerits
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Demerit Update Modal */}
      {showAddModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Update Demerits for {selectedStudent.user?.firstName} {selectedStudent.user?.lastName}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Demerits: {selectedStudent.demerits || 0}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Demerit Count:
                </label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={demeritData.demerits}
                  onChange={(e) => setDemeritData({
                    ...demeritData,
                    demerits: e.target.value
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Change: *
                </label>
                <textarea
                  value={demeritData.reason}
                  onChange={(e) => setDemeritData({
                    ...demeritData,
                    reason: e.target.value
                  })}
                  className="w-full border border-gray-300 rounded-md p-2"
                  rows="3"
                  placeholder="e.g., 'No-show for ABC Company interview', 'Violation of placement policy', etc."
                  required
                />
              </div>

              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Impact:</strong> {parseInt(demeritData.demerits) >= 6 ? '5 companies' :
                    parseInt(demeritData.demerits) >= 4 ? '3 companies' :
                    parseInt(demeritData.demerits) >= 2 ? '1 company' : 'No'} will be blocked.
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={submitDemeritUpdate}
                disabled={updating || !demeritData.reason.trim()}
                className="flex-1"
              >
                {updating ? 'Updating...' : 'Update Demerits'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedStudent(null);
                  setDemeritData({ demerits: 0, reason: '' });
                }}
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

export default DemeritManagementPage;