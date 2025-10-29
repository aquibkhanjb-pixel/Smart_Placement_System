# ☁️ Cloudinary Setup Guide

## Smart Placement Management System - File Storage Integration

This guide will help you set up Cloudinary for professional file storage and management.

---

## 🎯 **What Cloudinary Provides**

### **File Types Supported:**
1. **📄 Student Resumes** - PDF, DOC, DOCX (up to 5MB)
2. **📋 Job Descriptions** - PDF, DOC, DOCX (up to 10MB)
3. **👤 Profile Photos** - JPG, PNG, WebP (up to 2MB)
4. **🏢 Company Logos** - JPG, PNG, SVG, WebP (up to 1MB)

### **Benefits:**
- ✅ **Professional CDN** - Fast global file delivery
- ✅ **Automatic Optimization** - Compressed files for better performance
- ✅ **Secure Storage** - Protected file access with authentication
- ✅ **Backup & Redundancy** - Never lose files
- ✅ **Format Conversion** - Automatic format optimization
- ✅ **Scalability** - Handle thousands of files

---

## 🚀 **Setup Instructions**

### **Step 1: Create Cloudinary Account**

1. **Visit:** https://cloudinary.com/
2. **Click "Sign Up"**
3. **Choose "Free Plan"** (25GB storage + 25GB bandwidth/month)
4. **Fill in your details:**
   - Company: VIT College
   - Use case: File Storage
   - Role: Developer
5. **Verify your email**

### **Step 2: Get Your Credentials**

After login, go to your **Dashboard**:

1. **Find these 3 values:**
   ```
   Cloud Name: your-cloud-name
   API Key: 123456789012345
   API Secret: your-api-secret-key
   ```

2. **Copy each value carefully**

### **Step 3: Update Environment Variables**

Add your credentials to `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="your-api-secret-key"
CLOUDINARY_FOLDER="placement-system"
```

### **Step 4: Test Configuration**

Check if Cloudinary is working:

```bash
curl -X GET http://localhost:3004/api/upload/cloudinary
```

Should return:
```json
{
  "configured": true,
  "cloudName": "your-cloud-name",
  "folder": "placement-system"
}
```

---

## 🧪 **Testing File Uploads**

### **Test Resume Upload**

```bash
# Create a test file upload (replace with actual PDF path)
curl -X POST http://localhost:3004/api/upload/cloudinary \
  -F "file=@/path/to/resume.pdf" \
  -F "type=resume" \
  -F "fileName=test-resume"
```

### **Expected Response**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "url": "https://res.cloudinary.com/your-cloud/...",
    "publicId": "placement-system/resumes/resume_123...",
    "originalName": "resume.pdf",
    "format": "pdf",
    "size": 245678,
    "type": "resume"
  }
}
```

---

## 📁 **File Organization**

Files will be organized in Cloudinary as:

```
placement-system/
├── resumes/
│   ├── resume_1234567890_john_doe.pdf
│   └── resume_1234567891_jane_smith.pdf
├── job-descriptions/
│   ├── jobdesc_1234567892_google_sde.pdf
│   └── jobdesc_1234567893_microsoft_pm.pdf
├── profiles/
│   ├── profile_1234567894_student1.jpg
│   └── profile_1234567895_student2.png
└── company-logos/
    ├── logo_1234567896_google.png
    └── logo_1234567897_microsoft.svg
```

---

## 🔧 **Integration with Your System**

### **1. Resume Uploads**
- Students can upload multiple resume versions
- Automatic PDF optimization
- Secure access URLs
- Old versions kept for backup

### **2. Company Job Descriptions**
- Coordinators upload job description PDFs
- Fast global delivery via CDN
- Automatic format optimization

### **3. Profile Photos**
- Students and coordinators can add profile photos
- Automatic resizing (400x400px)
- Format optimization (WebP when supported)

### **4. Company Logos**
- Professional logo storage
- Automatic sizing (300x200px)
- Support for SVG, PNG, JPG

---

## 💰 **Pricing & Limits**

### **Free Tier (Perfect for Small/Medium Colleges):**
- ✅ **25GB Storage**
- ✅ **25GB Bandwidth/month**
- ✅ **Up to 1000 transformations/month**
- ✅ **Unlimited file uploads**

### **Estimated Usage:**
- **Resume (PDF)**: ~500KB each
- **Job Description**: ~1MB each
- **Profile Photo**: ~100KB each (after optimization)
- **Company Logo**: ~50KB each

**Example:** 1000 students + 100 companies = ~25GB total usage

### **Paid Plans (If Needed):**
- **Plus**: $89/month (100GB storage, 100GB bandwidth)
- **Advanced**: $224/month (Unlimited storage, 200GB bandwidth)

---

## 🔒 **Security Features**

### **Access Control:**
- Private file storage by default
- Signed URLs for secure access
- Time-limited download links
- User authentication required

### **File Validation:**
- File type restrictions
- Size limits per file type
- Virus scanning (paid plans)
- Content moderation available

---

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **1. "Cloudinary not configured"**
- **Solution**: Check all 3 environment variables are set
- **Verify**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

#### **2. "Upload failed"**
- **Check**: File size limits
- **Verify**: File format is supported
- **Test**: Internet connection

#### **3. "Invalid file type"**
- **Solution**: Only upload supported formats
- **Resume**: PDF, DOC, DOCX
- **Photos**: JPG, PNG, WebP

### **Debug Mode:**
Set `NODE_ENV=development` to see detailed upload logs.

---

## 📋 **Next Steps After Setup**

### **1. Replace Existing File Storage**
- Update resume upload forms to use Cloudinary
- Migrate existing files from `/public/uploads/`
- Update all file URLs to use Cloudinary

### **2. Enhanced Features**
- **Preview Generation**: Automatic PDF thumbnails
- **Download Tracking**: Monitor file access
- **Version Control**: Keep multiple resume versions
- **Bulk Operations**: Mass file management

### **3. Production Optimizations**
- **Custom Domain**: Use your own domain for files
- **CDN Setup**: Configure regional delivery
- **Backup Strategy**: Regular cloud backups
- **Monitoring**: File usage analytics

---

## ✅ **Setup Checklist**

- [ ] Cloudinary account created
- [ ] Free plan activated
- [ ] Credentials copied from dashboard
- [ ] Environment variables updated
- [ ] Configuration tested via API
- [ ] First file upload successful
- [ ] File organization confirmed
- [ ] Security settings reviewed

---

## 🎉 **Ready for Production**

Once configured, your Smart Placement Management System will have:
- ✅ **Professional file storage** with global CDN
- ✅ **Automatic optimization** for better performance
- ✅ **Secure access control** with authentication
- ✅ **Unlimited scalability** for growing file needs
- ✅ **Backup protection** against data loss

*Your file management is now enterprise-grade!* 🚀