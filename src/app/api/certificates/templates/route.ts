import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { CertificateService } from '@/lib/certificate/certificate-service';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// GET - List all templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const isActive = searchParams.get('isActive');

    const templates = await prisma.certificateTemplate.findMany({
      where: {
        ...(courseId && { courseId }),
        ...(isActive !== null && { isActive: isActive === 'true' })
      },
      include: {
        course: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      templates
    });
  } catch (error: any) {
    console.error('Failed to fetch templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST - Upload new template
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const courseId = formData.get('courseId') as string;
    const category = formData.get('category') as string || 'course_completion';
    const createdBy = formData.get('createdBy') as string;

    // Validate required fields
    if (!file || !name || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: file, name, createdBy' },
        { status: 400 }
      );
    }

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

    // Save template to database (no file system operations)
    const template = await prisma.certificateTemplate.create({
      data: {
        name,
        description,
        category,
        courseId: courseId || null,
        originalFileName: file.name,
        filePath: null, // No longer using file system
        templateData: buffer, // Store binary data in database
        placeholders: JSON.stringify(validation.placeholders),
        fileSize: file.size,
        fileType: 'docx',
        createdBy
      },
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
      template,
      validation: {
        placeholders: validation.placeholders,
        warnings: validation.warnings
      }
    });

  } catch (error: any) {
    console.error('Template upload failed:', error);
    return NextResponse.json(
      { success: false, error: `Template upload failed: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE - Delete template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Get template to delete file
    const template = await prisma.certificateTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Delete from database (no file cleanup needed)
    await prisma.certificateTemplate.delete({
      where: { id: templateId }
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