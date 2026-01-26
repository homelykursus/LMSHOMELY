import { db } from '@/lib/db';

async function main() {
  console.log('🔍 Verifying database is empty...');
  
  try {
    // Check main tables
    const coursesCount = await db.course.count();
    const teachersCount = await db.teacher.count();
    const studentsCount = await db.student.count();
    const classesCount = await db.class.count();
    const paymentsCount = await db.payment.count();
    const roomsCount = await db.room.count();
    const attendanceCount = await db.attendance.count();
    const meetingsCount = await db.classMeeting.count();

    console.log('\n📊 Current database counts:');
    console.log(`   - Courses: ${coursesCount}`);
    console.log(`   - Teachers: ${teachersCount}`);
    console.log(`   - Students: ${studentsCount}`);
    console.log(`   - Classes: ${classesCount}`);
    console.log(`   - Payments: ${paymentsCount}`);
    console.log(`   - Rooms: ${roomsCount}`);
    console.log(`   - Attendance: ${attendanceCount}`);
    console.log(`   - Meetings: ${meetingsCount}`);

    const totalRecords = coursesCount + teachersCount + studentsCount + 
                        classesCount + paymentsCount + roomsCount + 
                        attendanceCount + meetingsCount;

    if (totalRecords === 0) {
      console.log('\n✅ SUCCESS: Database is completely empty!');
      console.log('🎯 Ready for fresh data seeding');
    } else {
      console.log(`\n⚠️  WARNING: Database still contains ${totalRecords} records`);
      console.log('❌ Database clearing may have failed');
    }

  } catch (error) {
    console.error('❌ Error verifying database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Failed to verify database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });