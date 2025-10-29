import { v2 as cloudinary } from 'cloudinary';

/**
 * Cloudinary Configuration for Smart Placement Management System
 * Handles file uploads, storage, and delivery
 */

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Force HTTPS URLs
});

// Check if Cloudinary is properly configured
export const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Upload options for different file types
export const uploadOptions = {
  // Resume uploads
  resume: {
    resource_type: 'auto', // Handles PDF, DOC, DOCX automatically
    folder: `${process.env.CLOUDINARY_FOLDER}/resumes`,
    allowed_formats: ['pdf', 'doc', 'docx'],
    max_bytes: 5 * 1024 * 1024, // 5MB limit
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    quality: 'auto',
    fetch_format: 'auto',
  },

  // Company job descriptions
  jobDescription: {
    resource_type: 'auto',
    folder: `${process.env.CLOUDINARY_FOLDER}/job-descriptions`,
    allowed_formats: ['pdf', 'doc', 'docx'],
    max_bytes: 10 * 1024 * 1024, // 10MB limit
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  },

  // Profile photos
  profilePhoto: {
    resource_type: 'image',
    folder: `${process.env.CLOUDINARY_FOLDER}/profiles`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    max_bytes: 2 * 1024 * 1024, // 2MB limit
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
    use_filename: true,
    unique_filename: true,
    overwrite: true,
  },

  // Company logos
  companyLogo: {
    resource_type: 'image',
    folder: `${process.env.CLOUDINARY_FOLDER}/company-logos`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
    max_bytes: 1 * 1024 * 1024, // 1MB limit
    transformation: [
      { width: 300, height: 200, crop: 'fit' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
    use_filename: true,
    unique_filename: true,
    overwrite: true,
  }
};

// Generate signed upload URL for secure client-side uploads
export const generateSignedUploadUrl = (uploadType = 'resume') => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary not configured');
  }

  const options = uploadOptions[uploadType] || uploadOptions.resume;
  const timestamp = Math.round(new Date().getTime() / 1000);

  return cloudinary.utils.cloudinary_url('', {
    sign_url: true,
    ...options,
    timestamp
  });
};

// Upload file from buffer/base64
export const uploadFile = async (fileBuffer, uploadType = 'resume', customOptions = {}) => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary not configured');
  }

  const options = {
    ...uploadOptions[uploadType],
    ...customOptions
  };

  try {
    const result = await cloudinary.uploader.upload(fileBuffer, options);

    return {
      success: true,
      publicId: result.public_id,
      url: result.secure_url,
      originalName: result.original_filename,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height,
      resourceType: result.resource_type
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete file from Cloudinary
export const deleteFile = async (publicId) => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary not configured');
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get optimized URL for existing file
export const getOptimizedUrl = (publicId, options = {}) => {
  if (!isCloudinaryConfigured()) {
    return null;
  }

  return cloudinary.url(publicId, {
    secure: true,
    quality: 'auto',
    fetch_format: 'auto',
    ...options
  });
};

// Get file info
export const getFileInfo = async (publicId) => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary not configured');
  }

  try {
    const result = await cloudinary.api.resource(publicId);
    return {
      success: true,
      ...result
    };
  } catch (error) {
    console.error('Cloudinary get file info error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default cloudinary;