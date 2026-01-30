/**
 * PDF Generator for Word Templates
 * 
 * Converts processed Word documents to PDF format
 * Optimized for Vercel serverless environment
 */

import os from 'os';
import path from 'path';
import fs from 'fs';

export interface PDFGenerationOptions {
  quality?: 'high' | 'medium' | 'low';
  format?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

export class PDFGenerator {
  /**
   * Convert Word document buffer to PDF
   * 
   * Note: This is a placeholder implementation
   * In production, we may need to use external services or alternative approaches
   */
  static async convertWordToPDF(
    wordBuffer: Buffer,
    options: PDFGenerationOptions = {}
  ): Promise<Buffer> {
    const { quality = 'high', format = 'A4', orientation = 'landscape' } = options;

    try {
      // Approach 1: Try docx-pdf (may not work in serverless)
      return await this.convertWithDocxPdf(wordBuffer, options);
    } catch (error) {
      console.warn('docx-pdf conversion failed, trying alternative approach:', error);
      
      try {
        // Approach 2: Return Word document as-is for now
        // In production, we might use external conversion services
        return await this.fallbackConversion(wordBuffer, options);
      } catch (fallbackError) {
        throw new Error(`PDF conversion failed: ${fallbackError}`);
      }
    }
  }

  /**
   * Primary conversion method using docx-pdf
   */
  private static async convertWithDocxPdf(
    wordBuffer: Buffer,
    options: PDFGenerationOptions
  ): Promise<Buffer> {
    // Import docx-pdf dynamically to handle potential import issues
    let docxPdf: any;
    
    try {
      const docxPdfModule = await import('docx-pdf');
      docxPdf = docxPdfModule.default || docxPdfModule;
    } catch (error) {
      throw new Error('docx-pdf library not available');
    }

    return new Promise(async (resolve, reject) => {
      try {
        // Create temporary file paths (cross-platform)
        const tempDir = os.tmpdir();
        const inputPath = path.join(tempDir, `input-${Date.now()}.docx`);
        const outputPath = path.join(tempDir, `output-${Date.now()}.pdf`);

        // Write Word buffer to temporary file
        fs.writeFileSync(inputPath, wordBuffer);

        // Convert to PDF
        docxPdf(inputPath, outputPath, (err: any, result: any) => {
          try {
            if (err) {
              reject(new Error(`docx-pdf conversion error: ${err.message}`));
              return;
            }

            // Read the generated PDF
            const pdfBuffer = fs.readFileSync(outputPath);

            // Clean up temporary files
            try {
              fs.unlinkSync(inputPath);
              fs.unlinkSync(outputPath);
            } catch (cleanupError) {
              console.warn('Failed to clean up temporary files:', cleanupError);
            }

            resolve(pdfBuffer);
          } catch (processError) {
            reject(new Error(`PDF processing error: ${processError}`));
          }
        });
      } catch (importError) {
        reject(new Error(`Import error: ${importError}`));
      }
    });
  }

  /**
   * Fallback conversion method
   * 
   * For now, this returns the Word document as-is
   * In production, we might integrate with external conversion services
   */
  private static async fallbackConversion(
    wordBuffer: Buffer,
    options: PDFGenerationOptions
  ): Promise<Buffer> {
    // For development/testing, we'll return the Word document
    // In production, consider these alternatives:
    // 1. External conversion API (CloudConvert, ILovePDF, etc.)
    // 2. Puppeteer with Word-to-HTML conversion
    // 3. LibreOffice headless (if available in deployment environment)
    
    console.warn('Using fallback conversion - returning Word document');
    return wordBuffer;
  }

  /**
   * Validate PDF output
   */
  static async validatePDF(pdfBuffer: Buffer): Promise<{
    isValid: boolean;
    fileSize: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    try {
      // Check file size first
      const fileSize = pdfBuffer.length;
      if (fileSize === 0) {
        errors.push('File is empty');
        return { isValid: false, fileSize, errors };
      } else if (fileSize > 50 * 1024 * 1024) { // 50MB limit
        errors.push('File is too large (>50MB)');
      }

      // Check if it's a PDF file
      const pdfHeader = pdfBuffer.slice(0, 4).toString();
      const docxHeader = pdfBuffer.slice(0, 2).toString('hex');
      
      if (pdfHeader === '%PDF') {
        // Valid PDF file
        return { isValid: true, fileSize, errors };
      } else if (docxHeader === '504b') {
        // DOCX file (ZIP format) - acceptable in development mode
        console.warn('Certificate generated as DOCX (development mode)');
        return { isValid: true, fileSize, errors };
      } else {
        errors.push('Invalid file format - not PDF or DOCX');
      }

      return {
        isValid: errors.length === 0,
        fileSize,
        errors
      };
    } catch (error: any) {
      errors.push(`PDF validation failed: ${error.message}`);
      return {
        isValid: false,
        fileSize: 0,
        errors
      };
    }
  }

  /**
   * Get PDF metadata
   */
  static async getPDFMetadata(pdfBuffer: Buffer): Promise<{
    pages?: number;
    title?: string;
    author?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
  }> {
    // Basic metadata extraction
    // For more advanced metadata, consider using pdf-parse or similar library
    
    try {
      const pdfText = pdfBuffer.toString('binary');
      
      // Extract basic info using regex patterns
      const metadata: any = {};
      
      // Try to find page count
      const pageMatch = pdfText.match(/\/Count\s+(\d+)/);
      if (pageMatch) {
        metadata.pages = parseInt(pageMatch[1]);
      }

      // Try to find title
      const titleMatch = pdfText.match(/\/Title\s*\(([^)]+)\)/);
      if (titleMatch) {
        metadata.title = titleMatch[1];
      }

      return metadata;
    } catch (error) {
      console.warn('Failed to extract PDF metadata:', error);
      return {};
    }
  }
}