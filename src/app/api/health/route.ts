import { NextResponse } from "next/server";
import { db } from '@/lib/db';

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Test database connection
    await db.$queryRaw`SELECT 1`
    const dbResponseTime = Date.now() - startTime
    
    // Get basic stats
    const [employeeCount, teacherCount, studentCount] = await Promise.all([
      db.employeeAttendance.count(),
      db.teacher.count(),
      db.student.count()
    ])
    
    const totalResponseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: {
        database: `${dbResponseTime}ms`,
        total: `${totalResponseTime}ms`
      },
      database: {
        status: "connected",
        records: {
          employeeAttendance: employeeCount,
          teachers: teacherCount,
          students: studentCount
        }
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'development' ? error.message : 'Database connection failed',
      responseTime: `${Date.now() - startTime}ms`
    }, { status: 500 });
  }
}