# 🚀 Smart Placement System - Production Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Smart Placement Management System in a production environment.

---

## 📋 **Prerequisites**

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Database**: PostgreSQL 13+ (recommended) or SQLite for small deployments
- **Storage**: Minimum 20GB for file uploads and database
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **CPU**: 2+ cores recommended

### Required Accounts (Optional but Recommended)
- **Email Service**: Gmail, SendGrid, or AWS SES for email notifications
- **Cloud Storage**: AWS S3, Google Cloud Storage, or similar for file storage
- **Domain**: Custom domain name for professional deployment
- **SSL Certificate**: For HTTPS (Let's Encrypt recommended)

---

## 🔧 **Environment Configuration**

### 1. Create Production Environment File

Create a `.env.production` or `.env` file in your project root:

```bash
# =================================
# DATABASE CONFIGURATION
# =================================

# For PostgreSQL (Recommended for Production)
DATABASE_URL="postgresql://username:password@localhost:5432/placement_db"

# Alternative: For SQLite (Small Deployments)
# DATABASE_URL="file:./production.db"

# =================================
# APPLICATION CONFIGURATION
# =================================

# Application Environment
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# =================================
# SECURITY & AUTHENTICATION
# =================================

# JWT Secret (Generate a strong random string)
JWT_SECRET="your-super-secure-jwt-secret-key-minimum-32-characters-long"

# Session Secret (Generate another strong random string)
SESSION_SECRET="your-super-secure-session-secret-key-minimum-32-characters"

# =================================
# EMAIL CONFIGURATION
# =================================

# Gmail SMTP (Recommended for quick setup)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Alternative: SendGrid
# SMTP_HOST="smtp.sendgrid.net"
# SMTP_PORT="587"
# SMTP_USER="apikey"
# SMTP_PASS="your-sendgrid-api-key"

# Alternative: AWS SES
# SMTP_HOST="email-smtp.region.amazonaws.com"
# SMTP_PORT="587"
# SMTP_USER="your-aws-access-key-id"
# SMTP_PASS="your-aws-secret-access-key"

# Email Configuration
SMTP_FROM_NAME="Smart Placement System"
SMTP_FROM_EMAIL="noreply@yourdomain.com"

# =================================
# FILE UPLOAD CONFIGURATION
# =================================

# Maximum file size (in bytes) - 10MB default
MAX_FILE_SIZE="10485760"

# Upload directory (relative to project root)
UPLOAD_DIR="./public/uploads"

# For cloud storage (optional)
# AWS S3 Configuration
# AWS_ACCESS_KEY_ID="your-aws-access-key"
# AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
# AWS_REGION="us-east-1"
# AWS_S3_BUCKET="your-bucket-name"

# =================================
# SECURITY HEADERS
# =================================

# CORS Origins (comma-separated for multiple domains)
CORS_ORIGINS="https://yourdomain.com"

# =================================
# LOGGING & MONITORING
# =================================

# Log level (error, warn, info, debug)
LOG_LEVEL="info"

# Enable audit logging
ENABLE_AUDIT_LOGS="true"

# =================================
# DATABASE CONNECTION POOL
# =================================

# Database connection limits
DB_POOL_MIN="2"
DB_POOL_MAX="10"
DB_POOL_IDLE="10000"

# =================================
# RATE LIMITING
# =================================

# API rate limiting (requests per hour per IP)
RATE_LIMIT_REQUESTS="1000"
RATE_LIMIT_WINDOW="3600000"

# =================================
# BACKUP CONFIGURATION
# =================================

# Database backup settings
BACKUP_ENABLED="true"
BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM
BACKUP_RETENTION_DAYS="30"

```

### 2. Generate Secure Secrets

Use these commands to generate secure random strings:

```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate Session Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📧 **Email Configuration Options**

### Option 1: Gmail Setup (Easiest)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App Passwords
   - Generate password for "Mail"
3. Use the generated password in `SMTP_PASS`

### Option 2: SendGrid (Recommended for High Volume)
1. Create a SendGrid account
2. Generate an API key
3. Verify your sender email
4. Use API key in `SMTP_PASS`

### Option 3: AWS SES (Scalable)
1. Set up AWS SES in your region
2. Verify your domain/email
3. Create IAM user with SES permissions
4. Use access credentials in SMTP configuration

---

## 🗄️ **Database Setup**

### PostgreSQL Setup (Recommended)

1. **Install PostgreSQL**:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Windows - Download from postgresql.org
# macOS - Use Homebrew
brew install postgresql
```

2. **Create Database**:
```sql
-- Connect as postgres user
sudo -u postgres psql

-- Create database and user
CREATE DATABASE placement_db;
CREATE USER placement_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE placement_db TO placement_user;

-- Exit psql
\q
```

3. **Update Environment**:
```bash
DATABASE_URL="postgresql://placement_user:secure_password@localhost:5432/placement_db"
```

### SQLite Setup (Small Deployments)
For smaller deployments, you can use SQLite:
```bash
DATABASE_URL="file:./production.db"
```

---

## 🚀 **Deployment Steps**

### 1. Install Dependencies
```bash
# Clone the repository
git clone <your-repo-url>
cd smart-placement

# Install dependencies
npm install

# Install PM2 for process management
npm install -g pm2
```

### 2. Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed initial data (optional)
npx prisma db seed
```

### 3. Build Application
```bash
# Build for production
npm run build

# Verify build
npm run start
```

### 4. Process Management with PM2
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'smart-placement',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Start with PM2:
```bash
# Create logs directory
mkdir logs

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

### 5. Reverse Proxy Setup (Nginx)

Create `/etc/nginx/sites-available/smart-placement`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /path/to/your/project/public/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/smart-placement /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

---

## 🔒 **Security Hardening**

### 1. Firewall Configuration
```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Block direct access to application port
sudo ufw deny 3000
```

### 2. File Permissions
```bash
# Set proper permissions
sudo chown -R $USER:$USER /path/to/smart-placement
chmod -R 755 /path/to/smart-placement
chmod 600 .env
```

### 3. Database Security
```bash
# For PostgreSQL
sudo -u postgres psql
ALTER USER placement_user WITH PASSWORD 'new_secure_password';
```

---

## 📊 **Monitoring & Maintenance**

### 1. Log Management
```bash
# View PM2 logs
pm2 logs

# View specific app logs
pm2 logs smart-placement

# Monitor system resources
pm2 monit
```

### 2. Database Backups
Create backup script `backup.sh`:
```bash
#!/bin/bash
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups"
DB_NAME="placement_db"

# Create backup directory
mkdir -p $BACKUP_DIR

# PostgreSQL backup
pg_dump -U placement_user $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

Make executable and add to cron:
```bash
chmod +x backup.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

### 3. Health Checks
Create `health-check.sh`:
```bash
#!/bin/bash
HEALTH_URL="https://yourdomain.com/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "$(date): Application is healthy"
else
    echo "$(date): Application is down (HTTP $RESPONSE)"
    # Restart application
    pm2 restart smart-placement
fi
```

---

## 🔧 **Troubleshooting**

### Common Issues

1. **Database Connection Errors**:
   - Check DATABASE_URL format
   - Verify database server is running
   - Check firewall rules

2. **File Upload Issues**:
   - Verify upload directory permissions
   - Check MAX_FILE_SIZE setting
   - Ensure sufficient disk space

3. **Email Not Working**:
   - Verify SMTP credentials
   - Check email provider settings
   - Test with simple SMTP client

4. **Performance Issues**:
   - Monitor PM2 metrics
   - Check database query performance
   - Review server resources

### Useful Commands
```bash
# Check application status
pm2 status

# Restart application
pm2 restart smart-placement

# View real-time logs
pm2 logs smart-placement --lines 100

# Monitor resources
htop

# Check disk space
df -h

# Check database connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

---

## 📈 **Performance Optimization**

### 1. Application Optimizations
- Enable gzip compression in Nginx
- Set up proper caching headers
- Optimize database queries
- Implement Redis for session storage

### 2. Database Optimizations
```sql
-- Add database indexes for better performance
CREATE INDEX idx_students_department ON students(department);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_company ON applications(company_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
```

### 3. Monitoring Setup
- Set up application monitoring (New Relic, DataDog)
- Configure error tracking (Sentry)
- Implement custom health checks

---

## ✅ **Final Checklist**

Before going live, ensure:

- [ ] All environment variables are set correctly
- [ ] Database is properly configured and migrated
- [ ] SSL certificate is installed and working
- [ ] Email functionality is tested
- [ ] File uploads work correctly
- [ ] Backup system is configured
- [ ] Monitoring is set up
- [ ] Security hardening is complete
- [ ] Performance testing is done
- [ ] Error handling is implemented

---

## 🆘 **Support & Maintenance**

### Regular Maintenance Tasks
- Weekly: Check logs and performance metrics
- Monthly: Review backup integrity
- Quarterly: Update dependencies and security patches
- Annually: Review and update SSL certificates

### Emergency Procedures
1. **Application Down**: Restart PM2 process
2. **Database Issues**: Check connection and restart if needed
3. **High Load**: Scale PM2 instances or server resources
4. **Security Breach**: Immediately revoke access and investigate

---

*This guide ensures a robust, secure, and scalable production deployment of the Smart Placement Management System.*