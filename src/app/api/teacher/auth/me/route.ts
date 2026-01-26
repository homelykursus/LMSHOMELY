import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const teacher = await AuthService.getTeacherFromRequest(request);
    
    if (!teacher) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      teacher: {
        id: teacher.id,
        name: teacher.name,
        whatsapp: teacher.whatsapp,
        role: teacher.role
      }
    });
  } catch (error) {
    console.error('Get teacher profile error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data profil' },
      { status: 500 }
    );
  }
}