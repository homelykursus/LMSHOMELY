import { NextRequest, NextResponse } from 'next/server';
import { CertificateService } from '@/lib/certificate/certificate-service';

// POST - Generate batch certificates (multiple certificates in one document)
export async function POST(request: NextRequest) {
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
        { success: false, error: 'Maximum 50 certificates can be generated in one batch' },
        { status: 400 }
      );
    }

    console.log(`🔄 Starting batch certificate generation for ${studentIds.length} students`);

    // Generate batch certificates using the new service method
    const result = await CertificateService.generateBatchCertificates(
      templateId,
      studentIds,
      generatedBy,
      options
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.errors?.join(', ') || 'Batch certificate generation failed' },
        { status: 500 }
      );
    }

    console.log(`✅ Batch certificate generation completed successfully`);
    console.log(`📊 Generated ${result.certificateCount} certificates in one document`);

    return NextResponse.json({
      success: true,
      batchId: result.batchId,
      filePath: result.filePath,
      downloadUrl: `/api/certificates/download/${result.filePath?.split('/').pop()}`,
      fileSize: result.fileSize,
      certificateCount: result.certificateCount,
      certificateIds: result.certificateIds,
      generationMethod: result.generationMethod
    });

  } catch (error: any) {
    console.error('Batch certificate generation failed:', error);
    return NextResponse.json(
      { success: false, error: `Batch certificate generation failed: ${error.message}` },
      { status: 500 }
    );
  }
}