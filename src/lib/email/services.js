import { sendEmail, emailFeatures } from './config.js';
import {
  getWelcomeEmailTemplate,
  getApplicationStatusEmailTemplate,
  getNewCompanyNotificationTemplate,
  getPasswordResetEmailTemplate,
  getInterviewScheduleEmailTemplate
} from './templates.js';

/**
 * High-level email service functions for Smart Placement Management System
 * These functions handle specific email scenarios with proper error handling
 */

// 1. Send Welcome Email to New Students
export const sendWelcomeEmail = async (userData, tempPassword) => {
  if (!emailFeatures.sendWelcome) {
    console.log('Welcome emails are disabled via configuration');
    return { success: false, message: 'Welcome emails disabled' };
  }

  try {
    const htmlContent = getWelcomeEmailTemplate(userData, tempPassword);

    const mailOptions = {
      to: userData.email,
      subject: `Welcome to Smart Placement System - Account Created`,
      html: htmlContent,
      text: `Welcome ${userData.firstName}! Your account has been created. Email: ${userData.email}, Temporary Password: ${tempPassword}. Please log in and change your password.`
    };

    const result = await sendEmail(mailOptions);
    return result;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, message: 'Failed to send welcome email', error: error.message };
  }
};

// 2. Send Application Status Update Email
export const sendApplicationStatusEmail = async (studentEmail, studentName, companyName, status, additionalInfo = '') => {
  if (!emailFeatures.sendApplicationUpdates) {
    console.log('Application update emails are disabled via configuration');
    return { success: false, message: 'Application update emails disabled' };
  }

  try {
    const htmlContent = getApplicationStatusEmailTemplate(studentName, companyName, status, additionalInfo);

    const subjects = {
      APPLIED: `Application Submitted - ${companyName}`,
      SHORTLISTED: `🎉 Shortlisted for ${companyName}`,
      SELECTED: `🎉 Congratulations! Selected by ${companyName}`,
      REJECTED: `Application Update - ${companyName}`
    };

    const mailOptions = {
      to: studentEmail,
      subject: subjects[status] || `Application Update - ${companyName}`,
      html: htmlContent,
      text: `Application Update: Your application to ${companyName} status is now: ${status}. ${additionalInfo}`
    };

    const result = await sendEmail(mailOptions);
    return result;
  } catch (error) {
    console.error('Failed to send application status email:', error);
    return { success: false, message: 'Failed to send application status email', error: error.message };
  }
};

// 3. Send New Company Notification to Eligible Students
export const sendNewCompanyNotification = async (companyData, eligibleStudentEmails) => {
  if (!emailFeatures.sendPlacementNotifications) {
    console.log('Placement notification emails are disabled via configuration');
    return { success: false, message: 'Placement notification emails disabled' };
  }

  if (!eligibleStudentEmails || eligibleStudentEmails.length === 0) {
    return { success: false, message: 'No eligible students to notify' };
  }

  try {
    const htmlContent = getNewCompanyNotificationTemplate(companyData, eligibleStudentEmails);

    const mailOptions = {
      bcc: eligibleStudentEmails, // Use BCC to protect student privacy
      subject: `🏢 New Placement Opportunity: ${companyData.name} - ₹${companyData.ctc} LPA`,
      html: htmlContent,
      text: `New placement opportunity: ${companyData.name} offering ₹${companyData.ctc} LPA. Min CGPA: ${companyData.minCgpa}. Apply now!`
    };

    const result = await sendEmail(mailOptions);

    if (result.success) {
      console.log(`✅ New company notification sent to ${eligibleStudentEmails.length} students`);
    }

    return result;
  } catch (error) {
    console.error('Failed to send new company notification:', error);
    return { success: false, message: 'Failed to send new company notification', error: error.message };
  }
};

// 4. Send Password Reset Email
export const sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
  if (!emailFeatures.sendPasswordReset) {
    console.log('Password reset emails are disabled via configuration');
    return { success: false, message: 'Password reset emails disabled' };
  }

  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    const htmlContent = getPasswordResetEmailTemplate(userName, resetToken, resetUrl);

    const mailOptions = {
      to: userEmail,
      subject: 'Reset Your Password - Smart Placement System',
      html: htmlContent,
      text: `Password reset requested for ${userName}. Click this link to reset: ${resetUrl}`
    };

    const result = await sendEmail(mailOptions);
    return result;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: false, message: 'Failed to send password reset email', error: error.message };
  }
};

// 5. Send Interview Schedule Email
export const sendInterviewScheduleEmail = async (studentEmail, studentName, companyName, interviewDate, interviewDetails = {}) => {
  if (!emailFeatures.sendApplicationUpdates) {
    console.log('Interview schedule emails are disabled via configuration');
    return { success: false, message: 'Interview schedule emails disabled' };
  }

  try {
    const htmlContent = getInterviewScheduleEmailTemplate(studentName, companyName, interviewDate, interviewDetails);

    const mailOptions = {
      to: studentEmail,
      subject: `📅 Interview Scheduled: ${companyName} on ${new Date(interviewDate).toLocaleDateString()}`,
      html: htmlContent,
      text: `Interview scheduled with ${companyName} on ${new Date(interviewDate).toLocaleString()}. Please check your email for details.`
    };

    const result = await sendEmail(mailOptions);
    return result;
  } catch (error) {
    console.error('Failed to send interview schedule email:', error);
    return { success: false, message: 'Failed to send interview schedule email', error: error.message };
  }
};

// 6. Send Bulk Email to Multiple Recipients (for announcements)
export const sendBulkEmail = async (recipients, subject, htmlContent, textContent) => {
  if (!emailFeatures.enabled) {
    console.log('Email sending is disabled via configuration');
    return { success: false, message: 'Email sending disabled' };
  }

  if (!recipients || recipients.length === 0) {
    return { success: false, message: 'No recipients specified' };
  }

  try {
    const mailOptions = {
      bcc: recipients, // Use BCC to protect recipient privacy
      subject: subject,
      html: htmlContent,
      text: textContent
    };

    const result = await sendEmail(mailOptions);

    if (result.success) {
      console.log(`✅ Bulk email sent to ${recipients.length} recipients`);
    }

    return result;
  } catch (error) {
    console.error('Failed to send bulk email:', error);
    return { success: false, message: 'Failed to send bulk email', error: error.message };
  }
};

// 7. Test Email Connectivity
export const testEmailConnection = async (testEmailAddress) => {
  try {
    const htmlContent = `
      <h2>Email Service Test</h2>
      <p>This is a test email to verify that the Smart Placement Management System email service is working correctly.</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
      <p>If you received this email, the email service is functioning properly.</p>
    `;

    const mailOptions = {
      to: testEmailAddress,
      subject: 'Email Service Test - Smart Placement System',
      html: htmlContent,
      text: `Email service test. Timestamp: ${new Date().toISOString()}`
    };

    const result = await sendEmail(mailOptions);
    return result;
  } catch (error) {
    console.error('Failed to send test email:', error);
    return { success: false, message: 'Failed to send test email', error: error.message };
  }
};

export default {
  sendWelcomeEmail,
  sendApplicationStatusEmail,
  sendNewCompanyNotification,
  sendPasswordResetEmail,
  sendInterviewScheduleEmail,
  sendBulkEmail,
  testEmailConnection
};