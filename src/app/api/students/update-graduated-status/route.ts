import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Fetch all students with their classes
    const students = await db.student.findMany({
      include: {
        classes: {
          include: {
            class: {
              select: {
                id: true,
                totalMeetings: true,
                completedMeetings: true
              }
            }
          }
        }
      }
    });

    let updatedCount = 0;

    // Check each student for class completion
    for (const student of students) {
      // Check if student has completed any class
      const completedClass = student.classes.find(cs => 
        cs.class.totalMeetings > 0 && 
        cs.class.completedMeetings >= cs.class.totalMeetings
      );
      
      // If student has completed a class but is not yet marked as graduated
      if (completedClass && student.status !== 'graduated') {
        // Update the student status to graduated
        await db.student.update({
          where: { id: student.id },
          data: { status: 'graduated' }
        });
        updatedCount++;
        console.log(`Updated student ${student.name} (${student.id}) to graduated status`);
      }
    }

    return NextResponse.json({ 
      message: 'Student statuses updated successfully',
      updatedCount,
      totalStudents: students.length
    });

  } catch (error) {
    console.error('Error updating student statuses:', error);
    return NextResponse.json(
      { error: 'Failed to update student statuses' },
      { status: 500 }
    );
  }
}