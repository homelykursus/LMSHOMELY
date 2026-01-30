import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Get all generated certificates
export async function GET(request: NextRequest) {
  try {
    const certificates = await prisma.certificate.findMany({
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
        }
      },
      orderBy: { generatedAt: 'desc' },
      take: 50 // Limit to recent 50 certificates
    });

    const formattedCertificates = certificates.map(cert => ({
      id: cert.id,
      certificateNumber: cert.certificateNumber,
      studentName: cert.studentName,
      courseName: cert.courseName,
      templateName: cert.template.name,
      downloadUrl: cert.downloadUrl,
      fileSize: cert.fileSize,
      generatedAt: cert.generatedAt,
      generatedBy: cert.generatedBy
    }));

    return NextResponse.json({
      success: true,
      certificates: formattedCertificates
    });

  } catch (error: any) {
    console.error('Failed to fetch generated certificates:', error);
    return NextResponse.json(
      { success: false, error: `Failed to fetch certificates: ${error.message}` },
      { status: 500 }
    );
  }
}