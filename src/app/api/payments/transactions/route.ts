import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, amount, paymentMethod, notes, createdBy } = body;

    // Get current payment data
    const payment = await db.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Create transaction
    const transaction = await db.paymentTransaction.create({
      data: {
        paymentId,
        amount,
        paymentMethod,
        notes,
        createdBy
      }
    });

    // Update payment totals
    const newPaidAmount = payment.paidAmount + amount;
    const newRemainingAmount = payment.totalAmount - newPaidAmount;
    const newStatus = newRemainingAmount <= 0 ? 'completed' : 
                     newPaidAmount > 0 ? 'partial' : 'pending';

    await db.payment.update({
      where: { id: paymentId },
      data: {
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date() : null,
        // Auto-dismiss reminder after new payment (will be reset by new logic)
        reminderDismissedAt: new Date(),
        reminderDismissedBy: 'system-auto-after-payment'
      }
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating payment transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create payment transaction' },
      { status: 500 }
    );
  }
}