import { db } from '@/lib/db';

async function main() {
  console.log('🗑️  Starting to clear all database data...');
  console.log('⚠️  WARNING: This will delete ALL data in the database!');
  
  try {
    // Delete in correct order to avoid foreign key constraints
    console.log('🔄 Deleting data in correct order...');

    // 1. Delete attendance records first (depends on meetings and students)
    console.log('📝 Deleting attendance records...');
    const deletedAttendance = await db.attendance.deleteMany({});
    console.log(`   ✅ Deleted ${deletedAttendance.count} attendance records`);

    // 2. Delete teacher attendance records
    console.log('👨‍🏫 Deleting teacher attendance records...');
    const deletedTeacherAttendance = await db.teacherAttendance.deleteMany({});
    console.log(`   ✅ Deleted ${deletedTeacherAttendance.count} teacher attendance records`);

    // 3. Delete employee attendance records
    console.log('👥 Deleting employee attendance records...');
    const deletedEmployeeAttendance = await db.employeeAttendance.deleteMany({});
    console.log(`   ✅ Deleted ${deletedEmployeeAttendance.count} employee attendance records`);

    // 4. Delete class meetings
    console.log('📅 Deleting class meetings...');
    const deletedMeetings = await db.classMeeting.deleteMany({});
    console.log(`   ✅ Deleted ${deletedMeetings.count} class meetings`);

    // 5. Delete payment transactions
    console.log('💳 Deleting payment transactions...');
    const deletedTransactions = await db.paymentTransaction.deleteMany({});
    console.log(`   ✅ Deleted ${deletedTransactions.count} payment transactions`);

    // 6. Delete payments
    console.log('💰 Deleting payments...');
    const deletedPayments = await db.payment.deleteMany({});
    console.log(`   ✅ Deleted ${deletedPayments.count} payments`);

    // 7. Delete class-student relationships
    console.log('🎓 Deleting class-student relationships...');
    const deletedClassStudents = await db.classStudent.deleteMany({});
    console.log(`   ✅ Deleted ${deletedClassStudents.count} class-student relationships`);

    // 8. Delete classes
    console.log('🏫 Deleting classes...');
    const deletedClasses = await db.class.deleteMany({});
    console.log(`   ✅ Deleted ${deletedClasses.count} classes`);

    // 9. Delete students
    console.log('👨‍🎓 Deleting students...');
    const deletedStudents = await db.student.deleteMany({});
    console.log(`   ✅ Deleted ${deletedStudents.count} students`);

    // 10. Delete teacher-course relationships
    console.log('📚 Deleting teacher-course relationships...');
    const deletedTeacherCourses = await db.teacherCourse.deleteMany({});
    console.log(`   ✅ Deleted ${deletedTeacherCourses.count} teacher-course relationships`);

    // 11. Delete teachers
    console.log('👨‍🏫 Deleting teachers...');
    const deletedTeachers = await db.teacher.deleteMany({});
    console.log(`   ✅ Deleted ${deletedTeachers.count} teachers`);

    // 12. Delete rooms
    console.log('🏢 Deleting rooms...');
    const deletedRooms = await db.room.deleteMany({});
    console.log(`   ✅ Deleted ${deletedRooms.count} rooms`);

    // 13. Delete course pricing
    console.log('💲 Deleting course pricing...');
    const deletedPricing = await db.coursePricing.deleteMany({});
    console.log(`   ✅ Deleted ${deletedPricing.count} course pricing records`);

    // 14. Delete courses
    console.log('📖 Deleting courses...');
    const deletedCourses = await db.course.deleteMany({});
    console.log(`   ✅ Deleted ${deletedCourses.count} courses`);

    // 15. Delete users (if any)
    console.log('👤 Deleting users...');
    const deletedUsers = await db.user.deleteMany({});
    console.log(`   ✅ Deleted ${deletedUsers.count} users`);

    console.log('\n🎉 Database cleared successfully!');
    console.log('\n📊 Summary of deleted records:');
    console.log(`   - Attendance: ${deletedAttendance.count}`);
    console.log(`   - Teacher Attendance: ${deletedTeacherAttendance.count}`);
    console.log(`   - Employee Attendance: ${deletedEmployeeAttendance.count}`);
    console.log(`   - Class Meetings: ${deletedMeetings.count}`);
    console.log(`   - Payment Transactions: ${deletedTransactions.count}`);
    console.log(`   - Payments: ${deletedPayments.count}`);
    console.log(`   - Class-Student Relations: ${deletedClassStudents.count}`);
    console.log(`   - Classes: ${deletedClasses.count}`);
    console.log(`   - Students: ${deletedStudents.count}`);
    console.log(`   - Teacher-Course Relations: ${deletedTeacherCourses.count}`);
    console.log(`   - Teachers: ${deletedTeachers.count}`);
    console.log(`   - Rooms: ${deletedRooms.count}`);
    console.log(`   - Course Pricing: ${deletedPricing.count}`);
    console.log(`   - Courses: ${deletedCourses.count}`);
    console.log(`   - Users: ${deletedUsers.count}`);

    const totalDeleted = deletedAttendance.count + deletedTeacherAttendance.count + 
                        deletedEmployeeAttendance.count + deletedMeetings.count + 
                        deletedTransactions.count + deletedPayments.count + 
                        deletedClassStudents.count + deletedClasses.count + 
                        deletedStudents.count + deletedTeacherCourses.count + 
                        deletedTeachers.count + deletedRooms.count + 
                        deletedPricing.count + deletedCourses.count + deletedUsers.count;

    console.log(`\n🗑️  Total records deleted: ${totalDeleted}`);
    console.log('✨ Database is now completely empty and ready for fresh data!');

  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Failed to clear database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
    console.log('🔌 Database connection closed');
  });