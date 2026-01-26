import * as XLSX from 'xlsx';
import { z } from 'zod';

// Validation schema for student import data
export const StudentImportSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  
  dateOfBirth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime()) && parsed <= new Date();
    }, 'Invalid date or future date not allowed'),
  
  whatsapp: z.string()
    .min(10, 'WhatsApp number must be at least 10 characters')
    .regex(/^[\+]?[0-9\-\(\)\s]+$/, 'Invalid WhatsApp number format'),
  
  courseId: z.string()
    .min(1, 'Course ID is required'),
  
  courseName: z.string().optional(), // Reference only, not validated
  
  courseType: z.enum(['regular', 'private'], {
    message: 'Course type must be either regular or private'
  }),
  
  participants: z.string()
    .regex(/^\d+$/, 'Participants must be a number')
    .transform((val) => parseInt(val))
    .refine((val) => val > 0, 'Participants must be greater than 0'),
  
  finalPrice: z.string()
    .regex(/^\d+$/, 'Final price must be a number')
    .transform((val) => parseInt(val))
    .refine((val) => val >= 0, 'Final price must be 0 or greater'),
  
  discount: z.string()
    .regex(/^\d+$/, 'Discount must be a number')
    .transform((val) => parseInt(val))
    .refine((val) => val >= 0, 'Discount must be 0 or greater'),
  
  lastEducation: z.string().optional(),
  
  status: z.enum(['pending', 'confirmed', 'completed'], {
    message: 'Status must be one of: pending, confirmed, completed'
  })
});

export type StudentImportData = z.infer<typeof StudentImportSchema>;

export interface ImportError {
  row: number;
  field: string;
  value: any;
  message: string;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  validRows: StudentImportData[];
  errors: ImportError[];
  duplicateIds: string[];
  duplicateEmails: string[];
}

/**
 * Parse Excel file and extract student data
 */
export function parseExcelFile(buffer: Buffer): ImportResult {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    
    if (!sheetName) {
      throw new Error('No worksheet found in Excel file');
    }
    
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      blankrows: false
    }) as any[][];

    if (jsonData.length < 2) {
      throw new Error('Excel file must contain at least a header row and one data row');
    }

    // Find the header row (look for row that contains 'Name' as first column)
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(10, jsonData.length); i++) {
      const row = jsonData[i];
      if (row && row.some((cell: any) => 
        typeof cell === 'string' && (
          cell.toLowerCase().includes('name') ||
          cell.toLowerCase().includes('student id') // Keep backward compatibility
        )
      )) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      throw new Error('Header row with \"Name\" or \"Student ID\" column not found in first 10 rows');
    }

    const headers = jsonData[headerRowIndex].map((h: any) => 
      typeof h === 'string' ? h.trim() : ''
    );
    
    // Map expected headers to column indices
    const columnMap = {
      name: findColumnIndex(headers, ['name', 'student name', 'full name']),
      dateOfBirth: findColumnIndex(headers, ['date of birth', 'dateofbirth', 'birth date']),
      whatsapp: findColumnIndex(headers, ['whatsapp', 'phone', 'phone number', 'mobile']),
      courseId: findColumnIndex(headers, ['course id', 'courseid']),
      courseName: findColumnIndex(headers, ['course name', 'coursename', 'course']),
      courseType: findColumnIndex(headers, ['course type', 'coursetype', 'type']),
      participants: findColumnIndex(headers, ['participants', 'participant', 'jumlah peserta']),
      finalPrice: findColumnIndex(headers, ['final price', 'finalprice', 'price', 'harga']),
      discount: findColumnIndex(headers, ['discount', 'diskon']),
      lastEducation: findColumnIndex(headers, ['last education', 'lasteducation', 'education', 'pendidikan']),
      status: findColumnIndex(headers, ['status'])
    };

    // Check required columns
    const requiredColumns = ['name', 'dateOfBirth', 'whatsapp', 'courseId', 'courseType', 'participants', 'finalPrice', 'status'];
    const missingColumns = requiredColumns.filter(col => columnMap[col as keyof typeof columnMap] === -1);
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    const validRows: StudentImportData[] = [];
    const errors: ImportError[] = [];
    const seenCombinations = new Set<string>(); // WhatsApp + Course ID combination
    const duplicateIds: string[] = [];
    const duplicateEmails: string[] = [];

    // Process data rows (skip header and any rows before it)
    for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 1; // Excel row number (1-based)
      
      // Skip empty rows
      if (!row || row.every((cell: any) => !cell || cell.toString().trim() === '')) {
        continue;
      }

      // Extract data from row
      const rowData = {
        name: getCellValue(row, columnMap.name),
        dateOfBirth: getCellValue(row, columnMap.dateOfBirth),
        whatsapp: getCellValue(row, columnMap.whatsapp),
        courseId: getCellValue(row, columnMap.courseId),
        courseName: getCellValue(row, columnMap.courseName),
        courseType: getCellValue(row, columnMap.courseType),
        participants: getCellValue(row, columnMap.participants),
        finalPrice: getCellValue(row, columnMap.finalPrice),
        discount: getCellValue(row, columnMap.discount),
        lastEducation: getCellValue(row, columnMap.lastEducation),
        status: getCellValue(row, columnMap.status)
      };

      // Check for duplicates within the file (using whatsapp + courseId combination)
      const combinationKey = `${rowData.whatsapp}|${rowData.courseId}`;
      if (rowData.whatsapp && rowData.courseId && seenCombinations.has(combinationKey)) {
        duplicateIds.push(combinationKey);
        errors.push({
          row: rowNumber,
          field: 'whatsapp + courseId',
          value: `${rowData.whatsapp} + ${rowData.courseId}`,
          message: 'Duplicate WhatsApp number and Course ID combination within the file'
        });
      } else if (rowData.whatsapp && rowData.courseId) {
        seenCombinations.add(combinationKey);
      }

      // Validate the row data
      const validation = StudentImportSchema.safeParse(rowData);
      
      if (validation.success) {
        validRows.push(validation.data);
      } else {
        // Add validation errors
        validation.error.issues.forEach(error => {
          errors.push({
            row: rowNumber,
            field: error.path[0] as string,
            value: rowData[error.path[0] as keyof typeof rowData],
            message: error.message
          });
        });
      }
    }

    return {
      success: errors.length === 0,
      totalRows: jsonData.length - headerRowIndex - 1,
      validRows,
      errors,
      duplicateIds: Array.from(new Set(duplicateIds)),
      duplicateEmails: Array.from(new Set(duplicateEmails))
    };

  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Find column index by matching header names (case-insensitive)
 */
function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.findIndex(header => 
      header.toLowerCase().trim() === name.toLowerCase()
    );
    if (index !== -1) return index;
  }
  return -1;
}

/**
 * Get cell value safely
 */
function getCellValue(row: any[], columnIndex: number): string {
  if (columnIndex === -1 || !row || columnIndex >= row.length) {
    return '';
  }
  
  const value = row[columnIndex];
  if (value === null || value === undefined) {
    return '';
  }
  
  return value.toString().trim();
}

/**
 * Generate Excel file from student data
 */
export function generateStudentExcel(students: any[]): Buffer {
  // Prepare data for Excel
  const headers = [
    'Name',
    'Date of Birth',
    'WhatsApp',
    'Course ID',
    'Course Name',
    'Course Type',
    'Participants',
    'Final Price',
    'Discount',
    'Last Education',
    'Status',
    'Class Name',
    'Created At',
    'Updated At'
  ];

  const data = students.map(student => [
    student.name,
    student.dateOfBirth,
    student.whatsapp,
    student.courseId,
    student.course?.name || '',
    student.courseType,
    student.participants,
    student.finalPrice,
    student.discount || 0,
    student.lastEducation || '',
    student.status,
    student.classes?.[0]?.class?.name || '',
    new Date(student.createdAt).toLocaleDateString('id-ID'),
    new Date(student.updatedAt).toLocaleDateString('id-ID')
  ]);

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Set column widths
  const columnWidths = [
    { wch: 20 }, // Name
    { wch: 15 }, // Date of Birth
    { wch: 15 }, // WhatsApp
    { wch: 12 }, // Course ID
    { wch: 25 }, // Course Name
    { wch: 12 }, // Course Type
    { wch: 12 }, // Participants
    { wch: 15 }, // Final Price
    { wch: 12 }, // Discount
    { wch: 15 }, // Last Education
    { wch: 12 }, // Status
    { wch: 20 }, // Class Name
    { wch: 12 }, // Created At
    { wch: 12 }  // Updated At
  ];
  worksheet['!cols'] = columnWidths;

  // Style the header row
  const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:N1');
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;
    
    worksheet[cellAddress].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '4472C4' } },
      alignment: { horizontal: 'center' }
    };
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students Data');

  // Generate buffer
  return XLSX.write(workbook, { 
    type: 'buffer', 
    bookType: 'xlsx',
    compression: true 
  });
}