# Smart Placement Management System - Testing Guide

## Prerequisites

1. **Start the Application**
   ```bash
   npm run dev
   ```
   - Open http://localhost:3000 in your browser
   - Ensure the server is running (you should see the Next.js ready message)

2. **Database Status**
   - SQLite database is already set up with sample data
   - Test coordinator: `coordinator@test.com` (password: `rghqvgrh`)
   - Test student: `student@test.com` (password: `vXJCVztk`)

## 🔐 Authentication Testing

### Test 1: Login as Coordinator
1. Go to http://localhost:3000
2. Click "Sign In"
3. Enter credentials:
   - Email: `coordinator@test.com`
   - Password: `rghqvgrh`
4. **Expected**: Redirect to coordinator dashboard with system statistics

### Test 2: Login as Student
1. Logout if logged in
2. Login with student credentials:
   - Email: `student@test.com`
   - Password: `vXJCVztk`
3. **Expected**: Redirect to student dashboard with personal stats

### Test 3: Registration (Coordinator Only)
1. Login as coordinator
2. Click "Add User" in sidebar OR go to `/auth/register`
3. Create a new student:
   ```
   Email: newstudent@test.com
   First Name: New
   Last Name: Student
   Role: Student
   Roll Number: CS2024002
   Department: CSE
   Graduation Year: 2024
   CGPA: 9.0
   ```
4. **Expected**: Success message with temporary password
5. **Verify**: Login with new credentials

## 🏢 Company Management Testing

### Test 4: View Companies (Any Role)
1. Login as any user
2. Navigate to "Companies" in sidebar
3. **Expected**:
   - List of existing companies
   - Company details (name, CTC, category, location)
   - Eligibility criteria visible

### Test 5: Create Company (Coordinator Only)
1. Login as coordinator
2. Go to Companies → "Add New Company"
3. Fill form:
   ```
   Company Name: Tech Innovators
   Category: Elite (18+ LPA)
   Description: Leading technology company
   CTC: 25.0
   Min CGPA: 8.0
   Max Demerits: 2
   Location: Hyderabad
   Allowed Departments: CSE, IT, ECE (comma separated)
   ```
4. **Expected**: Company created successfully
5. **Verify**: Company appears in companies list

### Test 6: Edit Company (Coordinator Only)
1. Login as coordinator
2. Go to Companies list
3. Click "Edit" on any company
4. Modify details (e.g., change CTC or location)
5. **Expected**: Changes saved successfully
6. **Verify**: Updated details reflect in company list

### Test 7: Activate/Deactivate Company (Coordinator Only)
1. In companies list, click "Deactivate" on an active company
2. **Expected**: Status changes to "Inactive"
3. Click "Activate" to revert
4. **Expected**: Status changes back to "Active"

## 👤 Student Profile Testing

### Test 8: View Student Profile
1. Login as student
2. Navigate to "Profile" in sidebar
3. **Expected**:
   - Personal information displayed
   - Academic details (CGPA, department, etc.)
   - Current statistics (demerits, category jump attempts)

### Test 9: Update Student Profile
1. In profile page, modify:
   - CGPA (e.g., change to 8.8)
   - Skills (add: "React, Node.js, Python")
   - Current Offer (if any)
2. Click "Update Profile"
3. **Expected**: Success message
4. **Verify**: Refresh page to see updated information

### Test 10: Change Password
1. In profile page, scroll to "Change Password" section
2. Fill form:
   ```
   Current Password: [your current password]
   New Password: newpass123
   Confirm New Password: newpass123
   ```
3. Click "Change Password"
4. **Expected**: Success message
5. **Verify**: Logout and login with new password

## ✅ Eligibility Testing

### Test 11: Check Eligibility (Student Only)
1. Login as student
2. Navigate to "Eligibility Check" in sidebar
3. **Expected**:
   - List of all active companies
   - Eligibility status for each (Eligible/Not Eligible)
   - Detailed reasons for ineligibility
   - "Apply Now" button for eligible companies

### Test 12: Eligibility Rules Verification
1. Check eligibility for different companies
2. **Verify these rules are enforced**:
   - CGPA requirement (student CGPA ≥ company min CGPA)
   - Department matching (student dept in allowed departments)
   - Demerits limit (student demerits ≤ company max demerits)
   - **Expected**: Accurate eligibility calculations

### Test 13: Apply to Company
1. In eligibility page, find an eligible company
2. Click "Apply Now"
3. **Expected**:
   - Success message
   - Company status changes to "Already Applied"
   - Apply button disappears

## 📝 Application Management Testing

### Test 14: View Student Applications
1. Login as student
2. Navigate to "Applications" in sidebar
3. **Expected**:
   - List of all applications submitted
   - Application status (Applied, Shortlisted, Selected, Rejected)
   - Company details for each application
   - Application summary statistics

### Test 15: Withdraw Application (Student)
1. In applications page, find an application with "Applied" status
2. Click "Withdraw"
3. Confirm withdrawal
4. **Expected**: Application removed from list
5. **Verify**: Company becomes available for application again

### Test 16: Manage Applications (Coordinator)
1. Login as coordinator
2. Go to "Applications" page
3. **Expected**:
   - All applications from all students
   - Student details for each application
   - Ability to update status and add notes

## 📊 Dashboard Testing

### Test 17: Student Dashboard
1. Login as student
2. Go to main dashboard
3. **Expected Real Data**:
   - Total applications count
   - Eligible companies count
   - Recent applications list
   - Quick action links work

### Test 18: Coordinator Dashboard
1. Login as coordinator
2. Go to main dashboard
3. **Expected Real Data**:
   - Total students count
   - Active companies count
   - Total applications count
   - Successful placements count

## 🔄 End-to-End Workflow Testing

### Test 19: Complete Student Journey
1. **As Coordinator**:
   - Create a new student account
   - Create a new company with specific eligibility criteria
2. **As Student**:
   - Login with new account
   - Update profile information
   - Check eligibility for companies
   - Apply to eligible company
   - View application status
3. **As Coordinator**:
   - View all applications
   - Update application status to "Selected"
4. **Verify**: All steps complete successfully

### Test 20: Business Rules Testing
1. **Test Offer Jump Policy**:
   - Set student current offer to 8 LPA
   - Try applying to 10 LPA company
   - **Expected**: Should be rejected (need +5 LPA minimum)
2. **Test Department Restrictions**:
   - Create student with "Mechanical" department
   - Create company allowing only "CSE, IT"
   - **Expected**: Student should be ineligible
3. **Test CGPA Requirements**:
   - Set company min CGPA to 9.0
   - Test with student having 8.5 CGPA
   - **Expected**: Student should be ineligible

## 📱 UI/UX Testing

### Test 21: Navigation Testing
1. Test all sidebar links work correctly
2. Verify role-based menu items (coordinators see different options)
3. Check breadcrumbs and page titles
4. **Expected**: Smooth navigation, no broken links

### Test 22: Responsive Design
1. Test on different screen sizes
2. Check mobile responsiveness
3. Verify forms work on smaller screens
4. **Expected**: UI adapts to different screen sizes

### Test 23: Error Handling
1. **Test Form Validation**:
   - Submit forms with missing required fields
   - Enter invalid email formats
   - Enter CGPA > 10 or < 0
2. **Test API Errors**:
   - Try accessing pages without login
   - Test with expired tokens
3. **Expected**: Appropriate error messages displayed

## 🔧 Technical Testing

### Test 24: API Endpoints
Use browser developer tools or curl:

```bash
# Health Check
curl http://localhost:3000/api/health

# Companies List
curl http://localhost:3000/api/companies \
  -H "Authorization: Bearer [your-token]"

# Applications List
curl http://localhost:3000/api/applications \
  -H "Authorization: Bearer [your-token]"
```

### Test 25: Database Verification
1. Check if data persists after browser refresh
2. Verify relational data integrity
3. Test with multiple users simultaneously
4. **Expected**: Data consistency maintained

## 🚨 Security Testing

### Test 26: Authentication Protection
1. Try accessing protected routes without login
2. Try accessing coordinator routes as student
3. Try accessing student data from different student account
4. **Expected**: Proper access control enforced

### Test 27: Data Validation
1. Test SQL injection attempts in forms
2. Test XSS attempts in text fields
3. Test file upload vulnerabilities (if applicable)
4. **Expected**: All malicious inputs properly sanitized

## 📊 Performance Testing

### Test 28: Load Testing
1. Create multiple companies and applications
2. Test page load times with larger datasets
3. Check for memory leaks during extended use
4. **Expected**: Reasonable performance maintained

## ✅ Checklist Summary

- [ ] Authentication (login/register/logout)
- [ ] Company management (CRUD operations)
- [ ] Student profile management
- [ ] Eligibility checking with business rules
- [ ] Application submission and management
- [ ] Dashboard data accuracy
- [ ] Role-based access control
- [ ] Form validation and error handling
- [ ] Responsive design
- [ ] API functionality
- [ ] Database persistence
- [ ] Security measures

## 🐛 Common Issues & Solutions

### Issue: Login Fails
- **Solution**: Check if you're using the correct temporary passwords
- **Verify**: Database contains user records

### Issue: Companies Not Loading
- **Solution**: Check if you're logged in and have proper permissions
- **Verify**: API returns data in browser network tab

### Issue: Eligibility Not Updating
- **Solution**: Refresh the page or check if student profile is complete
- **Verify**: Student has all required fields filled

### Issue: Applications Not Submitting
- **Solution**: Ensure student is eligible and hasn't already applied
- **Verify**: Check eligibility status first

## 📞 Support

If you encounter any issues:
1. Check browser console for JavaScript errors
2. Check network tab for API call failures
3. Verify database contains expected data
4. Restart the development server if needed

---

**Note**: This system implements complex business rules for college placement management. Each feature has been thoroughly tested with real data and should work as expected when following this guide.