import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId } = body;

    // Get transaction with payment and student data
    const transaction = await db.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: {
        payment: {
          include: {
            student: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Generate receipt data
    const receiptData = {
      receiptNumber: `RCP-${Date.now()}`,
      transactionDate: transaction.paymentDate,
      studentName: transaction.payment.student.name,
      courseName: transaction.payment.student.course.name,
      courseType: transaction.payment.student.courseType,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod,
      totalAmount: transaction.payment.totalAmount, // Total biaya kursus
      totalPaid: transaction.payment.paidAmount,
      remainingAmount: transaction.payment.remainingAmount,
      status: transaction.payment.status,
      notes: transaction.notes
    };

    return NextResponse.json(receiptData);
  } catch (error) {
    console.error('Error generating receipt:', error);
    return NextResponse.json(
      { error: 'Failed to generate receipt' },
      { status: 500 }
    );
  }
}