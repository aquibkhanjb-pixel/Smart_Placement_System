import { companyInfo } from './config.js';

/**
 * Professional email templates for Smart Placement Management System
 * All templates are responsive and include proper styling
 */

// Base email template with consistent styling
const getEmailWrapper = (content, title = 'Smart Placement System') => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px 40px; text-align: center; }
        .header h1 { font-size: 24px; font-weight: 600; margin-bottom: 8px; }
        .header p { opacity: 0.9; font-size: 14px; }
        .content { padding: 40px; }
        .footer { background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { color: #64748b; font-size: 14px; margin-bottom: 8px; }
        .footer a { color: #3b82f6; text-decoration: none; }
        .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .button:hover { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); }
        .info-box { background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px; }
        .warning-box { background-color: #fef3cd; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px; }
        .success-box { background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px; }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .details-table th, .details-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .details-table th { background-color: #f8fafc; font-weight: 600; color: #475569; }
        @media (max-width: 600px) {
            .container { margin: 10px; }
            .header, .content, .footer { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${companyInfo.name}</h1>
            <p>Smart Placement Management System</p>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} ${companyInfo.name}. All rights reserved.</p>
            <p>
                <a href="${companyInfo.website}">Visit our website</a> |
                <a href="mailto:${companyInfo.supportEmail}">Contact Support</a>
            </p>
            <p style="margin-top: 16px; font-size: 12px; color: #94a3b8;">
                This is an automated message from the Smart Placement Management System.
            </p>
        </div>
    </div>
</body>
</html>`;
};

// 1. Welcome Email for New Students
export const getWelcomeEmailTemplate = (userData, tempPassword) => {
  const content = `
    <h2 style="color: #1e293b; margin-bottom: 24px;">Welcome to the Placement System!</h2>

    <p>Dear ${userData.firstName} ${userData.lastName},</p>

    <p>Welcome to the Smart Placement Management System! Your account has been successfully created by the placement coordinator.</p>

    <div class="info-box">
        <h3 style="margin-bottom: 12px; color: #3b82f6;">Your Account Details</h3>
        <table class="details-table">
            <tr><th>Name:</th><td>${userData.firstName} ${userData.lastName}</td></tr>
            <tr><th>Email:</th><td>${userData.email}</td></tr>
            <tr><th>Roll Number:</th><td>${userData.rollNumber}</td></tr>
            <tr><th>Department:</th><td>${userData.department}</td></tr>
            <tr><th>Graduation Year:</th><td>${userData.graduationYear}</td></tr>
        </table>
    </div>

    <div class="warning-box">
        <h3 style="margin-bottom: 12px; color: #f59e0b;">⚠️ Important: Temporary Password</h3>
        <p><strong>Your temporary password is: <code style="background: #fbbf24; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${tempPassword}</code></strong></p>
        <p style="margin-top: 8px;">For security reasons, you must change this password when you first log in.</p>
    </div>

    <p>To get started:</p>
    <ol style="margin: 16px 0; padding-left: 20px;">
        <li>Click the login button below</li>
        <li>Enter your email and temporary password</li>
        <li>Update your profile with your CGPA, skills, and upload your resume</li>
        <li>Start applying for placement opportunities</li>
    </ol>

    <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" class="button">Login to Your Account</a>
    </div>

    <p style="margin-top: 24px;">If you have any questions or need assistance, please contact the placement coordinator.</p>

    <p>Best regards,<br>Placement Team</p>
  `;

  return getEmailWrapper(content, 'Welcome to Smart Placement System');
};

// 2. Application Status Update Email
export const getApplicationStatusEmailTemplate = (studentName, companyName, status, additionalInfo = '') => {
  const statusColors = {
    APPLIED: '#3b82f6',
    SHORTLISTED: '#f59e0b',
    SELECTED: '#10b981',
    REJECTED: '#ef4444'
  };

  const statusMessages = {
    APPLIED: 'Your application has been submitted successfully',
    SHORTLISTED: 'Congratulations! You have been shortlisted',
    SELECTED: '🎉 Congratulations! You have been selected',
    REJECTED: 'Application status update'
  };

  const content = `
    <h2 style="color: #1e293b; margin-bottom: 24px;">${statusMessages[status]}</h2>

    <p>Dear ${studentName},</p>

    <p>We have an update regarding your application to <strong>${companyName}</strong>.</p>

    <div class="info-box">
        <h3 style="margin-bottom: 12px; color: ${statusColors[status]};">Application Status: ${status}</h3>
        <table class="details-table">
            <tr><th>Company:</th><td>${companyName}</td></tr>
            <tr><th>Status:</th><td><span style="color: ${statusColors[status]}; font-weight: bold;">${status}</span></td></tr>
            <tr><th>Updated:</th><td>${new Date().toLocaleDateString()}</td></tr>
        </table>
    </div>

    ${status === 'SELECTED' ? `
    <div class="success-box">
        <h3 style="margin-bottom: 12px; color: #10b981;">🎉 Congratulations!</h3>
        <p>You have been selected by ${companyName}! This is a significant achievement.</p>
        <p>Please wait for further instructions from the placement coordinator regarding next steps.</p>
    </div>
    ` : ''}

    ${status === 'SHORTLISTED' ? `
    <div class="warning-box">
        <h3 style="margin-bottom: 12px; color: #f59e0b;">📋 Next Steps</h3>
        <p>You have been shortlisted for the next round. Please:</p>
        <ul style="margin-top: 8px; padding-left: 20px;">
            <li>Check your email regularly for interview updates</li>
            <li>Prepare for the upcoming selection process</li>
            <li>Contact the placement coordinator if you have questions</li>
        </ul>
    </div>
    ` : ''}

    ${additionalInfo ? `
    <div class="info-box">
        <h3 style="margin-bottom: 12px;">Additional Information</h3>
        <p>${additionalInfo}</p>
    </div>
    ` : ''}

    <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View Dashboard</a>
    </div>

    <p style="margin-top: 24px;">Best regards,<br>Placement Team</p>
  `;

  return getEmailWrapper(content, `Application Update - ${companyName}`);
};

// 3. New Company Registration Email for Students
export const getNewCompanyNotificationTemplate = (companyData, eligibleStudents) => {
  const content = `
    <h2 style="color: #1e293b; margin-bottom: 24px;">🏢 New Placement Opportunity Available!</h2>

    <p>Dear Students,</p>

    <p>A new company has opened registration for placement opportunities. Here are the details:</p>

    <div class="info-box">
        <h3 style="margin-bottom: 12px; color: #3b82f6;">${companyData.name}</h3>
        <table class="details-table">
            <tr><th>Company:</th><td>${companyData.name}</td></tr>
            <tr><th>Package:</th><td>₹${companyData.ctc} LPA</td></tr>
            <tr><th>Category:</th><td>${companyData.category}</td></tr>
            <tr><th>Location:</th><td>${companyData.location || 'Not specified'}</td></tr>
            <tr><th>Min CGPA:</th><td>${companyData.minCgpa}</td></tr>
            <tr><th>Eligible Departments:</th><td>${JSON.parse(companyData.allowedDepartments).join(', ')}</td></tr>
            ${companyData.registrationDeadline ? `<tr><th>Application Deadline:</th><td>${new Date(companyData.registrationDeadline).toLocaleDateString()}</td></tr>` : ''}
        </table>
    </div>

    ${companyData.description ? `
    <div class="info-box">
        <h3 style="margin-bottom: 12px;">About the Company</h3>
        <p>${companyData.description}</p>
    </div>
    ` : ''}

    <div class="warning-box">
        <h3 style="margin-bottom: 12px; color: #f59e0b;">⏰ Action Required</h3>
        <p>If you meet the eligibility criteria and are interested in this opportunity:</p>
        <ul style="margin-top: 8px; padding-left: 20px;">
            <li>Log in to the placement portal</li>
            <li>Review the complete job description</li>
            <li>Submit your application before the deadline</li>
        </ul>
    </div>

    <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/companies" class="button">View Opportunity & Apply</a>
    </div>

    <p style="margin-top: 24px;">Good luck with your application!</p>

    <p>Best regards,<br>Placement Team</p>
  `;

  return getEmailWrapper(content, `New Opportunity - ${companyData.name}`);
};

// 4. Password Reset Email
export const getPasswordResetEmailTemplate = (userName, resetToken, resetUrl) => {
  const content = `
    <h2 style="color: #1e293b; margin-bottom: 24px;">🔐 Password Reset Request</h2>

    <p>Dear ${userName},</p>

    <p>We received a request to reset your password for the Smart Placement Management System.</p>

    <div class="warning-box">
        <h3 style="margin-bottom: 12px; color: #f59e0b;">⚠️ Security Information</h3>
        <p>If you did not request this password reset, please ignore this email. Your password will remain unchanged.</p>
        <p>This reset link will expire in 1 hour for security reasons.</p>
    </div>

    <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Your Password</a>
    </div>

    <p style="margin-top: 24px;">If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; background-color: #f8fafc; padding: 12px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>

    <p style="margin-top: 24px;">If you're having trouble, please contact our support team.</p>

    <p>Best regards,<br>Support Team</p>
  `;

  return getEmailWrapper(content, 'Password Reset Request');
};

// 5. Interview Schedule Email
export const getInterviewScheduleEmailTemplate = (studentName, companyName, interviewDate, interviewDetails) => {
  const content = `
    <h2 style="color: #1e293b; margin-bottom: 24px;">📅 Interview Scheduled</h2>

    <p>Dear ${studentName},</p>

    <p>Your interview with <strong>${companyName}</strong> has been scheduled. Please find the details below:</p>

    <div class="info-box">
        <h3 style="margin-bottom: 12px; color: #3b82f6;">Interview Details</h3>
        <table class="details-table">
            <tr><th>Company:</th><td>${companyName}</td></tr>
            <tr><th>Date & Time:</th><td>${new Date(interviewDate).toLocaleString()}</td></tr>
            ${interviewDetails.mode ? `<tr><th>Mode:</th><td>${interviewDetails.mode}</td></tr>` : ''}
            ${interviewDetails.location ? `<tr><th>Location:</th><td>${interviewDetails.location}</td></tr>` : ''}
            ${interviewDetails.meetingLink ? `<tr><th>Meeting Link:</th><td><a href="${interviewDetails.meetingLink}">${interviewDetails.meetingLink}</a></td></tr>` : ''}
            ${interviewDetails.contact ? `<tr><th>Contact Person:</th><td>${interviewDetails.contact}</td></tr>` : ''}
        </table>
    </div>

    <div class="warning-box">
        <h3 style="margin-bottom: 12px; color: #f59e0b;">📋 Preparation Tips</h3>
        <ul style="padding-left: 20px;">
            <li>Review your resume and be prepared to discuss your projects</li>
            <li>Research the company and understand their business</li>
            <li>Prepare for technical and behavioral questions</li>
            <li>Join the meeting 5-10 minutes early</li>
            <li>Test your audio/video setup if it's an online interview</li>
        </ul>
    </div>

    ${interviewDetails.instructions ? `
    <div class="info-box">
        <h3 style="margin-bottom: 12px;">Special Instructions</h3>
        <p>${interviewDetails.instructions}</p>
    </div>
    ` : ''}

    <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View Application Status</a>
    </div>

    <p style="margin-top: 24px;">Best of luck with your interview!</p>

    <p>Best regards,<br>Placement Team</p>
  `;

  return getEmailWrapper(content, `Interview Scheduled - ${companyName}`);
};

export default {
  getWelcomeEmailTemplate,
  getApplicationStatusEmailTemplate,
  getNewCompanyNotificationTemplate,
  getPasswordResetEmailTemplate,
  getInterviewScheduleEmailTemplate
};