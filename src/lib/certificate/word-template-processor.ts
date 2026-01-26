import mammoth from 'mammoth';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import fs from 'fs/promises';
import path from 'path';
// @ts-ignore - docxtemplater-image-module-free doesn't have types
import ImageModule from 'docxtemplater-image-module-free';

export interface WordTemplateData {
  originalFileName: string;
  content: string;
  placeholders: PlaceholderInfo[];
  metadata: TemplateMetadata;
}

export interface PlaceholderInfo {
  placeholder: string;
  position: number;
  context: string;
  required: boolean;
}

export interface TemplateMetadata {
  fileSize: number;
  fileType: string;
  placeholderCount: number;
  requiredFields: string[];
  optionalFields: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface StudentData {
  student_name: string;
  student_id: string;
  course_name: string;
  teacher_name?: string;
  course_duration: string;
  certificate_date: string;
  certificate_month_year: string; // Roman numeral month/year
  student_photo?: string; // Path to student photo for certificate
}

export class WordTemplateProcessor {
  private static readonly SUPPORTED_FORMATS = ['.docx', '.doc'];
  private static readonly PLACEHOLDER_REGEX_DOUBLE = /\{\{([^}]+)\}\}/g; // Double braces {{}}
  private static readonly PLACEHOLDER_REGEX_SINGLE = /\{([^}]+)\}/g; // Single braces {}
  private static readonly REQUIRED_PLACEHOLDERS = [
    'student_name',
    'student_id', 
    'course_name',
    'course_duration',
    'certificate_date',
    'certificate_month_year'
  ];

  private static readonly OPTIONAL_PLACEHOLDERS = [
    'teacher_name',
    'student_photo'
  ];

  // Instance properties to access static values
  private readonly PLACEHOLDER_REGEX_DOUBLE = WordTemplateProcessor.PLACEHOLDER_REGEX_DOUBLE;
  private readonly PLACEHOLDER_REGEX_SINGLE = WordTemplateProcessor.PLACEHOLDER_REGEX_SINGLE;
  private readonly REQUIRED_PLACEHOLDERS = WordTemplateProcessor.REQUIRED_PLACEHOLDERS;

  /**
   * Parse Word template and extract content, placeholders, and metadata
   */
  async parseTemplate(filePath: string): Promise<WordTemplateData> {
    try {
      // Read file
      const fileBuffer = await fs.readFile(filePath);
      const stats = await fs.stat(filePath);
      const fileName = path.basename(filePath);
      const fileExt = path.extname(filePath).toLowerCase();

      // Validate file format
      if (!WordTemplateProcessor.SUPPORTED_FORMATS.includes(fileExt)) {
        throw new Error(`Format file tidak didukung: ${fileExt}. Hanya mendukung .docx dan .doc`);
      }

      // Extract text content for placeholder detection using mammoth (fallback)
      let content = '';
      try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        content = result.value || '';
      } catch (mammothError) {
        console.error('Mammoth error:', mammothError);
        // Try to extract placeholders from docxtemplater
        try {
          const zip = new PizZip(fileBuffer);
          const doc = new Docxtemplater(zip);
          // Get document XML content for placeholder detection
          const xmlContent = zip.file('word/document.xml')?.asText() || '';
          content = this.extractTextFromXML(xmlContent);
        } catch (docxError) {
          throw new Error('Gagal membaca file Word. Pastikan file tidak corrupt.');
        }
      }

      // Extract placeholders
      const placeholders = this.extractPlaceholders(content);

      // Create metadata
      const metadata: TemplateMetadata = {
        fileSize: stats.size,
        fileType: fileExt.substring(1), // remove dot
        placeholderCount: placeholders.length,
        requiredFields: placeholders
          .filter(p => this.REQUIRED_PLACEHOLDERS.includes(p.placeholder))
          .map(p => p.placeholder),
        optionalFields: placeholders
          .filter(p => !this.REQUIRED_PLACEHOLDERS.includes(p.placeholder))
          .map(p => p.placeholder)
      };

      return {
        originalFileName: fileName,
        content,
        placeholders,
        metadata
      };
    } catch (error) {
      console.error('Parse template error:', error);
      throw new Error(`Gagal memproses template Word: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from Word document XML for placeholder detection
   */
  private extractTextFromXML(xmlContent: string): string {
    // Simple XML text extraction - remove tags and get text content
    return xmlContent
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract placeholders from text content
   * Supports both single {} and double {{}} braces
   */
  private extractPlaceholders(content: string): PlaceholderInfo[] {
    const placeholders: PlaceholderInfo[] = [];
    
    // Try double braces first {{}}
    const doubleMatches = Array.from(content.matchAll(this.PLACEHOLDER_REGEX_DOUBLE));
    let usesDoubleBraces = doubleMatches.length > 0;
    
    // If no double braces found, try single braces {}
    const singleMatches = Array.from(content.matchAll(this.PLACEHOLDER_REGEX_SINGLE));
    
    // Use whichever format has more matches, or prefer double braces if equal
    const matches = doubleMatches.length >= singleMatches.length ? doubleMatches : singleMatches;
    const isDoubleBrace = doubleMatches.length >= singleMatches.length;

    for (const match of matches) {
      const fullMatch = match[0]; // {{placeholder}} or {placeholder}
      const placeholder = match[1].trim(); // placeholder
      const position = match.index || 0;
      
      // Skip if placeholder is malformed or empty
      if (!placeholder || placeholder.includes('{') || placeholder.includes('}')) {
        continue;
      }
      
      // Get context (50 characters before and after)
      const contextStart = Math.max(0, position - 50);
      const contextEnd = Math.min(content.length, position + fullMatch.length + 50);
      const context = content.substring(contextStart, contextEnd);

      // Check if already exists
      const existing = placeholders.find(p => p.placeholder === placeholder);
      if (!existing) {
        placeholders.push({
          placeholder,
          position,
          context: context.replace(/\s+/g, ' ').trim(),
          required: this.REQUIRED_PLACEHOLDERS.includes(placeholder)
        });
      }
    }

    return placeholders;
  }

  /**
   * Validate template for required placeholders and format
   */
  async validateTemplate(templateData: WordTemplateData): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required placeholders
    const foundPlaceholders = templateData.placeholders.map(p => p.placeholder);
    const missingRequired = this.REQUIRED_PLACEHOLDERS.filter(
      required => !foundPlaceholders.includes(required)
    );

    if (missingRequired.length > 0) {
      errors.push(`Placeholder wajib tidak ditemukan: ${missingRequired.join(', ')}`);
    }

    // Check for unknown placeholders
    const knownPlaceholders = [...this.REQUIRED_PLACEHOLDERS, ...WordTemplateProcessor.OPTIONAL_PLACEHOLDERS];
    const unknownPlaceholders = foundPlaceholders.filter(
      found => !knownPlaceholders.includes(found)
    );

    if (unknownPlaceholders.length > 0) {
      warnings.push(`Placeholder tidak dikenal: ${unknownPlaceholders.join(', ')}`);
    }

    // Check file size (max 10MB)
    if (templateData.metadata.fileSize > 10 * 1024 * 1024) {
      warnings.push('Ukuran file template lebih dari 10MB, mungkin akan lambat diproses');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Populate template with student data and generate new Word document
   * This method now preserves Word formatting using docxtemplater with image support
   */
  async populateTemplate(templatePath: string, data: StudentData): Promise<Buffer> {
    try {
      // Read original template
      const fileBuffer = await fs.readFile(templatePath);
      
      try {
        // Use docxtemplater for formatting-preserving placeholder replacement
        const zip = new PizZip(fileBuffer);
        
        // Detect placeholder format by checking the content
        const xmlContent = zip.file('word/document.xml')?.asText() || '';
        const hasDoubleBraces = /\{\{[^}]+\}\}/.test(xmlContent);
        
        // Prepare image module for photo embedding
        const imageModule = new ImageModule({
          centered: false,
          getImage: (tagValue: string, tagName: string) => {
            // tagValue should be the path to the image file
            if (tagName === 'student_photo' && tagValue) {
              try {
                return fs.readFileSync(tagValue);
              } catch (error) {
                console.warn(`Failed to read image file: ${tagValue}`, error);
                return null;
              }
            }
            return null;
          },
          getSize: (img: Buffer, tagValue: string, tagName: string) => {
            // Return size in pixels for the image
            if (tagName === 'student_photo') {
              return [150, 200]; // Width x Height in pixels (certificate standard)
            }
            return [100, 100]; // Default size
          }
        });

        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
          modules: [imageModule], // Add image module
          delimiters: hasDoubleBraces ? {
            start: '{{',
            end: '}}'
          } : {
            start: '{',
            end: '}'
          }
        });

        // Prepare data for template rendering
        const templateData = { ...data };
        
        // Handle student photo - convert path to format expected by image module
        if (data.student_photo) {
          templateData.student_photo = data.student_photo;
        } else {
          // Remove photo placeholder if no photo available
          delete templateData.student_photo;
        }

        // Set data for placeholder replacement
        doc.render(templateData);

        // Generate the updated Word document buffer
        const buffer = doc.getZip().generate({
          type: 'nodebuffer',
          compression: 'DEFLATE',
        });

        return buffer;
      } catch (docxError) {
        console.warn('docxtemplater with image module failed, falling back to basic Word generation:', docxError);
        
        // Fallback to mammoth + docx generation (loses formatting and photos)
        const result = await mammoth.convertToHtml({ buffer: fileBuffer });
        let htmlContent = result.value;

        // Replace placeholders in HTML content (excluding photo)
        const dataWithoutPhoto = { ...data };
        delete dataWithoutPhoto.student_photo;
        htmlContent = this.replacePlaceholders(htmlContent, dataWithoutPhoto);

        // Convert back to Word document (basic formatting, no photos)
        const doc = new Document({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: this.stripHtml(htmlContent),
                    size: 24
                  })
                ]
              })
            ]
          }]
        });

        return await Packer.toBuffer(doc);
      }
    } catch (error) {
      throw new Error(`Gagal mengisi template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Replace placeholders in content with actual data
   */
  private replacePlaceholders(content: string, data: StudentData): string {
    let result = content;

    // Replace each placeholder
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      result = result.replace(regex, value || '');
    });

    return result;
  }

  /**
   * Strip HTML tags from content (simple implementation)
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  }

  /**
   * Get list of supported file formats
   */
  static getSupportedFormats(): string[] {
    return [...this.SUPPORTED_FORMATS];
  }

  /**
   * Get list of required placeholders
   */
  static getRequiredPlaceholders(): string[] {
    return [...this.REQUIRED_PLACEHOLDERS];
  }

  /**
   * Get list of optional placeholders
   */
  static getOptionalPlaceholders(): string[] {
    return [...this.OPTIONAL_PLACEHOLDERS];
  }

  /**
   * Generate certificate number
   */
  static generateCertificateNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const timestamp = now.getTime().toString().slice(-6);
    
    return `CERT-${year}${month}-${timestamp}`;
  }
}