import { db } from '@/lib/db';
import { WordTemplateProcessor, StudentData } from './word-template-processor';
import { PDFGenerator } from './pdf-generator';
import { RomanNumeralConverter } from '@/lib/roman-numeral-converter';
import { ImageProcessor } from './image-processor';
import fs from 'fs/promises';
import path from 'path';

export interface CertificateRequest {
  templateId: string;
  studentId: string;
  additionalData?: Record<string, any>;
}

export interface BulkCertificateRequest {
  templateId: string;
  studentIds: string[];
  additionalData?: Record<string, any>;
}

export interface GenerationResult {
  certificateId: string;
  certificateNumber: string;
  downloadUrl: string;
  generatedAt: Date;
  filePath: string;
}

export interface BulkGenerationResult {
  totalGenerated: number;
  successful: GenerationResult[];
  failed: GenerationError[];
  zipDownloadUrl?: string;
}

export interface GenerationError {
  studentId: string;
  studentName: string;
  error: string;
}

export interface PreviewRequest {
  templateId: string;
  studentId: string;
}

export interface PreviewData {
  previewUrl: string;
  studentData: StudentData;
  templateName: string;
}

export class CertificateService {
  private wordProcessor: WordTemplateProcessor;
  private pdfGenerator: PDFGenerator;
  private uploadsDir: string;
  private certificatesDir: string;

  constructor() {
    this.wordProcessor = new WordTemplateProcessor();
    this.pdfGenerator = new PDFGenerator();
    this.uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'certificates');
    this.certificatesDir = path.join(process.cwd(), 'public', 'certificates');
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  private async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
      await fs.mkdir(this.certificatesDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }

  /**
   * Generate single certificate
   */
  async generateCertificate(request: CertificateRequest, generatedBy: string): Promise<GenerationResult> {
    try {
      // Get student data first to determine course
      const student = await db.student.findUnique({
        where: { id: request.studentId },
        include: {
          course: true,
          classes: {
            include: {
              class: {
                select: {
                  id: true,
                  name: true,
                  totalMeetings: true,
                  isActive: true,
                  teacher: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!student) {
        throw new Error('Data siswa tidak ditemukan');
      }

      // Get template - prioritize course-specific template, fallback to general
      let template = await db.certificateTemplate.findFirst({
        where: { 
          id: request.templateId,
          isActive: true,
          OR: [
            { courseId: student.courseId }, // Course-specific
            { courseId: null } // General template
          ]
        }
      });

      // If no template found with the given ID, try to find any suitable template for this course
      if (!template) {
        template = await db.certificateTemplate.findFirst({
          where: {
            isActive: true,
            OR: [
              { courseId: student.courseId }, // Course-specific first
              { courseId: null } // General template as fallback
            ]
          },
          orderBy: [
            { courseId: 'asc' }, // Course-specific templates first
            { createdAt: 'desc' }
          ]
        });
      }

      if (!template) {
        throw new Error(`Tidak ada template yang tersedia untuk course "${student.course.name}"`);
      }

      // Generate certificate number
      const certificateNumber = WordTemplateProcessor.generateCertificateNumber();

      // Prepare student data for template
      const studentData = await this.prepareStudentData(student, request.additionalData, certificateNumber);

      // Process template with student data (preserving formatting)
      const templatePath = path.join(this.uploadsDir, template.filePath);
      const processedWordBuffer = await this.wordProcessor.populateTemplate(templatePath, studentData);

      // Save processed Word document temporarily
      const tempWordPath = path.join(this.certificatesDir, `temp_${certificateNumber}.docx`);
      await fs.writeFile(tempWordPath, processedWordBuffer);

      // Generate PDF from processed Word document
      const pdfBuffer = await this.pdfGenerator.generateFromWordTemplate(
        tempWordPath,
        studentData // This is now mainly for fallback scenarios
      );

      // Clean up temporary Word file
      try {
        await fs.unlink(tempWordPath);
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary Word file:', cleanupError);
      }

      // Save PDF file
      const pdfFileName = `${certificateNumber}.pdf`;
      const pdfFilePath = path.join(this.certificatesDir, pdfFileName);
      await fs.writeFile(pdfFilePath, pdfBuffer);

      // Get teacher info (from first class if available)
      const firstClass = student.classes[0]?.class;
      const teacher = firstClass?.teacher;

      // Save certificate record to database
      const certificate = await db.certificate.create({
        data: {
          certificateNumber,
          templateId: template.id,
          studentId: request.studentId,
          teacherId: teacher?.id,
          courseId: student.courseId,
          courseName: student.course.name,
          studentName: student.name,
          teacherName: teacher?.name,
          courseDuration: `${student.course.duration} jam`,
          generatedAt: new Date(),
          filePath: pdfFileName,
          downloadUrl: `/certificates/${pdfFileName}`,
          fileSize: pdfBuffer.length,
          status: 'generated',
          generatedBy,
          metadata: JSON.stringify({
            templateName: template.name,
            templateId: template.id,
            courseSpecific: template.courseId !== null,
            additionalData: request.additionalData
          })
        }
      });

      return {
        certificateId: certificate.id,
        certificateNumber: certificate.certificateNumber,
        downloadUrl: certificate.downloadUrl || '',
        generatedAt: certificate.generatedAt,
        filePath: certificate.filePath
      };
    } catch (error) {
      throw new Error(`Gagal generate sertifikat: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate bulk certificates
   */
  async generateBulkCertificates(request: BulkCertificateRequest, generatedBy: string): Promise<BulkGenerationResult> {
    const successful: GenerationResult[] = [];
    const failed: GenerationError[] = [];

    for (const studentId of request.studentIds) {
      try {
        const result = await this.generateCertificate({
          templateId: request.templateId,
          studentId,
          additionalData: request.additionalData
        }, generatedBy);
        
        successful.push(result);
      } catch (error) {
        // Get student name for error reporting
        const student = await db.student.findUnique({
          where: { id: studentId },
          select: { name: true }
        });

        failed.push({
          studentId,
          studentName: student?.name || 'Unknown',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      totalGenerated: successful.length,
      successful,
      failed
    };
  }

  /**
   * Preview certificate with sample data
   */
  async previewCertificate(request: PreviewRequest): Promise<PreviewData> {
    try {
      // Get template
      const template = await db.certificateTemplate.findUnique({
        where: { id: request.templateId, isActive: true }
      });

      if (!template) {
        throw new Error('Template tidak ditemukan');
      }

      // Get student data
      const student = await db.student.findUnique({
        where: { id: request.studentId },
        include: {
          course: true,
          classes: {
            include: {
              class: {
                select: {
                  id: true,
                  name: true,
                  totalMeetings: true,
                  isActive: true,
                  teacher: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!student) {
        throw new Error('Data siswa tidak ditemukan');
      }

      // Generate certificate number for photo processing
      const certificateNumber = WordTemplateProcessor.generateCertificateNumber();

      // Prepare student data
      const studentData = await this.prepareStudentData(student, undefined, certificateNumber);

      // Process template with student data (preserving formatting)
      const templatePath = path.join(this.uploadsDir, template.filePath);
      const processedWordBuffer = await this.wordProcessor.populateTemplate(templatePath, studentData);

      // Save processed Word document temporarily
      const tempWordPath = path.join(this.certificatesDir, `temp_preview_${Date.now()}.docx`);
      await fs.writeFile(tempWordPath, processedWordBuffer);

      // Generate preview PDF from processed Word document
      const previewBuffer = await this.pdfGenerator.generateFromWordTemplate(
        tempWordPath,
        studentData
      );

      // Clean up temporary Word file
      try {
        await fs.unlink(tempWordPath);
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary Word file:', cleanupError);
      }

      // Save temporary preview file
      const previewFileName = `preview_${Date.now()}.pdf`;
      const previewPath = path.join(this.certificatesDir, previewFileName);
      await fs.writeFile(previewPath, previewBuffer);

      // Schedule cleanup after 1 hour
      setTimeout(async () => {
        try {
          await fs.unlink(previewPath);
        } catch (error) {
          console.error('Error cleaning up preview file:', error);
        }
      }, 60 * 60 * 1000);

      return {
        previewUrl: `/certificates/${previewFileName}`,
        studentData,
        templateName: template.name
      };
    } catch (error) {
      throw new Error(`Gagal membuat preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get certificate by ID
   */
  async getCertificate(certificateId: string): Promise<any> {
    const certificate = await db.certificate.findUnique({
      where: { id: certificateId },
      include: {
        template: true,
        student: true,
        teacher: true,
        course: true
      }
    });

    if (!certificate) {
      throw new Error('Sertifikat tidak ditemukan');
    }

    return certificate;
  }

  /**
   * List certificates with filters
   */
  async listCertificates(filters?: {
    templateId?: string;
    studentId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const where: any = {};
    
    if (filters?.templateId) where.templateId = filters.templateId;
    if (filters?.studentId) where.studentId = filters.studentId;
    if (filters?.status) where.status = filters.status;

    const certificates = await db.certificate.findMany({
      where,
      include: {
        template: true,
        student: true,
        teacher: true,
        course: true
      },
      orderBy: { generatedAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0
    });

    return certificates;
  }

  /**
   * Prepare student data for template population
   */
  private async prepareStudentData(student: any, additionalData?: Record<string, any>, certificateNumber?: string): Promise<StudentData> {
    // Get teacher from first class (if available)
    const firstClass = student.classes[0]?.class;
    const teacher = firstClass?.teacher;

    // Format certificate date
    const certificateDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Format certificate month/year in Roman numeral (e.g., "I/2026")
    const certificateMonthYear = RomanNumeralConverter.getCurrentMonthYearRoman();

    // Calculate course duration based on total meetings * 1.5 hours
    let courseDurationHours = student.course.duration; // Default fallback
    
    // Get total meetings from the student's classes
    if (student.classes && student.classes.length > 0) {
      // Use the first active class or any class if no active class
      const activeClass = student.classes.find(cs => cs.class.isActive);
      const classToUse = activeClass || student.classes[0];
      
      if (classToUse && classToUse.class.totalMeetings) {
        courseDurationHours = classToUse.class.totalMeetings * 1.5;
      }
    }

    // Process student photo for certificate
    let studentPhotoPath: string | undefined;
    if (certificateNumber) {
      try {
        studentPhotoPath = await ImageProcessor.getPhotoForCertificate(
          {
            photo: student.photo,
            studentNumber: student.studentNumber,
            name: student.name
          },
          certificateNumber
        );
      } catch (error) {
        console.warn('Error processing student photo:', error);
        studentPhotoPath = undefined;
      }
    }

    return {
      student_name: student.name,
      student_id: student.studentNumber, // Use studentNumber instead of database ID
      course_name: student.course.name,
      teacher_name: teacher?.name || 'Tidak ada guru',
      course_duration: `${courseDurationHours} jam`,
      certificate_date: certificateDate,
      certificate_month_year: certificateMonthYear, // Roman numeral month/year
      student_photo: studentPhotoPath, // Path to processed student photo
      ...additionalData
    };
  }
}