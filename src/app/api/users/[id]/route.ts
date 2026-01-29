import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AuthService, withRole } from '@/lib/auth';

export const GET = withRole(['super_admin'], async (
  request: NextRequest,
  user: any,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const targetUser = await db.user.findUnique({
      where: { id: params.id },
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

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(targetUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
});

export const PUT = withRole(['super_admin'], async (
  request: NextRequest,
  currentUser: any,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { email, name, role, isActive, password } = await request.json();

    // Validate input
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (role && !['admin', 'super_admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent self-deactivation
    if (currentUser.id === params.id && isActive === false) {
      return NextResponse.json(
        { error: 'Cannot deactivate your own account' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    if (email.toLowerCase() !== existingUser.email) {
      const emailExists = await db.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      email: email.toLowerCase(),
      name,
      role: role || existingUser.role,
      isActive: isActive !== undefined ? isActive : existingUser.isActive
    };

    // Hash new password if provided
    if (password && password.trim()) {
      updateData.password = await AuthService.hashPassword(password);
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id: params.id },
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

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
});

export const DELETE = withRole(['super_admin'], async (
  request: NextRequest,
  currentUser: any,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    // Prevent self-deletion
    if (currentUser.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user
    await db.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
});