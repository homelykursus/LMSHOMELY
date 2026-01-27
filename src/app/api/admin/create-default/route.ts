import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Creating default admin user...');

    // Check if admin already exists
    const existingAdmin = await db.user.findFirst({
      where: { 
        OR: [
          { role: 'super_admin' },
          { email: 'admin@kursus.com' }
        ]
      }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      return NextResponse.json({
        success: false,
        message: 'Admin user already exists',
        user: {
          email: existingAdmin.email,
          role: existingAdmin.role,
          isActive: existingAdmin.isActive
        }
      });
    }

    console.log('👤 Creating new admin user...');

    // Create default admin
    const hashedPassword = await AuthService.hashPassword('admin123');
    
    const adminUser = await db.user.create({
      data: {
        email: 'admin@kursus.com',
        name: 'Super Admin',
        password: hashedPassword,
        role: 'super_admin',
        isActive: true
      }
    });

    console.log('✅ Admin user created successfully');

    return NextResponse.json({
      success: true,
      message: 'Default admin user created successfully',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        isActive: adminUser.isActive
      },
      credentials: {
        email: 'admin@kursus.com',
        password: 'admin123',
        note: 'Please change password after first login'
      }
    });

  } catch (error) {
    console.error('❌ Error creating default admin:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create admin user',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check current admin users
    const adminUsers = await db.user.findMany({
      where: {
        OR: [
          { role: 'super_admin' },
          { role: 'admin' }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Admin users retrieved',
      users: adminUsers,
      count: adminUsers.length
    });

  } catch (error) {
    console.error('❌ Error retrieving admin users:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve admin users',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}