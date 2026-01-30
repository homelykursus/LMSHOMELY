import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { CertificateService } from '@/lib/certificate/certificate-service';
import { writeFile } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// GET - Get template by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const template = await prisma.certificateTemplate.findUnique({
      where: { id: params.id },
      include: {
        course: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template
    });
  } catch (error: any) {
    console.error('Failed to fetch template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// PUT - Update template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const courseId = formData.get('courseId') as string;
    const category = formData.get('category') as string;
    const isActive = formData.get('isActive') as string;
    const file = formData.get('file') as File | null;

    // Get existing template
    const existingTemplate = await prisma.certificateTemplate.findUnique({
      where: { id: params.id }
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    let updateData: any = {};

    // Update basic fields
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (courseId !== undefined) updateData.courseId = courseId || null;
    if (category) updateData.category = category;
    if (isActive !== undefined) updateData.isActive = isActive === 'true';

    // Handle file update
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.docx')) {
        return NextResponse.json(
          { success: false, error: 'Only .docx files are supported' },
          { status: 400 }
        );
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { success: false, error: 'File size must be less than 10MB' },
          { status: 400 }
        );
      }

      // Convert file to buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Validate Word template
      const validation = await CertificateService.validateWordTemplate(buffer);
      if (!validation.isValid) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Template validation failed',
            errors: validation.errors,
            warnings: validation.warnings
          },
          { status: 400 }
        );
      }

      // Generate new filename
      const timestamp = Date.now();
      const sanitizedName = (name || existingTemplate.name).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const fileName = `${sanitizedName}_${timestamp}.docx`;
      const filePath = path.join(process.cwd(), 'public', 'certificate-templates', fileName);

      // Save new file
      await writeFile(filePath, buffer);

      // Delete old file
      const { existsSync, unlinkSync } = await import('fs');
      const oldFilePath = path.join(process.cwd(), existingTemplate.filePath);
      if (existsSync(oldFilePath)) {
        unlinkSync(oldFilePath);
      }

      // Update file-related fields
      updateData.originalFileName = file.name;
      updateData.filePath = `public/certificate-templates/${fileName}`;
      updateData.placeholders = JSON.stringify(validation.placeholders);
      updateData.fileSize = file.size;
      updateData.updatedAt = new Date();
    }

    // Update template in database
    const updatedTemplate = await prisma.certificateTemplate.update({
      where: { id: params.id },
      data: updateData,
      include: {
        course: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      template: updatedTemplate
    });

  } catch (error: any) {
    console.error('Template update failed:', error);
    return NextResponse.json(
      { success: false, error: `Template update failed: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE - Delete template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get template to delete file
    const template = await prisma.certificateTemplate.findUnique({
      where: { id: params.id }
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check if template is being used
    const certificateCount = await prisma.certificate.count({
      where: { templateId: params.id }
    });

    if (certificateCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete template. It is being used by ${certificateCount} certificate(s).` 
        },
        { status: 400 }
      );
    }

    // Delete file from disk
    const { existsSync, unlinkSync } = await import('fs');
    const filePath = path.join(process.cwd(), template.filePath);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    // Delete from database
    await prisma.certificateTemplate.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    });

  } catch (error: any) {
    console.error('Template deletion failed:', error);
    return NextResponse.json(
      { success: false, error: `Template deletion failed: ${error.message}` },
      { status: 500 }
    );
  }
}