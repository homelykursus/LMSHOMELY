import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AuthService } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const teachers = await db.teacher.findMany({
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
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const whatsapp = formData.get('whatsapp') as string;
    const password = formData.get('password') as string;
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

    // Validate required fields
    if (!name || !dateOfBirth || !whatsapp || !password || !education || !joinDate) {
      return NextResponse.json(
        { error: 'Nama, tanggal lahir, WhatsApp, password, pendidikan, dan tanggal bergabung wajib diisi' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Check if WhatsApp number already exists
    const existingTeacher = await db.teacher.findFirst({
      where: { whatsapp }
    });

    if (existingTeacher) {
      return NextResponse.json(
        { error: 'Nomor WhatsApp sudah digunakan oleh guru lain' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(password);

    let photoUrl = null;

    // Handle photo upload
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

    const teacher = await db.teacher.create({
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

    // Handle course assignments
    if (courseIds) {
      const courseIdArray = courseIds.split(',').filter((id: string) => id.trim());
      
      for (const courseId of courseIdArray) {
        await db.teacherCourse.create({
          data: {
            teacherId: teacher.id,
            courseId: courseId.trim(),
            isMain: courseIdArray.length === 1 // If only one course, mark as main
          }
        });
      }
    }

    return NextResponse.json(teacher, { status: 201 });
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json(
      { error: 'Failed to create teacher' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      );
    }

    const teacher = await db.teacher.findUnique({
      where: { id }
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Delete related teacher-course assignments first
    await db.teacherCourse.deleteMany({
      where: { teacherId: id }
    });

    // Delete the teacher
    await db.teacher.delete({
      where: { id }
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