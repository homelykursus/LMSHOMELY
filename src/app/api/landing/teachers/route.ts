import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      where: {
        status: 'active'
      },
      select: {
        id: true,
        name: true,
        photo: true,
        education: true,
        specialization: true,
        instagramUsername: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
