/**
 * Verify database data and test login credentials
 */

const { PrismaClient } = require('./src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function verify() {
  console.log('Verifying database data...\n');

  try {
    // Check users
    const users = await prisma.user.findMany({
      include: {
        student: true,
        coordinator: true
      }
    });

    console.log(`Total Users: ${users.length}\n`);

    for (const user of users) {
      console.log(`- ${user.email} (${user.role})`);

      // Test password for students
      if (user.role === 'STUDENT') {
        const isValid = await bcrypt.compare('student123', user.password);
        console.log(`  Password 'student123' valid: ${isValid}`);
      }

      // Test password for coordinator
      if (user.role === 'COORDINATOR') {
        const isValid = await bcrypt.compare('rghqvgrh', user.password);
        console.log(`  Password 'rghqvgrh' valid: ${isValid}`);
      }

      if (user.student) {
        console.log(`  Student: ${user.student.rollNumber} | CGPA: ${user.student.cgpa} | Demerits: ${user.student.demerits}`);
      }

      if (user.coordinator) {
        console.log(`  Coordinator: ${user.coordinator.department}`);
      }

      console.log('');
    }

    // Check companies
    const companies = await prisma.company.findMany();
    console.log(`Total Companies: ${companies.length}\n`);

    for (const company of companies) {
      console.log(`- ${company.name}`);
      console.log(`  CTC: ${company.ctc} LPA | Category: ${company.category}`);
      console.log(`  Min CGPA: ${company.minCgpa} | Max Demerits: ${company.maxDemerits}`);
      console.log('');
    }

    console.log('Verification complete!');

  } catch (error) {
    console.error('Verification failed:', error);
    throw error;
  }
}

verify()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
