'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth/context.js';
import { Button, Card } from '../../../components/ui/index.js';

const EligibilityPage = () => {
  const { user, token } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [eligibilityResults, setEligibilityResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [studentResumes, setStudentResumes] = useState([]);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [applying, setApplying] = useState(false);

  const fetchStudentResumes = async () => {
    if (user?.role !== 'STUDENT') return;

    try {
      const response = await fetch('/api/upload/resume', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setStudentResumes(data.resumes || []);
      } else {
        setStudentResumes([]);
      }
    } catch (err) {
      console.error('Failed to fetch resumes:', err);
      setStudentResumes([]);
    }
  };

  useEffect(() => {
    fetchCompaniesAndEligibility();
    fetchStudentResumes();

    // Refresh resumes when page becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStudentResumes();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchCompaniesAndEligibility = async () => {
    try {
      // Fetch companies
      const companiesResponse = await fetch('/api/companies?isActive=true', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!companiesResponse.ok) {
        throw new Error('Failed to fetch companies');
      }

      const companiesData = await companiesResponse.json();
      const activeCompanies = companiesData.companies || [];
      setCompanies(activeCompanies);

      // Check eligibility for all companies
      if (activeCompanies.length > 0) {
        await checkEligibilityForAllCompanies(activeCompanies);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibilityForAllCompanies = async (companiesToCheck = companies) => {
    if (user?.role !== 'STUDENT') return;

    setChecking(true);
    try {
      const response = await fetch('/api/eligibility/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyIds: companiesToCheck.map(c => c.id),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check eligibility');
      }

      const data = await response.json();

      // Convert array results to object format for easy lookup
      const resultsMap = {};
      if (data.eligibilityResults) {
        data.eligibilityResults.forEach(result => {
          resultsMap[result.companyId] = {
            eligible: result.isEligible && result.canApply,
            canApply: result.canApply,
            reasons: result.reasons,
            blockedCompanies: result.blockedCompanies
          };
        });
      }

      setEligibilityResults(resultsMap);
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  };

  const getEligibilityBadge = (companyId) => {
    const result = eligibilityResults[companyId];
    if (!result) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Checking...</span>;
    }

    if (result.eligible) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Eligible</span>;
    } else {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Not Eligible</span>;
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

  const handleApplyClick = (companyId) => {
    if (studentResumes.length === 0) {
      // Instead of blocking, show a helpful modal with upload option
      setSelectedCompanyId(companyId);
      setShowResumeModal(true);
      return;
    }

    if (studentResumes.length === 1) {
      // Auto-select the only resume
      applyToCompany(companyId, studentResumes[0].id);
    } else {
      // Show resume selection modal
      setSelectedCompanyId(companyId);
      setShowResumeModal(true);
    }
  };

  const applyToCompany = async (companyId, resumeId) => {
    setApplying(true);
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyId,
          resumeId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply');
      }

      // Refresh eligibility after application
      await checkEligibilityForAllCompanies();
      alert('Application submitted successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setApplying(false);
      setShowResumeModal(false);
      setSelectedCompanyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user?.role !== 'STUDENT') {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">Eligibility checker is only available for students.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eligibility Checker</h1>
          <p className="text-gray-600 mt-1">Check your eligibility for all active companies</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              checkEligibilityForAllCompanies();
              fetchStudentResumes();
            }}
            loading={checking}
            disabled={checking}
          >
            Refresh All
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Eligibility Summary */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Eligibility Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{companies.length}</div>
            <div className="text-sm text-gray-600">Total Companies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Object.values(eligibilityResults).filter(r => r?.eligible).length}
            </div>
            <div className="text-sm text-gray-600">Eligible</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {Object.values(eligibilityResults).filter(r => r && !r.eligible).length}
            </div>
            <div className="text-sm text-gray-600">Not Eligible</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {Object.values(eligibilityResults).filter(r => r?.eligible && !r?.alreadyApplied).length}
            </div>
            <div className="text-sm text-gray-600">Can Apply</div>
          </div>
        </div>
      </Card>

      {/* Companies List */}
      <div className="grid gap-4">
        {companies.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No active companies found</p>
          </Card>
        ) : (
          companies.map((company) => {
            const eligibility = eligibilityResults[company.id];

            return (
              <Card key={company.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                      {getCategoryBadge(company.category)}
                      {getEligibilityBadge(company.id)}
                      {eligibility?.alreadyApplied && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Already Applied
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-3">{company.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
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

                    {/* Eligibility Details */}
                    {eligibility && (
                      <div className="mt-3 p-3 rounded-lg border">
                        {eligibility.eligible ? (
                          <div className="text-green-700">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="font-medium">You are eligible for this company!</span>
                            </div>
                            <p className="text-sm">All eligibility criteria met.</p>
                          </div>
                        ) : (
                          <div className="text-red-700">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              <span className="font-medium">Not eligible</span>
                            </div>
                            <div className="text-sm space-y-1">
                              {eligibility.reasons?.map((reason, index) => (
                                <p key={index}>• {reason}</p>
                              ))}
                            </div>
                          </div>
                        )}

                        {eligibility.blocked && (
                          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-orange-700 text-sm">
                            <strong>Placement Block:</strong> {eligibility.blockReason}
                          </div>
                        )}
                      </div>
                    )}

                    {company.registrationDeadline && (
                      <div className="mt-3">
                        <span className="font-medium text-gray-700">Registration Deadline:</span>
                        <p className="text-gray-900">
                          {new Date(company.registrationDeadline).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {eligibility?.eligible && !eligibility?.alreadyApplied && (
                      <Button
                        onClick={() => handleApplyClick(company.id)}
                        size="sm"
                        disabled={applying}
                      >
                        {applying ? 'Applying...' : 'Apply Now'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Resume Selection Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            {studentResumes.length === 0 ? (
              <>
                <h3 className="text-lg font-semibold mb-4">Resume Required</h3>
                <p className="text-gray-600 mb-6">
                  You need to upload a resume before applying to companies. Would you like to upload one now?
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setShowResumeModal(false);
                      setSelectedCompanyId(null);
                      window.open('/dashboard/resumes', '_blank');
                    }}
                    className="flex-1"
                  >
                    Upload Resume
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowResumeModal(false);
                      setSelectedCompanyId(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-4">Select Resume</h3>
                <p className="text-gray-600 mb-4">
                  Choose which resume you want to submit for this application:
                </p>
                <div className="space-y-2 mb-6">
                  {studentResumes.map((resume, index) => (
                    <button
                      key={resume.id || index}
                      onClick={() => applyToCompany(selectedCompanyId, resume.id)}
                      disabled={applying}
                      className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      <div className="font-medium">{resume.name || `Resume ${index + 1}`}</div>
                      {resume.uploadedAt && (
                        <div className="text-sm text-gray-500">
                          Uploaded: {new Date(resume.uploadedAt).toLocaleDateString()}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowResumeModal(false);
                      setSelectedCompanyId(null);
                    }}
                    disabled={applying}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EligibilityPage;