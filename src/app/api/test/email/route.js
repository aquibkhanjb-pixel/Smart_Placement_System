import { NextResponse } from 'next/server';
import { testEmailConnection, sendWelcomeEmail, sendApplicationStatusEmail } from '../../../../lib/email/index.js';

/**
 * Email Testing API Endpoint
 * Use this endpoint to test email functionality in development
 *
 * POST /api/test/email
 * Body: { type: 'test' | 'welcome' | 'status', email: 'test@example.com', ...options }
 */

export async function POST(request) {
  try {
    // Only allow in development mode for security
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Email testing not available in production' },
        { status: 403 }
      );
    }

    const { type, email, ...options } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'test':
        // Basic connectivity test
        result = await testEmailConnection(email);
        break;

      case 'welcome':
        // Test welcome email template
        const studentData = {
          firstName: options.firstName || 'Test',
          lastName: options.lastName || 'Student',
          email: email,
          rollNumber: options.rollNumber || 'TEST2024999',
          department: options.department || 'CMPN',
          graduationYear: options.graduationYear || 2025
        };
        const tempPassword = options.tempPassword || 'TestPass123';

        result = await sendWelcomeEmail(studentData, tempPassword);
        break;

      case 'status':
        // Test application status email
        const studentName = `${options.firstName || 'Test'} ${options.lastName || 'Student'}`;
        const companyName = options.companyName || 'Test Company';
        const status = options.status || 'APPLIED';
        const additionalInfo = options.additionalInfo || 'This is a test email';

        result = await sendApplicationStatusEmail(email, studentName, companyName, status, additionalInfo);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type. Use: test, welcome, or status' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      messageId: result.messageId,
      type: type,
      sentTo: email,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: 'Email test failed'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return email configuration status (without sensitive data)
  return NextResponse.json({
    emailEnabled: process.env.EMAIL_ENABLED === 'true',
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    fromName: process.env.SMTP_FROM_NAME,
    fromEmail: process.env.SMTP_FROM_EMAIL,
    hasCredentials: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
    environment: process.env.NODE_ENV,
    features: {
      welcome: process.env.EMAIL_SEND_WELCOME === 'true',
      passwordReset: process.env.EMAIL_SEND_PASSWORD_RESET === 'true',
      applicationUpdates: process.env.EMAIL_SEND_APPLICATION_UPDATES === 'true',
      placementNotifications: process.env.EMAIL_SEND_PLACEMENT_NOTIFICATIONS === 'true'
    }
  });
}