import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Test database connection
    await db.$queryRaw`SELECT 1`;
    const dbHealthy = true;
    const dbResponseTime = Date.now() - startTime;
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        healthy: dbHealthy,
        responseTime: `${dbResponseTime}ms`
      },
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime()
    };
    
    return NextResponse.json(health, { status: 200 });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    const health = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      version: process.env.npm_package_version || '1.0.0'
    };
    
    return NextResponse.json(health, { status: 503 });
  }
}