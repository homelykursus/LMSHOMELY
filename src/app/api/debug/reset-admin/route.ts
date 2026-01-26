import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Resetting admin password...');

    // Test database connection
    await db.$connect();
    console.log('✅ Database connected');

    // Hash the correct password
    const correctPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(correctPassword, 12);
    console.log('🔐 Password hashed');

    // Update admin user
    const updatedAdmin = await db.user.upsert({
      where: { email: 'admin@kursus.com' },
      update: {
        password: hashedPassword,
        name: 'Super Admin',
        role: 'super_admin',
        isActive: true
      },
      create: {
        id: 'admin-production-001',
        email: 'admin@kursus.com',
        name: 'Super Admin',
        password: hashedPassword,
        role: 'super_admin',
        isActive: true
      }
    });

    console.log('✅ Admin user updated:', updatedAdmin.email);

    // Test the password immediately
    const testUser = await db.user.findUnique({
      where: { email: 'admin@kursus.com' }
    });

    if (testUser) {
      const isValidPassword = await bcrypt.compare(correctPassword, testUser.password);
      console.log('🧪 Password test result:', isValidPassword);

      return NextResponse.json({
        success: true,
        message: 'Admin password reset successfully',
        admin: {
          id: updatedAdmin.id,
          email: updatedAdmin.email,
          name: updatedAdmin.name,
          role: updatedAdmin.role
        },
        passwordTest: {
          isValid: isValidPassword,
          password: correctPassword
        }
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to verify password after reset'
    }, { status: 500 });

  } catch (error) {
    console.error('❌ Reset admin password error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  } finally {
    await db.$disconnect();
  }
}