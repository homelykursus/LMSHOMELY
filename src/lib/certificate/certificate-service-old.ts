/**
 * Certificate Service - Word Template Implementation
 * 
 * Production-ready certificate generation using Word templates
 * Designed for Vercel serverless environment with format preservation
 */

import { WordProcessor, WordTemplateData } from './word-processor';
import { PDFGenerator, PDFGenerationOptions } from './pdf-generator';
import { HTMLCertificateGenerator, HTMLCertificateData } from './html-certificate-generator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CertificateGenerationData {
  student_name: string;
  student_id: string;
  course_name: string;
  course_duration: string;
  teacher_name: string;
  certificate_number?: string;
  certificate_date?: string;
  certificate_month_year?: string;
  student_photo?: string;
}

export interface WordCertificateTemplate {
  id: string;
  name: string;
  filePath: string;
  placeholders: string[];
  originalFileName: string;
  fileSize: number;
  isActive: boolean;
}

export interface CertificateGenerationResult {
  success: boolean;
  certificateId?: string;
  filePath?: string;
  downloadUrl?: string;
  fileSize?: number;
  errors?: string[];
  warnings?: string[];
  generationMethod?: 'html-pdf' | 'word-docx';
}

export interface BatchCertificateGenerationResult {
  success: boolean;
  batchId?: string;
  filePath?: string;
  downloadUrl?: string;
  fileSize?: number;
  certificateCount?: number;
  certificateIds?: string[];
  errors?: string[];
  warnings?: string[];
  generationMethod?: 'html-pdf' | 'word-docx';
}

export class CertificateService {
  /**
   * Generate certificate from Word template
   */
  static async generateCertificate(
    templateId: string,
    studentId: string,
    generatedBy: string,
    options: PDFGenerationOptions = {}
  ): Promise<CertificateGenerationResult> {
    try {
      // Get template from database
      const template = await prisma.certificateTemplate.findUnique({
        where: { id: templateId },
        include: { course: true }
      });

      if (!template) {
        return {
          success: false,
          errors: ['Template not found']
        };
      }

      if (!template.isActive) {
        return {
          success: false,
          errors: ['Template is not active']
        };
      }

      // Get student data
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { 
          course: true,
          classes: {
            include: {
              class: {
                include: {
                  teacher: true
                }
              }
            }
          }
        }
      });

      if (!student) {
        return {
          success: false,
          errors: ['Student not found']
        };
      }

      // Prepare certificate data
      const certificateNumber = WordProcessor.generateCertificateNumber(student.studentNumber);
      const certificateDate = WordProcessor.formatCertificateDate();
      const certificateMonthYear = WordProcessor.formatMonthYearRoman();

      // Get teacher name (from first class or default)
      const teacherName = student.classes[0]?.class?.teacher?.name || 'Instruktur';

      // Calculate course duration: duration * 90 minutes converted to hours
      const calculateCourseDurationInHours = (duration: number): string => {
        const totalMinutes = duration * 90;
        const hours = totalMinutes / 60;
        
        // Format to show decimal if needed, otherwise show whole number
        if (hours % 1 === 0) {
          return `${hours} Jam`;
        } else {
          return `${hours.toFixed(1)} Jam`;
        }
      };

      // Try HTML-PDF generation first (disabled in serverless for now)
      // TODO: Re-enable when serverless-compatible PDF solution is implemented
      const isServerless = process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME;
      
      if (student.photo && !isServerless) {
        try {
          console.log(`Attempting HTML-PDF generation with photo for student ${student.name}`);
          
          // Process student photo for HTML embedding
          const processedPhoto = await HTMLCertificateGenerator.processPhotoForHTML(student.photo);
          
          const htmlCertificateData: HTMLCertificateData = {
            student_name: student.name,
            student_id: student.studentNumber,
            course_name: student.course.name,
            course_duration: calculateCourseDurationInHours(student.course.duration),
            teacher_name: teacherName,
            certificate_number: certificateNumber,
            certificate_date: certificateDate,
            certificate_month_year: certificateMonthYear,
            student_photo: processedPhoto
          };

          // Generate HTML (PDF generation disabled in serverless)
          const htmlBuffer = await HTMLCertificateGenerator.generatePDFFromHTML(htmlCertificateData);
          
          // Validate HTML
          const htmlValidation = await HTMLCertificateGenerator.validatePDF(htmlBuffer);
          if (!htmlValidation.isValid) {
            throw new Error(`HTML validation failed: ${htmlValidation.errors.join(', ')}`);
          }

          // Save certificate to database (as HTML for now)
          const certificateId = await this.saveCertificate({
            templateId,
            studentId,
            teacherId: student.classes[0]?.class?.teacher?.id,
            courseId: student.courseId,
            certificateNumber,
            courseName: student.course.name,
            studentName: student.name,
            teacherName,
            courseDuration: calculateCourseDurationInHours(student.course.duration),
            generatedBy,
            pdfBuffer: htmlBuffer,
            fileSize: htmlValidation.fileSize,
            fileExtension: 'html'
          });

          console.log(`✅ HTML certificate generated successfully for ${student.name}`);

          return {
            success: true,
            certificateId,
            filePath: `certificates/${certificateId}.html`,
            fileSize: htmlValidation.fileSize,
            generationMethod: 'html-pdf'
          };

        } catch (htmlError: any) {
          console.warn(`HTML generation failed for ${student.name}: ${htmlError.message}`);
          console.log('Falling back to Word template generation...');
        }
      } else if (student.photo && isServerless) {
        console.log(`Serverless environment detected - skipping HTML-PDF generation for ${student.name}`);
      }

      // Fallback to Word template generation (existing method)
      console.log(`Using Word template generation for student ${student.name}`);

      // Process student photo for Word embedding (text placeholder)
      let processedPhoto: Buffer | string | undefined;
      if (student.photo) {
        processedPhoto = '[Foto Siswa Tersedia]';
        console.log(`Photo placeholder added for student ${student.name}`);
      } else {
        processedPhoto = '[Foto Tidak Tersedia]';
      }

      const certificateData: WordTemplateData = {
        student_name: student.name,
        student_id: student.studentNumber,
        course_name: student.course.name,
        course_duration: calculateCourseDurationInHours(student.course.duration),
        teacher_name: teacherName,
        certificate_number: certificateNumber,
        certificate_date: certificateDate,
        certificate_month_year: certificateMonthYear,
        student_photo: processedPhoto
      };

      // Load template data from database
      if (!template.templateData) {
        return {
          success: false,
          errors: ['Template data not found in database']
        };
      }

      const templateBuffer = Buffer.from(template.templateData);

      // Process Word template
      const processedWordBuffer = await WordProcessor.processTemplate(
        templateBuffer,
        certificateData
      );

      // Convert to PDF (currently returns DOCX)
      const pdfBuffer = await PDFGenerator.convertWordToPDF(
        processedWordBuffer,
        options
      );

      // Validate PDF
      const pdfValidation = await PDFGenerator.validatePDF(pdfBuffer);
      if (!pdfValidation.isValid) {
        return {
          success: false,
          errors: pdfValidation.errors
        };
      }

      // Return certificate data directly without saving to database
      console.log(`✅ Word template certificate generated for ${student.name}`);

      return {
        success: true,
        certificateNumber,
        studentName: student.name,
        courseName: student.course.name,
        fileBuffer: pdfBuffer,
        fileName: `${certificateNumber}.${fileExtension}`,
        fileSize: pdfValidation.fileSize,
        contentType: fileExtension === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        generationMethod: 'word-docx'
      };

    } catch (error: any) {
      console.error('Certificate generation failed:', error);
      return {
        success: false,
        errors: [`Certificate generation failed: ${error.message}`]
      };
    }
  }

  /**
   * Validate Word template
   */
  static async validateWordTemplate(templateBuffer: Buffer): Promise<{
    isValid: boolean;
    placeholders: string[];
    errors: string[];
    warnings: string[];
  }> {
    return await WordProcessor.validateTemplate(templateBuffer);
  }

  /**
   * Extract placeholders from Word template
   */
  static async extractPlaceholders(templateBuffer: Buffer): Promise<string[]> {
    return await WordProcessor.extractPlaceholders(templateBuffer);
  }

  /**
   * Generate certificate number
   */
  static generateCertificateNumber(studentId?: string): string {
    return WordProcessor.generateCertificateNumber(studentId);
  }

  /**
   * Format certificate date
   */
  static formatCertificateDate(date?: Date): string {
    return WordProcessor.formatCertificateDate(date);
  }
}

  /**
   * Generate multiple certificates in one document (batch generation)
   */
  static async generateBatchCertificates(
    templateId: string,
    studentIds: string[],
    generatedBy: string,
    options: PDFGenerationOptions = {}
  ): Promise<BatchCertificateGenerationResult> {
    try {
      if (studentIds.length === 0) {
        return {
          success: false,
          errors: ['No students provided for batch generation']
        };
      }

      console.log(`🔄 Starting batch certificate generation for ${studentIds.length} students`);

      // Get template from database
      const template = await prisma.certificateTemplate.findUnique({
        where: { id: templateId },
        include: { course: true }
      });

      if (!template) {
        return {
          success: false,
          errors: ['Template not found']
        };
      }

      if (!template.isActive) {
        return {
          success: false,
          errors: ['Template is not active']
        };
      }

      if (!template.templateData) {
        return {
          success: false,
          errors: ['Template data not found in database']
        };
      }

      // Get all students data
      const students = await prisma.student.findMany({
        where: { 
          id: { in: studentIds }
        },
        include: { 
          course: true,
          classes: {
            include: {
              class: {
                include: {
                  teacher: true
                }
              }
            }
          }
        }
      });

      if (students.length === 0) {
        return {
          success: false,
          errors: ['No valid students found']
        };
      }

      console.log(`✅ Found ${students.length} students for batch generation`);

      // Prepare certificate data for all students
      const certificateDataArray: WordTemplateData[] = [];
      const certificateNumbers: string[] = [];
      
      const certificateDate = WordProcessor.formatCertificateDate();
      const certificateMonthYear = WordProcessor.formatMonthYearRoman();

      // Calculate course duration helper
      const calculateCourseDurationInHours = (duration: number): string => {
        const totalMinutes = duration * 90;
        const hours = totalMinutes / 60;
        
        if (hours % 1 === 0) {
          return `${hours} Jam`;
        } else {
          return `${hours.toFixed(1)} Jam`;
        }
      };

      for (const student of students) {
        const certificateNumber = WordProcessor.generateCertificateNumber(student.studentNumber);
        const teacherName = student.classes[0]?.class?.teacher?.name || 'Instruktur';
        
        // Process student photo (text placeholder for now)
        let processedPhoto: Buffer | string | undefined;
        if (student.photo) {
          processedPhoto = '[Foto Siswa Tersedia]';
        } else {
          processedPhoto = '[Foto Tidak Tersedia]';
        }

        const certificateData: WordTemplateData = {
          student_name: student.name,
          student_id: student.studentNumber,
          course_name: student.course.name,
          course_duration: calculateCourseDurationInHours(student.course.duration),
          teacher_name: teacherName,
          certificate_number: certificateNumber,
          certificate_date: certificateDate,
          certificate_month_year: certificateMonthYear,
          student_photo: processedPhoto
        };

        certificateDataArray.push(certificateData);
        certificateNumbers.push(certificateNumber);
      }

      console.log(`📄 Processing ${certificateDataArray.length} certificates into one document`);

      // Load template buffer
      const templateBuffer = Buffer.from(template.templateData);

      // Combine all certificates into one Word document
      const combinedWordBuffer = await WordProcessor.combineWordDocuments(
        templateBuffer,
        certificateDataArray
      );

      // Convert to PDF (currently returns DOCX)
      const pdfBuffer = await PDFGenerator.convertWordToPDF(
        combinedWordBuffer,
        options
      );

      // Validate PDF
      const pdfValidation = await PDFGenerator.validatePDF(pdfBuffer);
      if (!pdfValidation.isValid) {
        return {
          success: false,
          errors: pdfValidation.errors
        };
      }

      // Determine file extension
      const pdfHeader = pdfBuffer.subarray(0, 4).toString();
      const fileExtension = pdfHeader === '%PDF' ? 'pdf' : 'docx';

      // Generate batch filename
      const batchId = `BATCH-${Date.now()}`;
      const fileName = `${batchId}-${students.length}certificates.${fileExtension}`;

      console.log(`✅ Batch certificate generation completed successfully`);
      console.log(`📊 Generated ${students.length} certificates in one ${fileExtension.toUpperCase()} file`);

      return {
        success: true,
        batchId,
        fileName,
        fileBuffer: pdfBuffer,
        fileSize: pdfValidation.fileSize,
        certificateCount: students.length,
        contentType: fileExtension === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        generationMethod: 'word-docx',
        certificates: students.map((student, index) => ({
          studentName: student.name,
          certificateNumber: certificateNumbers[index]
        }))
      };

    } catch (error: any) {
      console.error('Batch certificate generation failed:', error);
      return {
        success: false,
        errors: [`Batch certificate generation failed: ${error.message}`]
      };
    }
  }
}