'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../lib/auth/context.js';
import { Button, Input, Card } from '../../../../../components/ui/index.js';

const EditCompanyPage = () => {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ctc: '',
    category: 'DREAM',
    location: '',
    website: '',
    minCgpa: '',
    maxDemerits: '6',
    allowedDepartments: '',
    registrationDeadline: '',
    interviewDate: '',
    isActive: true,
    registrationOpen: false,
  });

  useEffect(() => {
    if (params.id) {
      fetchCompany();
    }
  }, [params.id]);

  const fetchCompany = async () => {
    try {
      const response = await fetch(`/api/companies/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch company details');
      }

      const company = await response.json();

      // Format data for form
      setFormData({
        name: company.name || '',
        description: company.description || '',
        ctc: company.ctc?.toString() || '',
        category: company.category || 'DREAM',
        location: company.location || '',
        website: company.website || '',
        minCgpa: company.minCgpa?.toString() || '',
        maxDemerits: company.maxDemerits?.toString() || '6',
        allowedDepartments: company.allowedDepartments
          ? JSON.parse(company.allowedDepartments).join(', ')
          : '',
        registrationDeadline: company.registrationDeadline
          ? new Date(company.registrationDeadline).toISOString().slice(0, 16)
          : '',
        interviewDate: company.interviewDate
          ? new Date(company.interviewDate).toISOString().slice(0, 16)
          : '',
        isActive: company.isActive ?? true,
        registrationOpen: company.registrationOpen ?? false,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Process form data
      const submissionData = {
        ...formData,
        ctc: parseFloat(formData.ctc),
        minCgpa: parseFloat(formData.minCgpa),
        maxDemerits: parseInt(formData.maxDemerits),
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
      };

      const response = await fetch(`/api/companies/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update company');
      }

      router.push('/dashboard/companies');
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
        <h1 className="text-2xl font-bold text-gray-900">Edit Company</h1>
        <p className="text-gray-600 mt-1">Update company information and settings</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Status Controls */}
          <div className="flex gap-6 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Company Active</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="registrationOpen"
                checked={formData.registrationOpen}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Registration Open</span>
            </label>
          </div>

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <Input
              label="Maximum Demerits"
              name="maxDemerits"
              type="number"
              min="0"
              value={formData.maxDemerits}
              onChange={handleChange}
              placeholder="e.g. 6"
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

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              loading={saving}
              disabled={saving}
            >
              Update Company
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

export default EditCompanyPage;