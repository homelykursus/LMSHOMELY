import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Ambil 20 siswa terbaru dengan status confirmed atau completed
    const students = await prisma.student.findMany({
      where: {
        OR: [
          { status: 'confirmed' },
          { status: 'completed' }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20,
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching recent students:', error);
    return NextResponse.json({ students: [] });
  } finally {
    await prisma.$disconnect();
  }
}
