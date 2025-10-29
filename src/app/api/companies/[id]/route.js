import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma/index.js';
import { COMPANY_CATEGORIES } from '../../../../types/index.js';

// GET /api/companies/[id] - Get company by ID
export async function GET(request, { params }) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        applications: {
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
            }
          },
          orderBy: { appliedAt: 'desc' }
        },
        _count: {
          select: {
            applications: true
          }
        }
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(company);

  } catch (error) {
    console.error('Get company error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/companies/[id] - Update company (Coordinator only)
export async function PATCH(request, { params }) {
  try {
    const data = await request.json();

    // Validate category if provided
    if (data.category && !Object.values(COMPANY_CATEGORIES).includes(data.category)) {
      return NextResponse.json(
        { error: 'Invalid company category' },
        { status: 400 }
      );
    }

    // Process numeric fields
    const updateData = { ...data };
    if (updateData.ctc !== undefined) {
      updateData.ctc = parseFloat(updateData.ctc);
    }
    if (updateData.minCgpa !== undefined) {
      updateData.minCgpa = parseFloat(updateData.minCgpa);
    }
    if (updateData.maxDemerits !== undefined) {
      updateData.maxDemerits = parseInt(updateData.maxDemerits);
    }

    // Process date fields
    if (updateData.registrationDeadline !== undefined) {
      updateData.registrationDeadline = updateData.registrationDeadline
        ? new Date(updateData.registrationDeadline)
        : null;
    }
    if (updateData.interviewDate !== undefined) {
      updateData.interviewDate = updateData.interviewDate
        ? new Date(updateData.interviewDate)
        : null;
    }

    const company = await prisma.company.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({
      message: 'Company updated successfully',
      company
    });

  } catch (error) {
    console.error('Update company error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Company with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/companies/[id] - Delete company (Coordinator only)
export async function DELETE(request, { params }) {
  try {
    // Check if company has applications
    const applicationCount = await prisma.application.count({
      where: { companyId: params.id }
    });

    if (applicationCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete company with existing applications. Deactivate instead.' },
        { status: 400 }
      );
    }

    await prisma.company.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      message: 'Company deleted successfully'
    });

  } catch (error) {
    console.error('Delete company error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}