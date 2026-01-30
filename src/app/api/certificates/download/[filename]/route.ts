import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    
    // Security check - only allow PDF and DOCX files and prevent directory traversal
    const allowedExtensions = ['.pdf', '.docx'];
    const hasValidExtension = allowedExtensions.some(ext => filename.endsWith(ext));
    
    if (!hasValidExtension || filename.includes('..') || filename.includes('/')) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    // Find certificate by filename (stored in filePath field)
    const certificate = await prisma.certificate.findFirst({
      where: {
        filePath: filename
      }
    });
    
    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Check if certificate has binary data
    if (!certificate.certificateData) {
      return NextResponse.json(
        { error: 'Certificate data not available' },
        { status: 404 }
      );
    }

    const fileBuffer = certificate.certificateData;
    
    // Determine content type based on actual file content
    let contentType = 'application/octet-stream';
    let downloadFilename = filename;
    
    const pdfHeader = fileBuffer.slice(0, 4).toString();
    const docxHeader = fileBuffer.slice(0, 2).toString('hex');
    
    if (pdfHeader === '%PDF') {
      contentType = 'application/pdf';
      // Ensure filename has .pdf extension
      if (!downloadFilename.endsWith('.pdf')) {
        downloadFilename = downloadFilename.replace(/\.[^.]+$/, '.pdf');
      }
    } else if (docxHeader === '504b') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      // Ensure filename has .docx extension
      if (!downloadFilename.endsWith('.docx')) {
        downloadFilename = downloadFilename.replace(/\.[^.]+$/, '.docx');
      }
    }

    // Create response with proper headers for download
    const response = new NextResponse(fileBuffer);
    
    response.headers.set('Content-Type', contentType);
    response.headers.set('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    response.headers.set('Content-Length', fileBuffer.length.toString());
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}