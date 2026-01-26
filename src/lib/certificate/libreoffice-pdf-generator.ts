import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export interface LibreOfficeOptions {
  quality: 'standard' | 'high' | 'maximum';
  embedFonts: boolean;
  preserveImages: boolean;
  timeout: number; // milliseconds
  tempDirectory: string;
}

export interface LibreOfficeValidationResult {
  isAvailable: boolean;
  version?: string;
  path?: string;
  error?: string;
}

export class LibreOfficePDFGenerator {
  private defaultOptions: LibreOfficeOptions = {
    quality: 'high',
    embedFonts: true,
    preserveImages: true,
    timeout: 30000, // 30 seconds
    tempDirectory: os.tmpdir()
  };

  private options: LibreOfficeOptions;

  constructor(options?: Partial<LibreOfficeOptions>) {
    this.options = { ...this.defaultOptions, ...options };
  }

  /**
   * Validate LibreOffice installation and availability
   */
  async validateLibreOfficeInstallation(): Promise<LibreOfficeValidationResult> {
    try {
      // Try different LibreOffice paths and commands
      const paths = [
        'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
        'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
        'soffice',
        'libreoffice'
      ];

      for (const sofficeePath of paths) {
        try {
          // First check if file exists (for full paths)
          if (sofficeePath.includes('\\')) {
            const fs = await import('fs/promises');
            try {
              await fs.access(sofficeePath);
              // File exists, try to get version
              try {
                const { stdout, stderr } = await execAsync(`"${sofficeePath}" --version`, { timeout: 10000 });
                return {
                  isAvailable: true,
                  version: stdout.trim() || stderr.trim() || 'LibreOffice (version detection failed)',
                  path: sofficeePath
                };
              } catch (versionError) {
                // Even if version fails, if file exists we can use it
                return {
                  isAvailable: true,
                  version: 'LibreOffice (installed)',
                  path: sofficeePath
                };
              }
            } catch (accessError) {
              // File doesn't exist, continue to next path
              continue;
            }
          } else {
            // Try command in PATH
            try {
              const { stdout, stderr } = await execAsync(`${sofficeePath} --version`, { timeout: 10000 });
              return {
                isAvailable: true,
                version: stdout.trim() || stderr.trim() || 'LibreOffice (version detection failed)',
                path: sofficeePath
              };
            } catch (error) {
              continue;
            }
          }
        } catch (error) {
          // Continue to next path
          continue;
        }
      }

      return {
        isAvailable: false,
        error: 'LibreOffice not found. Please install LibreOffice for high-fidelity PDF conversion.'
      };
    } catch (error) {
      return {
        isAvailable: false,
        error: `LibreOffice validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Convert Word document to PDF using LibreOffice
   */
  async convertWordToPDF(wordBuffer: Buffer): Promise<Buffer> {
    const validation = await this.validateLibreOfficeInstallation();
    
    if (!validation.isAvailable) {
      throw new Error(`LibreOffice not available: ${validation.error}`);
    }

    const tempDir = await fs.mkdtemp(path.join(this.options.tempDirectory, 'libreoffice-'));
    const inputPath = path.join(tempDir, 'input.docx');
    const outputPath = path.join(tempDir, 'input.pdf');

    try {
      // Write Word buffer to temporary file
      await fs.writeFile(inputPath, wordBuffer);

      // Build LibreOffice command
      const command = this.buildConversionCommand(validation.path!, inputPath, tempDir);

      // Execute conversion
      await execAsync(command, { 
        timeout: this.options.timeout,
        cwd: tempDir 
      });

      // Check if PDF was created
      try {
        await fs.access(outputPath);
      } catch (error) {
        throw new Error('PDF conversion failed - output file not created');
      }

      // Read and return PDF buffer
      const pdfBuffer = await fs.readFile(outputPath);
      return pdfBuffer;

    } catch (error) {
      throw new Error(`LibreOffice conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Clean up temporary files
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary files:', cleanupError);
      }
    }
  }

  /**
   * Build LibreOffice conversion command based on options
   */
  private buildConversionCommand(libreOfficePath: string, inputPath: string, outputDir: string): string {
    // Use simpler command format that works reliably
    const commands = [
      `"${libreOfficePath}"`,
      '--headless',
      '--convert-to',
      'pdf',
      '--outdir',
      `"${outputDir}"`,
      `"${inputPath}"`
    ];

    return commands.join(' ');
  }

  /**
   * Set conversion options
   */
  setConversionOptions(options: Partial<LibreOfficeOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Get current conversion options
   */
  getConversionOptions(): LibreOfficeOptions {
    return { ...this.options };
  }

  /**
   * Test conversion with a simple document
   */
  async testConversion(): Promise<{ success: boolean; error?: string; processingTime?: number }> {
    const startTime = Date.now();
    
    try {
      // Create a simple test Word document
      const testDocx = await this.createTestDocument();
      
      // Attempt conversion
      const pdfBuffer = await this.convertWordToPDF(testDocx);
      
      const processingTime = Date.now() - startTime;
      
      // Validate PDF output
      if (pdfBuffer.length === 0) {
        return { success: false, error: 'Empty PDF output' };
      }

      // Check PDF header
      const pdfHeader = pdfBuffer.subarray(0, 4).toString();
      if (!pdfHeader.includes('%PDF')) {
        return { success: false, error: 'Invalid PDF format' };
      }

      return { success: true, processingTime };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Create a simple test Word document for validation
   */
  private async createTestDocument(): Promise<Buffer> {
    // Import docx library for creating test document
    const { Document, Packer, Paragraph, TextRun } = await import('docx');
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: 'LibreOffice PDF Conversion Test',
                bold: true,
                size: 24
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'This is a test document to verify LibreOffice PDF conversion functionality.',
                size: 20
              })
            ]
          })
        ]
      }]
    });

    return await Packer.toBuffer(doc);
  }
}