import { NextRequest, NextResponse } from 'next/server';
import { CloudinaryService } from '@/lib/cloudinary';
import { db } from '@/lib/db';
import { withAuth } from '@/lib/auth';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const studentId = formData.get('studentId') as string;

    if (!file || !studentId) {
      return NextResponse.json(
        { error: 'File and studentId are required' },
        { status: 400 }
      );
    }

    // Validasi file
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Maksimal 10MB (sesuai limit Cloudinary free)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Cek apakah student exists
    const student = await db.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload ke Cloudinary
    const uploadResult = await CloudinaryService.uploadStudentPhoto(
      buffer,
      studentId,
      {
        width: 400,
        height: 400,
        crop: 'fill',
        quality: 'auto:good'
      }
    );

    // Update database dengan URL Cloudinary
    const updatedStudent = await db.student.update({
      where: { id: studentId },
      data: {
        photo: uploadResult.secure_url
      }
    });

    // Generate responsive URLs
    const responsiveUrls = CloudinaryService.generateResponsiveUrls(uploadResult.public_id);

    return NextResponse.json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        student: updatedStudent,
        cloudinary: {
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
          responsive: responsiveUrls
        }
      }
    });

  } catch (error) {
    console.error('Error uploading student photo:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
});