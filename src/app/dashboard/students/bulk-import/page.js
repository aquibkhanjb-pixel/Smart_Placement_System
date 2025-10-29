'use client';

import { useState } from 'react';
import { useAuth } from '../../../../lib/auth/context.js';
import { ProtectedRoute } from '../../../../components/auth/index.js';
import { DashboardLayout } from '../../../../components/dashboard/index.js';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../../../components/ui/index.js';
import { USER_ROLES } from '../../../../types/index.js';
import Link from 'next/link';

export default function BulkImportStudentsPage() {
  const { user, token } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('csvFile', file);

      const response = await fetch('/api/students/bulk-import', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setResults(data);
      setFile(null);
      document.getElementById('csv-file').value = '';

    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `firstName,lastName,email,rollNumber,department,graduationYear,cgpa,demerits,skills,currentOffer
John,Doe,john.doe@test.com,CS2024001,CSE,2024,8.5,0,"React,Node.js,Python",
Jane,Smith,jane.smith@test.com,IT2024002,IT,2024,9.2,0,"Java,Spring Boot,MySQL",12.5
Alice,Johnson,alice.johnson@test.com,ECE2024003,ECE,2024,8.8,1,"VLSI,Embedded Systems,C++",`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (user?.role !== USER_ROLES.COORDINATOR) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-8">
            <p className="text-gray-600">Only coordinators can import students.</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Bulk Import Students</h1>
              <p className="text-gray-600">
                Upload multiple students at once using a CSV file
              </p>
            </div>
            <Link href="/dashboard/students">
              <Button variant="secondary">
                ← Back to Students
              </Button>
            </Link>
          </div>

          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select CSV File
                  </label>
                  <input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {file && (
                    <p className="text-sm text-green-600 mt-1">
                      Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="flex-1"
                  >
                    {uploading ? 'Uploading...' : 'Upload Students'}
                  </Button>
                  <Button
                    onClick={downloadTemplate}
                    variant="secondary"
                    className="flex-1"
                  >
                    📥 Download Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {results && (
            <Card>
              <CardHeader>
                <CardTitle>Import Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">{results.successful}</div>
                      <div className="text-sm text-green-700">Students Created</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                      <div className="text-sm text-red-700">Failed Imports</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">{results.total}</div>
                      <div className="text-sm text-blue-700">Total Processed</div>
                    </div>
                  </div>

                  {results.successful > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <h4 className="font-medium text-green-800 mb-2">Successfully Created Students:</h4>
                      <div className="space-y-1">
                        {results.successfulStudents?.map((student, index) => (
                          <div key={index} className="text-sm text-green-700">
                            {student.firstName} {student.lastName} ({student.email}) - Password: {student.tempPassword}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-green-600 mt-2">
                        ⚠️ Please share these temporary passwords securely with the students.
                      </p>
                    </div>
                  )}

                  {results.errors && results.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <h4 className="font-medium text-red-800 mb-2">Import Errors:</h4>
                      <div className="space-y-1">
                        {results.errors.map((error, index) => (
                          <div key={index} className="text-sm text-red-700">
                            Row {error.row}: {error.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>CSV Format Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Required Columns:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li><strong>firstName</strong> - Student&apos;s first name</li>
                    <li><strong>lastName</strong> - Student&apos;s last name</li>
                    <li><strong>email</strong> - Valid email address (must be unique)</li>
                    <li><strong>rollNumber</strong> - Student roll number (must be unique)</li>
                    <li><strong>department</strong> - Department code (CSE, IT, ECE, etc.)</li>
                    <li><strong>graduationYear</strong> - Year of graduation (e.g., 2024)</li>
                    <li><strong>cgpa</strong> - CGPA (0-10)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Optional Columns:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li><strong>demerits</strong> - Number of demerits (default: 0)</li>
                    <li><strong>skills</strong> - Comma-separated skills in quotes</li>
                    <li><strong>currentOffer</strong> - Current offer in LPA (if any)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Important Notes:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>First row must contain column headers exactly as shown</li>
                    <li>Skills should be in quotes and comma-separated</li>
                    <li>Email addresses and roll numbers must be unique</li>
                    <li>Temporary passwords will be generated automatically</li>
                    <li>Invalid rows will be skipped with error messages</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Tip:</strong> Download the template file to see the exact format required.
                    You can edit it with Excel, Google Sheets, or any spreadsheet application.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}