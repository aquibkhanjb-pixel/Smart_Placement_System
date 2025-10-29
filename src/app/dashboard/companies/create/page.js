'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth/context.js';
import { Button, Input, Card } from '../../../../components/ui/index.js';

const CreateCompanyPage = () => {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ctc: '',
    category: 'NORMAL',
    location: '',
    website: '',
    minCgpa: '',
    allowedDepartments: '',
    registrationDeadline: '',
    interviewDate: '',
  });

  const [files, setFiles] = useState({
    jobDescription: null,
    requirements: null
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    jobDescription: null,
    requirements: null
  });

  const [uploading, setUploading] = useState({
    jobDescription: false,
    requirements: false
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFiles({
        ...files,
        [type]: file
      });
    }
  };

  const uploadFile = async (type) => {
    const file = files[type];
    if (!file) return null;

    setUploading({ ...uploading, [type]: true });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('companyId', 'temp'); // Will be replaced with actual company ID

    try {
      const response = await fetch('/api/upload/company-docs', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const result = await response.json();
      setUploadedFiles({
        ...uploadedFiles,
        [type]: result
      });

      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Upload files first if they exist
      let jobDescriptionData = null;
      let requirementsData = null;

      if (files.jobDescription) {
        jobDescriptionData = await uploadFile('jobDescription');
      }
      if (files.requirements) {
        requirementsData = await uploadFile('requirements');
      }

      // Process form data
      const submissionData = {
        ...formData,
        ctc: parseFloat(formData.ctc),
        minCgpa: parseFloat(formData.minCgpa),
        allowedDepartments: JSON.stringify(
          formData.allowedDepartments
            .split(',')
            .map(dept => dept.trim())
            .filter(dept => dept.length > 0)
        ),
        registrationDeadline: formData.registrationDeadline
          ? new Date(formData.registrationDeadline).toISOString()
          : null,
        interviewDate: formData.interviewDate
          ? new Date(formData.interviewDate).toISOString()
          : null,
        // Add file information
        jobDescriptionUrl: jobDescriptionData?.fileUrl || null,
        jobDescriptionName: jobDescriptionData?.filename || null,
        requirementsUrl: requirementsData?.fileUrl || null,
        requirementsName: requirementsData?.filename || null,
      };

      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create company');
      }

      router.push('/dashboard/companies');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Company</h1>
        <p className="text-gray-600 mt-1">Create a new company profile for placements</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Company Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter company name"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="NORMAL">Normal (3-6 LPA)</option>
                <option value="DREAM">Dream (6-9 LPA)</option>
                <option value="SUPER_DREAM">Super Dream (9-18 LPA)</option>
                <option value="ELITE">Elite (18+ LPA)</option>
              </select>
            </div>
          </div>

          <div>
            <Input
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the company"
              multiline
              rows={3}
            />
          </div>

          {/* Package and Eligibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="CTC (LPA) *"
              name="ctc"
              type="number"
              step="0.5"
              value={formData.ctc}
              onChange={handleChange}
              required
              placeholder="e.g. 8.5"
            />

            <Input
              label="Minimum CGPA *"
              name="minCgpa"
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={formData.minCgpa}
              onChange={handleChange}
              required
              placeholder="e.g. 7.5"
            />
          </div>

          {/* Location and Website */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Bangalore, Mumbai"
            />

            <Input
              label="Website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://company.com"
            />
          </div>

          {/* Departments */}
          <div>
            <Input
              label="Allowed Departments"
              name="allowedDepartments"
              value={formData.allowedDepartments}
              onChange={handleChange}
              placeholder="CMPN, EXTC, EXCS, BioMed, INFT (comma separated)"
              help="Enter department codes separated by commas. Leave empty to allow all departments."
            />
          </div>

          {/* Important Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Deadline
              </label>
              <input
                type="datetime-local"
                name="registrationDeadline"
                value={formData.registrationDeadline}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Date
              </label>
              <input
                type="datetime-local"
                name="interviewDate"
                value={formData.interviewDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* File Uploads */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">📄 Documents</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job Description Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description (PDF)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'jobDescription')}
                    className="hidden"
                    id="jobDescription"
                  />
                  <label
                    htmlFor="jobDescription"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <div className="text-gray-400 mb-2">📄</div>
                    <div className="text-sm text-gray-600 text-center">
                      {files.jobDescription ? (
                        <span className="text-blue-600">{files.jobDescription.name}</span>
                      ) : (
                        <>
                          <span className="text-blue-600">Click to upload</span>
                          <br />
                          PDF files only (max 10MB)
                        </>
                      )}
                    </div>
                  </label>
                  {uploading.jobDescription && (
                    <div className="mt-2 text-sm text-blue-600">Uploading...</div>
                  )}
                </div>
              </div>

              {/* Requirements Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Requirements (PDF)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'requirements')}
                    className="hidden"
                    id="requirements"
                  />
                  <label
                    htmlFor="requirements"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <div className="text-gray-400 mb-2">📋</div>
                    <div className="text-sm text-gray-600 text-center">
                      {files.requirements ? (
                        <span className="text-blue-600">{files.requirements.name}</span>
                      ) : (
                        <>
                          <span className="text-blue-600">Click to upload</span>
                          <br />
                          PDF files only (max 10MB)
                        </>
                      )}
                    </div>
                  </label>
                  {uploading.requirements && (
                    <div className="mt-2 text-sm text-blue-600">Uploading...</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-500">
              💡 Upload job descriptions, skill requirements, or other relevant documents for students to review
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              Create Company
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/dashboard/companies')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateCompanyPage;