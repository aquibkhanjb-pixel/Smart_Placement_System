import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma/index.js';
import { COMPANY_CATEGORIES } from '../../../types/index.js';

// GET /api/companies - List all companies
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const registrationOpen = searchParams.get('registrationOpen');

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (category && Object.values(COMPANY_CATEGORIES).includes(category)) {
      where.category = category;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (registrationOpen !== null && registrationOpen !== undefined) {
      where.registrationOpen = registrationOpen === 'true';
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          applications: {
            select: {
              id: true,
              status: true,
              student: {
                select: {
                  rollNumber: true,
                  user: {
                    select: {
                      firstName: true,
                      lastName: true
                    }
                  }
                }
              }
            }
          },
          _count: {
            select: {
              applications: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.company.count({ where })
    ]);

    return NextResponse.json({
      companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get companies error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/companies - Create new company (Coordinator only)
export async function POST(request) {
  try {
    const {
      name,
      description,
      ctc,
      category,
      location,
      website,
      minCgpa,
      maxDemerits,
      allowedDepartments,
      registrationDeadline,
      interviewDate
    } = await request.json();

    // Validation
    if (!name || !ctc || !category || !minCgpa) {
      return NextResponse.json(
        { error: 'Required fields: name, ctc, category, minCgpa' },
        { status: 400 }
      );
    }

    if (!Object.values(COMPANY_CATEGORIES).includes(category)) {
      return NextResponse.json(
        { error: 'Invalid company category' },
        { status: 400 }
      );
    }

    const company = await prisma.company.create({
      data: {
        name,
        description,
        ctc: parseFloat(ctc),
        category,
        location,
        website,
        minCgpa: parseFloat(minCgpa),
        maxDemerits: maxDemerits ? parseInt(maxDemerits) : 6,
        allowedDepartments: allowedDepartments || '[]',
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        interviewDate: interviewDate ? new Date(interviewDate) : null
      }
    });

    return NextResponse.json({
      message: 'Company created successfully',
      company
    }, { status: 201 });

  } catch (error) {
    console.error('Create company error:', error);

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