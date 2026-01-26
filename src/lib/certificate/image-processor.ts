/**
 * Image Processor for Certificate Generation
 * Handles student photo processing and embedding in certificates
 * Supports both local files and Cloudinary URLs
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';
import fetch from 'node-fetch';

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export class ImageProcessor {
  private static readonly DEFAULT_OPTIONS: ImageProcessingOptions = {
    width: 150,
    height: 200,
    quality: 90,
    format: 'jpeg',
    fit: 'cover'
  };

  private static readonly SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Check if URL is a Cloudinary URL
   * @param url - URL to check
   * @returns boolean - True if it's a Cloudinary URL
   */
  static isCloudinaryUrl(url: string): boolean {
    return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
  }

  /**
   * Download image from URL (for Cloudinary images)
   * @param url - Image URL
   * @returns Promise<Buffer> - Image buffer
   */
  static async downloadImageFromUrl(url: string): Promise<Buffer> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }
      
      const buffer = await response.buffer();
      return buffer;
    } catch (error) {
      console.error('Error downloading image from URL:', error);
      throw new Error(`Failed to download image from URL: ${error}`);
    }
  }

  /**
   * Check if file exists and is a valid image
   * @param imagePath - Path to image file or URL
   * @returns boolean - True if valid image exists
   */
  static async isValidImage(imagePath: string): Promise<boolean> {
    try {
      // Handle Cloudinary URLs
      if (this.isCloudinaryUrl(imagePath)) {
        try {
          const buffer = await this.downloadImageFromUrl(imagePath);
          await sharp(buffer).metadata();
          return true;
        } catch (error) {
          console.warn('Invalid Cloudinary image:', imagePath, error);
          return false;
        }
      }

      // Handle local files
      // Check if file exists
      await fs.access(imagePath);
      
      // Check file extension
      const ext = path.extname(imagePath).toLowerCase();
      if (!this.SUPPORTED_FORMATS.includes(ext)) {
        return false;
      }

      // Check file size
      const stats = await fs.stat(imagePath);
      if (stats.size > this.MAX_FILE_SIZE) {
        return false;
      }

      // Try to read image metadata to verify it's a valid image
      await sharp(imagePath).metadata();
      return true;
    } catch (error) {
      console.warn('Invalid image:', imagePath, error);
      return false;
    }
  }

  /**
   * Process student photo for certificate use
   * @param input - Path to original student photo or Buffer from URL
   * @param outputPath - Path where processed image will be saved
   * @param options - Processing options
   * @returns Promise<string> - Path to processed image
   */
  static async processStudentPhoto(
    input: string | Buffer,
    outputPath: string,
    options: ImageProcessingOptions = {}
  ): Promise<string> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    try {
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      await fs.mkdir(outputDir, { recursive: true });

      // Process image
      await sharp(input)
        .resize(opts.width, opts.height, { 
          fit: opts.fit as any,
          withoutEnlargement: true 
        })
        .jpeg({ quality: opts.quality })
        .toFile(outputPath);

      return outputPath;
    } catch (error) {
      console.error('Error processing student photo:', error);
      throw new Error(`Failed to process student photo: ${error}`);
    }
  }

  /**
   * Get student photo path from database photo field
   * @param photoField - Photo field from student database record
   * @returns string | null - Full path to photo, URL, or null if not available
   */
  static getStudentPhotoPath(photoField: string | null): string | null {
    if (!photoField) {
      return null;
    }

    // Handle Cloudinary URLs
    if (this.isCloudinaryUrl(photoField)) {
      return photoField; // Return URL as-is
    }

    // Handle local file paths
    if (photoField.startsWith('/uploads/')) {
      // Relative path from public directory
      return path.join(process.cwd(), 'public', photoField);
    } else if (photoField.startsWith('uploads/')) {
      // Relative path without leading slash
      return path.join(process.cwd(), 'public', photoField);
    } else if (path.isAbsolute(photoField)) {
      // Absolute path
      return photoField;
    } else {
      // Assume it's in uploads/students directory
      return path.join(process.cwd(), 'public', 'uploads', 'students', photoField);
    }
  }

  /**
   * Prepare student photo for certificate generation
   * @param student - Student object with photo field
   * @param certificateId - Certificate ID for unique filename
   * @returns Promise<string | null> - Path to processed photo or null
   */
  static async prepareStudentPhotoForCertificate(
    student: { photo: string | null; studentNumber: string; name: string },
    certificateId: string
  ): Promise<string | null> {
    try {
      // Get original photo path or URL
      const originalPhoto = this.getStudentPhotoPath(student.photo);
      if (!originalPhoto) {
        console.log(`No photo available for student ${student.studentNumber}`);
        return null;
      }

      // Check if original photo is valid
      const isValid = await this.isValidImage(originalPhoto);
      if (!isValid) {
        console.log(`Invalid photo for student ${student.studentNumber}: ${originalPhoto}`);
        return null;
      }

      // Create processed photo path
      const processedDir = path.join(process.cwd(), 'public', 'certificates', 'photos');
      const processedFileName = `${certificateId}_${student.studentNumber}.jpg`;
      const processedPhotoPath = path.join(processedDir, processedFileName);

      // Prepare input for processing
      let input: string | Buffer;
      if (this.isCloudinaryUrl(originalPhoto)) {
        // Download from Cloudinary
        input = await this.downloadImageFromUrl(originalPhoto);
      } else {
        // Use local file path
        input = originalPhoto;
      }

      // Process photo for certificate use
      await this.processStudentPhoto(input, processedPhotoPath, {
        width: 150,
        height: 200,
        quality: 85,
        format: 'jpeg',
        fit: 'cover'
      });

      console.log(`Photo processed for ${student.name}: ${processedPhotoPath}`);
      return processedPhotoPath;
    } catch (error) {
      console.error(`Error preparing photo for student ${student.studentNumber}:`, error);
      return null;
    }
  }

  /**
   * Get default placeholder photo path
   * @returns string - Path to default placeholder photo
   */
  static getDefaultPhotoPath(): string {
    return path.join(process.cwd(), 'public', 'images', 'default-student-photo.jpg');
  }

  /**
   * Create default placeholder photo if it doesn't exist
   * @returns Promise<string> - Path to default photo
   */
  static async ensureDefaultPhoto(): Promise<string> {
    const defaultPhotoPath = this.getDefaultPhotoPath();
    
    try {
      await fs.access(defaultPhotoPath);
      return defaultPhotoPath;
    } catch (error) {
      // Create default photo directory
      const defaultDir = path.dirname(defaultPhotoPath);
      await fs.mkdir(defaultDir, { recursive: true });

      // Create a simple placeholder image
      await sharp({
        create: {
          width: 150,
          height: 200,
          channels: 3,
          background: { r: 240, g: 240, b: 240 }
        }
      })
      .jpeg({ quality: 80 })
      .toFile(defaultPhotoPath);

      return defaultPhotoPath;
    }
  }

  /**
   * Get photo for certificate (student photo or default)
   * @param student - Student object
   * @param certificateId - Certificate ID
   * @returns Promise<string> - Path to photo to use in certificate
   */
  static async getPhotoForCertificate(
    student: { photo: string | null; studentNumber: string; name: string },
    certificateId: string
  ): Promise<string> {
    // Try to get student photo
    const studentPhoto = await this.prepareStudentPhotoForCertificate(student, certificateId);
    
    if (studentPhoto) {
      return studentPhoto;
    }

    // Fallback to default photo
    console.log(`Using default photo for student ${student.studentNumber}`);
    return await this.ensureDefaultPhoto();
  }
}