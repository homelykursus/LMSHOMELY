import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthTeacher {
  id: string;
  name: string;
  whatsapp: string;
  role: 'teacher';
}

export class AuthService {
  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token
   */
  static generateToken(user: AuthUser): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  /**
   * Generate JWT token for teacher
   */
  static generateTeacherToken(teacher: AuthTeacher): string {
    return jwt.sign(
      {
        id: teacher.id,
        name: teacher.name,
        whatsapp: teacher.whatsapp,
        role: teacher.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  /**
   * Verify JWT token (works for both admin and teacher)
   */
  static verifyToken(token: string): AuthUser | AuthTeacher | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser | AuthTeacher;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get user from request (from Authorization header or cookie)
   */
  static async getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
    try {
      // Try Authorization header first
      const authHeader = request.headers.get('authorization');
      let token = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else {
        // Try cookie
        token = request.cookies.get('auth-token')?.value;
      }

      if (!token) {
        return null;
      }

      const decoded = this.verifyToken(token);
      if (!decoded) {
        return null;
      }

      // Verify user still exists and is active
      const user = await db.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true
        }
      });

      if (!user || !user.isActive) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };
    } catch (error) {
      console.error('Error getting user from request:', error);
      return null;
    }
  }

  /**
   * Authenticate user with email and password
   */
  static async authenticate(email: string, password: string): Promise<AuthUser | null> {
    try {
      // Clean and normalize email
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      console.log(`[AUTH] Attempting login for email: ${cleanEmail}`);

      const user = await db.user.findUnique({
        where: { email: cleanEmail },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          role: true,
          isActive: true
        }
      });

      if (!user) {
        console.log(`[AUTH] User not found: ${cleanEmail}`);
        return null;
      }

      if (!user.isActive) {
        console.log(`[AUTH] User inactive: ${cleanEmail}`);
        return null;
      }

      const isValidPassword = await this.verifyPassword(cleanPassword, user.password);
      if (!isValidPassword) {
        console.log(`[AUTH] Invalid password for: ${cleanEmail}`);
        return null;
      }

      console.log(`[AUTH] Login successful for: ${cleanEmail}`);

      // Update last login
      await db.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      return null;
    }
  }

  /**
   * Authenticate teacher with whatsapp and password
   */
  static async authenticateTeacher(whatsapp: string, password: string): Promise<AuthTeacher | null> {
    try {
      const teacher = await db.teacher.findFirst({
        where: { 
          whatsapp: whatsapp,
          status: 'active'
        },
        select: {
          id: true,
          name: true,
          whatsapp: true,
          password: true,
          status: true
        }
      });

      if (!teacher || !teacher.password) {
        return null;
      }

      const isValidPassword = await this.verifyPassword(password, teacher.password);
      if (!isValidPassword) {
        return null;
      }

      return {
        id: teacher.id,
        name: teacher.name,
        whatsapp: teacher.whatsapp,
        role: 'teacher'
      };
    } catch (error) {
      console.error('Error authenticating teacher:', error);
      return null;
    }
  }

  /**
   * Get teacher from request (from cookie)
   */
  static async getTeacherFromRequest(request: NextRequest): Promise<AuthTeacher | null> {
    try {
      const token = request.cookies.get('teacher-auth-token')?.value;

      if (!token) {
        return null;
      }

      const decoded = this.verifyToken(token);
      if (!decoded || (decoded as any).role !== 'teacher') {
        return null;
      }

      const teacherData = decoded as AuthTeacher;

      // Verify teacher still exists and is active
      const teacher = await db.teacher.findUnique({
        where: { id: teacherData.id },
        select: {
          id: true,
          name: true,
          whatsapp: true,
          status: true
        }
      });

      if (!teacher || teacher.status !== 'active') {
        return null;
      }

      return {
        id: teacher.id,
        name: teacher.name,
        whatsapp: teacher.whatsapp,
        role: 'teacher'
      };
    } catch (error) {
      console.error('Error getting teacher from request:', error);
      return null;
    }
  }
  static async createDefaultAdmin(): Promise<void> {
    try {
      const existingAdmin = await db.user.findFirst({
        where: { role: 'super_admin' }
      });

      if (!existingAdmin) {
        const hashedPassword = await this.hashPassword('admin123');
        
        await db.user.create({
          data: {
            email: 'admin@kursus.com',
            name: 'Super Admin',
            password: hashedPassword,
            role: 'super_admin',
            isActive: true
          }
        });

        console.log('Default admin user created:');
        console.log('Email: admin@kursus.com');
        console.log('Password: admin123');
        console.log('Please change the password after first login!');
      }
    } catch (error) {
      console.error('Error creating default admin:', error);
    }
  }
}

/**
 * Middleware to protect routes
 */
export function withAuth(handler: (request: NextRequest, user: AuthUser) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = await AuthService.getUserFromRequest(request);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return handler(request, user);
  };
}

/**
 * Middleware to protect teacher routes
 */
export function withTeacherAuth(handler: (request: NextRequest, teacher: AuthTeacher) => Promise<Response>) {
  return async (request: NextRequest) => {
    const teacher = await AuthService.getTeacherFromRequest(request);
    
    if (!teacher) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return handler(request, teacher);
  };
}
export function withRole(roles: string[], handler: (request: NextRequest, user: AuthUser, context?: any) => Promise<Response>) {
  return async (request: NextRequest, context?: any) => {
    const user = await AuthService.getUserFromRequest(request);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!roles.includes(user.role)) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return handler(request, user, context);
  };
}