import { NextResponse } from 'next/server';
import { uploadFile, isCloudinaryConfigured, deleteFile } from '../../../../lib/cloudinary/config.js';

/**
 * Cloudinary Upload API
 * Handles file uploads to Cloudinary
 *
 * POST /api/upload/cloudinary
 * Body: { file: base64, type: 'resume' | 'jobDescription' | 'profilePhoto' | 'companyLogo', fileName: string }
 */

export async function POST(request) {
  try {
    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cloudinary not configured. Please add CLOUDINARY_* environment variables.'
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type') || 'resume';
    const customFileName = formData.get('fileName');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type based on upload type
    const allowedTypes = {
      resume: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      jobDescription: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      profilePhoto: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      companyLogo: ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp']
    };

    if (allowedTypes[type] && !allowedTypes[type].includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type for ${type}. Allowed: ${allowedTypes[type].join(', ')}`
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Custom options for this upload
    const customOptions = {};
    if (customFileName) {
      customOptions.public_id = `${type}_${Date.now()}_${customFileName.replace(/\.[^/.]+$/, "")}`;
    }

    // Upload to Cloudinary
    const result = await uploadFile(base64File, type, customOptions);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'File uploaded successfully',
        file: {
          url: result.url,
          publicId: result.publicId,
          originalName: result.originalName || file.name,
          format: result.format,
          size: result.size,
          type: type
        }
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Upload failed'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during upload'
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove files
export async function DELETE(request) {
  try {
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Cloudinary not configured' },
        { status: 500 }
      );
    }

    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Public ID required' },
        { status: 400 }
      );
    }

    const result = await deleteFile(publicId);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}

// GET endpoint to check Cloudinary status
export async function GET() {
  return NextResponse.json({
    configured: isCloudinaryConfigured(),
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
    folder: process.env.CLOUDINARY_FOLDER || 'placement-system'
  });
}