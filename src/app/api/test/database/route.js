import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma/index.js';

export async function GET(request) {
  try {
    // Count users
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        firstName: true,
        lastName: true
      },
      take: 10
    });

    // Count companies
    const companyCount = await prisma.company.count();

    // Count students
    const studentCount = await prisma.student.count();

    // Check database connection
    const dbUrl = process.env.DATABASE_URL ?
      process.env.DATABASE_URL.split('@')[1] : 'Not set';

    return NextResponse.json({
      success: true,
      database: {
        url: dbUrl,
        connected: true
      },
      counts: {
        users: userCount,
        companies: companyCount,
        students: studentCount
      },
      sampleUsers: users
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      dbUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
    }, { status: 500 });
  }
}
