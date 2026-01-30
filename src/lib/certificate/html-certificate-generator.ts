/**
 * HTML Certificate Generator with Photo Support
 * 
 * Generates certificates using HTML templates with embedded photos
 * Converts to PDF using Puppeteer for proper photo display
 */

import puppeteer from 'puppeteer';
const htmlPdf = require('html-pdf-node');

export interface HTMLCertificateData {
  student_name: string;
  student_id: string;
  course_name: string;
  course_duration: string;
  teacher_name: string;
  certificate_number: string;
  certificate_date: string;
  certificate_month_year?: string;
  student_photo?: string; // URL or base64 data
}

export interface HTMLCertificateOptions {
  format?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

export class HTMLCertificateGenerator {
  /**
   * Generate certificate HTML template
   */
  static generateCertificateHTML(data: HTMLCertificateData): string {
    const {
      student_name,
      student_id,
      course_name,
      course_duration,
      teacher_name,
      certificate_number,
      certificate_date,
      certificate_month_year,
      student_photo
    } = data;

    return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sertifikat - ${student_name}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Times New Roman', serif;
            width: 297mm;
            height: 210mm;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
            overflow: hidden;
        }
        
        .certificate-container {
            width: 280mm;
            height: 190mm;
            background: white;
            border: 8px solid #2c3e50;
            border-radius: 20px;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .certificate-header {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .certificate-title {
            font-size: 48px;
            font-weight: bold;
            color: #2c3e50;
            text-transform: uppercase;
            letter-spacing: 8px;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        
        .certificate-subtitle {
            font-size: 24px;
            color: #34495e;
            font-style: italic;
            margin-bottom: 30px;
        }
        
        .certificate-body {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex: 1;
            margin: 20px 0;
        }
        
        .certificate-content {
            flex: 1;
            text-align: center;
            padding-right: 30px;
        }
        
        .student-photo {
            width: 150px;
            height: 200px;
            border: 4px solid #2c3e50;
            border-radius: 10px;
            object-fit: cover;
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
            flex-shrink: 0;
        }
        
        .photo-placeholder {
            width: 150px;
            height: 200px;
            border: 4px solid #bdc3c7;
            border-radius: 10px;
            background: #ecf0f1;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: #7f8c8d;
            text-align: center;
            flex-shrink: 0;
        }
        
        .awarded-text {
            font-size: 28px;
            color: #2c3e50;
            margin-bottom: 20px;
        }
        
        .student-name {
            font-size: 42px;
            font-weight: bold;
            color: #e74c3c;
            margin-bottom: 10px;
            text-decoration: underline;
        }
        
        .student-id {
            font-size: 20px;
            color: #7f8c8d;
            margin-bottom: 30px;
        }
        
        .course-info {
            font-size: 24px;
            color: #2c3e50;
            margin-bottom: 15px;
            line-height: 1.4;
        }
        
        .course-name {
            font-weight: bold;
            color: #3498db;
        }
        
        .certificate-footer {
            display: flex;
            justify-content: space-between;
            align-items: end;
            margin-top: 30px;
        }
        
        .certificate-info {
            text-align: left;
        }
        
        .signature-section {
            text-align: center;
        }
        
        .certificate-number {
            font-size: 16px;
            color: #7f8c8d;
            margin-bottom: 5px;
        }
        
        .certificate-date {
            font-size: 18px;
            color: #2c3e50;
        }
        
        .signature-line {
            width: 200px;
            height: 80px;
            border-bottom: 2px solid #2c3e50;
            margin-bottom: 10px;
        }
        
        .teacher-name {
            font-size: 20px;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .teacher-title {
            font-size: 16px;
            color: #7f8c8d;
            font-style: italic;
        }
        
        .decorative-border {
            position: absolute;
            top: 15px;
            left: 15px;
            right: 15px;
            bottom: 15px;
            border: 2px solid #3498db;
            border-radius: 15px;
            pointer-events: none;
        }
        
        .corner-decoration {
            position: absolute;
            width: 40px;
            height: 40px;
            border: 3px solid #e74c3c;
        }
        
        .corner-decoration.top-left {
            top: 25px;
            left: 25px;
            border-right: none;
            border-bottom: none;
        }
        
        .corner-decoration.top-right {
            top: 25px;
            right: 25px;
            border-left: none;
            border-bottom: none;
        }
        
        .corner-decoration.bottom-left {
            bottom: 25px;
            left: 25px;
            border-right: none;
            border-top: none;
        }
        
        .corner-decoration.bottom-right {
            bottom: 25px;
            right: 25px;
            border-left: none;
            border-top: none;
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        <div class="decorative-border"></div>
        <div class="corner-decoration top-left"></div>
        <div class="corner-decoration top-right"></div>
        <div class="corner-decoration bottom-left"></div>
        <div class="corner-decoration bottom-right"></div>
        
        <div class="certificate-header">
            <div class="certificate-title">Sertifikat</div>
            <div class="certificate-subtitle">Certificate of Completion</div>
        </div>
        
        <div class="certificate-body">
            <div class="certificate-content">
                <div class="awarded-text">Diberikan kepada:</div>
                <div class="student-name">${student_name}</div>
                <div class="student-id">ID: ${student_id}</div>
                
                <div class="course-info">
                    Telah menyelesaikan program<br>
                    <span class="course-name">${course_name}</span><br>
                    dengan durasi <strong>${course_duration}</strong>
                </div>
            </div>
            
            <div class="photo-section">
                ${student_photo ? 
                    `<img src="${student_photo}" alt="Foto ${student_name}" class="student-photo" />` :
                    `<div class="photo-placeholder">Foto<br>Tidak<br>Tersedia</div>`
                }
            </div>
        </div>
        
        <div class="certificate-footer">
            <div class="certificate-info">
                <div class="certificate-number">No. Sertifikat: ${certificate_number}</div>
                <div class="certificate-date">${certificate_date}</div>
                ${certificate_month_year ? `<div class="certificate-date">${certificate_month_year}</div>` : ''}
            </div>
            
            <div class="signature-section">
                <div class="signature-line"></div>
                <div class="teacher-name">${teacher_name}</div>
                <div class="teacher-title">Instruktur</div>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate PDF from HTML certificate
   */
  static async generatePDFFromHTML(
    data: HTMLCertificateData,
    options: HTMLCertificateOptions = {}
  ): Promise<Buffer> {
    const {
      format = 'A4',
      orientation = 'landscape',
      margin = { top: '0', right: '0', bottom: '0', left: '0' }
    } = options;

    try {
      // Generate HTML content
      const htmlContent = this.generateCertificateHTML(data);

      // Try html-pdf-node first (simpler and more reliable)
      try {
        console.log('Attempting PDF generation with html-pdf-node...');
        
        const pdfOptions = {
          format: format,
          landscape: orientation === 'landscape',
          margin: margin,
          printBackground: true,
          preferCSSPageSize: true,
          timeout: 30000
        };

        const file = { content: htmlContent };
        const pdfBuffer = await htmlPdf.generatePdf(file, pdfOptions);
        
        console.log('✅ PDF generated successfully with html-pdf-node');
        return Buffer.from(pdfBuffer);

      } catch (htmlPdfError: any) {
        console.warn('html-pdf-node failed, trying Puppeteer:', htmlPdfError.message);
        
        // Fallback to Puppeteer
        return await this.generatePDFWithPuppeteer(htmlContent, options);
      }

    } catch (error: any) {
      console.error('All PDF generation methods failed:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  /**
   * Generate PDF using Puppeteer (fallback method)
   */
  private static async generatePDFWithPuppeteer(
    htmlContent: string,
    options: HTMLCertificateOptions = {}
  ): Promise<Buffer> {
    const {
      format = 'A4',
      orientation = 'landscape',
      margin = { top: '0', right: '0', bottom: '0', left: '0' }
    } = options;

    let browser;
    try {
      console.log('Attempting PDF generation with Puppeteer...');

      // Launch Puppeteer browser with improved configuration
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ],
        timeout: 30000
      });

      const page = await browser.newPage();

      // Set viewport for consistent rendering
      await page.setViewport({
        width: 1200,
        height: 800,
        deviceScaleFactor: 2
      });

      // Set content with longer timeout
      await page.setContent(htmlContent, {
        waitUntil: ['networkidle0', 'load'],
        timeout: 30000
      });

      // Wait a bit more for images to fully load
      await page.waitForTimeout(2000);

      // Generate PDF with improved settings
      const pdfBuffer = await page.pdf({
        format: format as any,
        landscape: orientation === 'landscape',
        margin,
        printBackground: true,
        preferCSSPageSize: true,
        timeout: 30000
      });

      console.log('✅ PDF generated successfully with Puppeteer');
      return Buffer.from(pdfBuffer);

    } catch (error: any) {
      console.error('Puppeteer PDF generation failed:', error);
      throw new Error(`Puppeteer PDF generation failed: ${error.message}`);
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.warn('Failed to close browser:', closeError);
        }
      }
    }
  }

  /**
   * Process student photo for HTML embedding
   */
  static async processPhotoForHTML(photoUrl?: string): Promise<string | undefined> {
    if (!photoUrl) {
      return undefined;
    }

    try {
      // For Cloudinary URLs, we can use them directly
      if (photoUrl.includes('cloudinary.com')) {
        // Add transformation parameters for optimization
        const optimizedUrl = photoUrl.replace('/upload/', '/upload/w_150,h_200,c_fill,f_auto,q_auto/');
        return optimizedUrl;
      }

      // For other URLs, return as-is
      return photoUrl;

    } catch (error: any) {
      console.warn(`Failed to process photo URL: ${error.message}`);
      return undefined;
    }
  }

  /**
   * Validate generated PDF
   */
  static async validatePDF(pdfBuffer: Buffer): Promise<{
    isValid: boolean;
    fileSize: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    try {
      const fileSize = pdfBuffer.length;
      
      if (fileSize === 0) {
        errors.push('PDF file is empty');
        return { isValid: false, fileSize, errors };
      }

      // Check PDF header
      const pdfHeader = pdfBuffer.slice(0, 4).toString();
      if (pdfHeader !== '%PDF') {
        errors.push('Invalid PDF format');
        return { isValid: false, fileSize, errors };
      }

      // Check file size limits
      if (fileSize > 10 * 1024 * 1024) { // 10MB limit
        errors.push('PDF file is too large (>10MB)');
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
}