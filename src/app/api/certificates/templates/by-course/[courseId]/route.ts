import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - Get templates by course ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  return withAuth(async (req, user) => {
    try {
      // Get templates for specific course + general templates (courseId = null)
      const templates = await db.certificateTemplate.findMany({
        where: {
          OR: [
            { courseId: params.courseId },
            { courseId: null } // General templates
          ],
          isActive: true
        },
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
        orderBy: [
          { courseId: 'asc' }, // Course-specific templates first
          { createdAt: 'desc' }
        ]
      });

      // Parse placeholders JSON
      const templatesWithParsedPlaceholders = templates.map(template => ({
        ...template,
        placeholders: JSON.parse(template.placeholders || '[]'),
        certificateCount: template._count.certificates,
        isGeneral: template.courseId === null
      }));

      return NextResponse.json(templatesWithParsedPlaceholders);
    } catch (error) {
      console.error('Error fetching templates by course:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil template untuk course ini' },
        { status: 500 }
      );
    }
  })(request);
}