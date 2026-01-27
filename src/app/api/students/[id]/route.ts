import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const student = await db.student.findUnique({
      where: {
        id: params.id
      },
      include: {
        course: {
          select: {
            name: true,
            category: true,
            description: true,
            duration: true
          }
        },
        classes: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
                schedule: true,
                isActive: true
              }
            }
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if the request is JSON (status update only) or FormData (full update)
    const contentType = request.headers.get('content-type');
    
    const student = await db.student.findUnique({
      where: { id: params.id }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    let updatedStudent;

    if (contentType?.includes('application/json')) {
      // Handle JSON data (status update only)
      const body = await request.json();
      const { status } = body;

      if (!status) {
        return NextResponse.json(
          { error: 'Status is required' },
          { status: 400 }
        );
      }

      // Validate status values
      const validStatuses = ['pending', 'confirmed', 'completed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status value' },
          { status: 400 }
        );
      }

      updatedStudent = await db.student.update({
        where: { id: params.id },
        data: { status },
        include: {
          course: {
            select: {
              name: true,
              category: true,
              description: true,
              duration: true
            }
          },
          classes: {
            include: {
              class: {
                select: {
                  id: true,
                  name: true,
                  schedule: true,
                  isActive: true
                }
              }
            }
          }
        }
      });
    } else {
      // Handle FormData (full student update)
      const formData = await request.formData();
      
      const name = formData.get('name') as string;
      const dateOfBirth = formData.get('dateOfBirth') as string;
      const whatsapp = formData.get('whatsapp') as string;
      const courseId = formData.get('courseId') as string;
      const courseType = formData.get('courseType') as string;
      const participants = parseInt(formData.get('participants') as string);
      const finalPrice = parseInt(formData.get('finalPrice') as string);
      const discount = parseInt(formData.get('discount') as string) || 0;
      const lastEducation = formData.get('lastEducation') as string | null;
      const referralSource = formData.get('referralSource') as string | null;
      const photo = formData.get('photo') as File | null;

      let photoUrl = student.photo; // Keep existing photo by default

      // Handle photo upload
      if (photo && photo.size > 0) {
        // Validasi file
        if (!photo.type.startsWith('image/')) {
          return NextResponse.json(
            { error: 'File must be an image' },
            { status: 400 }
          );
        }

        // Maksimal 10MB (sesuai limit Cloudinary free)
        if (photo.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'File size must be less than 10MB' },
            { status: 400 }
          );
        }

        // Convert file to buffer
        const bytes = await photo.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload ke Cloudinary
        const { CloudinaryService } = await import('@/lib/cloudinary');
        const uploadResult = await CloudinaryService.uploadStudentPhoto(
          buffer,
          params.id,
          {
            width: 400,
            height: 400,
            crop: 'fill',
            quality: 'auto:good'
          }
        );

        // Store Cloudinary URL
        photoUrl = uploadResult.secure_url;
      }

      updatedStudent = await db.student.update({
        where: { id: params.id },
        data: {
          name,
          dateOfBirth,
          whatsapp,
          photo: photoUrl,
          courseId,
          courseType,
          participants,
          finalPrice,
          discount,
          lastEducation,
          referralSource
        },
        include: {
          course: {
            select: {
              name: true,
              category: true,
              description: true,
              duration: true
            }
          },
          classes: {
            include: {
              class: {
                select: {
                  id: true,
                  name: true,
                  schedule: true,
                  isActive: true
                }
              }
            }
          }
        }
      });
    }

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const student = await db.student.findUnique({
      where: { id: params.id }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Delete related payment records first
    await db.payment.deleteMany({
      where: { studentId: params.id }
    });

    // Delete the student
    await db.student.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}