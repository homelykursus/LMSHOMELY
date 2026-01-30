import { NextRequest, NextResponse } from 'next/server';
import { CertificateService } from '@/lib/certificate/certificate-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Generate certificate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, studentId, generatedBy, options = {} } = body;

    // Validate required fields
    if (!templateId || !studentId || !generatedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: templateId, studentId, generatedBy' },
        { status: 400 }
      );
    }

    console.log(`🔄 Starting certificate generation for student: ${studentId}`);

    // Generate certificate
    const result = await CertificateService.generateCertificate(
      templateId,
      studentId,
      generatedBy,
      options
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.errors?.join(', ') || 'Certificate generation failed' },
        { status: 500 }
      );
    }

    console.log(`✅ Certificate generated successfully for ${result.studentName}`);

    // Return the file directly
    return new NextResponse(result.fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': result.contentType,
        'Content-Disposition': `attachment; filename="${result.fileName}"`,
        'Content-Length': result.fileSize?.toString() || '0',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error: any) {
    console.error('Certificate generation failed:', error);
    return NextResponse.json(
      { success: false, error: `Certificate generation failed: ${error.message}` },
      { status: 500 }
    );
  }
}

// POST - Generate multiple certificates (batch)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, studentIds, generatedBy, options = {} } = body;

    // Validate required fields
    if (!templateId || !studentIds || !Array.isArray(studentIds) || !generatedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: templateId, studentIds (array), generatedBy' },
        { status: 400 }
      );
    }

    if (studentIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one student ID is required' },
        { status: 400 }
      );
    }

    if (studentIds.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Maximum 50 certificates can be generated at once' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    // Generate certificates one by one
    for (const studentId of studentIds) {
      try {
        // Check if certificate already exists
        const existingCertificate = await prisma.certificate.findFirst({
          where: {
            templateId,
            studentId
          }
        });

        if (existingCertificate) {
          errors.push({
            studentId,
            error: 'Certificate already exists',
            existingCertificate: {
              id: existingCertificate.id,
              certificateNumber: existingCertificate.certificateNumber
            }
          });
          continue;
        }

        const result = await CertificateService.generateCertificate(
          templateId,
          studentId,
          generatedBy,
          options
        );

        if (result.success) {
          const certificate = await CertificateService.getCertificate(result.certificateId!);
          results.push({
            studentId,
            success: true,
            certificate,
            downloadUrl: certificate?.downloadUrl
          });
        } else {
          errors.push({
            studentId,
            error: result.errors?.join(', ') || 'Generation failed'
          });
        }
      } catch (error: any) {
        errors.push({
          studentId,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      summary: {
        total: studentIds.length,
        successful: results.length,
        failed: errors.length
      }
    });

  } catch (error: any) {
    console.error('Batch certificate generation failed:', error);
    return NextResponse.json(
      { success: false, error: `Batch certificate generation failed: ${error.message}` },
      { status: 500 }
    );
  }
}