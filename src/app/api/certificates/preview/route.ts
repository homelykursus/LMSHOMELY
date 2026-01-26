import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { CertificateService } from '@/lib/certificate/certificate-service';

// POST - Preview certificate
export async function POST(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      const body = await req.json();
      const { templateId, studentId } = body;

      if (!templateId || !studentId) {
        return NextResponse.json(
          { error: 'Template ID dan Student ID harus diisi' },
          { status: 400 }
        );
      }

      const certificateService = new CertificateService();
      
      const result = await certificateService.previewCertificate({
        templateId,
        studentId
      });

      return NextResponse.json({
        message: 'Preview sertifikat berhasil dibuat',
        preview: result
      });
    } catch (error) {
      console.error('Error generating preview:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Gagal membuat preview sertifikat' },
        { status: 500 }
      );
    }
  })(request);
}