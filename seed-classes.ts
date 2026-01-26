import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🏫 Starting to seed classes...');

  // Get existing courses, teachers, and students
  const courses = await prisma.course.findMany();
  const teachers = await prisma.teacher.findMany();
  const students = await prisma.student.findMany();

  if (courses.length === 0 || teachers.length === 0 || students.length === 0) {
    console.log('❌ Need courses, teachers, and students to create classes. Please run other seed scripts first.');
    return;
  }

  // Get or create rooms
  const rooms = await createRooms();

  // Create classes
  const classesToCreate = [
    {
      name: 'Microsoft Office Batch 1',
      description: 'Kelas Microsoft Office untuk pemula',
      courseId: courses.find(c => c.name.includes('Microsoft Office'))?.id,
      teacherId: teachers.find(t => t.specialization?.includes('Microsoft Office'))?.id,
      roomId: rooms[0].id,
      maxStudents: 15,
      commissionType: 'BY_CLASS',
      commissionAmount: 500000,
      schedule: 'Senin & Rabu, 09:00-11:00',
      totalMeetings: 8
    },
    {
      name: 'Graphic Design Batch 1',
      description: 'Kelas Desain Grafis untuk pemula',
      courseId: courses.find(c => c.name.includes('Graphic Design'))?.id,
      teacherId: teachers.find(t => t.specialization?.includes('Graphic Design'))?.id,
      roomId: rooms[1].id,
      maxStudents: 12,
      commissionType: 'BY_STUDENT',
      commissionAmount: 60000,
      schedule: 'Selasa & Kamis, 13:00-15:00',
      totalMeetings: 10
    },
    {
      name: 'Microsoft Office Batch 2',
      description: 'Kelas Microsoft Office batch kedua',
      courseId: courses.find(c => c.name.includes('Microsoft Office'))?.id,
      teacherId: teachers.find(t => t.specialization?.includes('Microsoft Office') && t.name !== teachers.find(t2 => t2.specialization?.includes('Microsoft Office'))?.name)?.id,
      roomId: rooms[2].id,
      maxStudents: 15,
      commissionType: 'BY_CLASS',
      commissionAmount: 500000,
      schedule: 'Sabtu, 09:00-12:00',
      totalMeetings: 6
    }
  ];

  const createdClasses = [];
  
  for (const classData of classesToCreate) {
    if (!classData.courseId || !classData.teacherId) {
      console.log(`⚠️  Skipping class ${classData.name} - missing course or teacher`);
      continue;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Started 30 days ago
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (classData.totalMeetings * 7)); // Assuming weekly meetings

    const createdClass = await prisma.class.create({
      data: {
        name: classData.name,
        description: classData.description,
        courseId: classData.courseId,
        teacherId: classData.teacherId,
        roomId: classData.roomId,
        maxStudents: classData.maxStudents,
        commissionType: classData.commissionType,
        commissionAmount: classData.commissionAmount,
        schedule: classData.schedule,
        startDate: startDate,
        endDate: endDate,
        totalMeetings: classData.totalMeetings,
        completedMeetings: 0,
        isActive: true
      }
    });

    createdClasses.push(createdClass);
    console.log(`✅ Created class: ${createdClass.name}`);
  }

  // Assign students to classes
  console.log('\n👥 Assigning students to classes...');
  
  for (const createdClass of createdClasses) {
    // Get course type to filter students
    const course = await prisma.course.findUnique({
      where: { id: createdClass.courseId }
    });

    // Filter students by course
    const eligibleStudents = students.filter(student => student.courseId === course?.id);
    
    // Randomly assign 3-8 students to each class
    const studentsToAssign = Math.min(
      Math.floor(Math.random() * 6) + 3, // 3-8 students
      eligibleStudents.length,
      createdClass.maxStudents
    );

    const shuffledStudents = eligibleStudents.sort(() => 0.5 - Math.random());
    const selectedStudents = shuffledStudents.slice(0, studentsToAssign);

    for (const student of selectedStudents) {
      await prisma.classStudent.create({
        data: {
          classId: createdClass.id,
          studentId: student.id,
          joinedAt: createdClass.startDate
        }
      });
    }

    console.log(`📝 Assigned ${selectedStudents.length} students to ${createdClass.name}`);
  }

  console.log('\n🎉 Successfully seeded classes!');
  console.log(`📊 Summary:`);
  console.log(`   - Classes created: ${createdClasses.length}`);
  console.log(`   - Rooms created: ${rooms.length}`);
}

async function createRooms() {
  console.log('🏢 Creating rooms...');
  
  const roomsData = [
    {
      name: 'Lab Komputer 1',
      description: 'Ruang lab komputer dengan 20 PC',
      capacity: 20,
      floor: '2',
      building: 'Gedung A'
    },
    {
      name: 'Lab Komputer 2',
      description: 'Ruang lab komputer dengan 15 PC',
      capacity: 15,
      floor: '2',
      building: 'Gedung A'
    },
    {
      name: 'Ruang Kelas 1',
      description: 'Ruang kelas untuk teori',
      capacity: 25,
      floor: '1',
      building: 'Gedung B'
    }
  ];

  const rooms = [];
  
  for (const roomData of roomsData) {
    // Check if room already exists
    const existingRoom = await prisma.room.findUnique({
      where: { name: roomData.name }
    });

    if (existingRoom) {
      rooms.push(existingRoom);
      console.log(`📍 Room ${roomData.name} already exists`);
    } else {
      const room = await prisma.room.create({
        data: roomData
      });
      rooms.push(room);
      console.log(`✅ Created room: ${room.name}`);
    }
  }

  return rooms;
}

main()
  .catch((e) => {
    console.error('❌ Error seeding classes:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });