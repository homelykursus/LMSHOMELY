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

      // Determine correct file extension based on content
      const pdfHeader = pdfBuffer.subarray(0, 4).toString();
      const fileExtension = pdfHeader === '%PDF' ? 'pdf' : 'docx';
      
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
        pdfBuffer,
        fileSize: pdfValidation.fileSize,
        fileExtension
      });

      console.log(`✅ Word template certificate generated for ${student.name}`);

      return {
        success: true,
        certificateId,
        filePath: `certificates/${certificateId}.${fileExtension}`,
        fileSize: pdfValidation.fileSize,
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
   * Save certificate to database (serverless-compatible)
   */
  private static async saveCertificate(data: {
    templateId: string;
    studentId: string;
    teacherId?: string;
    courseId: string;
    certificateNumber: string;
    courseName: string;
    studentName: string;
    teacherName: string;
    courseDuration: string;
    generatedBy: string;
    pdfBuffer: Buffer;
    fileSize: number;
    fileExtension: string;
  }): Promise<string> {
    // Generate filename for download
    const fileName = `${data.certificateNumber}.${data.fileExtension}`;
    
    // Create certificate record with binary data (serverless-compatible)
    const certificate = await prisma.certificate.create({
      data: {
        certificateNumber: data.certificateNumber,
        templateId: data.templateId,
        studentId: data.studentId,
        teacherId: data.teacherId,
        courseId: data.courseId,
        courseName: data.courseName,
        studentName: data.studentName,
        teacherName: data.teacherName,
        courseDuration: data.courseDuration,
        filePath: fileName, // Store filename for reference
        fileSize: data.fileSize,
        generatedBy: data.generatedBy,
        // Store certificate data as binary in database (production-ready)
        certificateData: data.pdfBuffer,
        downloadUrl: `/api/certificates/download/${fileName}`
      }
    });

    return certificate.id;
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

  /**
   * Get certificate by ID
   */
  static async getCertificate(certificateId: string) {
    return await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        template: true,
        student: true,
        teacher: true,
        course: true
      }
    });
  }

  /**
   * Get certificates by student
   */
  static async getCertificatesByStudent(studentId: string) {
    return await prisma.certificate.findMany({
      where: { studentId },
      include: {
        template: true,
        course: true
      },
      orderBy: { generatedAt: 'desc' }
    });
  }

  /**
   * Get active templates
   */
  static async getActiveTemplates(courseId?: string) {
    return await prisma.certificateTemplate.findMany({
      where: {
        isActive: true,
        ...(courseId && { courseId })
      },
      include: {
        course: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}