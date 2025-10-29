import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma/index.js';
import { verifyToken } from '../../../../lib/auth/jwt.js';
import { emailService } from '../../../../lib/email/index.js';
import { EligibilityEngine } from '../../../../lib/eligibility/index.js';
import { USER_ROLES } from '../../../../types/index.js';

const eligibilityEngine = new EligibilityEngine();

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
      return NextResponse.json({ error: 'Only coordinators can send company notifications' }, { status: 403 });
    }

    const { companyId, notifyEligibleOnly = true } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Get company details
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get all students
    const students = await prisma.student.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    let emailsSent = 0;
    let eligibleStudents = 0;
    const emailPromises = [];

    for (const student of students) {
      let shouldNotify = true;

      if (notifyEligibleOnly) {
        // Check if student is eligible for this company
        const eligibilityResult = eligibilityEngine.checkStudentEligibility(student, company);
        if (!eligibilityResult.isEligible) {
          shouldNotify = false;
        } else {
          eligibleStudents++;
        }
      }

      if (shouldNotify) {
        const emailPromise = emailService.sendNewCompanyNotification({
          studentEmail: student.user.email,
          studentName: `${student.user.firstName} ${student.user.lastName}`,
          companyName: company.name,
          companyCtc: company.ctc,
          companyCategory: company.category
        }).then(result => {
          if (result.success) {
            emailsSent++;
          }
          return result;
        }).catch(error => {
          console.error(`Failed to send email to ${student.user.email}:`, error);
          return { success: false, error: error.message };
        });

        emailPromises.push(emailPromise);
      }
    }

    // Wait for all emails to be sent
    const emailResults = await Promise.all(emailPromises);

    return NextResponse.json({
      success: true,
      message: `Notifications sent successfully`,
      stats: {
        totalStudents: students.length,
        eligibleStudents: notifyEligibleOnly ? eligibleStudents : students.length,
        emailsSent,
        notifyEligibleOnly
      },
      emailResults
    });

  } catch (error) {
    console.error('New company notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}