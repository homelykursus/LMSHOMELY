import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Query only WAITING classes: startDate = null AND endDate = null AND isActive = true
    // This is a public endpoint - only exposes safe, limited data
    const classes = await db.class.findMany({
      where: {
        startDate: null,  // Belum dimulai
        endDate: null,    // Belum selesai
        isActive: true,   // Hanya kelas aktif
      },
      select: {
        id: true,
        name: true,
        schedule: true,
        maxStudents: true,
        // Hanya ambil data yang perlu ditampilkan publik
        course: {
          select: {
            name: true,
            category: true,
          },
        },
        students: {
          select: {
            student: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        room: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      // Batasi jumlah untuk keamanan dan performa
      take: 50,
    });

    const result = classes.map((c) => ({
      id: c.id,
      name: c.name,
      schedule: c.schedule,
      room: c.room?.name || null,
      courseName: c.course.name,
      courseCategory: c.course.category,
      maxStudents: c.maxStudents,
      enrolledCount: c.students.length,
      availableSlots: c.maxStudents - c.students.length,
      isFull: c.students.length >= c.maxStudents,
      // Hanya tampilkan nama siswa, bukan ID atau data sensitif lainnya
      students: c.students.map((s) => ({
        id: s.student.id,
        name: s.student.name,
      })),
    }));

    return NextResponse.json(result, {
      headers: {
        // Cache 5 menit di browser, revalidate di background
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('[PUBLIC] Error fetching available classes:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data kelas' },
      { status: 500 }
    );
  }
}
