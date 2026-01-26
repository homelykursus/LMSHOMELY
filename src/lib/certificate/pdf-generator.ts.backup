import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import mammoth from 'mammoth';
import fs from 'fs/promises';
import { StudentData } from './word-template-processor';
import { LibreOfficePDFGenerator } from './libreoffice-pdf-generator';

export interface PDFGenerationOptions {
  format: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  quality: 'standard' | 'high';
  embedFonts: boolean;
}

export class PDFGenerator {
  private defaultOptions: PDFGenerationOptions = {
    format: 'A4',
    orientation: 'landscape', // Certificate biasanya landscape
    margin: {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50
    },
    quality: 'high',
    embedFonts: true
  };

  private libreOfficeGenerator: LibreOfficePDFGenerator;

  constructor() {
    this.libreOfficeGenerator = new LibreOfficePDFGenerator();
  }

  /**
   * Generate PDF from Word template with student data
   * Now uses LibreOffice for high-fidelity conversion when available
   */
  async generateFromWordTemplate(
    templatePath: string, 
    studentData: StudentData, 
    options?: Partial<PDFGenerationOptions>
  ): Promise<Buffer> {
    try {
      const finalOptions = { ...this.defaultOptions, ...options };

      // First, try LibreOffice conversion for high-fidelity PDF
      try {
        const validation = await this.libreOfficeGenerator.validateLibreOfficeInstallation();
        
        if (validation.isAvailable) {
          console.log('Using LibreOffice for high-fidelity PDF conversion');
          
          // Read the Word template (should already have placeholders replaced)
          const wordBuffer = await fs.readFile(templatePath);
          
          // Convert to PDF using LibreOffice
          const pdfBuffer = await this.libreOfficeGenerator.convertWordToPDF(wordBuffer);
          
          return pdfBuffer;
        } else {
          console.warn('LibreOffice not available, falling back to basic PDF generation:', validation.error);
        }
      } catch (libreOfficeError) {
        console.warn('LibreOffice conversion failed, falling back to basic PDF generation:', libreOfficeError);
      }

      // Fallback to original PDF generation method
      return await this.generateBasicPDF(templatePath, studentData, finalOptions);
    } catch (error) {
      throw new Error(`Gagal generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate PDF using basic method (fallback when LibreOffice unavailable)
   */
  private async generateBasicPDF(
    templatePath: string, 
    studentData: StudentData, 
    options: PDFGenerationOptions
  ): Promise<Buffer> {
    // Read Word template
    const templateBuffer = await fs.readFile(templatePath);
    
    // Extract content and convert to HTML
    const result = await mammoth.convertToHtml({ buffer: templateBuffer });
    let htmlContent = result.value;

    // Replace placeholders with actual data
    htmlContent = this.replacePlaceholders(htmlContent, studentData);

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Set page size based on format and orientation
    const pageSize = this.getPageSize(options.format, options.orientation);
    const page = pdfDoc.addPage([pageSize.width, pageSize.height]);

    // Embed font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Convert HTML to text and draw on PDF
    const textContent = this.htmlToText(htmlContent);
    
    // Draw content on PDF
    await this.drawContentOnPDF(page, textContent, font, boldFont, options);

    // Serialize PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Replace placeholders in HTML content
   */
  private replacePlaceholders(htmlContent: string, studentData: StudentData): string {
    let result = htmlContent;

    // Replace each placeholder
    Object.entries(studentData).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      result = result.replace(regex, value || '');
    });

    return result;
  }

  /**
   * Convert HTML to plain text with basic formatting
   */
  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    // Remove HTML tags but preserve line breaks
    let text = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // Clean up multiple spaces and line breaks
    text = text
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

    return text;
  }

  /**
   * Draw content on PDF page
   */
  private async drawContentOnPDF(
    page: any, 
    content: string, 
    font: any, 
    boldFont: any, 
    options: PDFGenerationOptions
  ): Promise<void> {
    const { width, height } = page.getSize();
    const { margin } = options;
    
    // Calculate available space
    const availableWidth = width - margin.left - margin.right;
    const availableHeight = height - margin.top - margin.bottom;
    
    // Split content into lines
    const lines = content.split('\n');
    
    let currentY = height - margin.top;
    const lineHeight = 20;
    const fontSize = 12;
    const titleFontSize = 18;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        currentY -= lineHeight / 2; // Half line for empty lines
        continue;
      }
      
      // Check if we have space for this line
      if (currentY - lineHeight < margin.bottom) {
        break; // No more space
      }
      
      // Determine if this is a title (first few lines or lines with certain keywords)
      const isTitle = i < 3 || 
        line.includes('SERTIFIKAT') || 
        line.includes('CERTIFICATE') ||
        line.includes('PENGHARGAAN');
      
      const currentFont = isTitle ? boldFont : font;
      const currentFontSize = isTitle ? titleFontSize : fontSize;
      
      // Word wrap if line is too long
      const words = line.split(' ');
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const textWidth = currentFont.widthOfTextAtSize(testLine, currentFontSize);
        
        if (textWidth <= availableWidth) {
          currentLine = testLine;
        } else {
          // Draw current line and start new one
          if (currentLine) {
            const textWidth = currentFont.widthOfTextAtSize(currentLine, currentFontSize);
            const x = margin.left + (availableWidth - textWidth) / 2; // Center align
            
            page.drawText(currentLine, {
              x,
              y: currentY,
              size: currentFontSize,
              font: currentFont,
              color: rgb(0, 0, 0)
            });
            
            currentY -= lineHeight;
            if (currentY - lineHeight < margin.bottom) break;
          }
          currentLine = word;
        }
      }
      
      // Draw remaining text
      if (currentLine) {
        const textWidth = currentFont.widthOfTextAtSize(currentLine, currentFontSize);
        const x = margin.left + (availableWidth - textWidth) / 2; // Center align
        
        page.drawText(currentLine, {
          x,
          y: currentY,
          size: currentFontSize,
          font: currentFont,
          color: rgb(0, 0, 0)
        });
        
        currentY -= lineHeight;
      }
    }
  }

  /**
   * Get page size based on format and orientation
   */
  private getPageSize(format: string, orientation: string): { width: number; height: number } {
    const sizes = {
      A4: { width: 595, height: 842 },
      Letter: { width: 612, height: 792 },
      Legal: { width: 612, height: 1008 }
    };

    const size = sizes[format as keyof typeof sizes] || sizes.A4;
    
    if (orientation === 'landscape') {
      return { width: size.height, height: size.width };
    }
    
    return size;
  }

  /**
   * Validate template before PDF generation
   */
  async validateTemplate(templatePath: string): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check if file exists
      await fs.access(templatePath);
      
      // Check file size (max 10MB)
      const stats = await fs.stat(templatePath);
      if (stats.size > 10 * 1024 * 1024) {
        errors.push('File template terlalu besar (maksimal 10MB)');
      }

      // Try to read the file
      const buffer = await fs.readFile(templatePath);
      const result = await mammoth.convertToHtml({ buffer });
      
      if (!result.value || result.value.trim().length === 0) {
        errors.push('Template kosong atau tidak dapat dibaca');
      }

    } catch (error) {
      errors.push(`Template tidak valid: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}