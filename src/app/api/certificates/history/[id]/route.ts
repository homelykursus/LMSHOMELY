import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    await db.certificate.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Certificate history deleted successfully',
    });
  } catch (error: any) {
    console.error('Failed to delete certificate history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete certificate history' },
      { status: 500 }
    );
  }
}
