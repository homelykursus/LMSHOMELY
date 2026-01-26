import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // Reset dismiss status when new payment is made
    const updatedPayment = await prisma.payment.update({
      where: {
        id: paymentId
      },
      data: {
        reminderDismissedAt: null,
        reminderDismissedBy: null
      }
    });

    console.log(`Dismiss status reset for payment ${paymentId} due to new payment`);

    return NextResponse.json({ 
      success: true, 
      message: 'Dismiss status berhasil di-reset',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Error resetting dismiss status:', error);
    return NextResponse.json({ error: 'Failed to reset dismiss status' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}