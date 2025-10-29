import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma/index.js';
import { hashPassword, generateTempPassword } from '../../../../lib/auth/index.js';
import { USER_ROLES } from '../../../../types/index.js';
import { sendWelcomeEmail } from '../../../../lib/email/index.js';

export async function POST(request) {
  try {
    const {
      email,
      firstName,
      lastName,
      role,
      // Student specific fields
      rollNumber,
      department,
      graduationYear,
      cgpa,
      demerits,
      skills,
      currentOffer,
      // Coordinator specific fields
      designation,
      phoneNumber,
      officeLocation
    } = await request.json();

    // Basic validation
    if (!email || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Required fields: email, firstName, lastName, role' },
        { status: 400 }
      );
    }

    if (!Object.values(USER_ROLES).includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Student specific validation
    if (role === USER_ROLES.STUDENT) {
      if (!rollNumber || !department || !graduationYear || cgpa === undefined) {
        return NextResponse.json(
          { error: 'Student requires: rollNumber, department, graduationYear, cgpa' },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Check if roll number exists (for students)
    if (role === USER_ROLES.STUDENT) {
      const existingStudent = await prisma.student.findUnique({
        where: { rollNumber }
      });

      if (existingStudent) {
        return NextResponse.json(
          { error: 'Student with this roll number already exists' },
          { status: 409 }
        );
      }
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    const hashedPassword = await hashPassword(tempPassword);

    // Create user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
          firstName,
          lastName
        }
      });

      // Create role-specific record
      if (role === USER_ROLES.STUDENT) {
        // Process skills array
        const skillsArray = Array.isArray(skills) ? skills :
          (skills ? skills.split(',').map(s => s.trim()).filter(s => s) : []);

        await tx.student.create({
          data: {
            userId: user.id,
            rollNumber,
            department,
            graduationYear: parseInt(graduationYear),
            cgpa: parseFloat(cgpa),
            demerits: demerits ? parseInt(demerits) : 0,
            currentOffer: currentOffer ? parseFloat(currentOffer) : null,
            skills: JSON.stringify(skillsArray),
            resumeUrls: '[]',
            phoneNumber: phoneNumber || null
          }
        });
      } else if (role === USER_ROLES.COORDINATOR) {
        await tx.coordinator.create({
          data: {
            userId: user.id,
            department: department || null,
            designation: designation || null,
            phoneNumber: phoneNumber || null,
            officeLocation: officeLocation || null
          }
        });
      }

      return user;
    });

    // Send welcome email for students
    if (role === USER_ROLES.STUDENT) {
      try {
        const studentData = {
          firstName,
          lastName,
          email,
          rollNumber,
          department,
          graduationYear
        };

        const emailResult = await sendWelcomeEmail(studentData, tempPassword);

        if (emailResult.success) {
          console.log('✅ Welcome email sent successfully to:', email);
        } else {
          console.warn('⚠️ Failed to send welcome email:', emailResult.message);
        }
      } catch (emailError) {
        console.error('❌ Email sending error:', emailError);
        // Don't fail user creation if email fails
      }
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: result.id,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        role: result.role
      },
      tempPassword, // In production, send via email instead
      emailSent: role === USER_ROLES.STUDENT ? 'Welcome email sent if configured' : false
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email or roll number already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}