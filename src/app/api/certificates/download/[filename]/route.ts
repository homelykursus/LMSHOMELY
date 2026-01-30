import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Download certificate file by filename
export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;

    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Filename is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Looking for certificate file: ${filename}`);

    // Find certificate by filename (stored in filePath field)
    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [
          { filePath: filename },
          { filePath: { endsWith: filename } }
        ]
      }
    });

    if (!certificate) {
      console.log(`❌ Certificate not found for filename: ${filename}`);
      return NextResponse.json(
        { success: false, error: 'Certificate not found' },
        { status: 404 }
      );
    }

    if (!certificate.certificateData) {
      console.log(`❌ Certificate data not found for: ${filename}`);
      return NextResponse.json(
        { success: false, error: 'Certificate data not available' },
        { status: 404 }
      );
    }

    console.log(`✅ Found certificate: ${certificate.certificateNumber}`);
    console.log(`📄 File size: ${certificate.fileSize} bytes`);

    // Determine content type based on file extension
    const fileExtension = filename.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (fileExtension) {
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'doc':
        contentType = 'application/msword';
        break;
    }

    // Return the certificate file
    return new NextResponse(certificate.certificateData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': certificate.fileSize?.toString() || '0',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error: any) {
    console.error('Certificate download failed:', error);
    return NextResponse.json(
      { success: false, error: `Download failed: ${error.message}` },
      { status: 500 }
    );
  }
}