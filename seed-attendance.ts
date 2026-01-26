import { db } from '@/lib/db';

async function main() {
  console.log('🎯 Starting to seed attendance data...');

  // Get existing classes with teachers and students
  const classes = await db.class.findMany({
    include: {
      teacher: true,
      students: {
        include: {
          student: true
        }
      }
    }
  });

  if (classes.length === 0) {
    console.log('❌ No classes found. Please create classes first.');
    return;
  }

  console.log(`📚 Found ${classes.length} classes`);

  // Create attendance data for each class
  for (const classData of classes) {
    console.log(`\n📝 Creating attendance for class: ${classData.name}`);

    if (classData.students.length === 0) {
      console.log(`⚠️  No students in class ${classData.name}, skipping...`);
      continue;
    }

    // Check existing meetings for this class
    const existingMeetings = await db.classMeeting.findMany({
      where: { classId: classData.id },
      orderBy: { meetingNumber: 'desc' },
      take: 1
    });

    const lastMeetingNumber = existingMeetings.length > 0 ? existingMeetings[0].meetingNumber : 0;

    // Create 3-5 new meetings for each class
    const meetingCount = Math.floor(Math.random() * 3) + 3; // 3-5 meetings

    for (let i = 1; i <= meetingCount; i++) {
      const meetingNum = lastMeetingNumber + i;
      // Create meeting date (random date in the last 30 days)
      const meetingDate = new Date();
      meetingDate.setDate(meetingDate.getDate() - Math.floor(Math.random() * 30));
      meetingDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0); // 9 AM - 5 PM

      const endTime = new Date(meetingDate);
      endTime.setHours(endTime.getHours() + 2); // 2 hour duration

      // Create class meeting
      const meeting = await db.classMeeting.create({
        data: {
          classId: classData.id,
          meetingNumber: meetingNum,
          date: meetingDate,
          startTime: meetingDate,
          endTime: endTime,
          topic: `Pertemuan ${meetingNum} - ${getRandomTopic()}`,
          status: 'COMPLETED',
          notes: `Pertemuan ${meetingNum} telah selesai`
        }
      });

      // Create teacher attendance
      await db.teacherAttendance.create({
        data: {
          classMeetingId: meeting.id,
          teacherId: classData.teacherId,
          status: 'HADIR',
          markedAt: meetingDate
        }
      });

      // Create student attendance for each student in the class
      for (const classStudent of classData.students) {
        // Random attendance status (80% present, 10% late, 5% absent, 5% excused)
        const rand = Math.random();
        let status: string;
        let notes: string | null = null;

        if (rand < 0.8) {
          status = 'HADIR';
        } else if (rand < 0.9) {
          status = 'TERLAMBAT';
          notes = 'Terlambat 15 menit';
        } else if (rand < 0.95) {
          status = 'TIDAK_HADIR';
          notes = 'Tidak hadir tanpa keterangan';
        } else {
          status = 'IZIN';
          notes = 'Izin sakit';
        }

        await db.attendance.create({
          data: {
            classMeetingId: meeting.id,
            studentId: classStudent.studentId,
            status: status,
            notes: notes,
            markedAt: meetingDate
          }
        });
      }

      console.log(`✅ Created meeting ${meetingNum} with ${classData.students.length} student attendance records`);
    }

    // Update class completed meetings
    const newCompletedMeetings = lastMeetingNumber + meetingCount;
    await db.class.update({
      where: { id: classData.id },
      data: {
        completedMeetings: newCompletedMeetings,
        totalMeetings: Math.max(newCompletedMeetings + 2, 8) // Set total meetings higher than completed
      }
    });

    console.log(`📊 Updated class ${classData.name}: ${meetingCount} completed meetings`);
  }

  console.log('\n🎉 Successfully seeded attendance data!');

  // Show summary
  const totalMeetings = await db.classMeeting.count();
  const totalAttendance = await db.attendance.count();
  const totalTeacherAttendance = await db.teacherAttendance.count();

  console.log(`📈 Summary:`);
  console.log(`   - Total Meetings: ${totalMeetings}`);
  console.log(`   - Total Student Attendance Records: ${totalAttendance}`);
  console.log(`   - Total Teacher Attendance Records: ${totalTeacherAttendance}`);
}

function getRandomTopic(): string {
  const topics = [
    'Pengenalan Dasar',
    'Praktik Hands-on',
    'Teori dan Konsep',
    'Latihan Soal',
    'Project Work',
    'Review Materi',
    'Quiz dan Evaluasi',
    'Studi Kasus',
    'Workshop',
    'Presentasi'
  ];

  return topics[Math.floor(Math.random() * topics.length)];
}

main()
  .catch((e) => {
    console.error('❌ Error seeding attendance data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });