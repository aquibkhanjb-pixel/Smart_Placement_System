import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma/index.js';
import { authenticateToken, requireCoordinator } from '../../../lib/auth/index.js';

// GET /api/students - List all students (Coordinator only)
export async function GET(request) {
  try {
    // Extract headers for middleware simulation
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const department = searchParams.get('department');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (department) {
      where.department = department;
    }

    if (search) {
      where.OR = [
        { rollNumber: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              isActive: true,
              createdAt: true
            }
          },
          applications: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  ctc: true,
                  category: true
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { rollNumber: 'asc' }
      }),
      prisma.student.count({ where })
    ]);

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}