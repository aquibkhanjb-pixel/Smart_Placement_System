import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma/index.js';
import { verifyToken } from '../../../../lib/auth/jwt.js';
import { USER_ROLES } from '../../../../types/index.js';
import bcrypt from 'bcryptjs';

// Helper function to generate random password
function generatePassword(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to parse CSV
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parsing (handles quoted values)
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    // Create object from headers and values
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    row._rowNumber = i + 1;
    data.push(row);
  }

  return data;
}

export async function POST(request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user and ensure they're a coordinator
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (user?.role !== USER_ROLES.COORDINATOR) {
      return NextResponse.json({ error: 'Only coordinators can import students' }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();
    const csvFile = formData.get('csvFile');

    if (!csvFile) {
      return NextResponse.json({ error: 'No CSV file provided' }, { status: 400 });
    }

    // Read and parse CSV
    const csvText = await csvFile.text();
    const students = parseCSV(csvText);

    const results = {
      total: students.length,
      successful: 0,
      failed: 0,
      successfulStudents: [],
      errors: []
    };

    const requiredFields = ['firstName', 'lastName', 'email', 'rollNumber', 'department', 'graduationYear', 'cgpa'];
    const validDepartments = ['CSE', 'IT', 'ECE', 'MECH', 'CIVIL', 'EEE', 'CHEM', 'BT'];

    for (const studentData of students) {
      try {
        // Validate required fields
        for (const field of requiredFields) {
          if (!studentData[field] || studentData[field].trim() === '') {
            throw new Error(`Missing required field: ${field}`);
          }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(studentData.email)) {
          throw new Error('Invalid email format');
        }

        // Validate department
        if (!validDepartments.includes(studentData.department.toUpperCase())) {
          throw new Error(`Invalid department: ${studentData.department}`);
        }

        // Validate CGPA
        const cgpa = parseFloat(studentData.cgpa);
        if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
          throw new Error('CGPA must be between 0 and 10');
        }

        // Validate graduation year
        const gradYear = parseInt(studentData.graduationYear);
        const currentYear = new Date().getFullYear();
        if (isNaN(gradYear) || gradYear < currentYear || gradYear > currentYear + 10) {
          throw new Error('Invalid graduation year');
        }

        // Process optional fields
        const demerits = studentData.demerits ? parseInt(studentData.demerits) || 0 : 0;
        const currentOffer = studentData.currentOffer ? parseFloat(studentData.currentOffer) || null : null;

        // Process skills
        let skillsArray = [];
        if (studentData.skills && studentData.skills.trim()) {
          skillsArray = studentData.skills
            .replace(/"/g, '')
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0);
        }

        // Generate temporary password
        const tempPassword = generatePassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Check for existing user
        const existingUser = await prisma.user.findUnique({
          where: { email: studentData.email.toLowerCase() }
        });

        if (existingUser) {
          throw new Error('Email already exists');
        }

        // Check for existing roll number
        const existingStudent = await prisma.student.findUnique({
          where: { rollNumber: studentData.rollNumber.toUpperCase() }
        });

        if (existingStudent) {
          throw new Error('Roll number already exists');
        }

        // Create user
        const newUser = await prisma.user.create({
          data: {
            email: studentData.email.toLowerCase(),
            password: hashedPassword,
            role: 'STUDENT',
            firstName: studentData.firstName.trim(),
            lastName: studentData.lastName.trim(),
            isActive: true,
            createdById: user.id
          }
        });

        // Create student profile
        await prisma.student.create({
          data: {
            userId: newUser.id,
            rollNumber: studentData.rollNumber.toUpperCase(),
            cgpa: cgpa,
            demerits: demerits,
            currentOffer: currentOffer,
            department: studentData.department.toUpperCase(),
            graduationYear: gradYear,
            skills: JSON.stringify(skillsArray),
            resumeUrls: JSON.stringify([])
          }
        });

        results.successful++;
        results.successfulStudents.push({
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          email: studentData.email,
          rollNumber: studentData.rollNumber.toUpperCase(),
          tempPassword
        });

      } catch (error) {
        results.failed++;
        results.errors.push({
          row: studentData._rowNumber,
          message: error.message,
          data: studentData
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${results.successful} successful, ${results.failed} failed`,
      ...results
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import students' },
      { status: 500 }
    );
  }
}