import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { courseId, courseType, finalPrice } = await request.json();

    console.log(`🔄 [COURSE PRICING UPDATE] Updating pricing for student ${params.id}`);
    console.log(`📚 Course: ${courseId}, Type: ${courseType}, Price: ${finalPrice}`);

    // Get current student data
    const student = await db.student.findUnique({
      where: { id: params.id },
      include: {
        course: true
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get existing payment record
    const existingPayment = await db.payment.findFirst({
      where: { studentId: params.id },
      include: {
        transactions: true
      }
    });

    console.log(`💰 [COURSE PRICING UPDATE] Existing payment:`, existingPayment ? 'Found' : 'Not found');

    if (existingPayment) {
      // Calculate total paid amount from transactions
      const totalPaid = existingPayment.transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
      
      console.log(`💵 [COURSE PRICING UPDATE] Total paid: ${totalPaid}, New price: ${finalPrice}`);

      // Calculate new remaining amount
      const newRemainingAmount = Math.max(0, finalPrice - totalPaid);
      
      // Determine new payment status
      let newStatus = 'pending';
      if (totalPaid >= finalPrice) {
        newStatus = 'completed';
      } else if (totalPaid > 0) {
        newStatus = 'partial';
      }

      console.log(`📊 [COURSE PRICING UPDATE] New remaining: ${newRemainingAmount}, Status: ${newStatus}`);

      // Update payment record
      const updatedPayment = await db.payment.update({
        where: { id: existingPayment.id },
        data: {
          totalAmount: finalPrice,
          remainingAmount: newRemainingAmount,
          status: newStatus,
          // Reset reminder dismissal if there's a new balance
          reminderDismissedAt: newRemainingAmount > 0 ? null : existingPayment.reminderDismissedAt,
          reminderDismissedBy: newRemainingAmount > 0 ? null : existingPayment.reminderDismissedBy,
        }
      });

      console.log(`✅ [COURSE PRICING UPDATE] Payment updated successfully`);

      return NextResponse.json({
        success: true,
        message: 'Course pricing updated successfully',
        payment: updatedPayment,
        changes: {
          oldPrice: existingPayment.totalAmount,
          newPrice: finalPrice,
          totalPaid,
          newRemaining: newRemainingAmount,
          statusChanged: existingPayment.status !== newStatus
        }
      });

    } else {
      // Create new payment record
      console.log(`🆕 [COURSE PRICING UPDATE] Creating new payment record`);

      const newPayment = await db.payment.create({
        data: {
          studentId: params.id,
          totalAmount: finalPrice,
          paidAmount: 0,
          remainingAmount: finalPrice,
          status: 'pending'
        }
      });

      console.log(`✅ [COURSE PRICING UPDATE] New payment created successfully`);

      return NextResponse.json({
        success: true,
        message: 'New payment record created',
        payment: newPayment,
        changes: {
          oldPrice: 0,
          newPrice: finalPrice,
          totalPaid: 0,
          newRemaining: finalPrice,
          statusChanged: true
        }
      });
    }

  } catch (error) {
    console.error('❌ [COURSE PRICING UPDATE] Error updating course pricing:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update course pricing',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}