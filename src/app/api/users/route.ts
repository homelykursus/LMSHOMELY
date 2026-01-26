import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AuthService, withRole } from '@/lib/auth';

export const GET = withRole(['super_admin'], async (request: NextRequest) => {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
});

export const POST = withRole(['super_admin'], async (request: NextRequest) => {
  try {
    const { email, name, password, role } = await request.json();

    // Validate input
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'super_admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
});