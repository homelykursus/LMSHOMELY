import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { CertificateService } from '@/lib/certificate/certificate-service';

// GET - List certificates
export async function GET(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const templateId = searchParams.get('templateId');
      const studentId = searchParams.get('studentId');
      const status = searchParams.get('status');
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      const certificateService = new CertificateService();
      
      const certificates = await certificateService.listCertificates({
        templateId: templateId || undefined,
        studentId: studentId || undefined,
        status: status || undefined,
        limit,
        offset
      });

      return NextResponse.json({
        certificates,
        pagination: {
          limit,
          offset,
          total: certificates.length
        }
      });
    } catch (error) {
      console.error('Error fetching certificates:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data sertifikat' },
        { status: 500 }
      );
    }
  })(request);
}