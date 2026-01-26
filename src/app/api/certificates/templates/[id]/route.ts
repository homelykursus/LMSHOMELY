import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

// GET - Get template by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req, user) => {
    try {
      const template = await db.certificateTemplate.findUnique({
        where: { id: params.id },
        include: {
          _count: {
            select: {
              certificates: true
            }
          }
        }
      });

      if (!template) {
        return NextResponse.json(
          { error: 'Template tidak ditemukan' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        ...template,
        placeholders: JSON.parse(template.placeholders || '[]'),
        certificateCount: template._count.certificates
      });
    } catch (error) {
      console.error('Error fetching template:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data template' },
        { status: 500 }
      );
    }
  })(request);
}

// PUT - Update template metadata
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req, user) => {
    try {
      const body = await req.json();
      const { name, description, category, isActive } = body;

      // Check if template exists
      const existingTemplate = await db.certificateTemplate.findUnique({
        where: { id: params.id }
      });

      if (!existingTemplate) {
        return NextResponse.json(
          { error: 'Template tidak ditemukan' },
          { status: 404 }
        );
      }

      // Update template
      const updatedTemplate = await db.certificateTemplate.update({
        where: { id: params.id },
        data: {
          name: name || existingTemplate.name,
          description: description !== undefined ? description : existingTemplate.description,
          category: category || existingTemplate.category,
          isActive: isActive !== undefined ? isActive : existingTemplate.isActive,
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        message: 'Template berhasil diperbarui',
        template: {
          ...updatedTemplate,
          placeholders: JSON.parse(updatedTemplate.placeholders || '[]')
        }
      });
    } catch (error) {
      console.error('Error updating template:', error);
      return NextResponse.json(
        { error: 'Gagal memperbarui template' },
        { status: 500 }
      );
    }
  })(request);
}

// DELETE - Delete template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req, user) => {
    try {
      // Check if template exists
      const template = await db.certificateTemplate.findUnique({
        where: { id: params.id },
        include: {
          _count: {
            select: {
              certificates: true
            }
          }
        }
      });

      if (!template) {
        return NextResponse.json(
          { error: 'Template tidak ditemukan' },
          { status: 404 }
        );
      }

      // Note: Safety check removed - templates can now be deleted even if used
      // This allows administrators to delete any template as requested

      // Delete file from filesystem
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'certificates', template.filePath);
      try {
        await fs.unlink(filePath);
        console.log(`Deleted template file: ${filePath}`);
      } catch (fileError) {
        console.warn('Warning: Could not delete template file:', fileError);
        // Continue with database deletion even if file deletion fails
      }

      // Delete from database
      await db.certificateTemplate.delete({
        where: { id: params.id }
      });

      return NextResponse.json({
        message: 'Template berhasil dihapus',
        deletedTemplate: {
          id: template.id,
          name: template.name,
          certificateCount: template._count.certificates
        }
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      return NextResponse.json(
        { error: 'Gagal menghapus template' },
        { status: 500 }
      );
    }
  })(request);
}