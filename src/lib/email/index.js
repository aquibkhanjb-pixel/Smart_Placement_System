/**
 * Email Service Module for Smart Placement Management System
 *
 * Usage:
 * import { sendWelcomeEmail, sendApplicationStatusEmail } from "@/lib/email";
 */

// Export configuration
export {
  emailConfig,
  emailSender,
  companyInfo,
  emailFeatures,
  createTransporter,
  getTransporter,
  sendEmail
} from "./config.js";

// Export templates
export {
  getWelcomeEmailTemplate,
  getApplicationStatusEmailTemplate,
  getNewCompanyNotificationTemplate,
  getPasswordResetEmailTemplate,
  getInterviewScheduleEmailTemplate
} from "./templates.js";

// Export services (main functions to use)
export {
  sendWelcomeEmail,
  sendApplicationStatusEmail,
  sendNewCompanyNotification,
  sendPasswordResetEmail,
  sendInterviewScheduleEmail,
  sendBulkEmail,
  testEmailConnection
} from "./services.js";
