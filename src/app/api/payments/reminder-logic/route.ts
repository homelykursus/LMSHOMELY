import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get all students with their payments and attendance data
    const students = await prisma.student.findMany({
      include: {
        payments: {
          include: {
            transactions: {
              orderBy: {
                paymentDate: 'desc'
              }
            }
          }
        }
      }
    });

    // Get attendance counts for all students
    const attendanceCounts = await prisma.attendance.groupBy({
      by: ['studentId'],
      _count: {
        id: true
      }
    });

    const attendanceMap = attendanceCounts.reduce((acc, item) => {
      acc[item.studentId] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Calculate reminder data for each student using SIMPLIFIED LOGIC
    const reminderData = await Promise.all(students.map(async (student) => {
      const payment = student.payments[0]; // Assuming one payment per student
      
      // No reminder if no payment or payment is completed
      if (!payment || payment.status === 'completed') {
        return {
          studentId: student.id,
          shouldShowReminder: false,
          reason: payment?.status === 'completed' ? 'Payment completed (lunas)' : 'No payment found'
        };
      }

      const totalMeetings = attendanceMap[student.id] || 0;
      
      // No reminder if no remaining amount
      if (payment.remainingAmount <= 0) {
        return {
          studentId: student.id,
          shouldShowReminder: false,
          reason: 'Payment completed (no remaining amount)',
          totalMeetings
        };
      }

      // SIMPLIFIED LOGIC:
      // 1. Show reminder starting from meeting 1
      // 2. After dismiss/payment AFTER first meeting: reset counter, next reminder after 3 meetings
      // 3. Continue cycle until payment status = "completed"
      // 4. NEW: Consider any payment within last 7 days as recent payment that should reset reminder

      let meetingsToCheck = totalMeetings;
      let lastResetDate: Date | null = null;
      let resetType: string | null = null;
      
      // Check if there are transactions (payments) - consider recent payments (within 7 days)
      const hasTransactions = payment.transactions && payment.transactions.length > 0;
      if (hasTransactions) {
        // Get the first attendance date to compare with payment dates
        const firstAttendance = await prisma.attendance.findFirst({
          where: {
            studentId: student.id
          },
          include: {
            classMeeting: true
          },
          orderBy: {
            classMeeting: {
              date: 'asc'
            }
          }
        });
        
        if (firstAttendance) {
          const firstMeetingDate = new Date(firstAttendance.classMeeting.date);
          
          // Consider payments made AFTER the first meeting OR within last 7 days
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          const relevantPayments = payment.transactions.filter(transaction => {
            const paymentDate = new Date(transaction.paymentDate);
            const firstMeetingDateOnly = new Date(firstMeetingDate.getFullYear(), firstMeetingDate.getMonth(), firstMeetingDate.getDate());
            const paymentDateOnly = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), paymentDate.getDate());
            
            // Payment must be AFTER the first meeting date OR within last 7 days
            return paymentDateOnly > firstMeetingDateOnly || paymentDate >= sevenDaysAgo;
          });
          
          if (relevantPayments.length > 0) {
            const latestTransaction = relevantPayments[0];
            lastResetDate = new Date(latestTransaction.paymentDate);
            resetType = 'payment';
          }
        } else {
          // No attendance yet, but check for recent payments (within 7 days)
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          const recentPayments = payment.transactions.filter(transaction => {
            const paymentDate = new Date(transaction.paymentDate);
            return paymentDate >= sevenDaysAgo;
          });
          
          if (recentPayments.length > 0) {
            const latestTransaction = recentPayments[0];
            lastResetDate = new Date(latestTransaction.paymentDate);
            resetType = 'payment';
          }
        }
      }
      
      // Check if reminder was dismissed - use dismissal as reset point if more recent
      if (payment.reminderDismissedAt) {
        const dismissedDate = new Date(payment.reminderDismissedAt);
        if (!lastResetDate || dismissedDate > lastResetDate) {
          lastResetDate = dismissedDate;
          resetType = 'dismiss';
        }
      }
      
      // If we have a reset date (payment AFTER first meeting or dismissal), count meetings since then
      if (lastResetDate) {
        meetingsToCheck = await prisma.attendance.count({
          where: {
            studentId: student.id,
            classMeeting: {
              date: {
                gt: lastResetDate
              }
            }
          }
        });
      }
      
      // Determine if reminder should show
      let shouldShow = false;
      let reason = '';
      
      // SPECIAL RULE: Always show reminder starting from first meeting (totalMeetings >= 1)
      // until there's a payment or dismissal after the first meeting
      if (totalMeetings >= 1) {
        // Check if there's been any reset (payment/dismiss) after the first meeting
        if (lastResetDate) {
          // There was a reset - use normal 3-meeting cycle
          if (meetingsToCheck === 0) {
            shouldShow = false;
            reason = `0 meetings since last ${resetType} (${lastResetDate.toLocaleDateString()}), next reminder at 3 meetings`;
          } else if (meetingsToCheck >= 3) {
            shouldShow = true;
            reason = `${meetingsToCheck} meetings since ${resetType} (${lastResetDate.toLocaleDateString()}), reminder triggered, remaining: ${formatCurrency(payment.remainingAmount)}`;
          } else {
            shouldShow = false;
            const meetingsUntilNext = 3 - meetingsToCheck;
            reason = `${meetingsToCheck} meetings since ${resetType} (${lastResetDate.toLocaleDateString()}), ${meetingsUntilNext} more meetings until next reminder`;
          }
        } else {
          // No reset yet - show reminder continuously from first meeting
          shouldShow = true;
          reason = `Meeting ${totalMeetings} - reminder active since first meeting, remaining: ${formatCurrency(payment.remainingAmount)}`;
        }
      } else {
        // No meetings yet
        shouldShow = false;
        reason = 'No meetings yet, next reminder at meeting 1';
      }
      
      return {
        studentId: student.id,
        shouldShowReminder: shouldShow,
        reason,
        totalMeetings,
        meetingsSinceReset: meetingsToCheck,
        lastResetDate: lastResetDate?.toISOString() || null,
        remainingAmount: payment.remainingAmount,
        resetType
      };
    }));

    return NextResponse.json(reminderData);
  } catch (error) {
    console.error('Error calculating reminder data:', error);
    return NextResponse.json({ error: 'Failed to calculate reminder data' }, { status: 500 });
  }
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}