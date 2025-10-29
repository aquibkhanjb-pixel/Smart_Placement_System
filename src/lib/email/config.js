import nodemailer from 'nodemailer';

/**
 * Email configuration and transporter setup
 * Supports multiple SMTP providers with fallback options
 */

// Email configuration from environment variables
export const emailConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Additional security options for production
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  },
  // Connection timeout and retry settings
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
};

// Email sender information
export const emailSender = {
  name: process.env.SMTP_FROM_NAME || 'Smart Placement System',
  email: process.env.SMTP_FROM_EMAIL || 'noreply@placement.system',
  get address() {
    return `"${this.name}" <${this.email}>`;
  }
};

// Company branding information
export const companyInfo = {
  name: process.env.COMPANY_NAME || 'Your College Name',
  website: process.env.COMPANY_WEBSITE || '#',
  logoUrl: process.env.COMPANY_LOGO_URL || '',
  supportEmail: process.env.SMTP_FROM_EMAIL || 'support@placement.system',
};

// Email feature flags
export const emailFeatures = {
  enabled: process.env.EMAIL_ENABLED === 'true',
  sendWelcome: process.env.EMAIL_SEND_WELCOME === 'true',
  sendPasswordReset: process.env.EMAIL_SEND_PASSWORD_RESET === 'true',
  sendApplicationUpdates: process.env.EMAIL_SEND_APPLICATION_UPDATES === 'true',
  sendPlacementNotifications: process.env.EMAIL_SEND_PLACEMENT_NOTIFICATIONS === 'true',
};

// Create reusable transporter object
let transporter = null;

export const createTransporter = () => {
  if (!transporter) {
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.warn('Email credentials not configured. Email functionality will be disabled.');
      return null;
    }

    try {
      transporter = nodemailer.createTransport(emailConfig);

      // Verify connection configuration on startup (optional in production)
      if (process.env.NODE_ENV === 'development') {
        transporter.verify((error, success) => {
          if (error) {
            console.error('Email transporter verification failed:', error);
          } else {
            console.log('✅ Email server is ready to send messages');
          }
        });
      }
    } catch (error) {
      console.error('Failed to create email transporter:', error);
      return null;
    }
  }

  return transporter;
};

// Get the transporter instance
export const getTransporter = () => {
  return createTransporter();
};

// Email sending wrapper with error handling
export const sendEmail = async (mailOptions) => {
  if (!emailFeatures.enabled) {
    console.log('Email sending is disabled via configuration');
    return { success: false, message: 'Email sending disabled' };
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.error('Email transporter not available');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    // Add default sender if not specified
    if (!mailOptions.from) {
      mailOptions.from = emailSender.address;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('❌ Failed to send email:', error);

    return {
      success: false,
      error: error.message,
      message: 'Failed to send email'
    };
  }
};

export default {
  emailConfig,
  emailSender,
  companyInfo,
  emailFeatures,
  createTransporter,
  getTransporter,
  sendEmail
};