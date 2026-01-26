import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { paymentId, dismissedBy } = await request.json();

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // Update payment with dismissed information
    const updatedPayment = await prisma.payment.update({
      where: {
        id: paymentId
      },
      data: {
        reminderDismissedAt: new Date(),
        reminderDismissedBy: dismissedBy || 'admin'
      }
    });

    console.log(`Reminder dismissed for payment ${paymentId} by ${dismissedBy || 'admin'}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Reminder berhasil di-dismiss',
      dismissedAt: updatedPayment.reminderDismissedAt
    });
  } catch (error) {
    console.error('Error dismissing reminder:', error);
    return NextResponse.json({ error: 'Failed to dismiss reminder' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}