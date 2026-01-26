import { NextRequest, NextResponse } from 'next/server';
import { CloudinaryService } from '@/lib/cloudinary';
import { db } from '@/lib/db';
import { withAuth } from '@/lib/auth';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const teacherId = formData.get('teacherId') as string;

    if (!file || !teacherId) {
      return NextResponse.json(
        { error: 'File and teacherId are required' },
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

    // Cek apakah teacher exists
    const teacher = await db.teacher.findUnique({
      where: { id: teacherId }
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload ke Cloudinary
    const uploadResult = await CloudinaryService.uploadTeacherPhoto(
      buffer,
      teacherId,
      {
        width: 400,
        height: 400,
        crop: 'fill',
        quality: 'auto:good'
      }
    );

    // Update database dengan URL Cloudinary
    const updatedTeacher = await db.teacher.update({
      where: { id: teacherId },
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
        teacher: updatedTeacher,
        cloudinary: {
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
          responsive: responsiveUrls
        }
      }
    });

  } catch (error) {
    console.error('Error uploading teacher photo:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
});