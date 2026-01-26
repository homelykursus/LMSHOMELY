import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { WordTemplateProcessor } from '@/lib/certificate/word-template-processor';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';

// GET - List all templates
export async function GET(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const category = searchParams.get('category');
      const courseId = searchParams.get('courseId');
      const isActive = searchParams.get('isActive');

      const where: any = {};
      if (category) where.category = category;
      if (courseId) where.courseId = courseId;
      if (isActive !== null) where.isActive = isActive === 'true';

      const templates = await db.certificateTemplate.findMany({
        where,
        include: {
          course: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              certificates: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Parse placeholders JSON
      const templatesWithParsedPlaceholders = templates.map(template => ({
        ...template,
        placeholders: JSON.parse(template.placeholders || '[]'),
        certificateCount: template._count.certificates
      }));

      return NextResponse.json(templatesWithParsedPlaceholders);
    } catch (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data template' },
        { status: 500 }
      );
    }
  })(request);
}

// POST - Upload new template
export async function POST(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'certificates');
      await fs.mkdir(uploadsDir, { recursive: true });

      // Parse form data
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const name = formData.get('name') as string;
      const description = formData.get('description') as string;
      const category = formData.get('category') as string || 'course_completion';
      const courseId = formData.get('courseId') as string;

      if (!file) {
        return NextResponse.json(
          { error: 'File template harus diupload' },
          { status: 400 }
        );
      }

      if (!name) {
        return NextResponse.json(
          { error: 'Nama template harus diisi' },
          { status: 400 }
        );
      }

      // Validate file type
      const allowedTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Format file tidak didukung. Hanya mendukung .docx dan .doc' },
          { status: 400 }
        );
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Ukuran file maksimal 10MB' },
          { status: 400 }
        );
      }

      // Generate unique filename
      const fileExt = path.extname(file.name);
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}${fileExt}`;
      const filePath = path.join(uploadsDir, fileName);

      // Save file
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);

      try {
        // Process template
        const processor = new WordTemplateProcessor();
        const templateData = await processor.parseTemplate(filePath);
        
        // Validate template
        const validation = await processor.validateTemplate(templateData);
        if (!validation.isValid) {
          // Delete uploaded file if validation fails
          await fs.unlink(filePath);
          return NextResponse.json(
            { 
              error: 'Template tidak valid', 
              details: validation.errors 
            },
            { status: 400 }
          );
        }

        // Save template to database
        const template = await db.certificateTemplate.create({
          data: {
            name,
            description,
            category,
            courseId: courseId || null,
            originalFileName: file.name,
            filePath: fileName,
            placeholders: JSON.stringify(templateData.placeholders),
            fileSize: file.size,
            fileType: templateData.metadata.fileType,
            createdBy: user.id,
            isActive: true
          }
        });

        return NextResponse.json({
          message: 'Template berhasil diupload',
          template: {
            ...template,
            placeholders: templateData.placeholders,
            validation: validation.warnings.length > 0 ? { warnings: validation.warnings } : null
          }
        });

      } catch (processingError) {
        // Delete uploaded file if processing fails
        await fs.unlink(filePath);
        throw processingError;
      }

    } catch (error) {
      console.error('Error uploading template:', error);
      return NextResponse.json(
        { error: 'Gagal mengupload template' },
        { status: 500 }
      );
    }
  })(request);
}