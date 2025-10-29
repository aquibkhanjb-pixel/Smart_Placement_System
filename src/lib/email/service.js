import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // For development, we'll use a test account or console logging
    // In production, you would configure with real SMTP settings

    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Production configuration
      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      // Development configuration - creates a test account
      this.createTestAccount();
    }
  }

  async createTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      console.log('📧 Email Service: Using test account');
      console.log('📧 Test account user:', testAccount.user);
      console.log('📧 Test account pass:', testAccount.pass);
    } catch (error) {
      console.error('Failed to create test email account:', error);
      // Fallback to console logging
      this.transporter = null;
    }
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      if (!this.transporter) {
        // Fallback: log to console in development
        console.log('📧 EMAIL (Console Mode):');
        console.log('📧 To:', to);
        console.log('📧 Subject:', subject);
        console.log('📧 Content:', text || 'HTML content provided');
        return { success: true, messageId: 'console-log', mode: 'console' };
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Smart Placement System <noreply@placement.edu>',
        to,
        subject,
        text,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);

      // For test accounts, get the preview URL
      let previewUrl = null;
      if (info.messageId && this.transporter.options.host === 'smtp.ethereal.email') {
        previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('📧 Email sent successfully!');
        console.log('📧 Preview URL:', previewUrl);
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl,
        mode: 'smtp'
      };

    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error.message,
        mode: 'error'
      };
    }
  }

  // Template methods for different types of notifications
  async sendApplicationSubmitted({ studentEmail, studentName, companyName, applicationId }) {
    const subject = `Application Submitted - ${companyName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Application Submitted Successfully</h2>

        <p>Dear ${studentName},</p>

        <p>Your application has been successfully submitted to <strong>${companyName}</strong>.</p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Application Details</h3>
          <p><strong>Company:</strong> ${companyName}</p>
          <p><strong>Application ID:</strong> ${applicationId}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <p>You can track your application status in your dashboard.</p>

        <p>Best of luck!</p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280;">
          This is an automated email from the Smart Placement Management System.
        </p>
      </div>
    `;

    const text = `
      Application Submitted Successfully

      Dear ${studentName},

      Your application has been successfully submitted to ${companyName}.

      Application Details:
      - Company: ${companyName}
      - Application ID: ${applicationId}
      - Submitted: ${new Date().toLocaleDateString()}

      You can track your application status in your dashboard.

      Best of luck!
    `;

    return this.sendEmail({
      to: studentEmail,
      subject,
      html,
      text
    });
  }

  async sendApplicationStatusUpdate({ studentEmail, studentName, companyName, newStatus, applicationId }) {
    const subject = `Application Status Update - ${companyName}`;

    const statusMessages = {
      SHORTLISTED: {
        title: 'You\'ve been shortlisted!',
        message: 'Congratulations! Your application has been shortlisted.',
        color: '#059669'
      },
      SELECTED: {
        title: 'Congratulations! You\'ve been selected!',
        message: 'We\'re excited to inform you that you have been selected.',
        color: '#059669'
      },
      REJECTED: {
        title: 'Application Update',
        message: 'Unfortunately, your application was not selected this time.',
        color: '#dc2626'
      }
    };

    const statusInfo = statusMessages[newStatus] || {
      title: 'Application Status Update',
      message: `Your application status has been updated to: ${newStatus}`,
      color: '#6b7280'
    };

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${statusInfo.color};">${statusInfo.title}</h2>

        <p>Dear ${studentName},</p>

        <p>${statusInfo.message}</p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Application Details</h3>
          <p><strong>Company:</strong> ${companyName}</p>
          <p><strong>Application ID:</strong> ${applicationId}</p>
          <p><strong>New Status:</strong> <span style="color: ${statusInfo.color}; font-weight: bold;">${newStatus}</span></p>
          <p><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <p>You can view more details in your dashboard.</p>

        <p>Best regards,<br>Smart Placement Team</p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280;">
          This is an automated email from the Smart Placement Management System.
        </p>
      </div>
    `;

    const text = `
      ${statusInfo.title}

      Dear ${studentName},

      ${statusInfo.message}

      Application Details:
      - Company: ${companyName}
      - Application ID: ${applicationId}
      - New Status: ${newStatus}
      - Updated: ${new Date().toLocaleDateString()}

      You can view more details in your dashboard.

      Best regards,
      Smart Placement Team
    `;

    return this.sendEmail({
      to: studentEmail,
      subject,
      html,
      text
    });
  }

  async sendNewCompanyNotification({ studentEmail, studentName, companyName, companyCtc, companyCategory }) {
    const subject = `New Company Added - ${companyName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Company Opportunity</h2>

        <p>Dear ${studentName},</p>

        <p>A new company has been added to the placement portal that might interest you!</p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">${companyName}</h3>
          <p><strong>Package:</strong> ₹${companyCtc} LPA</p>
          <p><strong>Category:</strong> ${companyCategory}</p>
        </div>

        <p>Check your dashboard to see if you're eligible and apply!</p>

        <p>Best regards,<br>Smart Placement Team</p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280;">
          This is an automated email from the Smart Placement Management System.
        </p>
      </div>
    `;

    const text = `
      New Company Opportunity

      Dear ${studentName},

      A new company has been added to the placement portal that might interest you!

      Company: ${companyName}
      Package: ₹${companyCtc} LPA
      Category: ${companyCategory}

      Check your dashboard to see if you're eligible and apply!

      Best regards,
      Smart Placement Team
    `;

    return this.sendEmail({
      to: studentEmail,
      subject,
      html,
      text
    });
  }
}

// Create a singleton instance
const emailService = new EmailService();

export { emailService };