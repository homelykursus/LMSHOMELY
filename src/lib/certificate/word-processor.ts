/**
 * Word Template Processor
 * 
 * Handles Word document template processing using docxtemplater
 * Preserves original document formatting while replacing placeholders
 * Supports image embedding for student photos
 */

import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import ImageModule from 'docxtemplater-image-module-free';

export interface WordTemplateData {
  student_name: string;
  student_id: string;
  course_name: string;
  course_duration: string;
  teacher_name: string;
  certificate_number: string;
  certificate_date: string;
  certificate_month_year?: string; // Roman numeral format
  student_photo?: Buffer | string; // Image buffer for embedding or text fallback
}

export interface TemplateValidationResult {
  isValid: boolean;
  placeholders: string[];
  errors: string[];
  warnings: string[];
}

export class WordProcessor {
  /**
   * Download image from URL and return as Buffer
   */
  static async downloadImage(imageUrl: string): Promise<Buffer> {
    try {
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error: any) {
      throw new Error(`Image download failed: ${error.message}`);
    }
  }

  /**
   * Process student photo for certificate embedding
   */
  static async processStudentPhoto(photoUrl?: string): Promise<Buffer | undefined> {
    if (!photoUrl) {
      return undefined;
    }
    
    try {
      // Download the image from URL
      const imageBuffer = await this.downloadImage(photoUrl);
      
      // Validate image buffer
      if (imageBuffer.length === 0) {
        throw new Error('Downloaded image is empty');
      }
      
      return imageBuffer;
    } catch (error: any) {
      console.warn(`Failed to process student photo: ${error.message}`);
      return undefined; // Return undefined to skip photo embedding
    }
  }
  /**
   * Process Word template with data
   */
  static async processTemplate(
    templateBuffer: Buffer,
    data: WordTemplateData
  ): Promise<Buffer> {
    try {
      // Load the docx file as binary content
      const zip = new PizZip(templateBuffer);
      
      // For now, always use text-only processing to prevent file corruption
      // Image embedding will be re-enabled once we resolve compatibility issues
      return await this.processTemplateTextOnly(zip, data);
    } catch (error: any) {
      throw new Error(`Word processing failed: ${error.message}`);
    }
  }

  /**
   * Process template with image module
   */
  private static async processTemplateWithImage(
    zip: PizZip,
    data: WordTemplateData
  ): Promise<Buffer> {
    // Configure image module for photo embedding
    const imageModule = new ImageModule({
      centered: false,
      getImage: (tagValue: any) => {
        // tagValue should be a Buffer containing the image data
        return tagValue;
      },
      getSize: () => {
        // Return standard certificate photo size
        return [150, 200]; // width, height in pixels
      }
    });
    
    // Create docxtemplater instance with image module
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: '{{',
        end: '}}'
      },
      modules: [imageModule]
    });

    // Set template data
    doc.render(data);

    // Generate the processed document buffer
    return doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    });
  }

  /**
   * Process template without image module (text only)
   */
  private static async processTemplateTextOnly(
    zip: PizZip,
    data: WordTemplateData
  ): Promise<Buffer> {
    // Create docxtemplater instance without image module
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: '{{',
        end: '}}'
      }
    });

    // Remove photo placeholder or replace with text
    const processedData = { ...data };
    if (processedData.student_photo) {
      // Replace photo with placeholder text
      processedData.student_photo = '[Foto Siswa]' as any;
    }

    // Set template data
    try {
      doc.render(processedData);
    } catch (error: any) {
      // Handle template rendering errors
      if (error.properties && error.properties.errors instanceof Array) {
        const errorMessages = error.properties.errors.map((err: any) => {
          return `${err.name}: ${err.message} at ${err.properties?.id || 'unknown location'}`;
        }).join(', ');
        throw new Error(`Template rendering failed: ${errorMessages}`);
      }
      throw new Error(`Template rendering failed: ${error.message}`);
    }

    // Generate the processed document buffer
    return doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    });
  }

  /**
   * Extract placeholders from Word template
   */
  static async extractPlaceholders(templateBuffer: Buffer): Promise<string[]> {
    try {
      const zip = new PizZip(templateBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
          start: '{{',
          end: '}}'
        }
      });

      // Get all placeholders from the template
      const placeholders: string[] = [];
      
      // Parse document XML to find placeholders
      const documentXml = zip.files['word/document.xml']?.asText();
      if (documentXml) {
        const placeholderRegex = /\{\{([^}]+)\}\}/g;
        let match;
        
        while ((match = placeholderRegex.exec(documentXml)) !== null) {
          const placeholder = match[1].trim();
          if (!placeholders.includes(placeholder)) {
            placeholders.push(placeholder);
          }
        }
      }

      return placeholders;
    } catch (error: any) {
      throw new Error(`Failed to extract placeholders: ${error.message}`);
    }
  }

  /**
   * Validate Word template
   */
  static async validateTemplate(templateBuffer: Buffer): Promise<TemplateValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let placeholders: string[] = [];

    try {
      // Check if it's a valid ZIP file (docx format)
      const zip = new PizZip(templateBuffer);
      
      // Check for required Word document structure
      if (!zip.files['word/document.xml']) {
        errors.push('Invalid Word document: missing document.xml');
        return { isValid: false, placeholders: [], errors, warnings };
      }

      // Extract placeholders
      placeholders = await this.extractPlaceholders(templateBuffer);

      // Check for required placeholders
      const requiredPlaceholders = [
        'student_name',
        'course_name',
        'certificate_date',
        'certificate_number'
      ];

      const missingRequired = requiredPlaceholders.filter(
        required => !placeholders.includes(required)
      );

      if (missingRequired.length > 0) {
        errors.push(`Missing required placeholders: ${missingRequired.join(', ')}`);
      }

      // Check for recommended placeholders
      const recommendedPlaceholders = [
        'student_id',
        'course_duration',
        'teacher_name'
      ];

      const missingRecommended = recommendedPlaceholders.filter(
        recommended => !placeholders.includes(recommended)
      );

      if (missingRecommended.length > 0) {
        warnings.push(`Missing recommended placeholders: ${missingRecommended.join(', ')}`);
      }

      // Check for unknown placeholders
      const knownPlaceholders = [
        ...requiredPlaceholders,
        ...recommendedPlaceholders,
        'certificate_month_year',
        'student_photo'
      ];

      const unknownPlaceholders = placeholders.filter(
        placeholder => !knownPlaceholders.includes(placeholder)
      );

      if (unknownPlaceholders.length > 0) {
        warnings.push(`Unknown placeholders found: ${unknownPlaceholders.join(', ')}`);
      }

    } catch (error: any) {
      errors.push(`Template validation failed: ${error.message}`);
    }

    return {
      isValid: errors.length === 0,
      placeholders,
      errors,
      warnings
    };
  }

  /**
   * Generate certificate number in format: CERT-YYYYMM-STUDENT_ID
   */
  static generateCertificateNumber(studentId?: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp for uniqueness
    
    if (studentId) {
      return `CERT-${year}${month}-${studentId}-${timestamp}`;
    }
    
    // Fallback to random if no student ID provided
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CERT-${year}${month}-${random}-${timestamp}`;
  }

  /**
   * Format date to Indonesian format
   */
  static formatCertificateDate(date: Date = new Date()): string {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  }

  /**
   * Format month and year to Roman numerals
   */
  static formatMonthYearRoman(date: Date = new Date()): string {
    const romanNumerals = [
      'I', 'II', 'III', 'IV', 'V', 'VI',
      'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
    ];

    const month = romanNumerals[date.getMonth()];
    const year = date.getFullYear();

    return `${month}/${year}`;
  }
}