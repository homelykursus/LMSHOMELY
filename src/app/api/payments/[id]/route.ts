import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payment = await db.payment.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            whatsapp: true,
            photo: true,
            course: {
              select: {
                name: true,
                category: true
              }
            }
          }
        },
        transactions: {
          orderBy: { paymentDate: 'desc' }
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, paymentMethod, notes, dueDate } = body;

    const payment = await db.payment.update({
      where: { id },
      data: {
        status,
        paymentMethod,
        notes,
        dueDate: dueDate ? new Date(dueDate) : null,
        completedAt: status === 'completed' ? new Date() : null
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            whatsapp: true,
            photo: true,
            course: {
              select: {
                name: true,
                category: true
              }
            }
          }
        },
        transactions: {
          orderBy: { paymentDate: 'desc' }
        }
      }
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.payment.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    );
  }
}