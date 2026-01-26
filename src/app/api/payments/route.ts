import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const payments = await db.payment.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            whatsapp: true,
            photo: true,
            lastEducation: true,
            discount: true,
            status: true, // Tambahkan status siswa
            createdAt: true, // Tambahkan tanggal pendaftaran
            courseType: true, // Tambahkan courseType
            course: {
              select: {
                name: true,
                category: true
              }
            }
          }
        },
        transactions: {
          orderBy: { paymentDate: 'asc' }
        }
      },
      where: {
        student: {
          status: {
            in: ["confirmed", "completed"] // Hanya tampilkan siswa yang sudah dikonfirmasi atau selesai
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, totalAmount, dueDate, notes } = body;

    // Cek apakah siswa sudah memiliki pembayaran
    const existingPayment = await db.payment.findFirst({
      where: { studentId }
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Student already has a payment record' },
        { status: 400 }
      );
    }

    const payment = await db.payment.create({
      data: {
        studentId,
        totalAmount,
        remainingAmount: totalAmount,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            whatsapp: true,
            photo: true,
            lastEducation: true,
            discount: true,
            courseType: true, // Tambahkan courseType
            course: {
              select: {
                name: true,
                category: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}