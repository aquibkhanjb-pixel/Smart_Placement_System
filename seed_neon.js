/**
 * Seed Neon PostgreSQL database with initial test data
 */

const { PrismaClient } = require('./src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Neon PostgreSQL database...\n');

  try {
    // Hash password for all users
    const hashedPassword = await bcrypt.hash('student123', 10);
    const coordinatorPassword = await bcrypt.hash('rghqvgrh', 10);

    // 1. Create Coordinator User
    console.log('📝 Creating coordinator user...');
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
    console.log(`✅ Coordinator created: ${coordinatorUser.email}`);

    // Create coordinator profile
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
    console.log(`✅ Coordinator profile created\n`);

    // 2. Create Student Users
    const students = [
      {
        email: 'alice.smith@test.com',
        firstName: 'Alice',
        lastName: 'Smith',
        rollNumber: 'CS2024001',
        department: 'CSE',
        graduationYear: 2024,
        cgpa: 9.2,
        demerits: 0
      },
      {
        email: 'bob.johnson@test.com',
        firstName: 'Bob',
        lastName: 'Johnson',
        rollNumber: 'IT2024002',
        department: 'IT',
        graduationYear: 2024,
        cgpa: 8.5,
        demerits: 2
      },
      {
        email: 'charlie.brown@test.com',
        firstName: 'Charlie',
        lastName: 'Brown',
        rollNumber: 'ECE2024003',
        department: 'ECE',
        graduationYear: 2024,
        cgpa: 8.8,
        demerits: 0
      },
      {
        email: 'david.wilson@test.com',
        firstName: 'David',
        lastName: 'Wilson',
        rollNumber: 'CSE2024004',
        department: 'CSE',
        graduationYear: 2024,
        cgpa: 7.5,
        demerits: 4
      }
    ];

    console.log('📝 Creating student users...');
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

      console.log(`✅ ${studentData.firstName} ${studentData.lastName} (${studentData.email})`);
    }

    console.log(`\n✅ Created ${students.length} students\n`);

    // 3. Create Sample Companies
    console.log('📝 Creating sample companies...');
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
        registrationDeadline: new Date('2024-12-31'),
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
        registrationDeadline: new Date('2024-12-31'),
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
        registrationDeadline: new Date('2024-12-31'),
        interviewDate: new Date('2025-01-25')
      }
    ];

    for (const companyData of companies) {
      await prisma.company.upsert({
        where: { name: companyData.name },
        update: {},
        create: companyData
      });
      console.log(`✅ ${companyData.name}`);
    }

    console.log(`\n✅ Created ${companies.length} companies\n`);

    console.log('🎉 Database seeded successfully!\n');
    console.log('📋 Test Credentials:');
    console.log('   Coordinator:');
    console.log('   - Email: coordinator@test.com');
    console.log('   - Password: rghqvgrh\n');
    console.log('   Students (all have password: student123):');
    console.log('   - alice.smith@test.com (CSE, CGPA: 9.2, No demerits)');
    console.log('   - bob.johnson@test.com (IT, CGPA: 8.5, 2 demerits)');
    console.log('   - charlie.brown@test.com (ECE, CGPA: 8.8, No demerits)');
    console.log('   - david.wilson@test.com (CSE, CGPA: 7.5, 4 demerits)\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
