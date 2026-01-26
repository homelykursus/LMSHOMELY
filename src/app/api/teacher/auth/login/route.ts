import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { whatsapp, password } = await request.json();

    // Validate input
    if (!whatsapp || !password) {
      return NextResponse.json(
        { error: 'Nomor WhatsApp dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Authenticate teacher
    const teacher = await AuthService.authenticateTeacher(whatsapp, password);
    
    if (!teacher) {
      return NextResponse.json(
        { error: 'Nomor WhatsApp atau password salah' },
        { status: 401 }
      );
    }

    // Generate token
    const token = AuthService.generateTeacherToken(teacher);

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      teacher: {
        id: teacher.id,
        name: teacher.name,
        whatsapp: teacher.whatsapp,
        role: teacher.role
      }
    });

    // Set cookie
    response.cookies.set('teacher-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Teacher login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
}