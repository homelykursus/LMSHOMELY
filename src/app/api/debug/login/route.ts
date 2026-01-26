import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('🔍 Debug login attempt:', { email, passwordLength: password?.length });

    // Test database connection
    await db.$connect();
    console.log('✅ Database connected');

    // Find user
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        isActive: true
      }
    });

    console.log('🔍 User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      return NextResponse.json({
        debug: true,
        step: 'user_lookup',
        result: 'USER_NOT_FOUND',
        email: email.toLowerCase()
      });
    }

    console.log('🔍 User details:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      hasPassword: !!user.password,
      passwordLength: user.password?.length
    });

    if (!user.isActive) {
      return NextResponse.json({
        debug: true,
        step: 'user_active_check',
        result: 'USER_INACTIVE',
        user: {
          id: user.id,
          email: user.email,
          isActive: user.isActive
        }
      });
    }

    // Test password verification
    console.log('🔐 Testing password verification...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('🔐 Password verification result:', isValidPassword);

    return NextResponse.json({
      debug: true,
      step: 'password_verification',
      result: isValidPassword ? 'PASSWORD_VALID' : 'PASSWORD_INVALID',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      },
      passwordTest: {
        provided: password,
        providedLength: password.length,
        storedLength: user.password.length,
        isValid: isValidPassword
      }
    });

  } catch (error) {
    console.error('❌ Debug login error:', error);
    return NextResponse.json({
      debug: true,
      step: 'error',
      result: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  } finally {
    await db.$disconnect();
  }
}