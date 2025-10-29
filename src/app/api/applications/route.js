import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma/index.js';
import { EligibilityEngine } from '../../../lib/eligibility/index.js';
import { APPLICATION_STATUS } from '../../../types/index.js';
import { verifyToken } from '../../../lib/auth/jwt.js';
import { emailService } from '../../../lib/email/index.js';

const eligibilityEngine = new EligibilityEngine();

// GET /api/applications - List applications
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (studentId) where.studentId = studentId;
    if (companyId) where.companyId = companyId;
    if (status && Object.values(APPLICATION_STATUS).includes(status)) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          student: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          company: {
            select: {
              id: true,
              name: true,
              ctc: true,
              category: true,
              location: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { appliedAt: 'desc' }
      }),
      prisma.application.count({ where })
    ]);

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/applications - Create new application
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

    const { companyId, resumeId } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    if (!resumeId) {
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }

    // Get user and ensure they're a student
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { student: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.student) {
      return NextResponse.json({ error: 'Only students can apply' }, { status: 403 });
    }

    const studentId = user.student.id;

    // Check if application already exists
    const existingApplication = await prisma.application.findUnique({
      where: {
        studentId_companyId: {
          studentId,
          companyId
        }
      }
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Application already exists for this company' },
        { status: 409 }
      );
    }

    // Verify the resume belongs to the student
    const studentResumes = user.student.resumeUrls ? JSON.parse(user.student.resumeUrls) : [];
    const selectedResume = studentResumes.find(r => r.id === resumeId);

    if (!selectedResume) {
      return NextResponse.json(
        { error: 'Resume not found or does not belong to student' },
        { status: 404 }
      );
    }

    // Get company data for eligibility check
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check eligibility
    const eligibilityResult = eligibilityEngine.checkStudentEligibility(user.student, company);

    if (!eligibilityResult.isEligible) {
      return NextResponse.json({
        error: 'Student is not eligible for this company',
        reasons: eligibilityResult.reasons
      }, { status: 400 });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        studentId,
        companyId,
        status: APPLICATION_STATUS.APPLIED,
        resumeId: selectedResume.id,
        resumeUrl: selectedResume.url,
        resumeName: selectedResume.name
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        company: {
          select: {
            name: true,
            ctc: true,
            category: true
          }
        }
      }
    });

    // Send email notification (don't await to avoid blocking the response)
    emailService.sendApplicationSubmitted({
      studentEmail: user.email,
      studentName: `${user.firstName} ${user.lastName}`,
      companyName: company.name,
      applicationId: application.id
    }).catch(error => {
      console.error('Failed to send application email:', error);
    });

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      application
    }, { status: 201 });

  } catch (error) {
    console.error('Create application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}