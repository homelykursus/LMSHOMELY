import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('🚨 Emergency admin creation requested...');

    // Check if ANY admin user exists
    const existingAdmins = await db.user.findMany({
      where: { 
        OR: [
          { role: 'super_admin' },
          { role: 'admin' }
        ]
      }
    });

    // Only allow creation if NO admin users exist (emergency situation)
    if (existingAdmins.length > 0) {
      console.log('⚠️  Admin users already exist, emergency creation not needed');
      return NextResponse.json({
        success: false,
        message: 'Admin users already exist. Emergency creation not needed.',
        existingAdmins: existingAdmins.map(admin => ({
          email: admin.email,
          role: admin.role,
          isActive: admin.isActive
        }))
      });
    }

    console.log('🆘 No admin users found, creating emergency admin...');

    // Create emergency admin
    const hashedPassword = await AuthService.hashPassword('admin123');
    
    const adminUser = await db.user.create({
      data: {
        email: 'admin@kursus.com',
        name: 'Emergency Admin',
        password: hashedPassword,
        role: 'super_admin',
        isActive: true
      }
    });

    console.log('✅ Emergency admin created successfully');

    return NextResponse.json({
      success: true,
      message: 'Emergency admin user created successfully',
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
        note: 'Emergency admin created. Please change password immediately after login.'
      },
      warning: 'This is an emergency endpoint. Please remove after use for security.'
    });

  } catch (error) {
    console.error('❌ Emergency admin creation failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Emergency admin creation failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check current admin status
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
      message: 'Admin status retrieved',
      adminCount: adminUsers.length,
      admins: adminUsers,
      emergencyNeeded: adminUsers.length === 0
    });

  } catch (error) {
    console.error('❌ Error checking admin status:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check admin status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}