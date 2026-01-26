import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

// DELETE - Delete certificate
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req, user) => {
    try {
      const certificateId = params.id;

      // Get certificate details first
      const certificate = await db.certificate.findUnique({
        where: { id: certificateId },
        select: {
          id: true,
          certificateNumber: true,
          filePath: true,
          studentName: true,
          courseName: true,
          status: true
        }
      });

      if (!certificate) {
        return NextResponse.json(
          { error: 'Sertifikat tidak ditemukan' },
          { status: 404 }
        );
      }

      // Delete the physical PDF file
      if (certificate.filePath) {
        const certificatesDir = path.join(process.cwd(), 'public', 'certificates');
        const filePath = path.join(certificatesDir, certificate.filePath);
        
        try {
          await fs.unlink(filePath);
          console.log(`Deleted certificate file: ${filePath}`);
        } catch (fileError) {
          console.warn(`Failed to delete certificate file: ${filePath}`, fileError);
          // Continue with database deletion even if file deletion fails
        }
      }

      // Delete any processed photos associated with this certificate
      const certificatePhotosDir = path.join(process.cwd(), 'public', 'certificates', 'photos');
      try {
        const photoFiles = await fs.readdir(certificatePhotosDir);
        const certificatePhotoFiles = photoFiles.filter(file => 
          file.startsWith(certificate.certificateNumber)
        );
        
        for (const photoFile of certificatePhotoFiles) {
          const photoPath = path.join(certificatePhotosDir, photoFile);
          try {
            await fs.unlink(photoPath);
            console.log(`Deleted certificate photo: ${photoPath}`);
          } catch (photoError) {
            console.warn(`Failed to delete certificate photo: ${photoPath}`, photoError);
          }
        }
      } catch (dirError) {
        console.warn('Failed to read certificate photos directory:', dirError);
      }

      // Delete certificate record from database
      await db.certificate.delete({
        where: { id: certificateId }
      });

      return NextResponse.json({
        success: true,
        message: 'Sertifikat berhasil dihapus',
        deletedCertificate: {
          id: certificate.id,
          certificateNumber: certificate.certificateNumber,
          studentName: certificate.studentName,
          courseName: certificate.courseName
        }
      });

    } catch (error) {
      console.error('Error deleting certificate:', error);
      return NextResponse.json(
        { error: 'Gagal menghapus sertifikat' },
        { status: 500 }
      );
    }
  })(request);
}

// GET - Get certificate details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req, user) => {
    try {
      const certificateId = params.id;

      const certificate = await db.certificate.findUnique({
        where: { id: certificateId },
        include: {
          template: {
            select: {
              id: true,
              name: true,
              category: true
            }
          },
          student: {
            select: {
              id: true,
              name: true,
              studentNumber: true,
              photo: true
            }
          },
          teacher: {
            select: {
              id: true,
              name: true
            }
          },
          course: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      if (!certificate) {
        return NextResponse.json(
          { error: 'Sertifikat tidak ditemukan' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        certificate
      });

    } catch (error) {
      console.error('Error fetching certificate:', error);
      return NextResponse.json(
        { error: 'Gagal memuat detail sertifikat' },
        { status: 500 }
      );
    }
  })(request);
}