// PART 1: Imports and Interfaces
import JSZip from 'jszip';
import fs from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';
import { AuthService } from '@/lib/auth';

export interface BackupMetadata {
  version: string;
  created_at: string;
  backup_type: 'data' | 'full';
  total_records: number;
  file_size?: string;
  description: string;
  tables_included: string[]; // NEW: List of tables included in backup
}

export interface BackupData {
  metadata: BackupMetadata;
  data: {
    // Core Tables
    students: any[];
    teachers: any[];
    classes: any[];
    courses: any[];
    coursePricing: any[];
    meetings: any[];
    payments: any[];
    paymentTransactions: any[];
    certificates: any[];
    certificateTemplates: any[];
    users: any[];
    rooms: any[];
    
    // Relation Tables
    classStudents: any[];
    teacherAttendances: any[];
    attendances: any[];
    teacherCourses: any[];
    
    // System Tables
    announcements: any[];
    employeeAttendances: any[];
    
    // Web Content CMS Tables (NEW)
    heroSections: any[];
    facilities: any[];
    testimonials: any[];
    galleryImages: any[];
    locationInfo: any[];
    landingCourses: any[];
    blogPosts: any[];
  };
  assets?: {
    cloudinary_urls: string[];
    local_files: string[];
  };
}
