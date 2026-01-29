import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('Fetching alumni detail for ID:', id);

    // Fetch alumni detail with all related data
    const alumni = await db.student.findUnique({
      where: { 
        id: id,
        status: {
          in: ['completed', 'graduated'] // Ensure this is actually an alumni
        }
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            category: true,
            description: true,
            duration: true
          }
        },
        classes: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
                schedule: true,
                isActive: true,
                totalMeetings: true,
                completedMeetings: true
              }
            }
          },
          orderBy: {
            joinedAt: 'desc'
          }
        },
        payments: {
          select: {
            id: true,
            totalAmount: true,
            paidAmount: true,
            remainingAmount: true,
            status: true,
            paymentMethod: true,
            completedAt: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!alumni) {
      return NextResponse.json(
        { error: 'Alumni not found' },
        { status: 404 }
      );
    }

    console.log(`Found alumni: ${alumni.name}`);

    return NextResponse.json(alumni);
  } catch (error) {
    console.error('Error fetching alumni detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alumni detail' },
      { status: 500 }
    );
  }
}