import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AuthService } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teacher = await db.teacher.findUnique({
      where: {
        id: params.id
      },
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                category: true,
                description: true,
                duration: true
              }
            }
          }
        }
      }
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(teacher);
  } catch (error) {
    console.error('Error fetching teacher:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teacher' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const whatsapp = formData.get('whatsapp') as string;
    const password = formData.get('password') as string | null;
    const education = formData.get('education') as string;
    const specialization = formData.get('specialization') as string | null;
    const experience = formData.get('experience') as string | null;
    const address = formData.get('address') as string | null;
    const joinDate = formData.get('joinDate') as string;
    const status = formData.get('status') as string || 'active';
    const salary = formData.get('salary') as string | null;
    const notes = formData.get('notes') as string | null;
    const photo = formData.get('photo') as File | null;
    const courseIds = formData.get('courseIds') as string;

    // Check if teacher exists
    const existingTeacher = await db.teacher.findUnique({
      where: { id: params.id }
    });

    if (!existingTeacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Validate password if provided
    let hashedPassword = existingTeacher.password;
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password minimal 6 karakter' },
          { status: 400 }
        );
      }
      hashedPassword = await AuthService.hashPassword(password);
    }

    // Check WhatsApp uniqueness if changed
    if (whatsapp !== existingTeacher.whatsapp) {
      const duplicateTeacher = await db.teacher.findFirst({
        where: { 
          whatsapp,
          id: { not: params.id }
        }
      });

      if (duplicateTeacher) {
        return NextResponse.json(
          { error: 'Nomor WhatsApp sudah digunakan oleh guru lain' },
          { status: 400 }
        );
      }
    }

    let photoUrl = existingTeacher.photo;

    // Handle photo upload if new photo provided
    if (photo && photo.size > 0) {
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const timestamp = Date.now();
      const originalName = photo.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}_${originalName}`;
      
      // Ensure uploads directory exists
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'teachers');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }

      // Write file
      const filepath = join(uploadDir, filename);
      await writeFile(filepath, buffer);
      
      // Store relative URL
      photoUrl = `/uploads/teachers/${filename}`;
    }

    const teacher = await db.teacher.update({
      where: { id: params.id },
      data: {
        name,
        dateOfBirth,
        whatsapp,
        password: hashedPassword,
        photo: photoUrl,
        education,
        specialization,
        experience: experience ? parseInt(experience) : null,
        address,
        joinDate,
        status,
        salary: salary ? parseInt(salary) : null,
        notes
      },
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                category: true
              }
            }
          }
        }
      }
    });

    // Update course assignments
    // Delete existing assignments
    await db.teacherCourse.deleteMany({
      where: { teacherId: params.id }
    });

    // Create new assignments
    if (courseIds) {
      const courseIdArray = courseIds.split(',').filter((id: string) => id.trim());
      
      for (const courseId of courseIdArray) {
        await db.teacherCourse.create({
          data: {
            teacherId: params.id,
            courseId: courseId.trim(),
            isMain: courseIdArray.length === 1 // If only one course, mark as main
          }
        });
      }
    }

    return NextResponse.json(teacher);
  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json(
      { error: 'Failed to update teacher' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teacher = await db.teacher.findUnique({
      where: { id: params.id }
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Delete related teacher-course assignments first
    await db.teacherCourse.deleteMany({
      where: { teacherId: params.id }
    });

    // Delete the teacher
    await db.teacher.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json(
      { error: 'Failed to delete teacher' },
      { status: 500 }
    );
  }
}