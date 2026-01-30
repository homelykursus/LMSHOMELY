/**
 * Word Template Processor
 * 
 * Handles Word document template processing using docxtemplater
 * Preserves original document formatting while replacing placeholders
 */

import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';

export interface WordTemplateData {
  student_name: string;
  student_id: string;
  course_name: string;
  course_duration: string;
  teacher_name: string;
  certificate_number: string;
  certificate_date: string;
  certificate_month_year?: string; // Roman numeral format
  student_photo?: string; // Base64 or URL
}

export interface TemplateValidationResult {
  isValid: boolean;
  placeholders: string[];
  errors: string[];
  warnings: string[];
}

export class WordProcessor {
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
      
      // Create docxtemplater instance
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
          start: '{{',
          end: '}}'
        }
      });

      // Set template data
      doc.setData(data);
      
      try {
        // Render the document (replace placeholders)
        doc.render();
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
      const buffer = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6
        }
      });

      return buffer;
    } catch (error: any) {
      throw new Error(`Word processing failed: ${error.message}`);
    }
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
   * Generate certificate number in format: CERT-YYYYMM-RANDOM
   */
  static generateCertificateNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    return `CERT-${year}${month}-${random}`;
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