import { PrismaClient } from '../src/generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function addSampleData() {
  console.log('🌱 Adding sample data to database...');

  try {
    // Add more students
    const studentsData = [
      {
        email: 'alice.smith@test.com',
        firstName: 'Alice',
        lastName: 'Smith',
        rollNumber: 'CS2024003',
        department: 'CSE',
        graduationYear: 2024,
        cgpa: 9.2,
        demerits: 0,
        skills: JSON.stringify(['React', 'Node.js', 'Python', 'Machine Learning'])
      },
      {
        email: 'bob.johnson@test.com',
        firstName: 'Bob',
        lastName: 'Johnson',
        rollNumber: 'IT2024004',
        department: 'IT',
        graduationYear: 2024,
        cgpa: 8.7,
        demerits: 2,
        skills: JSON.stringify(['Java', 'Spring Boot', 'MySQL', 'Angular'])
      },
      {
        email: 'carol.brown@test.com',
        firstName: 'Carol',
        lastName: 'Brown',
        rollNumber: 'ECE2024005',
        department: 'ECE',
        graduationYear: 2024,
        cgpa: 8.9,
        demerits: 0,
        skills: JSON.stringify(['VLSI Design', 'Embedded Systems', 'C++', 'MATLAB'])
      },
      {
        email: 'david.wilson@test.com',
        firstName: 'David',
        lastName: 'Wilson',
        rollNumber: 'CS2024006',
        department: 'CSE',
        graduationYear: 2024,
        cgpa: 7.8,
        demerits: 4,
        skills: JSON.stringify(['JavaScript', 'Python', 'Docker', 'AWS'])
      },
      {
        email: 'emma.davis@test.com',
        firstName: 'Emma',
        lastName: 'Davis',
        rollNumber: 'IT2024007',
        department: 'IT',
        graduationYear: 2024,
        cgpa: 9.0,
        demerits: 0,
        skills: JSON.stringify(['React Native', 'Flutter', 'Firebase', 'MongoDB'])
      },
      {
        email: 'frank.miller@test.com',
        firstName: 'Frank',
        lastName: 'Miller',
        rollNumber: 'MECH2024008',
        department: 'MECH',
        graduationYear: 2024,
        cgpa: 8.3,
        demerits: 1,
        skills: JSON.stringify(['AutoCAD', 'SolidWorks', 'ANSYS', 'Manufacturing'])
      }
    ];

    const hashedPassword = await bcrypt.hash('student123', 10);

    for (const studentData of studentsData) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: studentData.email }
      });

      if (existingUser) {
        console.log(`⏭️  Skipped existing student: ${studentData.firstName} ${studentData.lastName} (${studentData.email})`);
        continue;
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          email: studentData.email,
          password: hashedPassword,
          role: 'STUDENT',
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          isActive: true
        }
      });

      // Create student profile
      await prisma.student.create({
        data: {
          userId: user.id,
          rollNumber: studentData.rollNumber,
          cgpa: studentData.cgpa,
          demerits: studentData.demerits,
          department: studentData.department,
          graduationYear: studentData.graduationYear,
          skills: studentData.skills,
          resumeUrls: JSON.stringify([])
        }
      });

      console.log(`✅ Created student: ${studentData.firstName} ${studentData.lastName} (${studentData.email})`);
    }

    // Add more companies
    const companiesData = [
      {
        name: 'TechCorp Solutions',
        ctc: 15.5,
        category: 'SUPER_DREAM',
        description: 'Leading technology solutions provider specializing in enterprise software.',
        minCgpa: 8.0,
        maxDemerits: 2,
        allowedDepartments: JSON.stringify(['CSE', 'IT']),
        location: 'Bangalore',
        isActive: true
      },
      {
        name: 'InnovateTech',
        ctc: 22.0,
        category: 'ELITE',
        description: 'Cutting-edge AI and machine learning company.',
        minCgpa: 8.5,
        maxDemerits: 0,
        allowedDepartments: JSON.stringify(['CSE', 'IT', 'ECE']),
        location: 'Hyderabad',
        isActive: true
      },
      {
        name: 'DataSoft Industries',
        ctc: 7.5,
        category: 'DREAM',
        description: 'Data analytics and business intelligence solutions.',
        minCgpa: 7.0,
        maxDemerits: 3,
        allowedDepartments: JSON.stringify(['CSE', 'IT', 'ECE', 'MECH']),
        location: 'Pune',
        isActive: true
      },
      {
        name: 'Global Systems Inc',
        ctc: 12.0,
        category: 'SUPER_DREAM',
        description: 'Multinational IT services and consulting company.',
        minCgpa: 7.5,
        maxDemerits: 2,
        allowedDepartments: JSON.stringify(['CSE', 'IT', 'ECE']),
        location: 'Chennai',
        isActive: true
      },
      {
        name: 'NextGen Technologies',
        ctc: 18.5,
        category: 'ELITE',
        description: 'Blockchain and cryptocurrency technology leader.',
        minCgpa: 8.2,
        maxDemerits: 1,
        allowedDepartments: JSON.stringify(['CSE', 'IT']),
        location: 'Mumbai',
        isActive: true
      },
      {
        name: 'AutoMech Corp',
        ctc: 9.5,
        category: 'DREAM',
        description: 'Automotive manufacturing and design company.',
        minCgpa: 7.0,
        maxDemerits: 2,
        allowedDepartments: JSON.stringify(['MECH', 'ECE']),
        location: 'Delhi',
        isActive: true
      }
    ];

    for (const companyData of companiesData) {
      // Check if company already exists
      const existingCompany = await prisma.company.findFirst({
        where: { name: companyData.name }
      });

      if (existingCompany) {
        console.log(`⏭️  Skipped existing company: ${companyData.name}`);
        continue;
      }

      await prisma.company.create({
        data: companyData
      });
      console.log(`✅ Created company: ${companyData.name} (${companyData.ctc} LPA)`);
    }

    // Create some sample applications to demonstrate the system
    const students = await prisma.student.findMany({
      include: { user: true }
    });
    const companies = await prisma.company.findMany();

    // Create a few sample applications
    if (students.length > 0 && companies.length > 0) {
      const sampleApplications = [
        { studentIndex: 0, companyIndex: 0, status: 'APPLIED' },
        { studentIndex: 1, companyIndex: 1, status: 'SHORTLISTED' },
        { studentIndex: 2, companyIndex: 2, status: 'SELECTED' },
        { studentIndex: 3, companyIndex: 0, status: 'REJECTED' },
        { studentIndex: 4, companyIndex: 3, status: 'APPLIED' }
      ];

      for (const appData of sampleApplications) {
        if (students[appData.studentIndex] && companies[appData.companyIndex]) {
          await prisma.application.create({
            data: {
              studentId: students[appData.studentIndex].id,
              companyId: companies[appData.companyIndex].id,
              status: appData.status,
              appliedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
            }
          });
          console.log(`✅ Created application: ${students[appData.studentIndex].user.firstName} → ${companies[appData.companyIndex].name} (${appData.status})`);
        }
      }
    }

    console.log('🎉 Sample data added successfully!');
    console.log('\n📊 Database Summary:');

    const totalUsers = await prisma.user.count();
    const totalStudents = await prisma.student.count();
    const totalCompanies = await prisma.company.count();
    const totalApplications = await prisma.application.count();

    console.log(`👥 Total Users: ${totalUsers}`);
    console.log(`🎓 Total Students: ${totalStudents}`);
    console.log(`🏢 Total Companies: ${totalCompanies}`);
    console.log(`📝 Total Applications: ${totalApplications}`);

    console.log('\n🔑 Test Accounts (Password: student123):');
    const allStudents = await prisma.student.findMany({
      include: { user: true }
    });

    allStudents.forEach(student => {
      console.log(`📧 ${student.user.email} - ${student.user.firstName} ${student.user.lastName} (${student.department}, CGPA: ${student.cgpa})`);
    });

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleData();