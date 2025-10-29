# 🚀 Production Readiness Checklist

## ⚠️ **CRITICAL: Complete Before Production Deployment**

### 🔒 **Security Configuration**

- [ ] **Replace JWT Secret**: Generate a secure 64-character JWT secret
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] **Database Security**: Change default database credentials
- [ ] **Email Credentials**: Update with production email account
- [ ] **Cloudinary Production**: Use separate production Cloudinary account
- [ ] **Domain Configuration**: Update NEXT_PUBLIC_APP_URL with your domain
- [ ] **Remove Development Data**: Clear test data from database

### 📧 **Email Configuration**

- [ ] **SMTP Settings**: Configure production email service
- [ ] **Email Templates**: Verify all email templates work
- [ ] **Sender Verification**: Verify domain/email with email provider
- [ ] **Test Email Flow**: Send test emails for all scenarios

### ☁️ **Cloudinary Production Setup**

- [ ] **Production Account**: Create separate Cloudinary account for production
- [ ] **Folder Structure**: Set up production folder structure
- [ ] **API Limits**: Verify upload limits for your plan
- [ ] **Security Settings**: Configure proper access controls

### 🗄️ **Database Production Setup**

- [ ] **PostgreSQL Setup**: Install and configure PostgreSQL server
- [ ] **Database Creation**: Create production database
- [ ] **User Permissions**: Set up database user with minimal required permissions
- [ ] **Backup Strategy**: Configure automated backups
- [ ] **Connection Pooling**: Configure connection limits

### 🌐 **Infrastructure Setup**

- [ ] **Server Setup**: Provision production server (minimum 4GB RAM)
- [ ] **Domain & DNS**: Configure domain and DNS settings
- [ ] **SSL Certificate**: Install SSL certificate (Let's Encrypt recommended)
- [ ] **Reverse Proxy**: Configure Nginx/Apache reverse proxy
- [ ] **Firewall**: Configure firewall rules
- [ ] **PM2 Installation**: Install PM2 for process management

### 📁 **File System Preparation**

- [ ] **Upload Directories**: Create necessary upload directories
- [ ] **File Permissions**: Set proper file permissions
- [ ] **Backup Storage**: Configure file backup strategy

## 🔧 **Configuration Updates Required**

### 1. Environment Variables (.env.production)

```bash
# CRITICAL: Replace these values
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
DATABASE_URL="postgresql://user:password@localhost:5432/placement_db"
JWT_SECRET="YOUR_64_CHARACTER_SECURE_SECRET"

# Email Configuration
SMTP_USER="your-production-email@domain.com"
SMTP_PASS="your-app-password"
SMTP_FROM_EMAIL="noreply@yourdomain.com"
COMPANY_NAME="Your Institution Name"

# Cloudinary Production
CLOUDINARY_CLOUD_NAME="your-production-cloud"
CLOUDINARY_API_KEY="your-production-key"
CLOUDINARY_API_SECRET="your-production-secret"
```

### 2. Database Migration Commands

```bash
# Generate secure secret first
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update .env.production with the generated secret
# Then run:
npx prisma generate
npx prisma migrate deploy
```

### 3. Security Headers Added

✅ **Implemented**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
✅ **Implemented**: Referrer-Policy, Permissions-Policy
✅ **Implemented**: JWT token validation and secure expiry

## 🚨 **Current Security Issues**

### ❌ **CRITICAL FIXES NEEDED**

1. **Weak JWT Secret**: Currently using weak development secret
2. **Development Database**: Using localhost PostgreSQL with default settings
3. **Test Email Credentials**: Using development email credentials
4. **Development Cloudinary**: Using development Cloudinary account
5. **No Rate Limiting**: Need to implement API rate limiting
6. **File Upload Security**: Local file storage instead of cloud

### ✅ **ALREADY SECURE**

1. **Password Hashing**: Using bcryptjs for secure password hashing
2. **Authentication**: JWT-based authentication with proper validation
3. **Authorization**: Role-based access control (Student/Coordinator)
4. **Input Validation**: Proper validation in API endpoints
5. **Audit Logging**: Complete audit trail system

## 📋 **Deployment Steps**

### 1. Pre-deployment Preparation

```bash
# 1. Clone repository on production server
git clone your-repository-url
cd smart-placement

# 2. Copy and configure environment
cp .env.production .env
# Edit .env with your production values

# 3. Install dependencies
npm ci --only=production

# 4. Generate secure secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Update JWT_SECRET in .env
```

### 2. Database Setup

```bash
# 1. Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# 2. Create database and user
sudo -u postgres psql
CREATE DATABASE placement_db;
CREATE USER placement_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE placement_db TO placement_user;

# 3. Run migrations
npx prisma migrate deploy
```

### 3. Application Deployment

```bash
# 1. Build application
npm run build:production

# 2. Install PM2
npm install -g pm2

# 3. Start application
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 4. Reverse Proxy & SSL

```bash
# 1. Install Nginx
sudo apt install nginx

# 2. Configure reverse proxy (see PRODUCTION_SETUP.md)
# 3. Install SSL certificate
sudo certbot --nginx -d yourdomain.com
```

## ⚡ **Performance Optimizations**

### ✅ **Already Implemented**

- Next.js production build optimization
- Prisma query optimization
- Image optimization for Cloudinary
- Gzip compression enabled
- Static file caching

### 📈 **Additional Recommendations**

- Set up CDN for static assets
- Configure Redis for session storage
- Implement database indexing
- Set up monitoring (New Relic, DataDog)

## 🔍 **Testing Checklist**

Before going live, test:

- [ ] **User Registration**: Coordinator can create student accounts
- [ ] **Authentication**: Login/logout works properly
- [ ] **Resume Upload**: Students can upload resumes to Cloudinary
- [ ] **Application Flow**: Students can apply to companies
- [ ] **Email Notifications**: All email types are sent correctly
- [ ] **File Downloads**: Resume downloads work properly
- [ ] **Admin Functions**: Coordinator dashboard works correctly
- [ ] **Database Persistence**: Data persists across server restarts
- [ ] **Error Handling**: Application handles errors gracefully
- [ ] **Security**: No sensitive data exposed in client

## 🆘 **Emergency Contacts & Support**

### **Critical Issues Hotfix**

```bash
# If application crashes
pm2 restart smart-placement

# Check logs
pm2 logs smart-placement

# If database issues
sudo systemctl status postgresql
sudo systemctl restart postgresql

# If Nginx issues
sudo nginx -t
sudo systemctl reload nginx
```

### **Monitoring Commands**

```bash
# System monitoring
pm2 monit
htop
df -h

# Application logs
pm2 logs smart-placement --lines 100

# Database monitoring
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

## 🎯 **Success Criteria**

Your application is ready for production when:

✅ All checklist items are completed
✅ Secure secrets are generated and configured
✅ Production database is set up and migrated
✅ SSL certificate is installed and working
✅ All features tested and working
✅ Monitoring and logging are configured
✅ Backup strategy is implemented

---

## 🚀 **Quick Production Deploy Command**

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run automated deployment
./deploy.sh
```

**The deploy script will validate your configuration and guide you through any missing steps.**