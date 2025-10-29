/**
 * Migrate data from local SQLite to Neon PostgreSQL
 * Run this script to populate your production database with initial data
 */

const { PrismaClient } = require('./src/generated/prisma');

// Source: SQLite (local dev.db)
const sourcePrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

// Target: PostgreSQL (Neon)
const targetPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function migrate() {
  try {
    console.log('🚀 Starting migration from SQLite to PostgreSQL...\n');

    // 1. Migrate Users
    console.log('📥 Fetching users from SQLite...');
    const users = await sourcePrisma.user.findMany({
      include: {
        student: true,
        coordinator: true
      }
    });
    console.log(`✅ Found ${users.length} users\n`);

    console.log('📤 Migrating users to PostgreSQL...');
    for (const user of users) {
      const { student, coordinator, createdUsers, auditLogs, ...userData } = user;

      await targetPrisma.user.upsert({
        where: { email: userData.email },
        update: userData,
        create: userData
      });
      console.log(`  ✓ ${userData.email} (${userData.role})`);
    }
    console.log(`✅ Migrated ${users.length} users\n`);

    // 2. Migrate Students
    console.log('📥 Fetching students from SQLite...');
    const students = await sourcePrisma.student.findMany();
    console.log(`✅ Found ${students.length} students\n`);

    console.log('📤 Migrating students to PostgreSQL...');
    for (const student of students) {
      const { applications, ...studentData } = student;

      await targetPrisma.student.upsert({
        where: { userId: studentData.userId },
        update: studentData,
        create: studentData
      });
      console.log(`  ✓ ${studentData.rollNumber}`);
    }
    console.log(`✅ Migrated ${students.length} students\n`);

    // 3. Migrate Coordinators
    console.log('📥 Fetching coordinators from SQLite...');
    const coordinators = await sourcePrisma.coordinator.findMany();
    console.log(`✅ Found ${coordinators.length} coordinators\n`);

    if (coordinators.length > 0) {
      console.log('📤 Migrating coordinators to PostgreSQL...');
      for (const coordinator of coordinators) {
        const { auditLogs, ...coordinatorData } = coordinator;

        await targetPrisma.coordinator.upsert({
          where: { userId: coordinatorData.userId },
          update: coordinatorData,
          create: coordinatorData
        });
        console.log(`  ✓ ${coordinatorData.department}`);
      }
      console.log(`✅ Migrated ${coordinators.length} coordinators\n`);
    }

    // 4. Migrate Companies
    console.log('📥 Fetching companies from SQLite...');
    const companies = await sourcePrisma.company.findMany();
    console.log(`✅ Found ${companies.length} companies\n`);

    if (companies.length > 0) {
      console.log('📤 Migrating companies to PostgreSQL...');
      for (const company of companies) {
        const { applications, ...companyData } = company;

        await targetPrisma.company.upsert({
          where: { id: companyData.id },
          update: companyData,
          create: companyData
        });
        console.log(`  ✓ ${companyData.name}`);
      }
      console.log(`✅ Migrated ${companies.length} companies\n`);
    }

    // 5. Migrate Applications
    console.log('📥 Fetching applications from SQLite...');
    const applications = await sourcePrisma.application.findMany();
    console.log(`✅ Found ${applications.length} applications\n`);

    if (applications.length > 0) {
      console.log('📤 Migrating applications to PostgreSQL...');
      for (const application of applications) {
        await targetPrisma.application.upsert({
          where: { id: application.id },
          update: application,
          create: application
        });
      }
      console.log(`✅ Migrated ${applications.length} applications\n`);
    }

    // 6. Migrate Audit Logs
    console.log('📥 Fetching audit logs from SQLite...');
    const auditLogs = await sourcePrisma.auditLog.findMany();
    console.log(`✅ Found ${auditLogs.length} audit logs\n`);

    if (auditLogs.length > 0) {
      console.log('📤 Migrating audit logs to PostgreSQL...');
      for (const log of auditLogs) {
        await targetPrisma.auditLog.create({
          data: log
        });
      }
      console.log(`✅ Migrated ${auditLogs.length} audit logs\n`);
    }

    console.log('🎉 Migration completed successfully!\n');
    console.log('Summary:');
    console.log(`  ✓ ${users.length} users`);
    console.log(`  ✓ ${students.length} students`);
    console.log(`  ✓ ${coordinators.length} coordinators`);
    console.log(`  ✓ ${companies.length} companies`);
    console.log(`  ✓ ${applications.length} applications`);
    console.log(`  ✓ ${auditLogs.length} audit logs`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
  }
}

migrate()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
