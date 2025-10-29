import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma/index.js';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    console.log('Starting database seed...');

    // Hash passwords
    const hashedPassword = await bcrypt.hash('student123', 10);
    const coordinatorPassword = await bcrypt.hash('rghqvgrh', 10);

    // 1. Create Coordinator
    const coordinatorUser = await prisma.user.upsert({
      where: { email: 'coordinator@test.com' },
      update: {},
      create: {
        email: 'coordinator@test.com',
        password: coordinatorPassword,
        role: 'COORDINATOR',
        firstName: 'Admin',
        lastName: 'Coordinator',
        isActive: true
      }
    });

    await prisma.coordinator.upsert({
      where: { userId: coordinatorUser.id },
      update: {},
      create: {
        userId: coordinatorUser.id,
        department: 'Placement Cell',
        designation: 'Placement Officer',
        phoneNumber: '1234567890',
        officeLocation: 'Admin Block'
      }
    });

    // 2. Create Students
    const students = [
      { email: 'alice.smith@test.com', firstName: 'Alice', lastName: 'Smith', rollNumber: 'CS2024001', department: 'CSE', graduationYear: 2024, cgpa: 9.2, demerits: 0 },
      { email: 'bob.johnson@test.com', firstName: 'Bob', lastName: 'Johnson', rollNumber: 'IT2024002', department: 'IT', graduationYear: 2024, cgpa: 8.7, demerits: 2 },
      { email: 'charlie.brown@test.com', firstName: 'Charlie', lastName: 'Brown', rollNumber: 'ECE2024003', department: 'ECE', graduationYear: 2024, cgpa: 8.8, demerits: 0 },
      { email: 'david.wilson@test.com', firstName: 'David', lastName: 'Wilson', rollNumber: 'CS2024004', department: 'CSE', graduationYear: 2024, cgpa: 7.8, demerits: 4 },
      { email: 'emma.davis@test.com', firstName: 'Emma', lastName: 'Davis', rollNumber: 'IT2024005', department: 'IT', graduationYear: 2024, cgpa: 9.0, demerits: 0 },
      { email: 'carol.brown@test.com', firstName: 'Carol', lastName: 'Brown', rollNumber: 'ECE2024006', department: 'ECE', graduationYear: 2024, cgpa: 8.9, demerits: 0 }
    ];

    for (const studentData of students) {
      const user = await prisma.user.upsert({
        where: { email: studentData.email },
        update: {},
        create: {
          email: studentData.email,
          password: hashedPassword,
          role: 'STUDENT',
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          isActive: true
        }
      });

      await prisma.student.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          rollNumber: studentData.rollNumber,
          department: studentData.department,
          graduationYear: studentData.graduationYear,
          cgpa: studentData.cgpa,
          demerits: studentData.demerits,
          skills: JSON.stringify([]),
          resumeUrls: JSON.stringify([])
        }
      });
    }

    // 3. Create Companies
    const companies = [
      {
        name: 'Google India',
        description: 'Leading technology company - Software Engineer position',
        ctc: 18.0,
        category: 'ELITE',
        location: 'Bangalore',
        website: 'https://careers.google.com',
        minCgpa: 8.0,
        maxDemerits: 2,
        allowedDepartments: JSON.stringify(['CSE', 'IT', 'ECE']),
        isActive: true,
        registrationOpen: true,
        registrationDeadline: new Date('2025-12-31'),
        interviewDate: new Date('2025-01-15')
      },
      {
        name: 'Microsoft India',
        description: 'Global technology leader - SDE position',
        ctc: 16.5,
        category: 'SUPER_DREAM',
        location: 'Hyderabad',
        website: 'https://careers.microsoft.com',
        minCgpa: 7.5,
        maxDemerits: 3,
        allowedDepartments: JSON.stringify(['CSE', 'IT']),
        isActive: true,
        registrationOpen: true,
        registrationDeadline: new Date('2025-12-31'),
        interviewDate: new Date('2025-01-20')
      },
      {
        name: 'Amazon',
        description: 'E-commerce and cloud computing - Software Development Engineer',
        ctc: 15.0,
        category: 'DREAM',
        location: 'Chennai',
        website: 'https://amazon.jobs',
        minCgpa: 7.0,
        maxDemerits: 2,
        allowedDepartments: JSON.stringify(['CSE', 'IT', 'ECE']),
        isActive: true,
        registrationOpen: true,
        registrationDeadline: new Date('2025-12-31'),
        interviewDate: new Date('2025-01-25')
      }
    ];

    for (const companyData of companies) {
      await prisma.company.upsert({
        where: { name: companyData.name },
        update: {},
        create: companyData
      });
    }

    // Count final results
    const userCount = await prisma.user.count();
    const studentCount = await prisma.student.count();
    const companyCount = await prisma.company.count();

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      counts: {
        users: userCount,
        students: studentCount,
        companies: companyCount
      },
      credentials: {
        coordinator: {
          email: 'coordinator@test.com',
          password: 'rghqvgrh'
        },
        students: students.map(s => ({
          email: s.email,
          password: 'student123'
        }))
      }
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
