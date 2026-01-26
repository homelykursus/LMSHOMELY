/**
 * Commission Calculator Service
 * 
 * Handles calculation of teacher commission based on different commission types:
 * - BY_CLASS: Fixed commission amount per class session
 * - BY_STUDENT: Variable commission based on number of attending students
 */

export interface AttendanceRecord {
  id: string;
  studentId: string;
  status: 'HADIR' | 'TIDAK_HADIR' | 'TERLAMBAT' | 'IZIN';
  notes?: string | null;
}

export interface CommissionCalculationResult {
  amount: number;
  breakdown: string;
  eligibleStudentCount: number;
}

export type CommissionType = 'BY_CLASS' | 'BY_STUDENT';

export class CommissionCalculator {
  /**
   * Calculate teacher commission based on commission type and attendance records
   * 
   * @param commissionType - Type of commission calculation ('BY_CLASS' | 'BY_STUDENT')
   * @param commissionAmount - Base commission amount (per class or per student)
   * @param attendanceRecords - Array of attendance records for the meeting
   * @returns Commission calculation result with amount, breakdown, and eligible student count
   */
  static calculateCommission(
    commissionType: CommissionType,
    commissionAmount: number,
    attendanceRecords: AttendanceRecord[]
  ): CommissionCalculationResult {
    // Validate inputs
    if (!commissionType || !['BY_CLASS', 'BY_STUDENT'].includes(commissionType)) {
      throw new Error(`Invalid commission type: ${commissionType}. Must be 'BY_CLASS' or 'BY_STUDENT'`);
    }

    if (commissionAmount < 0) {
      throw new Error(`Commission amount must be non-negative, got: ${commissionAmount}`);
    }

    if (!Array.isArray(attendanceRecords)) {
      throw new Error('Attendance records must be an array');
    }

    // Filter eligible students (only HADIR and TERLAMBAT count toward commission)
    const eligibleStudents = attendanceRecords.filter(record => 
      record.status === 'HADIR' || record.status === 'TERLAMBAT'
    );
    
    const eligibleCount = eligibleStudents.length;
    
    // If no eligible students, no commission is paid
    if (eligibleCount === 0) {
      return {
        amount: 0,
        breakdown: 'Tidak ada siswa yang hadir atau terlambat',
        eligibleStudentCount: 0
      };
    }
    
    // Calculate commission based on type
    switch (commissionType) {
      case 'BY_CLASS':
        return {
          amount: commissionAmount,
          breakdown: `Komisi per kelas: Rp ${commissionAmount.toLocaleString('id-ID')}`,
          eligibleStudentCount: eligibleCount
        };
        
      case 'BY_STUDENT':
        const totalAmount = commissionAmount * eligibleCount;
        return {
          amount: totalAmount,
          breakdown: `${eligibleCount} siswa × Rp ${commissionAmount.toLocaleString('id-ID')} = Rp ${totalAmount.toLocaleString('id-ID')}`,
          eligibleStudentCount: eligibleCount
        };
        
      default:
        throw new Error(`Unknown commission type: ${commissionType}`);
    }
  }

  /**
   * Validate commission type
   * 
   * @param commissionType - Commission type to validate
   * @returns true if valid, false otherwise
   */
  static isValidCommissionType(commissionType: string): commissionType is CommissionType {
    return ['BY_CLASS', 'BY_STUDENT'].includes(commissionType);
  }

  /**
   * Format commission amount for display
   * 
   * @param amount - Commission amount in IDR
   * @returns Formatted currency string
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Get commission type display label
   * 
   * @param commissionType - Commission type
   * @returns Human-readable label
   */
  static getCommissionTypeLabel(commissionType: CommissionType): string {
    switch (commissionType) {
      case 'BY_CLASS':
        return 'Komisi per Kelas';
      case 'BY_STUDENT':
        return 'Komisi per Siswa';
      default:
        return 'Tidak diketahui';
    }
  }

  /**
   * Calculate total commission for multiple meetings
   * 
   * @param meetings - Array of meetings with commission data
   * @returns Total commission amount
   */
  static calculateTotalCommission(meetings: Array<{ calculatedCommission?: number | null }>): number {
    return meetings.reduce((total, meeting) => {
      return total + (meeting.calculatedCommission || 0);
    }, 0);
  }
}