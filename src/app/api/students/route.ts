import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { StudentIdGenerator } from '@/lib/student-id-generator';

export async function GET() {
  try {
    const students = await db.student.findMany({
      where: {
        status: {
          notIn: ['completed', 'graduated'] // Exclude alumni from students list
        }
      },
      include: {
        course: {
          select: {
            name: true,
            category: true
          }
        },
        classes: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
                schedule: true,
                isActive: true,
                totalMeetings: true,
                completedMeetings: true,
                teacher: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform the data to match the expected format
    const transformedStudents = students.map(student => {
      const activeClass = student.classes.find(cs => cs.class.isActive);
      
      // Check if student has completed any class (class is inactive AND meetings completed)
      const completedClass = student.classes.find(cs => 
        !cs.class.isActive &&
        cs.class.totalMeetings > 0 && 
        cs.class.completedMeetings >= cs.class.totalMeetings
      );
      
      // Prioritize active class, but if no active class, show completed class
      const relevantClass = activeClass || completedClass;
      
      // Auto-update status to graduated only if class is completed (inactive AND meetings done)
      let finalStatus = student.status;
      if (completedClass && student.status !== 'graduated') {
        finalStatus = 'graduated';
        // Update the student status in database
        db.student.update({
          where: { id: student.id },
          data: { status: 'graduated' }
        }).catch(error => {
          console.error('Failed to update student status to graduated:', error);
        });
      }
      
      return {
        id: student.id,
        name: student.name,
        studentId: student.studentNumber, // Use studentNumber for consistency with certificates
        classId: relevantClass?.classId || '',
        className: relevantClass?.class?.name || 'Belum ada kelas',
        courseId: student.courseId,
        courseName: student.course.name,
        phone: student.whatsapp,
        email: null,
        status: finalStatus,
        joinDate: student.createdAt.toISOString().split('T')[0],
        photo: student.photo,
        lastEducation: student.lastEducation,
        referralSource: student.referralSource,
        notes: student.notes,
        // Legacy fields for backward compatibility
        dateOfBirth: student.dateOfBirth,
        whatsapp: student.whatsapp,
        courseType: student.courseType,
        participants: student.participants,
        finalPrice: student.finalPrice,
        discount: student.discount,
        createdAt: student.createdAt.toISOString(),
        updatedAt: student.updatedAt.toISOString(),
        course: student.course,
        classes: student.classes
      };
    });

    return NextResponse.json(transformedStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest
) {
  try {
    // Handle deletion from /api/students
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const student = await db.student.findUnique({
      where: { id }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Delete related payment records first
    await db.payment.deleteMany({
      where: { studentId: id }
    });

    // Delete the student
    await db.student.delete({
      where: { id }
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

export async function POST(request: NextRequest) {
  try {
    // Check if the request is JSON (from landing page) or FormData (from admin panel)
    const contentType = request.headers.get('content-type');
    
    let name: string;
    let dateOfBirth: string;
    let gender: string | null = null;
    let whatsapp: string;
    let courseId: string;
    let courseType: string;
    let finalPrice: number;
    let discount: number = 0;
    let lastEducation: string | null = null;
    let referralSource: string | null = null;
    let notes: string | null = null;
    let photo: File | null = null;
    
    if (contentType?.includes('application/json')) {
      // Handle JSON data from landing page
      const jsonData = await request.json();
      name = jsonData.name;
      dateOfBirth = jsonData.dateOfBirth;
      gender = jsonData.gender || null;
      whatsapp = jsonData.whatsapp;
      courseId = jsonData.courseId;
      courseType = jsonData.courseType;
      finalPrice = jsonData.finalPrice;
      discount = jsonData.discount || 0;
      lastEducation = jsonData.lastEducation || null;
      referralSource = jsonData.referralSource || null;
      notes = jsonData.notes || null;
    } else {
      // Handle FormData from admin panel
      const formData = await request.formData();
      name = formData.get('name') as string;
      dateOfBirth = formData.get('dateOfBirth') as string;
      gender = formData.get('gender') as string || null;
      whatsapp = formData.get('whatsapp') as string;
      courseId = formData.get('courseId') as string;
      courseType = formData.get('courseType') as string;
      finalPrice = parseInt(formData.get('finalPrice') as string);
      discount = parseInt(formData.get('discount') as string) || 0;
      lastEducation = formData.get('lastEducation') as string | null;
      referralSource = formData.get('referralSource') as string | null;
      notes = formData.get('notes') as string | null;
      photo = formData.get('photo') as File | null;
    }

    // Generate unique random student ID
    const existingStudentNumbers = await db.student.findMany({
      select: { studentNumber: true }
    });
    const existingIds = existingStudentNumbers.map(s => s.studentNumber).filter(Boolean);
    const studentNumber = StudentIdGenerator.generateUniqueStudentId(existingIds);

    let photoUrl = null;

    // Handle photo upload (only from admin panel FormData)
    if (photo && photo.size > 0) {
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const timestamp = Date.now();
      const originalName = photo.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}_${originalName}`;
      
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
      photoUrl = `/uploads/students/${filename}`;
    }

    const student = await db.student.create({
      data: {
        studentNumber, // Add the generated student number
        name,
        dateOfBirth,
        gender,
        whatsapp,
        photo: photoUrl,
        courseId,
        courseType,
        participants: 1, // Default to 1 participant
        finalPrice,
        discount,
        lastEducation,
        referralSource,
        notes
      },
      include: {
        course: {
          select: {
            name: true,
            category: true
          }
        },
        classes: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
                schedule: true,
                isActive: true,
                totalMeetings: true,
                completedMeetings: true
              }
            }
          }
        }
      }
    });

    // Otomatis buat payment record untuk student baru
    const payment = await db.payment.create({
      data: {
        studentId: student.id,
        totalAmount: finalPrice,
        remainingAmount: finalPrice,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 hari dari sekarang
        notes: `Pembayaran kursus ${student.course.name} (${courseType})${discount > 0 ? ` dengan diskon Rp ${discount.toLocaleString('id-ID')}` : ''}`
      }
    });

    return NextResponse.json({ ...student, payment }, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}