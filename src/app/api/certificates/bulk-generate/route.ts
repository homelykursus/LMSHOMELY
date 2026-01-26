import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { CertificateService } from '@/lib/certificate/certificate-service';

// POST - Generate bulk certificates
export async function POST(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      const body = await req.json();
      const { templateId, studentIds, additionalData } = body;

      if (!templateId || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return NextResponse.json(
          { error: 'Template ID dan daftar Student ID harus diisi' },
          { status: 400 }
        );
      }

      // Limit bulk generation to prevent server overload
      if (studentIds.length > 100) {
        return NextResponse.json(
          { error: 'Maksimal 100 sertifikat dapat digenerate sekaligus' },
          { status: 400 }
        );
      }

      const certificateService = new CertificateService();
      
      const result = await certificateService.generateBulkCertificates({
        templateId,
        studentIds,
        additionalData
      }, user.id);

      return NextResponse.json({
        message: `Bulk generation selesai. ${result.totalGenerated} sertifikat berhasil digenerate`,
        result
      });
    } catch (error) {
      console.error('Error generating bulk certificates:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Gagal generate bulk sertifikat' },
        { status: 500 }
      );
    }
  })(request);
}