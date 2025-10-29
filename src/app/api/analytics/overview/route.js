import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma/index.js';
import { verifyToken } from '../../../../lib/auth/jwt.js';
import { USER_ROLES, APPLICATION_STATUS } from '../../../../types/index.js';

export async function GET(request) {
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

    // Get basic counts
    const [
      totalStudents,
      totalCompanies,
      totalApplications,
      selectedApplications
    ] = await Promise.all([
      prisma.student.count(),
      prisma.company.count(),
      prisma.application.count(),
      prisma.application.count({
        where: { status: APPLICATION_STATUS.SELECTED }
      })
    ]);

    // Get placement rate
    const placementRate = totalStudents > 0 ? (selectedApplications / totalStudents * 100) : 0;

    // Get applications by status
    const applicationsByStatus = await prisma.application.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    // Get top companies by applications
    const topCompanies = await prisma.application.groupBy({
      by: ['companyId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    });

    // Get company details for top companies
    const topCompaniesWithDetails = await Promise.all(
      topCompanies.map(async (item) => {
        const company = await prisma.company.findUnique({
          where: { id: item.companyId },
          select: { name: true, ctc: true, category: true }
        });
        return {
          ...company,
          applicationCount: item._count.id
        };
      })
    );

    // Get applications by company category
    const applicationsByCategory = await prisma.application.findMany({
      include: {
        company: {
          select: { category: true }
        }
      }
    });

    const categoryStats = applicationsByCategory.reduce((acc, app) => {
      const category = app.company.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category]++;
      return acc;
    }, {});

    // Get monthly application trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyApplications = await prisma.application.findMany({
      where: {
        appliedAt: {
          gte: sixMonthsAgo
        }
      },
      select: {
        appliedAt: true,
        status: true
      }
    });

    // Group by month
    const monthlyStats = {};
    monthlyApplications.forEach(app => {
      const monthKey = app.appliedAt.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          total: 0,
          selected: 0
        };
      }
      monthlyStats[monthKey].total++;
      if (app.status === APPLICATION_STATUS.SELECTED) {
        monthlyStats[monthKey].selected++;
      }
    });

    // Get department-wise statistics
    const departmentStats = await prisma.student.groupBy({
      by: ['department'],
      _count: {
        id: true
      }
    });

    // Get selected students by department
    const selectedByDepartment = await prisma.application.findMany({
      where: { status: APPLICATION_STATUS.SELECTED },
      include: {
        student: {
          select: { department: true }
        }
      }
    });

    const departmentPlacements = selectedByDepartment.reduce((acc, app) => {
      const dept = app.student.department;
      if (!acc[dept]) {
        acc[dept] = 0;
      }
      acc[dept]++;
      return acc;
    }, {});

    // Combine department stats
    const departmentAnalytics = departmentStats.map(dept => ({
      department: dept.department,
      totalStudents: dept._count.id,
      placed: departmentPlacements[dept.department] || 0,
      placementRate: dept._count.id > 0 ? ((departmentPlacements[dept.department] || 0) / dept._count.id * 100) : 0
    }));

    // Get CGPA distribution of placed students
    const placedStudents = await prisma.application.findMany({
      where: { status: APPLICATION_STATUS.SELECTED },
      include: {
        student: {
          select: { cgpa: true }
        }
      }
    });

    const cgpaDistribution = {
      '9.5+': 0,
      '8.5-9.5': 0,
      '7.5-8.5': 0,
      '6.5-7.5': 0,
      'Below 6.5': 0
    };

    placedStudents.forEach(app => {
      const cgpa = app.student.cgpa;
      if (cgpa >= 9.5) cgpaDistribution['9.5+']++;
      else if (cgpa >= 8.5) cgpaDistribution['8.5-9.5']++;
      else if (cgpa >= 7.5) cgpaDistribution['7.5-8.5']++;
      else if (cgpa >= 6.5) cgpaDistribution['6.5-7.5']++;
      else cgpaDistribution['Below 6.5']++;
    });

    // Get package distribution
    const packageStats = await prisma.application.findMany({
      where: { status: APPLICATION_STATUS.SELECTED },
      include: {
        company: {
          select: { ctc: true }
        }
      }
    });

    const packageDistribution = {
      '15+ LPA': 0,
      '10-15 LPA': 0,
      '7-10 LPA': 0,
      '5-7 LPA': 0,
      'Below 5 LPA': 0
    };

    packageStats.forEach(app => {
      const ctc = app.company.ctc;
      if (ctc >= 15) packageDistribution['15+ LPA']++;
      else if (ctc >= 10) packageDistribution['10-15 LPA']++;
      else if (ctc >= 7) packageDistribution['7-10 LPA']++;
      else if (ctc >= 5) packageDistribution['5-7 LPA']++;
      else packageDistribution['Below 5 LPA']++;
    });

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalStudents,
          totalCompanies,
          totalApplications,
          selectedApplications,
          placementRate: Math.round(placementRate * 100) / 100
        },
        applicationsByStatus: applicationsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {}),
        topCompanies: topCompaniesWithDetails,
        categoryStats,
        monthlyStats,
        departmentAnalytics,
        cgpaDistribution,
        packageDistribution
      }
    });

  } catch (error) {
    console.error('Analytics overview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}