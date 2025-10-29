'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth/context.js';
import { Button } from '../../../components/ui/index.js';
import { Card } from '../../../components/ui/index.js';
import Link from 'next/link';
import { USER_ROLES } from '../../../types/index.js';

const CompaniesPage = () => {
  const { user, token } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [applying, setApplying] = useState(false);
  const [eligibilityResults, setEligibilityResults] = useState({});

  useEffect(() => {
    fetchCompanies();
    if (user?.role === USER_ROLES.STUDENT) {
      fetchEligibility();
    }
  }, [user]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }

      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibility = async () => {
    try {
      const response = await fetch('/api/eligibility/check', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEligibilityResults(data.results || {});
      }
    } catch (err) {
      console.error('Failed to fetch eligibility:', err);
    }
  };

  const fetchResumes = async () => {
    try {
      const response = await fetch('/api/upload/resume', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setResumes(data.resumes);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const handleApplyClick = async (company) => {
    // Check eligibility before allowing application
    if (user?.role === USER_ROLES.STUDENT) {
      const eligibility = eligibilityResults[company.id];
      if (!eligibility?.eligible) {
        const reasons = eligibility?.reasons || ['Eligibility check failed'];
        alert(`You are not eligible for this company:\n\n${reasons.join('\n')}`);
        return;
      }
    }

    setSelectedCompany(company);
    await fetchResumes();
    setShowApplicationModal(true);
  };

  const handleApplication = async () => {
    if (!selectedResume) {
      alert('Please select a resume');
      return;
    }

    setApplying(true);
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyId: selectedCompany.id,
          resumeId: selectedResume,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Application submitted successfully!');
        setShowApplicationModal(false);
        setSelectedResume('');
      } else {
        alert(data.error || 'Application failed');
      }
    } catch (error) {
      console.error('Application error:', error);
      alert('Application failed. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleToggleStatus = async (companyId, currentStatus) => {
    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update company status');
      }

      fetchCompanies(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Company Management</h1>
        {user?.role === 'COORDINATOR' && (
          <Link href="/dashboard/companies/create">
            <Button>Add New Company</Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {companies.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">No companies found</p>
            {user?.role === 'COORDINATOR' && (
              <Link href="/dashboard/companies/create">
                <Button>Add First Company</Button>
              </Link>
            )}
          </Card>
        ) : (
          companies.map((company) => (
            <Card key={company.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                    {getCategoryBadge(company.category)}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        company.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {company.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3">{company.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">CTC:</span>
                      <p className="text-gray-900">₹{company.ctc} LPA</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Min CGPA:</span>
                      <p className="text-gray-900">{company.minCgpa}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <p className="text-gray-900">{company.location || 'Not specified'}</p>
                    </div>
                  </div>

                  {company.allowedDepartments && (
                    <div className="mt-3">
                      <span className="font-medium text-gray-700">Departments:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {JSON.parse(company.allowedDepartments).map((dept, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {dept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {company.registrationDeadline && (
                    <div className="mt-2">
                      <span className="font-medium text-gray-700">Registration Deadline:</span>
                      <p className="text-gray-900">
                        {new Date(company.registrationDeadline).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {user?.role === USER_ROLES.COORDINATOR ? (
                    <>
                      <Link href={`/dashboard/companies/${company.id}/edit`}>
                        <Button variant="secondary" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant={company.isActive ? 'danger' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleStatus(company.id, company.isActive)}
                      >
                        {company.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </>
                  ) : (
                    user?.role === USER_ROLES.STUDENT && company.isActive && (
                      (() => {
                        const eligibility = eligibilityResults[company.id];
                        const isEligible = eligibility?.eligible;

                        if (isEligible) {
                          return (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApplyClick(company)}
                            >
                              Apply Now
                            </Button>
                          );
                        } else {
                          return (
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled
                              title={`Not eligible: ${eligibility?.reasons?.join(', ') || 'Checking eligibility...'}`}
                            >
                              Not Eligible
                            </Button>
                          );
                        }
                      })()
                    )
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Apply to {selectedCompany?.name}
            </h3>

            {resumes.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">
                  You need to upload a resume before applying.
                </p>
                <Link href="/dashboard/resumes">
                  <Button className="mb-2">Upload Resume</Button>
                </Link>
                <br />
                <Button
                  variant="secondary"
                  onClick={() => setShowApplicationModal(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Resume:
                </label>
                <select
                  value={selectedResume}
                  onChange={(e) => setSelectedResume(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 mb-4"
                >
                  <option value="">Choose a resume...</option>
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.name}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <Button
                    onClick={handleApplication}
                    disabled={applying || !selectedResume}
                    className="flex-1"
                  >
                    {applying ? 'Applying...' : 'Submit Application'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowApplicationModal(false);
                      setSelectedResume('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;