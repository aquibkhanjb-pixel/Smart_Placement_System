import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth/jwt.js';
import { prisma } from '../../../../lib/prisma/index.js';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export async function POST(request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      console.error('Token verification error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Get user and ensure they're a student
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { student: true },
    });

    if (!user?.student) {
      return NextResponse.json({ error: 'Only students can upload resumes' }, { status: 403 });
    }

    // Check if this is a Cloudinary resume data update (JSON body)
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const body = await request.json();

      if (body.action === 'add_cloudinary_resume' && body.resumeData) {
        // Handle Cloudinary resume data
        const currentResumes = user.student.resumeUrls ? JSON.parse(user.student.resumeUrls) : [];
        const updatedResumes = [...currentResumes, body.resumeData];

        // Update database
        await prisma.student.update({
          where: { id: user.student.id },
          data: {
            resumeUrls: JSON.stringify(updatedResumes),
          },
        });

        return NextResponse.json({
          success: true,
          resume: body.resumeData,
          message: 'Resume data saved successfully',
        });
      }
    }

    // Handle traditional file upload (FormData)
    const formData = await request.formData();
    const file = formData.get('resume');
    const resumeName = formData.get('resumeName') || 'My Resume';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type and size
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Only PDF and Word documents are allowed.'
      }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 5MB.'
      }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = path.extname(file.name);
    const filename = `${user.student.rollNumber}_${timestamp}${extension}`;
    const filepath = path.join(uploadsDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filepath, buffer);

    // Update student's resume URLs
    const currentResumes = user.student.resumeUrls ? JSON.parse(user.student.resumeUrls) : [];
    const newResume = {
      id: timestamp.toString(),
      name: resumeName,
      filename: filename,
      url: `/uploads/resumes/${filename}`,
      uploadedAt: new Date().toISOString(),
      fileSize: file.size,
      fileType: file.type,
      cloudinaryUrl: false, // Flag to indicate this is a local file
    };

    const updatedResumes = [...currentResumes, newResume];

    // Update database
    await prisma.student.update({
      where: { id: user.student.id },
      data: {
        resumeUrls: JSON.stringify(updatedResumes),
      },
    });

    return NextResponse.json({
      success: true,
      resume: newResume,
      message: 'Resume uploaded successfully',
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload resume' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      console.error('Token verification error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Get user and their resumes
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { student: true },
    });

    if (!user?.student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const resumes = user.student.resumeUrls ? JSON.parse(user.student.resumeUrls) : [];

    return NextResponse.json({
      success: true,
      resumes,
    });

  } catch (error) {
    console.error('Get resumes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resumes' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { student: true },
    });

    if (!user?.student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get resume ID from URL
    const url = new URL(request.url);
    const resumeId = url.searchParams.get('id');

    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID required' }, { status: 400 });
    }

    // Get current resumes
    const currentResumes = user.student.resumeUrls ? JSON.parse(user.student.resumeUrls) : [];
    const resumeToDelete = currentResumes.find(r => r.id === resumeId);

    if (!resumeToDelete) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Delete file from filesystem (only for local files, not Cloudinary)
    if (!resumeToDelete.cloudinaryUrl) {
      const filepath = path.join(uploadsDir, resumeToDelete.filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
    // Note: Cloudinary deletion is handled in the frontend before calling this API

    // Remove from array
    const updatedResumes = currentResumes.filter(r => r.id !== resumeId);

    // Update database
    await prisma.student.update({
      where: { id: user.student.id },
      data: {
        resumeUrls: JSON.stringify(updatedResumes),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Resume deleted successfully',
    });

  } catch (error) {
    console.error('Delete resume error:', error);
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    );
  }
}