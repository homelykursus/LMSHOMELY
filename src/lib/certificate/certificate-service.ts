/**
 * Certificate Service - Word Template Implementation
 * 
 * Production-ready certificate generation using Word templates
 * Designed for Vercel serverless environment with format preservation
 */

import { WordProcessor, WordTemplateData } from './word-processor';
import { PDFGenerator, PDFGenerationOptions } from './pdf-generator';
import { PrismaClient } from '@prisma/client';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';

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
      const certificateNumber = WordProcessor.generateCertificateNumber();
      const certificateDate = WordProcessor.formatCertificateDate();
      const certificateMonthYear = WordProcessor.formatMonthYearRoman();

      // Get teacher name (from first class or default)
      const teacherName = student.classes[0]?.class?.teacher?.name || 'Instruktur';

      const certificateData: WordTemplateData = {
        student_name: student.name,
        student_id: student.studentNumber,
        course_name: student.course.name,
        course_duration: `${student.course.duration} Jam`,
        teacher_name: teacherName,
        certificate_number: certificateNumber,
        certificate_date: certificateDate,
        certificate_month_year: certificateMonthYear,
        student_photo: student.photo || undefined
      };

      // Load template data from database
      if (!template.templateData) {
        return {
          success: false,
          errors: ['Template data not found in database']
        };
      }

      const templateBuffer = template.templateData;

      // Process Word template
      const processedWordBuffer = await WordProcessor.processTemplate(
        templateBuffer,
        certificateData
      );

      // Convert to PDF
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

      // Save certificate to database and file system
      // Determine correct file extension based on content
      const pdfHeader = pdfBuffer.slice(0, 4).toString();
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
        courseDuration: `${student.course.duration} Jam`,
        generatedBy,
        pdfBuffer,
        fileSize: pdfValidation.fileSize,
        fileExtension
      });

      return {
        success: true,
        certificateId,
        filePath: `certificates/${certificateId}.${fileExtension}`,
        fileSize: pdfValidation.fileSize,
        fileType: fileExtension
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
   * Save certificate to database and file system
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
    // Create certificate record
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
        filePath: '', // Will be updated after file save
        fileSize: data.fileSize,
        generatedBy: data.generatedBy
      }
    });

    // Save file with correct extension
    const certificatesDir = path.join(process.cwd(), 'public', 'generated-certificates');
    if (!existsSync(certificatesDir)) {
      mkdirSync(certificatesDir, { recursive: true });
    }

    const fileName = `${certificate.id}.${data.fileExtension}`;
    const filePath = path.join(certificatesDir, fileName);
    writeFileSync(filePath, data.pdfBuffer);

    // Update certificate with file path
    await prisma.certificate.update({
      where: { id: certificate.id },
      data: {
        filePath: `public/generated-certificates/${fileName}`,
        downloadUrl: `/generated-certificates/${fileName}`
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
  static generateCertificateNumber(): string {
    return WordProcessor.generateCertificateNumber();
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