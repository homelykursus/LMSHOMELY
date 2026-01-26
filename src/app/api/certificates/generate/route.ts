import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { CertificateService } from '@/lib/certificate/certificate-service';

// POST - Generate single certificate
export async function POST(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      const body = await req.json();
      const { templateId, studentId, additionalData } = body;

      if (!templateId || !studentId) {
        return NextResponse.json(
          { error: 'Template ID dan Student ID harus diisi' },
          { status: 400 }
        );
      }

      const certificateService = new CertificateService();
      
      const result = await certificateService.generateCertificate({
        templateId,
        studentId,
        additionalData
      }, user.id);

      return NextResponse.json({
        message: 'Sertifikat berhasil digenerate',
        certificate: result
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Gagal generate sertifikat' },
        { status: 500 }
      );
    }
  })(request);
}