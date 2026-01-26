import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test database connection
    await db.$connect();
    console.log('✅ Database connected successfully');
    
    // Check if admin exists
    const existingAdmin = await db.user.findUnique({
      where: { email: 'admin@kursus.com' }
    });

    let adminStatus = 'exists';
    
    if (!existingAdmin) {
      console.log('🔐 Creating default admin user...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      // Create admin user
      const admin = await db.user.create({
        data: {
          id: 'admin-production-001',
          email: 'admin@kursus.com',
          name: 'Super Admin',
          password: hashedPassword,
          role: 'super_admin',
          isActive: true
        }
      });
      
      adminStatus = 'created';
      console.log('✅ Admin user created:', admin.email);
    }

    // Get basic stats
    const userCount = await db.user.count();
    const teacherCount = await db.teacher.count();
    const studentCount = await db.student.count();
    const courseCount = await db.course.count();

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      database: {
        connected: true,
        provider: 'postgresql'
      },
      admin: {
        status: adminStatus,
        email: 'admin@kursus.com',
        password: 'admin123'
      },
      stats: {
        users: userCount,
        teachers: teacherCount,
        students: studentCount,
        courses: courseCount
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        connected: false
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await db.$disconnect();
  }
}