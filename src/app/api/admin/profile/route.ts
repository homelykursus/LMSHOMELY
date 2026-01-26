import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated admin user
    const user = await AuthService.getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch full user data from database
    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!fullUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user: fullUser
    });

  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get authenticated admin user
    const user = await AuthService.getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch full user data including password
    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        isActive: true
      }
    });

    if (!fullUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, email, currentPassword, newPassword } = body;

    // Validate required fields for profile update
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    if (email !== fullUser.email) {
      const existingUser = await db.user.findUnique({
        where: { email }
      });

      if (existingUser && existingUser.id !== fullUser.id) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      email
    };

    // Handle password change if provided
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to change password' },
          { status: 400 }
        );
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, fullUser.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Validate new password
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters long' },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      updateData.password = hashedNewPassword;
    }

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: fullUser.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: newPassword ? 'Profile and password updated successfully' : 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating admin profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}