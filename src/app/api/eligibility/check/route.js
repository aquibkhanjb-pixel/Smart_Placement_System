import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma/index.js';
import { EligibilityEngine } from '../../../../lib/eligibility/index.js';
import { verifyToken } from '../../../../lib/auth/jwt.js';

const eligibilityEngine = new EligibilityEngine();

// POST /api/eligibility/check - Check student eligibility for companies
export async function POST(request) {
  try {
    // Check for authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user and student ID from token
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { student: true },
    });

    if (!user?.student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const { companyIds } = await request.json();
    const studentId = user.student.id;

    // Get student data
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    let companies;

    if (companyIds && companyIds.length > 0) {
      // Check specific companies
      companies = await prisma.company.findMany({
        where: {
          id: { in: companyIds },
          isActive: true
        }
      });
    } else {
      // Check all active companies
      companies = await prisma.company.findMany({
        where: { isActive: true }
      });
    }

    // Check eligibility for each company
    const eligibilityResults = companies.map(company => {
      const eligibility = eligibilityEngine.checkStudentEligibility(student, company);

      return {
        companyId: company.id,
        companyName: company.name,
        ctc: company.ctc,
        category: company.category,
        isEligible: eligibility.isEligible,
        canApply: eligibility.canApply,
        reasons: eligibility.reasons,
        blockedCompanies: eligibility.blockedCompanies
      };
    });

    const summary = {
      totalCompanies: companies.length,
      eligibleCompanies: eligibilityResults.filter(r => r.isEligible && r.canApply).length,
      blockedCompanies: eligibilityResults.filter(r => !r.isEligible || !r.canApply).length
    };

    return NextResponse.json({
      student: {
        id: student.id,
        rollNumber: student.rollNumber,
        cgpa: student.cgpa,
        demerits: student.demerits,
        currentOffer: student.currentOffer,
        department: student.department
      },
      eligibilityResults,
      summary
    });

  } catch (error) {
    console.error('Eligibility check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/eligibility/check - Quick eligibility overview for authenticated student
export async function GET(request) {
  try {
    // Check for authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user and student ID from token
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { student: true },
    });

    if (!user?.student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const studentId = user.student.id;

    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const companies = await prisma.company.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        ctc: true,
        category: true,
        minCgpa: true,
        maxDemerits: true,
        allowedDepartments: true
      }
    });

    const bulkResults = eligibilityEngine.getBulkEligibility([student], companies);

    return NextResponse.json({
      student: {
        id: student.id,
        rollNumber: student.rollNumber,
        cgpa: student.cgpa,
        demerits: student.demerits,
        currentOffer: student.currentOffer
      },
      eligibility: bulkResults[0]
    });

  } catch (error) {
    console.error('Quick eligibility check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}