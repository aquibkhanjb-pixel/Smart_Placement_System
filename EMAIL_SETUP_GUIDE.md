# 📧 Nodemailer Production Setup Guide

## Smart Placement Management System - Email Integration

This guide will help you set up production-level email functionality for your Smart Placement Management System using Nodemailer.

---

## 🚀 **Quick Start**

### 1. **Configure Environment Variables**

Add these variables to your `.env` file:

```env
# Email Configuration (NodeMailer) - Production Setup
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-placement-system@gmail.com"
SMTP_PASS="your-app-specific-password"

# Email Templates & Branding
SMTP_FROM_NAME="Smart Placement System"
SMTP_FROM_EMAIL="noreply@placement.system"
COMPANY_NAME="Your College Name"
COMPANY_LOGO_URL="https://your-domain.com/logo.png"
COMPANY_WEBSITE="https://your-college.edu"

# Email Feature Toggles
EMAIL_ENABLED="true"
EMAIL_SEND_WELCOME="true"
EMAIL_SEND_PASSWORD_RESET="true"
EMAIL_SEND_APPLICATION_UPDATES="true"
EMAIL_SEND_PLACEMENT_NOTIFICATIONS="true"
```

### 2. **Gmail Setup (Recommended)**

#### **Option A: Gmail with App Password (Recommended)**

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Navigate to Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `SMTP_PASS`

3. **Update Environment Variables**:
   ```env
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-16-character-app-password"
   ```

#### **Option B: Gmail with OAuth2 (Advanced)**

For higher security and better deliverability, consider OAuth2 authentication.

---

## 🏢 **Production Email Providers**

### **1. Gmail (Free - Good for Development)**
- **Pros**: Easy setup, reliable
- **Cons**: 500 emails/day limit, may be flagged as spam
- **Cost**: Free
- **Setup**: See Gmail setup above

### **2. SendGrid (Recommended for Production)**
- **Pros**: High deliverability, detailed analytics, 100 emails/day free
- **Cons**: Requires domain verification
- **Cost**: Free tier available, paid plans from $15/month

```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
```

### **3. Amazon SES**
- **Pros**: Very affordable, high scalability
- **Cons**: Complex setup, requires AWS account
- **Cost**: $0.10 per 1000 emails

```env
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_USER="your-aws-access-key"
SMTP_PASS="your-aws-secret-key"
```

### **4. Mailgun**
- **Pros**: Developer-friendly, good API
- **Cons**: Free tier limited
- **Cost**: Free tier: 5,000 emails/month

```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_USER="postmaster@your-domain.mailgun.org"
SMTP_PASS="your-mailgun-password"
```

---

## 🔧 **Testing Email Setup**

### **1. Check Configuration**

Visit: `http://localhost:3003/api/test/email`

This will show your current email configuration without exposing credentials.

### **2. Send Test Email**

```bash
curl -X POST http://localhost:3003/api/test/email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "test",
    "email": "your-test-email@gmail.com"
  }'
```

### **3. Test Welcome Email**

```bash
curl -X POST http://localhost:3003/api/test/email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "email": "student@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "rollNumber": "CS2024001",
    "department": "CMPN"
  }'
```

### **4. Test Application Status Email**

```bash
curl -X POST http://localhost:3003/api/test/email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "status",
    "email": "student@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "companyName": "Google",
    "status": "SELECTED"
  }'
```

---

## 🎨 **Email Templates Available**

### **1. Welcome Email** (`sendWelcomeEmail`)
- Sent when new students are created
- Contains login credentials and account details
- Professional design with company branding

### **2. Application Status Email** (`sendApplicationStatusEmail`)
- Sent when application status changes
- Different styles for APPLIED, SHORTLISTED, SELECTED, REJECTED
- Includes next steps and action items

### **3. New Company Notification** (`sendNewCompanyNotification`)
- Sent to eligible students when new companies register
- Includes company details and application deadline
- Filtered by eligibility criteria

### **4. Password Reset Email** (`sendPasswordResetEmail`)
- Secure password reset with time-limited tokens
- Professional security messaging

### **5. Interview Schedule Email** (`sendInterviewScheduleEmailEmail`)
- Interview details with preparation tips
- Support for online and offline interviews

---

## 📈 **Usage in Your Code**

### **Basic Usage**

```javascript
import { sendWelcomeEmail } from '@/lib/email';

// Send welcome email to new student
const result = await sendWelcomeEmail(studentData, tempPassword);

if (result.success) {
  console.log('Email sent successfully!');
} else {
  console.error('Failed to send email:', result.message);
}
```

### **Application Status Updates**

```javascript
import { sendApplicationStatusEmail } from '@/lib/email';

await sendApplicationStatusEmail(
  'student@example.com',
  'John Doe',
  'Google',
  'SELECTED',
  'Congratulations! Please report on Monday.'
);
```

### **Bulk Notifications**

```javascript
import { sendNewCompanyNotification } from '@/lib/email';

const eligibleEmails = ['student1@example.com', 'student2@example.com'];
await sendNewCompanyNotification(companyData, eligibleEmails);
```

---

## 🔒 **Security Best Practices**

### **1. Environment Variables**
- Never commit credentials to version control
- Use different credentials for development/production
- Rotate passwords regularly

### **2. Email Security**
- Use app-specific passwords instead of main account passwords
- Enable 2FA on email provider accounts
- Monitor failed login attempts

### **3. Rate Limiting**
- Implement rate limiting for email endpoints
- Monitor daily/monthly sending limits
- Set up alerts for unusual activity

### **4. Content Security**
- Sanitize all user inputs in email content
- Use HTTPS links only
- Include unsubscribe options where required

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. "Authentication Failed"**
- **Solution**: Check username/password, ensure 2FA + App Password for Gmail
- **Check**: `SMTP_USER` and `SMTP_PASS` environment variables

#### **2. "Connection Timeout"**
- **Solution**: Check `SMTP_HOST` and `SMTP_PORT`
- **Check**: Firewall settings, network connectivity

#### **3. "Emails Going to Spam"**
- **Solution**:
  - Set up SPF/DKIM records
  - Use professional email provider (SendGrid/SES)
  - Warm up your domain reputation

#### **4. "Rate Limit Exceeded"**
- **Solution**:
  - Upgrade email provider plan
  - Implement email queuing
  - Space out bulk emails

### **Debug Mode**

Set `NODE_ENV=development` to enable detailed email logs and connection verification.

---

## 📋 **Production Checklist**

- [ ] Email provider configured with high sending limits
- [ ] Domain verification completed (for professional providers)
- [ ] SPF/DKIM records set up
- [ ] Rate limiting implemented
- [ ] Error logging and monitoring set up
- [ ] Email templates tested with real data
- [ ] Unsubscribe mechanism implemented (if required)
- [ ] Backup email provider configured
- [ ] Email queue system implemented for high volume
- [ ] Monitoring and alerting set up

---

## 📞 **Support & Next Steps**

### **Email Features Implemented:**
✅ Welcome emails for new students
✅ Application status notifications
✅ New company announcements
✅ Interview schedule emails
✅ Password reset emails
✅ Professional HTML templates
✅ Environment-based configuration
✅ Error handling and logging

### **Ready for Production:**
- Configure your preferred email provider
- Update environment variables
- Test with real email addresses
- Monitor delivery rates and responses

### **Need Help?**
- Check the testing endpoint: `/api/test/email`
- Review console logs for detailed error messages
- Verify environment variables are correctly set

---

*Your Smart Placement Management System is now equipped with professional-grade email capabilities!* 🎉