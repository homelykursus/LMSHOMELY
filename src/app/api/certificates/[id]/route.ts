import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// DELETE - Delete a generated certificate
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const certificateId = params.id;

    // Get certificate details before deletion
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId }
    });

    if (!certificate) {
      return NextResponse.json(
        { success: false, error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Delete the physical file if it exists
    if (certificate.filePath) {
      try {
        const fullFilePath = path.join(process.cwd(), certificate.filePath);
        await fs.unlink(fullFilePath);
      } catch (fileError) {
        console.warn('Failed to delete certificate file:', fileError);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    await prisma.certificate.delete({
      where: { id: certificateId }
    });

    return NextResponse.json({
      success: true,
      message: 'Certificate deleted successfully'
    });

  } catch (error: any) {
    console.error('Failed to delete certificate:', error);
    return NextResponse.json(
      { success: false, error: `Failed to delete certificate: ${error.message}` },
      { status: 500 }
    );
  }
}

// GET - Get certificate details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const certificateId = params.id;

    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        student: {
          select: {
            name: true,
            studentNumber: true
          }
        },
        template: {
          select: {
            name: true
          }
        },
        course: {
          select: {
            name: true
          }
        },
        teacher: {
          select: {
            name: true
          }
        }
      }
    });

    if (!certificate) {
      return NextResponse.json(
        { success: false, error: 'Certificate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate.id,
        certificateNumber: certificate.certificateNumber,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        teacherName: certificate.teacherName,
        courseDuration: certificate.courseDuration,
        downloadUrl: certificate.downloadUrl,
        fileSize: certificate.fileSize,
        generatedAt: certificate.generatedAt,
        generatedBy: certificate.generatedBy,
        student: certificate.student,
        template: certificate.template,
        course: certificate.course,
        teacher: certificate.teacher
      }
    });

  } catch (error: any) {
    console.error('Failed to get certificate:', error);
    return NextResponse.json(
      { success: false, error: `Failed to get certificate: ${error.message}` },
      { status: 500 }
    );
  }
}