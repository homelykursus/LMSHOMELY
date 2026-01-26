import { db } from './src/lib/db';

const prisma = db;

async function main() {
  console.log('🧪 Testing substitute teacher functionality...');

  // Get existing classes and teachers
  const classes = await prisma.class.findMany({
    include: {
      teacher: true,
      students: {
        include: {
          student: true
        }
      }
    }
  });

  const teachers = await prisma.teacher.findMany();

  if (classes.length === 0 || teachers.length < 2) {
    console.log('❌ Need at least 1 class and 2 teachers to test substitute functionality');
    return;
  }

  // Pick the first class for testing
  const testClass = classes[0];
  const mainTeacher = testClass.teacher;

  // Find a substitute teacher (different from main teacher)
  const substituteTeacher = teachers.find(t => t.id !== mainTeacher.id);

  if (!substituteTeacher) {
    console.log('❌ No substitute teacher available');
    return;
  }

  console.log(`📚 Testing with class: ${testClass.name}`);
  console.log(`👨‍🏫 Main teacher: ${mainTeacher.name}`);
  console.log(`👩‍🏫 Substitute teacher: ${substituteTeacher.name}`);

  // Create a new meeting with substitute teacher
  const meetingDate = new Date();
  meetingDate.setHours(10, 0, 0, 0); // 10 AM today

  const endTime = new Date(meetingDate);
  endTime.setHours(12, 0, 0, 0); // 12 PM

  // Get next meeting number
  const lastMeeting = await prisma.classMeeting.findFirst({
    where: { classId: testClass.id },
    orderBy: { meetingNumber: 'desc' }
  });

  const nextMeetingNumber = (lastMeeting?.meetingNumber || 0) + 1;

  // Create the meeting
  const meeting = await prisma.classMeeting.create({
    data: {
      classId: testClass.id,
      meetingNumber: nextMeetingNumber,
      date: meetingDate,
      startTime: meetingDate,
      endTime: endTime,
      topic: `Test Pertemuan ${nextMeetingNumber} - Guru Pengganti`,
      status: 'COMPLETED',
      substituteTeacherId: substituteTeacher.id, // Add substitute teacher ID
      notes: `Testing substitute teacher functionality`
    }
  });

  console.log(`✅ Created meeting: ${meeting.topic}`);

  // Create teacher attendance records
  // 1. Main teacher - absent (berhalangan)
  await prisma.teacherAttendance.create({
    data: {
      classMeetingId: meeting.id,
      teacherId: mainTeacher.id,
      status: 'TIDAK_HADIR',
      notes: `Berhalangan hadir, digantikan oleh ${substituteTeacher.name}`,
      markedAt: meetingDate
    }
  });

  console.log(`❌ Main teacher (${mainTeacher.name}) marked as absent`);

  // 2. Substitute teacher - present (hadir)
  await prisma.teacherAttendance.create({
    data: {
      classMeetingId: meeting.id,
      teacherId: substituteTeacher.id,
      status: 'HADIR',
      notes: `Menggantikan ${mainTeacher.name}`,
      markedAt: meetingDate
    }
  });

  console.log(`✅ Substitute teacher (${substituteTeacher.name}) marked as present`);

  // Create student attendance (some students present)
  const studentsToAttend = testClass.students.slice(0, Math.min(3, testClass.students.length));

  for (const classStudent of studentsToAttend) {
    await prisma.attendance.create({
      data: {
        classMeetingId: meeting.id,
        studentId: classStudent.studentId,
        status: 'HADIR',
        notes: 'Hadir dengan guru pengganti',
        markedAt: meetingDate
      }
    });
  }

  console.log(`👥 Created attendance for ${studentsToAttend.length} students`);

  // Update class completed meetings
  await prisma.class.update({
    where: { id: testClass.id },
    data: {
      completedMeetings: nextMeetingNumber
    }
  });

  console.log('🎉 Test data created successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Meeting: ${meeting.topic}`);
  console.log(`   - Main Teacher (${mainTeacher.name}): ABSENT`);
  console.log(`   - Substitute Teacher (${substituteTeacher.name}): PRESENT`);
  console.log(`   - Students Present: ${studentsToAttend.length}`);
  console.log('\n🔍 Check the teacher attendance page to verify:');
  console.log(`   - ${mainTeacher.name} should NOT get +1 attendance`);
  console.log(`   - ${substituteTeacher.name} should get +1 attendance`);
}

main()
  .catch((e) => {
    console.error('❌ Error creating test data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });