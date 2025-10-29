'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth/context.js';
import { ProtectedRoute } from '../../../components/auth/index.js';
import { DashboardLayout } from '../../../components/dashboard/index.js';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '../../../components/ui/index.js';

const ResumeCard = ({ resume, onDelete }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word')) return '📝';
    return '📄';
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getFileIcon(resume.fileType)}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{resume.name}</h3>
                {resume.cloudinaryUrl && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ☁️ Cloud
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {formatFileSize(resume.fileSize)} • Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={resume.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View
            </a>
            <a
              href={resume.url}
              download={resume.filename}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              Download
            </a>
            <button
              onClick={() => onDelete(resume.id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ResumeUploadForm = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [resumeName, setResumeName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const { token } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!resumeName) {
        // Auto-generate name from filename
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setResumeName(nameWithoutExt);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    if (!resumeName.trim()) {
      alert('Please enter a resume name');
      return;
    }

    setUploading(true);

    try {
      // First upload to Cloudinary
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', selectedFile);
      cloudinaryFormData.append('type', 'resume');
      cloudinaryFormData.append('fileName', resumeName.trim());

      const cloudinaryResponse = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: cloudinaryFormData,
      });

      const cloudinaryData = await cloudinaryResponse.json();

      if (!cloudinaryData.success) {
        throw new Error(cloudinaryData.error || 'Cloudinary upload failed');
      }

      // Then update student resume data using the local API
      const resumeData = {
        id: Date.now().toString(),
        name: resumeName.trim(),
        filename: cloudinaryData.file.originalName,
        url: cloudinaryData.file.url,
        publicId: cloudinaryData.file.publicId, // Store Cloudinary public ID for deletion
        uploadedAt: new Date().toISOString(),
        fileSize: cloudinaryData.file.size,
        fileType: selectedFile.type,
        cloudinaryUrl: true, // Flag to indicate this is a Cloudinary URL
      };

      const updateResponse = await fetch('/api/upload/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'add_cloudinary_resume',
          resumeData: resumeData,
        }),
      });

      const updateData = await updateResponse.json();

      if (updateData.success) {
        alert('Resume uploaded successfully to Cloudinary!');
        setResumeName('');
        setSelectedFile(null);
        document.getElementById('resume-file').value = '';
        onUploadSuccess();
      } else {
        // If local update fails, try to cleanup Cloudinary upload
        try {
          await fetch('/api/upload/cloudinary', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicId: cloudinaryData.file.publicId }),
          });
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
        throw new Error(updateData.error || 'Failed to save resume data');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Upload New Resume</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label htmlFor="resume-name" className="block text-sm font-medium text-gray-700 mb-1">
              Resume Name
            </label>
            <Input
              id="resume-name"
              type="text"
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              placeholder="e.g., Software Developer Resume"
              required
            />
          </div>

          <div>
            <label htmlFor="resume-file" className="block text-sm font-medium text-gray-700 mb-1">
              Select File
            </label>
            <input
              id="resume-file"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: PDF, DOC, DOCX (Max 5MB) • Files stored securely on Cloudinary ☁️
            </p>
          </div>

          <Button
            type="submit"
            disabled={uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload Resume'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

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
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async (resumeId) => {
    if (!confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      // Find the resume to get its details
      const resumeToDelete = resumes.find(r => r.id === resumeId);

      if (!resumeToDelete) {
        alert('Resume not found');
        return;
      }

      // If it's a Cloudinary URL, delete from Cloudinary first
      if (resumeToDelete.publicId && resumeToDelete.cloudinaryUrl) {
        try {
          const cloudinaryDeleteResponse = await fetch('/api/upload/cloudinary', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicId: resumeToDelete.publicId }),
          });

          const cloudinaryDeleteData = await cloudinaryDeleteResponse.json();
          if (!cloudinaryDeleteData.success) {
            console.warn('Failed to delete from Cloudinary:', cloudinaryDeleteData.error);
            // Continue with local deletion even if Cloudinary delete fails
          }
        } catch (cloudinaryError) {
          console.warn('Cloudinary delete error:', cloudinaryError);
          // Continue with local deletion even if Cloudinary delete fails
        }
      }

      // Delete from local database
      const response = await fetch(`/api/upload/resume?id=${resumeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        alert('Resume deleted successfully');
        fetchResumes();
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed. Please try again.');
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resume Management</h1>
            <p className="text-gray-600">
              Upload and manage your resumes for job applications
            </p>
          </div>

          <ResumeUploadForm onUploadSuccess={fetchResumes} />

          <Card>
            <CardHeader>
              <CardTitle>Your Resumes ({resumes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading resumes...</p>
                </div>
              ) : resumes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No resumes uploaded yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload your first resume using the form above
                  </p>
                </div>
              ) : (
                <div>
                  {resumes.map((resume) => (
                    <ResumeCard
                      key={resume.id}
                      resume={resume}
                      onDelete={handleDeleteResume}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips for Great Resumes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li>Keep your resume to 1-2 pages maximum</li>
                <li>Use clear, professional formatting</li>
                <li>Highlight relevant skills and projects</li>
                <li>Include quantifiable achievements</li>
                <li>Tailor your resume for different types of companies</li>
                <li>Save files in PDF format for best compatibility</li>
                <li>Use descriptive names like "John_Doe_SoftwareDeveloper_Resume.pdf"</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}