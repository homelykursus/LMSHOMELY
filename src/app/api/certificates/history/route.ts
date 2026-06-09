import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const certificates = await db.certificate.findMany({
      orderBy: {
        generatedAt: 'desc',
      },
      include: {
        student: {
          include: {
            course: true,
          }
        },
        template: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: certificates,
    });
  } catch (error: any) {
    console.error('Failed to fetch certificate history:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil riwayat sertifikat' },
      { status: 500 }
    );
  }
}
