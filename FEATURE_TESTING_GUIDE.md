# Feature Testing Guide - Smart Placement Management System

## 🚀 Quick Start
**URL**: http://localhost:3000

## 👥 Test Accounts (Password: `student123` for all students)

### Coordinator Account
- **Email**: `coordinator@test.com`
- **Password**: `rghqvgrh`

### Student Accounts
- **Test Student**: `student@test.com` / `vXJCVztk` (CSE, CGPA: 8.5)
- **Alice Smith**: `alice.smith@test.com` / `student123` (CSE, CGPA: 9.2)
- **Bob Johnson**: `bob.johnson@test.com` / `student123` (IT, CGPA: 8.7, 2 demerits)
- **Carol Brown**: `carol.brown@test.com` / `student123` (ECE, CGPA: 8.9)
- **David Wilson**: `david.wilson@test.com` / `student123` (CSE, CGPA: 7.8, 4 demerits)
- **Emma Davis**: `emma.davis@test.com` / `student123` (IT, CGPA: 9.0)
- **Frank Miller**: `frank.miller@test.com` / `student123` (MECH, CGPA: 8.3, 1 demerit)

---

## 📋 Testing Checklist

### ✅ 1. File Upload System (Resume Management)

#### Test as Student (e.g., alice.smith@test.com)
1. **Navigate to Resume Management**
   - Login → Sidebar → "Resumes" OR Dashboard → "Upload Resume" card

2. **Upload Resume**
   - Click "Select File" and choose a PDF/DOC/DOCX file
   - Enter a descriptive name (e.g., "Software Developer Resume")
   - Click "Upload Resume"
   - ✅ **Expected**: Success message, file appears in list

3. **Resume Management**
   - ✅ **View**: Click "View" to open resume in new tab
   - ✅ **Download**: Click "Download" to save file
   - ✅ **Delete**: Click "Delete" and confirm to remove

4. **File Validation Testing**
   - Try uploading a .txt file → ❌ Should fail with error
   - Try uploading a file > 5MB → ❌ Should fail with error
   - Upload multiple resumes → ✅ Should work

#### Test Resume in Application Process
1. **Apply to Company**
   - Go to "Companies" page
   - Click "Apply Now" on any active company
   - ✅ **Expected**: Modal shows with resume selection dropdown

2. **Resume Selection**
   - If no resumes uploaded → Shows "Upload Resume" button
   - If resumes exist → Dropdown lists all uploaded resumes
   - Select a resume and click "Submit Application"
   - ✅ **Expected**: Success message

---

### ✅ 2. Email Notification System

#### Test Application Notifications (Student)
1. **Submit Application**
   - Login as any student
   - Apply to a company with resume selected
   - ✅ **Check Console**: Should show email log in development mode
   - ✅ **Expected Email**: Application submitted confirmation

#### Test Status Update Notifications (Coordinator)
1. **Login as Coordinator** (`coordinator@test.com`)
2. **Navigate to Notifications**
   - Sidebar → "Notifications"
   - Scroll to "Application Status Updates" section

3. **Update Application Status**
   - Find an application with status "APPLIED"
   - Click "Shortlist" or "Reject"
   - ✅ **Check Console**: Should show email log
   - ✅ **Expected**: Status updated + email sent message

#### Test Company Notifications (Coordinator)
1. **Send Company Notifications**
   - In Notifications page → "New Company Notifications" section
   - Select a company from dropdown
   - Check/uncheck "Only notify eligible students"
   - Click "Send Company Notifications"
   - ✅ **Expected**: Success message with email count

---

### ✅ 3. Advanced Analytics Dashboard

#### Test as Coordinator
1. **Navigate to Analytics**
   - Login as coordinator → Sidebar → "Analytics"

2. **Overview Statistics**
   - ✅ **Check**: Total Students (should be 7)
   - ✅ **Check**: Total Companies (should be 8)
   - ✅ **Check**: Total Applications (should be 6+)
   - ✅ **Check**: Placement Rate calculation

3. **Visual Analytics**
   - ✅ **Applications by Status**: Pie chart with APPLIED, SHORTLISTED, etc.
   - ✅ **Company Categories**: Distribution of Elite, Super Dream, Dream
   - ✅ **Package Distribution**: Bar chart of salary ranges
   - ✅ **CGPA Distribution**: CGPA ranges of placed students

4. **Department Performance**
   - ✅ **Check**: Table showing each department's placement rate
   - ✅ **Verify**: Color coding (green >80%, yellow 60-80%, red <60%)

5. **Top Companies**
   - ✅ **Check**: List of companies by application count
   - ✅ **Verify**: Shows company name, package, category

6. **Key Insights**
   - ✅ **Check**: Automated performance insights
   - ✅ **Check**: Top performing department highlighted

---

### ✅ 4. Enhanced Application System

#### Test Eligibility Checking (Student)
1. **Check Eligibility**
   - Login as different students with varying CGPA/demerits
   - Navigate to "Companies" page
   - ✅ **Bob** (2 demerits): Should see "Apply Now" on eligible companies
   - ✅ **David** (4 demerits, low CGPA): May be blocked from some companies

2. **Resume Selection in Applications**
   - Upload multiple resumes with different names
   - Apply to company → Should show dropdown with all resumes
   - ✅ **Test**: Select different resumes for different applications

#### Test Application Management (Coordinator)
1. **View Applications**
   - Login as coordinator → "Applications" page
   - ✅ **Check**: Shows all applications with student and company details

2. **Status Management**
   - Use "Notifications" page for status updates
   - ✅ **Verify**: Status changes reflect in applications list

---

### ✅ 5. Company Management

#### Test Company CRUD (Coordinator)
1. **Create Company**
   - Navigate to "Companies" → "Add Company"
   - Fill all details including department restrictions
   - ✅ **Test**: Create companies with different categories

2. **Edit Company**
   - Click "Edit" on any company
   - Modify details and save
   - ✅ **Verify**: Changes reflected immediately

3. **Activate/Deactivate**
   - Click "Activate" or "Deactivate" buttons
   - ✅ **Check**: Students can only apply to active companies

---

### ✅ 6. User Management

#### Test Student Registration (Coordinator)
1. **Register New Student**
   - Sidebar → "Add User"
   - Fill student details
   - ✅ **Check**: Temporary password generated
   - ✅ **Test**: Login with new account and change password

---

### ✅ 7. Dashboard Features

#### Student Dashboard
1. **Real-time Stats**
   - ✅ **Applications Count**: Shows actual number
   - ✅ **Eligible Companies**: Updates based on profile
   - ✅ **Recent Applications**: Shows latest applications

#### Coordinator Dashboard
1. **System Overview**
   - ✅ **Live Counts**: Students, companies, applications
   - ✅ **Placement Stats**: Real-time placement numbers

---

## 🧪 Advanced Testing Scenarios

### Eligibility Engine Testing
1. **CGPA Testing**
   - Login as students with different CGPAs
   - Check which companies they can apply to
   - ✅ **Verify**: Follows CGPA requirements exactly

2. **Demerit System Testing**
   - **Bob** (2 demerits): Should be blocked from 1 company after applying
   - **David** (4 demerits): Should be blocked from 3 companies after applying

3. **Department Restrictions**
   - Login as **Frank** (MECH student)
   - ✅ **Check**: Can only apply to companies allowing MECH department

### File System Testing
1. **Multiple Resume Versions**
   - Upload 3-4 different resumes
   - Apply to different companies with different resumes
   - ✅ **Verify**: Each application tracks the specific resume used

2. **File Storage**
   - Check `public/uploads/resumes/` folder
   - ✅ **Verify**: Files are properly named and stored

---

## 🚨 Error Testing

### Expected Errors to Test
1. **File Upload Errors**
   - Upload non-PDF/DOC file → Should show error
   - Upload file > 5MB → Should show size error

2. **Application Errors**
   - Apply without uploading resume → Should prompt to upload
   - Apply to same company twice → Should show duplicate error

3. **Access Control**
   - Student trying to access coordinator features → Should be blocked
   - Invalid token → Should redirect to login

---

## 📧 Email Testing

### Development Mode
- All emails are logged to browser console
- Check browser console after each notification trigger
- ✅ **Look for**: "📧 EMAIL" logs with recipient and content

### Test Email Templates
1. **Application Submitted**: Student receives confirmation
2. **Status Updates**: Student receives shortlist/select/reject notifications
3. **New Company**: Students receive company announcements

---

## 🎯 Performance Testing

### Data Volume Testing
1. **Create Multiple Applications**
   - Use different student accounts
   - Apply to various companies
   - ✅ **Check**: Analytics update correctly

2. **Bulk Email Testing**
   - Send company notifications to all students
   - ✅ **Verify**: Performance with 7+ students

---

## ✅ Success Criteria

### All Features Working When:
- ✅ Resume upload/download/delete functions properly
- ✅ Email notifications appear in console logs
- ✅ Analytics show real, accurate data
- ✅ Application process includes resume selection
- ✅ Eligibility rules are enforced correctly
- ✅ Coordinator can manage all aspects of placement
- ✅ Students have smooth application experience

---

## 🐛 Troubleshooting

### Common Issues
1. **Module not found errors**: Clear cache and restart server
2. **Database errors**: Check Prisma schema and run migrations
3. **File upload issues**: Verify `public/uploads/resumes/` directory exists
4. **Email not sending**: Check console for development mode logs

### Quick Fixes
```bash
# Restart development server
npm run dev

# Reset database if needed
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate
```

---

## 🎉 Testing Complete!

When all tests pass, you have a **production-ready placement management system** with:
- ✅ Enterprise-level file management
- ✅ Automated email communication
- ✅ Business intelligence analytics
- ✅ Complete placement workflow automation

**Ready for real-world deployment!** 🚀