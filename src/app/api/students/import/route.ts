import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseExcelFile, StudentImportData, ImportResult } from '@/lib/excel-utils';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting student import process...');

    // Parse the multipart form data using Next.js built-in FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded. Please select an Excel file.' },
        { status: 400 }
      );
    }

    console.log(`Processing file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    // Validate file type
    if (!file.type.includes('spreadsheet') && !file.type.includes('excel')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls).' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse Excel file
    let parseResult: ImportResult;
    try {
      parseResult = parseExcelFile(buffer);
    } catch (error) {
      console.error('Excel parsing error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to parse Excel file',
          details: error instanceof Error ? error.message : 'Unknown parsing error'
        },
        { status: 400 }
      );
    }

    console.log(`Parse result: ${parseResult.validRows.length} valid rows, ${parseResult.errors.length} errors`);

    // If there are parsing errors, return them for user review
    if (parseResult.errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Validation errors found in Excel file',
        result: {
          totalRows: parseResult.totalRows,
          validRows: parseResult.validRows.length,
          errorCount: parseResult.errors.length,
          errors: parseResult.errors,
          duplicateIds: parseResult.duplicateIds,
          duplicateEmails: parseResult.duplicateEmails,
          previewData: parseResult.validRows.slice(0, 5) // First 5 valid rows for preview
        }
      }, { status: 422 }); // 422 Unprocessable Entity
    }

    // Check for database duplicates (WhatsApp + Course ID combination)
    const whatsappNumbers = parseResult.validRows.map(row => row.whatsapp);
    const courseIds = Array.from(new Set(parseResult.validRows.map(row => row.courseId)));

    const [existingStudents, existingCourses] = await Promise.all([
      // Check existing WhatsApp + Course ID combinations
      db.student.findMany({
        where: { 
          whatsapp: { in: whatsappNumbers },
          courseId: { in: courseIds }
        },
        select: { whatsapp: true, courseId: true }
      }),
      
      // Validate course IDs exist
      db.course.findMany({
        where: { 
          id: { in: courseIds }
        },
        select: { id: true, name: true }
      })
    ]);

    // Create set of existing WhatsApp + Course ID combinations
    const existingCombinations = new Set(
      existingStudents.map(s => `${s.whatsapp}|${s.courseId}`)
    );
    const validCourseIds = new Set(existingCourses.map(c => c.id));

    // Filter out rows with database conflicts and invalid course IDs
    const dbErrors: any[] = [];
    const validRowsForImport: StudentImportData[] = [];

    parseResult.validRows.forEach((row, index) => {
      let hasError = false;

      // Check for existing WhatsApp + Course ID combination
      const combinationKey = `${row.whatsapp}|${row.courseId}`;
      if (existingCombinations.has(combinationKey)) {
        dbErrors.push({
          row: index + 2, // Approximate row number
          field: 'whatsapp + courseId',
          value: `${row.whatsapp} + ${row.courseId}`,
          message: 'WhatsApp number and Course ID combination already exists in database'
        });
        hasError = true;
      }

      // Check for valid course ID
      if (!validCourseIds.has(row.courseId)) {
        dbErrors.push({
          row: index + 2,
          field: 'courseId',
          value: row.courseId,
          message: 'Course ID does not exist in database'
        });
        hasError = true;
      }

      if (!hasError) {
        validRowsForImport.push(row);
      }
    });

    // If there are database conflicts, return them
    if (dbErrors.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Database validation errors found',
        result: {
          totalRows: parseResult.totalRows,
          validRows: validRowsForImport.length,
          errorCount: dbErrors.length,
          errors: dbErrors,
          duplicateIds: existingStudents.map(s => `${s.whatsapp}|${s.courseId}`),
          duplicateEmails: [],
          previewData: validRowsForImport.slice(0, 5)
        }
      }, { status: 422 });
    }

    // All validations passed, proceed with import
    console.log(`Importing ${validRowsForImport.length} students...`);

    const importedStudents: any[] = [];
    const importErrors: any[] = [];

    // Import students in a transaction
    try {
      await db.$transaction(async (tx) => {
        for (const studentData of validRowsForImport) {
          try {
            const student = await tx.student.create({
              data: {
                name: studentData.name,
                dateOfBirth: studentData.dateOfBirth,
                whatsapp: studentData.whatsapp,
                courseId: studentData.courseId,
                courseType: studentData.courseType,
                participants: studentData.participants,
                finalPrice: studentData.finalPrice,
                discount: studentData.discount || 0,
                lastEducation: studentData.lastEducation || null,
                status: studentData.status
              }
            });
            importedStudents.push(student);
          } catch (error) {
            console.error(`Error importing student ${studentData.name}:`, error);
            importErrors.push({
              studentId: studentData.whatsapp,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      });
    } catch (error) {
      console.error('Transaction failed:', error);
      return NextResponse.json(
        { 
          error: 'Failed to import students due to database error',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    console.log(`Import completed: ${importedStudents.length} successful, ${importErrors.length} failed`);

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedStudents.length} students`,
      result: {
        totalRows: parseResult.totalRows,
        successCount: importedStudents.length,
        errorCount: importErrors.length,
        errors: importErrors,
        importedStudents: importedStudents.map(s => ({
          id: s.id,
          name: s.name,
          whatsapp: s.whatsapp
        }))
      }
    });

  } catch (error) {
    console.error('Import API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during import',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for import status or validation
export async function GET(request: NextRequest) {
  try {
    // This could be used for checking import status or getting validation info
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'validate-courses') {
      // Return available courses for validation
      const courses = await db.course.findMany({
        select: {
          id: true,
          name: true,
          isActive: true
        },
        where: {
          isActive: true
        },
        orderBy: {
          name: 'asc'
        }
      });

      return NextResponse.json({
        success: true,
        courses: courses
      });
    }

    if (action === 'import-stats') {
      // Return import statistics
      const totalStudents = await db.student.count();
      const activeStudents = await db.student.count({
        where: { status: 'active' }
      });
      const recentImports = await db.student.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      return NextResponse.json({
        success: true,
        stats: {
          totalStudents,
          activeStudents,
          recentImports
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Import GET API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}