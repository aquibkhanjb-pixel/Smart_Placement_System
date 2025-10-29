import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma/index.js';
import { verifyToken } from '../../../../lib/auth/jwt.js';
import { emailService } from '../../../../lib/email/index.js';
import { USER_ROLES } from '../../../../types/index.js';

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

    // Get user and ensure they're a coordinator
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (user?.role !== USER_ROLES.COORDINATOR) {
      return NextResponse.json({ error: 'Only coordinators can send status updates' }, { status: 403 });
    }

    const { applicationId, newStatus } = await request.json();

    if (!applicationId || !newStatus) {
      return NextResponse.json(
        { error: 'Application ID and new status are required' },
        { status: 400 }
      );
    }

    // Get application with student and company details
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
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
            name: true
          }
        }
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Update application status
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: newStatus,
        ...(newStatus === 'SELECTED' && { selectedAt: new Date() }),
        ...(newStatus === 'REJECTED' && { rejectedAt: new Date() })
      }
    });

    // Send email notification
    const emailResult = await emailService.sendApplicationStatusUpdate({
      studentEmail: application.student.user.email,
      studentName: `${application.student.user.firstName} ${application.student.user.lastName}`,
      companyName: application.company.name,
      newStatus,
      applicationId: application.id
    });

    return NextResponse.json({
      success: true,
      message: 'Status updated and notification sent',
      emailResult
    });

  } catch (error) {
    console.error('Application status notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}