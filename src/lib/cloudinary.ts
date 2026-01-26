import { v2 as cloudinary } from 'cloudinary';

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  bytes: number;
  url: string;
}

export class CloudinaryService {
  /**
   * Upload foto siswa ke Cloudinary
   */
  static async uploadStudentPhoto(
    file: Buffer | string,
    studentId: string,
    options?: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
    }
  ): Promise<CloudinaryUploadResult> {
    try {
      const uploadOptions = {
        folder: 'students/photos',
        public_id: `student_${studentId}`,
        transformation: [
          {
            width: options?.width || 400,
            height: options?.height || 400,
            crop: options?.crop || 'fill',
            gravity: 'face',
            quality: options?.quality || 'auto:good',
            format: 'jpg'
          }
        ],
        overwrite: true,
        invalidate: true,
      };

      const result = await cloudinary.uploader.upload(
        typeof file === 'string' ? file : `data:image/jpeg;base64,${file.toString('base64')}`,
        uploadOptions
      );

      return result as CloudinaryUploadResult;
    } catch (error) {
      console.error('Error uploading student photo:', error);
      throw new Error('Failed to upload student photo');
    }
  }

  /**
   * Upload foto guru ke Cloudinary
   */
  static async uploadTeacherPhoto(
    file: Buffer | string,
    teacherId: string,
    options?: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
    }
  ): Promise<CloudinaryUploadResult> {
    try {
      const uploadOptions = {
        folder: 'teachers/photos',
        public_id: `teacher_${teacherId}`,
        transformation: [
          {
            width: options?.width || 400,
            height: options?.height || 400,
            crop: options?.crop || 'fill',
            gravity: 'face',
            quality: options?.quality || 'auto:good',
            format: 'jpg'
          }
        ],
        overwrite: true,
        invalidate: true,
      };

      const result = await cloudinary.uploader.upload(
        typeof file === 'string' ? file : `data:image/jpeg;base64,${file.toString('base64')}`,
        uploadOptions
      );

      return result as CloudinaryUploadResult;
    } catch (error) {
      console.error('Error uploading teacher photo:', error);
      throw new Error('Failed to upload teacher photo');
    }
  }

  /**
   * Upload gambar umum (logo, banner, dll)
   */
  static async uploadGeneralImage(
    file: Buffer | string,
    folder: string,
    filename: string,
    options?: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
    }
  ): Promise<CloudinaryUploadResult> {
    try {
      const uploadOptions = {
        folder: `general/${folder}`,
        public_id: filename,
        transformation: options ? [
          {
            width: options.width,
            height: options.height,
            crop: options.crop || 'limit',
            quality: options.quality || 'auto:good',
          }
        ] : undefined,
        overwrite: true,
        invalidate: true,
      };

      const result = await cloudinary.uploader.upload(
        typeof file === 'string' ? file : `data:image/jpeg;base64,${file.toString('base64')}`,
        uploadOptions
      );

      return result as CloudinaryUploadResult;
    } catch (error) {
      console.error('Error uploading general image:', error);
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Hapus gambar dari Cloudinary
   */
  static async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  /**
   * Generate URL dengan transformasi
   */
  static generateUrl(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
      format?: string;
    }
  ): string {
    return cloudinary.url(publicId, {
      transformation: [
        {
          width: options?.width,
          height: options?.height,
          crop: options?.crop || 'fill',
          quality: options?.quality || 'auto:good',
          format: options?.format || 'auto',
        }
      ]
    });
  }

  /**
   * Generate responsive image URLs
   */
  static generateResponsiveUrls(publicId: string): {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
  } {
    return {
      thumbnail: this.generateUrl(publicId, { width: 150, height: 150, crop: 'fill' }),
      small: this.generateUrl(publicId, { width: 300, height: 300, crop: 'fill' }),
      medium: this.generateUrl(publicId, { width: 600, height: 600, crop: 'limit' }),
      large: this.generateUrl(publicId, { width: 1200, height: 1200, crop: 'limit' }),
    };
  }

  /**
   * Get image info
   */
  static async getImageInfo(publicId: string) {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      console.error('Error getting image info:', error);
      return null;
    }
  }
}

export default cloudinary;