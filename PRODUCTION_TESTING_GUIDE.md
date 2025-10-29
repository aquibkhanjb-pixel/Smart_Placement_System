# Smart Placement System - Production Testing Guide

## Deployment URL
**Production URL:** https://smart-placement-system-eight.vercel.app

---

## Test Credentials

### Coordinator Account
```
Email: coordinator@test.com
Password: rghqvgrh
```

### Student Accounts (All passwords: student123)

#### High Performers (No Demerits)
```
1. alice.smith@test.com
   - Roll Number: CS2024003
   - Department: CSE
   - CGPA: 9.2
   - Demerits: 0
   - Status: Eligible for all companies

2. emma.davis@test.com
   - Roll Number: IT2024007
   - Department: IT
   - CGPA: 9.0
   - Demerits: 0
   - Status: Eligible for most companies

3. carol.brown@test.com
   - Roll Number: ECE2024005
   - Department: ECE
   - CGPA: 8.9
   - Demerits: 0
   - Status: Eligible for most companies

4. charlie.brown@test.com
   - Roll Number: ECE2024003
   - Department: ECE
   - CGPA: 8.8
   - Demerits: 0
   - Status: Eligible for most companies
```

#### Students with Demerits
```
5. bob.johnson@test.com
   - Roll Number: IT2024004
   - Department: IT
   - CGPA: 8.7
   - Demerits: 2
   - Status: Blocked from 1 company (can apply to 2nd company onwards)

6. david.wilson@test.com
   - Roll Number: CS2024006
   - Department: CSE
   - CGPA: 7.8
   - Demerits: 4
   - Status: Blocked from 3 companies (can apply to 4th company onwards)
```

---

## Available Companies in Database

### Elite Category (18+ LPA)
```
1. Google India
   - CTC: 18 LPA
   - Min CGPA: 8.0
   - Max Demerits: 2
   - Departments: CSE, IT, ECE
   - Status: Active, Registration Open

2. InnovateTech
   - CTC: 22 LPA
   - Min CGPA: 8.5
   - Max Demerits: 6
   - Status: Active

3. NextGen Technologies
   - CTC: 18.5 LPA
   - Min CGPA: 8.2
   - Max Demerits: 1
   - Status: Active
```

### Super Dream Category (12-18 LPA)
```
4. Microsoft India
   - CTC: 16.5 LPA
   - Min CGPA: 7.5
   - Max Demerits: 3
   - Departments: CSE, IT
   - Status: Active, Registration Open

5. TechCorp Solutions
   - CTC: 15.5 LPA
   - Min CGPA: 8.0
   - Max Demerits: 2
   - Status: Active

6. Test Company
   - CTC: 12.5 LPA
   - Min CGPA: 7.5
   - Max Demerits: 4
   - Status: Active

7. Global Systems Inc
   - CTC: 12 LPA
   - Min CGPA: 7.5
   - Max Demerits: 2
   - Status: Active
```

### Dream Category (8-12 LPA)
```
8. Amazon
   - CTC: 15 LPA
   - Min CGPA: 7.0
   - Max Demerits: 2
   - Departments: CSE, IT, ECE
   - Status: Active, Registration Open

9. AutoMech Corporation
   - CTC: 9.5 LPA
   - Min CGPA: 7.0
   - Max Demerits: 2
   - Status: Active

10. Computer Science Company
    - CTC: 8.5 LPA
    - Min CGPA: 7.0
    - Max Demerits: 6
    - Status: Active

11. DataSoft Industries
    - CTC: 7.5 LPA
    - Min CGPA: 7.0
    - Max Demerits: 3
    - Status: Active
```

---

## Complete Testing Workflow

### 1. STUDENT FEATURES TESTING

#### 1.1 Login and Dashboard
**Test with:** alice.smith@test.com / student123

**Steps:**
1. Navigate to production URL
2. Click "Sign In"
3. Enter credentials and login
4. Verify dashboard loads with:
   - Personal statistics (CGPA, Demerits, Department)
   - Application stats
   - Quick Actions section

**Expected Result:**
- Successful login
- Dashboard shows: Alice Smith, CS2024003, CGPA: 9.2, Demerits: 0

---

#### 1.2 Interview Preparation Integration
**Test with:** alice.smith@test.com (already logged in)

**Steps:**
1. On Student Dashboard, locate "Quick Actions" section
2. Find "Interview Preparation" button (blue gradient background)
3. Click the button

**Expected Result:**
- Opens Interview Intelligence System in new tab
- Shows companies list: Amazon (16 experiences), Google (11 experiences), etc.
- Can browse real interview experiences
- Original Smart Placement tab remains open

**Interview Intelligence Features to Test:**
- View company list with experience counts
- Click on a company (e.g., Amazon)
- Read interview experiences
- Filter by topics (if available)
- Navigate back to company list

---

#### 1.3 Company Browsing
**Test with:** alice.smith@test.com

**Steps:**
1. Go to "Companies" page from navigation
2. Browse available companies
3. Check eligibility indicators

**Expected Result:**
- See all 11 companies
- Green "Eligible" badge on companies Alice can apply to
- Should be eligible for: Google India, Microsoft India, Amazon, InnovateTech, etc.

---

#### 1.4 Eligibility Checking
**Test with:** alice.smith@test.com

**Steps:**
1. Click on "Google India" company
2. View company details
3. Check eligibility status

**Expected Result:**
- Eligibility: GREEN (Eligible)
- Reason: "Meets all eligibility criteria"
- Details shown:
  - CTC: 18 LPA
  - Min CGPA: 8.0 (Alice has 9.2)
  - Max Demerits: 2 (Alice has 0)
  - Allowed Departments: CSE, IT, ECE (Alice is CSE)

---

#### 1.5 Testing Demerit System
**Test with:** david.wilson@test.com / student123

**Steps:**
1. Logout alice.smith@test.com
2. Login as david.wilson@test.com
3. Go to Companies page
4. Try to check eligibility for companies

**Expected Result:**
- David has 4 demerits
- According to demerit rules (4 demerits = blocked from first 3 companies):
  - Should see "Not Eligible" for top companies
  - Reason: "You have 4 demerits. You are blocked from applying to the first 3 companies."
- Should be eligible for 4th company onwards

---

#### 1.6 Testing CGPA Restrictions
**Test with:** david.wilson@test.com

**Steps:**
1. Check eligibility for "InnovateTech" (requires CGPA 8.5)
2. David has CGPA 7.8

**Expected Result:**
- Eligibility: RED (Not Eligible)
- Reason: "Your CGPA (7.8) is below the minimum requirement (8.5)"

---

#### 1.7 Resume Management
**Test with:** alice.smith@test.com

**Steps:**
1. Go to "Resumes" page
2. Upload a test PDF resume
3. Manage resume versions

**Expected Result:**
- Can upload PDF/DOC files
- Files stored on Cloudinary
- Can view, download, and delete resumes
- Shows cloud icon for Cloudinary-hosted resumes

---

#### 1.8 Job Application
**Test with:** alice.smith@test.com

**Steps:**
1. Go to Companies page
2. Click on "Google India"
3. Select a resume (upload one if needed)
4. Click "Apply"

**Expected Result:**
- Application submitted successfully
- Status shown as "APPLIED"
- Can view application on Dashboard
- Application tracking page shows the application

---

#### 1.9 Profile Management
**Test with:** alice.smith@test.com

**Steps:**
1. Go to "Profile" page
2. View personal information
3. Update phone number or skills (if editable)

**Expected Result:**
- Shows complete profile: Name, Email, Roll Number, Department, CGPA, Demerits
- Can update allowed fields
- Changes saved successfully

---

### 2. COORDINATOR FEATURES TESTING

#### 2.1 Coordinator Login and Dashboard
**Test with:** coordinator@test.com / rghqvgrh

**Steps:**
1. Logout student account
2. Login as coordinator
3. View coordinator dashboard

**Expected Result:**
- Access to coordinator dashboard
- Shows statistics:
  - Total students: 11
  - Total companies: 11
  - Total applications
  - Placement statistics

---

#### 2.2 Student Management
**Test with:** coordinator@test.com

**Steps:**
1. Go to "Students" page
2. View student list
3. Search for "alice"
4. Filter by department (CSE)
5. Click on a student to view details

**Expected Result:**
- See all 11 students
- Search works correctly
- Filter shows only CSE students
- Student details page shows: Profile, Academic info, Applications, Demerits history

---

#### 2.3 Add New Student
**Test with:** coordinator@test.com

**Steps:**
1. Go to "Students" page
2. Click "Add Student"
3. Fill in form:
   - First Name: Test
   - Last Name: Student
   - Email: test.student@example.com
   - Roll Number: CSE2024999
   - Department: CSE
   - Graduation Year: 2024
   - CGPA: 8.0
4. Submit

**Expected Result:**
- Student created successfully
- Temporary password generated
- Password shown on screen (note it for testing)
- Can login with new credentials

---

#### 2.4 Bulk Student Import (CSV)
**Test with:** coordinator@test.com

**Steps:**
1. Go to "Students" > "Bulk Import"
2. Download CSV template
3. Add sample students to CSV:
   ```csv
   firstName,lastName,email,rollNumber,department,graduationYear,cgpa,demerits,skills,currentOffer
   John,Doe,john.doe@test.com,CS2024101,CSE,2024,8.5,0,"React,Node.js,Python",
   Jane,Smith,jane.smith@test.com,IT2024102,IT,2024,9.2,0,"Java,Spring Boot,MySQL",12.5
   ```
4. Upload CSV file

**Expected Result:**
- Shows import results summary
- Successful: 2 students created
- Failed: 0
- Shows temporary passwords for new students
- Students appear in student list

---

#### 2.5 Demerit Management
**Test with:** coordinator@test.com

**Steps:**
1. Go to "Students" > "Demerits"
2. Find "bob.johnson@test.com" (currently has 2 demerits)
3. Click "Assign Demerit"
4. Enter reason: "Late submission of documents"
5. Submit

**Expected Result:**
- Demerit count increases to 3
- Audit log created with timestamp, coordinator name, and reason
- Bob's eligibility changes (now blocked from first 2 companies instead of 1)

---

#### 2.6 Company Management
**Test with:** coordinator@test.com

**Steps:**
1. Go to "Companies" page
2. View list of 11 companies
3. Click "Add Company"
4. Fill in form:
   - Name: Apple India
   - CTC: 20 LPA
   - Category: ELITE
   - Min CGPA: 8.5
   - Max Demerits: 1
   - Allowed Departments: CSE, IT
   - Description: Leading technology company
5. Submit

**Expected Result:**
- Company created successfully
- Appears in company list
- Students can now see and apply to Apple India

---

#### 2.7 Edit Company
**Test with:** coordinator@test.com

**Steps:**
1. Go to Companies page
2. Click on "Test Company"
3. Click "Edit"
4. Change CTC from 12.5 to 13.0 LPA
5. Save

**Expected Result:**
- Company details updated
- New CTC reflected everywhere
- Students see updated information

---

#### 2.8 Application Oversight
**Test with:** coordinator@test.com

**Steps:**
1. Go to "Applications" page
2. View all student applications
3. Filter by company (e.g., Google India)
4. Click on an application
5. Change status from "APPLIED" to "SHORTLISTED"

**Expected Result:**
- See all applications from students
- Can filter by company, status, student
- Status update successful
- Student sees updated status on their dashboard

---

#### 2.9 Notifications System
**Test with:** coordinator@test.com

**Steps:**
1. Go to "Notifications" page
2. Select a company (e.g., Google India)
3. Compose notification:
   - Subject: "Interview Schedule for Google India"
   - Message: "Your interview is scheduled for Jan 15, 2025"
4. Send to all eligible students

**Expected Result:**
- Email sent to all students who applied to Google India
- (Note: Requires SMTP configuration to actually send emails)
- Success message shown

---

#### 2.10 Analytics Dashboard
**Test with:** coordinator@test.com

**Steps:**
1. Go to "Analytics" page
2. View comprehensive statistics

**Expected Result:**
- Department-wise placement stats
- Company-wise application distribution
- CGPA vs Package correlation chart
- Top performing students
- Eligibility distribution charts

---

### 3. CROSS-FEATURE TESTING

#### 3.1 Complete Placement Flow
**Full workflow:**

1. **Coordinator adds company:**
   - Login as coordinator@test.com
   - Add "Flipkart" company (CTC: 14 LPA, Min CGPA: 7.5, Max Demerits: 2)

2. **Student checks eligibility:**
   - Login as alice.smith@test.com
   - Browse companies, find Flipkart
   - Check eligibility (should be eligible)

3. **Student applies:**
   - Upload resume (if not done)
   - Select resume
   - Submit application to Flipkart

4. **Coordinator reviews application:**
   - Login as coordinator@test.com
   - Go to Applications
   - Find Alice's Flipkart application
   - Update status to "SHORTLISTED"

5. **Coordinator sends notification:**
   - Go to Notifications
   - Send interview schedule email to Alice

6. **Coordinator updates final status:**
   - Go to Applications
   - Update Alice's application to "SELECTED"
   - Set offer amount: 14 LPA

7. **Verify student offer:**
   - Login as alice.smith@test.com
   - Dashboard shows current offer: 14 LPA
   - Application status shows "SELECTED"

---

#### 3.2 Demerit Impact Testing
**Full workflow:**

1. **Initial state:**
   - Login as carol.brown@test.com (0 demerits)
   - Check eligible companies (should see all)

2. **Coordinator assigns demerits:**
   - Login as coordinator@test.com
   - Go to Demerits
   - Assign 2 demerits to carol.brown@test.com
   - Reason: "Missed placement training"

3. **Verify demerit impact:**
   - Login as carol.brown@test.com
   - Refresh dashboard (demerits now: 2)
   - Check companies
   - Should now be blocked from 1st company
   - Eligibility messages updated

4. **More demerits:**
   - Coordinator assigns 2 more demerits (total: 4)
   - Carol now blocked from first 3 companies

5. **Verify audit trail:**
   - Coordinator views Carol's demerit history
   - See both demerit entries with timestamps and reasons

---

#### 3.3 Multi-Student Application Scenario
**Test workflow:**

1. **Multiple students apply to same company:**
   - alice.smith@test.com applies to Google India
   - bob.johnson@test.com applies to Google India
   - emma.davis@test.com applies to Google India

2. **Coordinator reviews all:**
   - Go to Applications
   - Filter by "Google India"
   - See all 3 applications

3. **Coordinator updates statuses:**
   - Alice: SELECTED (offer: 18 LPA)
   - Bob: SHORTLISTED
   - Emma: APPLIED (no change)

4. **Verify individual dashboards:**
   - Each student sees their specific status
   - Alice's current offer updates to 18 LPA

---

### 4. EDGE CASES AND ERROR HANDLING

#### 4.1 Department Restriction
**Test:**
- Login as carol.brown@test.com (ECE student)
- Try to check eligibility for Microsoft India (only CSE, IT allowed)
- Expected: "Not Eligible - Your department (ECE) is not allowed"

#### 4.2 CGPA Below Minimum
**Test:**
- Login as david.wilson@test.com (CGPA: 7.8)
- Check eligibility for Google India (Min CGPA: 8.0)
- Expected: "Not Eligible - CGPA below minimum requirement"

#### 4.3 Demerits Blocking
**Test:**
- Login as david.wilson@test.com (4 demerits)
- Try to apply to 1st, 2nd, or 3rd company
- Expected: Blocked, cannot apply
- Try 4th company onwards: Should be able to apply

#### 4.4 Duplicate Application Prevention
**Test:**
- Login as alice.smith@test.com
- Apply to Google India
- Try to apply again to Google India
- Expected: Error message "Already applied to this company"

---

### 5. INTERVIEW INTELLIGENCE INTEGRATION

#### 5.1 Accessing Interview Prep from Student Dashboard
**Test with:** alice.smith@test.com

**Steps:**
1. Login to Smart Placement System
2. On dashboard, find "Interview Preparation" button
3. Click button

**Expected:**
- Opens https://interview-intelligence-frontend.vercel.app in new tab
- Shows list of 13 companies with interview data
- Can browse Amazon (16 experiences), Google (11 experiences), etc.

#### 5.2 Browsing Interview Experiences
**In Interview Intelligence tab:**

**Steps:**
1. Click on "Amazon" company card
2. View interview details
3. Read real interview questions
4. Navigate back to company list
5. Try Google, Cred, PhonePe

**Expected:**
- Each company shows:
  - Number of interview experiences
  - Real interview questions asked
  - Interview process details
  - Difficulty levels
  - Technical topics covered

#### 5.3 Workflow Integration
**Full integration test:**

1. Student browses companies in Smart Placement
2. Finds Google India, checks eligibility
3. Decides to prepare for interview
4. Clicks "Interview Preparation" button
5. Reads 11 Google interview experiences
6. Returns to Smart Placement tab
7. Applies to Google India with confidence

---

## Summary of Test Data

### Users
- 1 Coordinator
- 10 Students (6 with valid passwords for testing)

### Companies
- 11 Companies across 3 categories (Elite, Super Dream, Dream)
- CTC range: 7.5 LPA to 22 LPA

### Valid Login Credentials
**Working Student Accounts:**
- alice.smith@test.com / student123 (Best for positive testing)
- bob.johnson@test.com / student123 (Test with 2 demerits)
- charlie.brown@test.com / student123
- david.wilson@test.com / student123 (Test with 4 demerits)
- emma.davis@test.com / student123
- carol.brown@test.com / student123

**Coordinator:**
- coordinator@test.com / rghqvgrh

---

## Troubleshooting

### Cannot Login
- Double-check email and password (case-sensitive)
- Use credentials listed in "Valid Login Credentials" section above
- Clear browser cache and cookies
- Try incognito/private browsing mode

### Companies Not Showing
- Ensure you're logged in as a student
- Check if registrationOpen is true for the company
- Verify database has company data (run verify_database.js locally)

### Eligibility Issues
- Check student's CGPA, demerits, and department
- Compare against company requirements
- Demerits block companies sequentially (2 demerits = 1 block, 4 = 3 blocks, 6 = 5 blocks)

### Interview Preparation Button Not Working
- Verify NEXT_PUBLIC_INTERVIEW_PREP_URL is set in Vercel environment variables
- Check if button has blue gradient styling
- Ensure it opens in new tab (target="_blank")

---

## Feature Checklist

### Student Features
- [ ] Login with valid credentials
- [ ] View personal dashboard
- [ ] Access Interview Preparation (new integration)
- [ ] Browse available companies
- [ ] Check eligibility for specific companies
- [ ] Upload resume to Cloudinary
- [ ] Manage multiple resume versions
- [ ] Apply to eligible companies
- [ ] Track application status
- [ ] View profile information
- [ ] Update personal details

### Coordinator Features
- [ ] Login as coordinator
- [ ] View coordinator dashboard with stats
- [ ] View all students with search/filter
- [ ] Add individual student
- [ ] Bulk import students via CSV
- [ ] Assign demerits to students
- [ ] View demerit audit trail
- [ ] Add new company
- [ ] Edit existing company
- [ ] View all applications
- [ ] Update application statuses
- [ ] Send email notifications to students
- [ ] View analytics and reports

### Interview Intelligence Integration
- [ ] Interview Preparation button visible on student dashboard
- [ ] Button opens Interview Intelligence in new tab
- [ ] Can browse 13 companies with interview data
- [ ] Can read real interview experiences
- [ ] Original tab remains open for easy switching

### System Features
- [ ] JWT authentication working
- [ ] Role-based access control (Student vs Coordinator)
- [ ] Database persistence (Neon PostgreSQL)
- [ ] Eligibility engine with complex rules
- [ ] Demerit system with blocking logic
- [ ] Audit logging for administrative actions
- [ ] Resume upload to Cloudinary
- [ ] Email notifications (if SMTP configured)

---

## Next Steps After Testing

1. **If all features work:**
   - Document any bugs or issues found
   - Share with end users for UAT
   - Collect feedback for improvements

2. **If login issues persist:**
   - Check Vercel deployment logs for errors
   - Verify all environment variables are set
   - Check database connection is stable

3. **To add more data:**
   - Use coordinator account to add companies
   - Use bulk import to add students
   - Build up realistic test dataset

---

**Happy Testing!** If you encounter any issues, check the Troubleshooting section or review the Vercel deployment logs for error messages.
