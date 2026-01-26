import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated teacher
    const teacher = await AuthService.getTeacherFromRequest(request);
    if (!teacher) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch full teacher data from database
    const fullTeacher = await db.teacher.findUnique({
      where: { id: teacher.id },
      select: {
        id: true,
        name: true,
        dateOfBirth: true,
        whatsapp: true,
        photo: true,
        education: true,
        specialization: true,
        experience: true,
        address: true,
        joinDate: true,
        status: true,
        salary: true,
        notes: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!fullTeacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      teacher: fullTeacher
    });

  } catch (error) {
    console.error('Error fetching teacher profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get authenticated teacher
    const teacher = await AuthService.getTeacherFromRequest(request);
    if (!teacher) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch full teacher data including password
    const fullTeacher = await db.teacher.findUnique({
      where: { id: teacher.id },
      select: {
        id: true,
        name: true,
        whatsapp: true,
        password: true,
        status: true
      }
    });

    if (!fullTeacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, whatsapp, currentPassword, newPassword } = body;

    // Validate required fields for profile update
    if (!name || !whatsapp) {
      return NextResponse.json(
        { error: 'Name and WhatsApp are required' },
        { status: 400 }
      );
    }

    // Check if WhatsApp is already taken by another teacher
    if (whatsapp !== fullTeacher.whatsapp) {
      const existingTeacher = await db.teacher.findFirst({
        where: { 
          whatsapp,
          id: { not: fullTeacher.id }
        }
      });

      if (existingTeacher) {
        return NextResponse.json(
          { error: 'WhatsApp number already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      whatsapp
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
      if (!fullTeacher.password) {
        return NextResponse.json(
          { error: 'No password set for this account' },
          { status: 400 }
        );
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, fullTeacher.password);
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

    // Update teacher profile
    const updatedTeacher = await db.teacher.update({
      where: { id: fullTeacher.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        dateOfBirth: true,
        whatsapp: true,
        photo: true,
        education: true,
        specialization: true,
        experience: true,
        address: true,
        joinDate: true,
        status: true,
        salary: true,
        notes: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: newPassword ? 'Profile and password updated successfully' : 'Profile updated successfully',
      teacher: updatedTeacher
    });

  } catch (error) {
    console.error('Error updating teacher profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}