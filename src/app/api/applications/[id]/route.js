import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma/index.js';
import { APPLICATION_STATUS } from '../../../../types/index.js';

// GET /api/applications/[id] - Get application by ID
export async function GET(request, { params }) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: params.id },
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
            description: true,
            ctc: true,
            category: true,
            location: true,
            website: true
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

    return NextResponse.json(application);

  } catch (error) {
    console.error('Get application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/applications/[id] - Update application status (Coordinator only)
export async function PATCH(request, { params }) {
  try {
    const data = await request.json();

    // Validate status if provided
    if (data.status && !Object.values(APPLICATION_STATUS).includes(data.status)) {
      return NextResponse.json(
        { error: 'Invalid application status' },
        { status: 400 }
      );
    }

    // Process dates
    const updateData = { ...data };
    if (updateData.interviewDate !== undefined) {
      updateData.interviewDate = updateData.interviewDate
        ? new Date(updateData.interviewDate)
        : null;
    }
    if (updateData.selectedAt !== undefined) {
      updateData.selectedAt = updateData.selectedAt
        ? new Date(updateData.selectedAt)
        : null;
    }
    if (updateData.rejectedAt !== undefined) {
      updateData.rejectedAt = updateData.rejectedAt
        ? new Date(updateData.rejectedAt)
        : null;
    }

    const application = await prisma.application.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json({
      message: 'Application updated successfully',
      application
    });

  } catch (error) {
    console.error('Update application error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/applications/[id] - Withdraw application (Student only for own applications)
export async function DELETE(request, { params }) {
  try {
    // Get application first to check ownership and status
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        student: {
          include: {
            user: true
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

    // Check if application can be withdrawn (only APPLIED status)
    if (application.status !== APPLICATION_STATUS.APPLIED) {
      return NextResponse.json(
        { error: 'Can only withdraw applications in APPLIED status' },
        { status: 400 }
      );
    }

    // Delete the application
    await prisma.application.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      message: 'Application withdrawn successfully'
    });

  } catch (error) {
    console.error('Delete application error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}