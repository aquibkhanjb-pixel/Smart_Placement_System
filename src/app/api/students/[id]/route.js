import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma/index.js';
import { verifyToken } from '../../../../lib/auth/jwt.js';
import { AuditLogger } from '../../../../lib/audit/index.js';

// GET /api/students/[id] - Get specific student
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }
        },
        applications: {
          include: {
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
          orderBy: { appliedAt: 'desc' }
        }
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ student });

  } catch (error) {
    console.error('Get student error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/students/[id] - Update student
export async function PATCH(request, { params }) {
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

    const { id } = params;
    const updates = await request.json();

    const allowedUpdates = [
      'cgpa',
      'demerits',
      'currentOffer',
      'department',
      'skills',
      'resumeUrls'
    ];

    const studentUpdates = {};
    const userUpdates = {};

    // Separate student and user updates
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        studentUpdates[key] = updates[key];
      } else if (['firstName', 'lastName', 'email'].includes(key)) {
        userUpdates[key] = updates[key];
      }
    });

    // Get the current student data for audit logging
    const currentStudent = await prisma.student.findUnique({
      where: { id },
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

    if (!currentStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Update in transaction
    const updatedStudent = await prisma.$transaction(async (tx) => {
      // Update user if needed
      if (Object.keys(userUpdates).length > 0) {
        await tx.user.update({
          where: { id: currentStudent.userId },
          data: userUpdates
        });
      }

      // Update student
      return await tx.student.update({
        where: { id },
        data: studentUpdates,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              isActive: true
            }
          }
        }
      });
    });

    // Log demerit changes for audit trail
    if (studentUpdates.demerits !== undefined && currentStudent.demerits !== studentUpdates.demerits) {
      AuditLogger.log({
        userId: decoded.userId,
        action: 'UPDATE_DEMERITS',
        entityType: 'STUDENT',
        entityId: id,
        oldValues: { demerits: currentStudent.demerits },
        newValues: { demerits: studentUpdates.demerits },
        metadata: {
          studentName: `${currentStudent.user.firstName} ${currentStudent.user.lastName}`,
          reason: updates.demeritReason || 'No reason provided'
        }
      }).catch(console.error);
    }

    return NextResponse.json({
      message: 'Student updated successfully',
      student: updatedStudent
    });

  } catch (error) {
    console.error('Update student error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/students/[id] - Delete student
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await prisma.student.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Student deleted successfully'
    });

  } catch (error) {
    console.error('Delete student error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}