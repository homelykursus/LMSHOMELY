import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    console.log('Fetching financial records...');

    // Fetch all payment transactions with related data
    const transactions = await db.paymentTransaction.findMany({
      include: {
        payment: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                whatsapp: true,
                course: {
                  select: {
                    name: true,
                    category: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        paymentDate: 'desc'
      }
    });

    console.log(`Found ${transactions.length} financial records`);

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching financial records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial records' },
      { status: 500 }
    );
  }
}