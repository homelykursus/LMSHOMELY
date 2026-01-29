import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const studentId = params.id;
    const formData = await request.formData();
    const photo = formData.get('photo') as File;

    if (!photo) {
      return NextResponse.json(
        { error: 'No photo file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!photo.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (photo.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Check if student exists
    const student = await db.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Process photo upload
    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = photo.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${studentId}_${timestamp}_${originalName}`;
    
    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'students');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Write file
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);
    
    // Store relative URL
    const photoUrl = `/uploads/students/${filename}`;

    // Update student record with new photo
    const updatedStudent = await db.student.update({
      where: { id: studentId },
      data: { photo: photoUrl },
      include: {
        course: {
          select: {
            name: true,
            category: true
          }
        }
      }
    });

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error('Error updating student photo:', error);
    return NextResponse.json(
      { error: 'Failed to update student photo' },
      { status: 500 }
    );
  }
}