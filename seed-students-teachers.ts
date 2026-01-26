import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting to seed students and teachers...');

  // Get existing courses
  const microsoftOfficeCourse = await prisma.course.findFirst({
    where: { name: 'Microsoft Office Mastery' },
    include: { pricing: true }
  });

  const graphicDesignCourse = await prisma.course.findFirst({
    where: { name: 'Graphic Design Basic' },
    include: { pricing: true }
  });

  if (!microsoftOfficeCourse || !graphicDesignCourse) {
    console.error('❌ Required courses not found. Please run seed.ts first.');
    return;
  }

  // Create Teachers
  console.log('👨‍🏫 Creating teachers...');
  
  const teachers = [
    {
      name: 'Budi Santoso',
      dateOfBirth: '1985-06-15',
      whatsapp: '081234567890',
      education: 'S1 Teknik Informatika',
      specialization: 'Microsoft Office',
      experience: 5,
      address: 'Jl. Merdeka No. 123, Jakarta',
      joinDate: '2020-01-15',
      status: 'active',
      salary: 4000000,
      courses: [microsoftOfficeCourse.id]
    },
    {
      name: 'Sari Wijaya',
      dateOfBirth: '1988-03-22',
      whatsapp: '081234567891',
      education: 'S1 Sistem Informasi',
      specialization: 'Microsoft Office & Data Analysis',
      experience: 7,
      address: 'Jl. Sudirman No. 456, Jakarta',
      joinDate: '2019-08-10',
      status: 'active',
      salary: 4500000,
      courses: [microsoftOfficeCourse.id]
    },
    {
      name: 'Andi Pratama',
      dateOfBirth: '1990-11-08',
      whatsapp: '081234567892',
      education: 'S1 Desain Komunikasi Visual',
      specialization: 'Graphic Design & UI/UX',
      experience: 4,
      address: 'Jl. Gatot Subroto No. 789, Jakarta',
      joinDate: '2021-03-01',
      status: 'active',
      salary: 4200000,
      courses: [graphicDesignCourse.id]
    }
  ];

  const createdTeachers = [];
  for (const teacherData of teachers) {
    const teacher = await prisma.teacher.create({
      data: {
        name: teacherData.name,
        dateOfBirth: teacherData.dateOfBirth,
        whatsapp: teacherData.whatsapp,
        education: teacherData.education,
        specialization: teacherData.specialization,
        experience: teacherData.experience,
        address: teacherData.address,
        joinDate: teacherData.joinDate,
        status: teacherData.status,
        salary: teacherData.salary,
        courses: {
          create: teacherData.courses.map(courseId => ({
            courseId: courseId
          }))
        }
      }
    });
    createdTeachers.push(teacher);
    console.log(`✅ Created teacher: ${teacher.name}`);
  }

  // Create Students
  console.log('👨‍🎓 Creating students...');

  // Microsoft Office Students (5 students)
  const microsoftOfficeStudents = [
    {
      name: 'Ahmad Rizki',
      dateOfBirth: '1995-03-15',
      whatsapp: '081234567801',
      lastEducation: 'SMA',
      courseType: 'regular' as const,
      participants: 1,
      discount: 50000
    },
    {
      name: 'Dewi Lestari',
      dateOfBirth: '1992-07-22',
      whatsapp: '081234567802',
      lastEducation: 'D3 Akuntansi',
      courseType: 'private' as const,
      participants: 1,
      discount: 0
    },
    {
      name: 'Rudi Hermawan',
      dateOfBirth: '1988-11-08',
      whatsapp: '081234567803',
      lastEducation: 'S1 Ekonomi',
      courseType: 'regular' as const,
      participants: 1,
      discount: 100000
    },
    {
      name: 'Maya Sari',
      dateOfBirth: '1997-01-30',
      whatsapp: '081234567804',
      lastEducation: 'SMK',
      courseType: 'regular' as const,
      participants: 1,
      discount: 75000
    },
    {
      name: 'Joko Widodo',
      dateOfBirth: '1990-09-17',
      whatsapp: '081234567805',
      lastEducation: 'S1 Manajemen',
      courseType: 'private' as const,
      participants: 1,
      discount: 200000
    }
  ];

  // Graphic Design Students (5 students)
  const graphicDesignStudents = [
    {
      name: 'Rina Kartika',
      dateOfBirth: '1996-05-12',
      whatsapp: '081234567806',
      lastEducation: 'SMK Multimedia',
      courseType: 'regular' as const,
      participants: 1,
      discount: 150000
    },
    {
      name: 'Bayu Setiawan',
      dateOfBirth: '1994-12-03',
      whatsapp: '081234567807',
      lastEducation: 'D3 DKV',
      courseType: 'private' as const,
      participants: 1,
      discount: 0
    },
    {
      name: 'Indah Permata',
      dateOfBirth: '1999-08-25',
      whatsapp: '081234567808',
      lastEducation: 'SMA',
      courseType: 'regular' as const,
      participants: 1,
      discount: 200000
    },
    {
      name: 'Fajar Nugroho',
      dateOfBirth: '1993-04-14',
      whatsapp: '081234567809',
      lastEducation: 'S1 Seni Rupa',
      courseType: 'private' as const,
      participants: 1,
      discount: 100000
    },
    {
      name: 'Lina Marlina',
      dateOfBirth: '1991-10-07',
      whatsapp: '081234567810',
      lastEducation: 'D3 Desain Grafis',
      courseType: 'regular' as const,
      participants: 1,
      discount: 120000
    }
  ];

  // Create Microsoft Office students
  for (const studentData of microsoftOfficeStudents) {
    const regularPricing = microsoftOfficeCourse.pricing.find(p => p.courseType === studentData.courseType);
    if (!regularPricing) continue;

    const finalPrice = regularPricing.basePrice - studentData.discount;
    
    const student = await prisma.student.create({
      data: {
        name: studentData.name,
        dateOfBirth: studentData.dateOfBirth,
        whatsapp: studentData.whatsapp,
        lastEducation: studentData.lastEducation,
        courseId: microsoftOfficeCourse.id,
        courseType: studentData.courseType,
        participants: studentData.participants,
        finalPrice: finalPrice,
        discount: studentData.discount,
        status: 'active'
      }
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        studentId: student.id,
        totalAmount: finalPrice,
        paidAmount: 0,
        remainingAmount: finalPrice,
        status: 'pending'
      }
    });

    // Add some payment transactions for variety
    const shouldHavePayment = Math.random() > 0.3; // 70% chance of having payment
    if (shouldHavePayment) {
      const paymentAmount = Math.floor(finalPrice * (0.3 + Math.random() * 0.4)); // 30-70% of total
      const paymentMethods = ['Cash', 'Transfer Bank', 'E-Wallet', 'Kartu Kredit'];
      const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      await prisma.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          amount: paymentAmount,
          paymentMethod: randomMethod,
          paymentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          notes: `Pembayaran pertama untuk kursus ${microsoftOfficeCourse.name}`,
          createdBy: 'Admin'
        }
      });

      // Update payment status
      const newRemainingAmount = finalPrice - paymentAmount;
      const newStatus = newRemainingAmount === 0 ? 'completed' : 'partial';
      
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          paidAmount: paymentAmount,
          remainingAmount: newRemainingAmount,
          status: newStatus
        }
      });
    }

    console.log(`✅ Created Microsoft Office student: ${student.name}`);
  }

  // Create Graphic Design students
  for (const studentData of graphicDesignStudents) {
    const regularPricing = graphicDesignCourse.pricing.find(p => p.courseType === studentData.courseType);
    if (!regularPricing) continue;

    const finalPrice = regularPricing.basePrice - studentData.discount;
    
    const student = await prisma.student.create({
      data: {
        name: studentData.name,
        dateOfBirth: studentData.dateOfBirth,
        whatsapp: studentData.whatsapp,
        lastEducation: studentData.lastEducation,
        courseId: graphicDesignCourse.id,
        courseType: studentData.courseType,
        participants: studentData.participants,
        finalPrice: finalPrice,
        discount: studentData.discount,
        status: 'active'
      }
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        studentId: student.id,
        totalAmount: finalPrice,
        paidAmount: 0,
        remainingAmount: finalPrice,
        status: 'pending'
      }
    });

    // Add some payment transactions for variety
    const shouldHavePayment = Math.random() > 0.2; // 80% chance of having payment
    if (shouldHavePayment) {
      const paymentAmount = Math.floor(finalPrice * (0.2 + Math.random() * 0.6)); // 20-80% of total
      const paymentMethods = ['Cash', 'Transfer Bank', 'E-Wallet', 'Kartu Kredit'];
      const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      await prisma.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          amount: paymentAmount,
          paymentMethod: randomMethod,
          paymentDate: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000), // Random date within last 45 days
          notes: `Pembayaran pertama untuk kursus ${graphicDesignCourse.name}`,
          createdBy: 'Admin'
        }
      });

      // Some students might have second payment
      const shouldHaveSecondPayment = Math.random() > 0.6; // 40% chance
      if (shouldHaveSecondPayment) {
        const remainingAfterFirst = finalPrice - paymentAmount;
        const secondPaymentAmount = Math.floor(remainingAfterFirst * (0.3 + Math.random() * 0.5)); // 30-80% of remaining
        
        await prisma.paymentTransaction.create({
          data: {
            paymentId: payment.id,
            amount: secondPaymentAmount,
            paymentMethod: randomMethod,
            paymentDate: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000), // Random date within last 15 days
            notes: `Pembayaran kedua untuk kursus ${graphicDesignCourse.name}`,
            createdBy: 'Admin'
          }
        });

        // Update payment with both transactions
        const totalPaid = paymentAmount + secondPaymentAmount;
        const newRemainingAmount = finalPrice - totalPaid;
        const newStatus = newRemainingAmount === 0 ? 'completed' : 'partial';
        
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            paidAmount: totalPaid,
            remainingAmount: newRemainingAmount,
            status: newStatus
          }
        });
      } else {
        // Update payment status with single transaction
        const newRemainingAmount = finalPrice - paymentAmount;
        const newStatus = newRemainingAmount === 0 ? 'completed' : 'partial';
        
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            paidAmount: paymentAmount,
            remainingAmount: newRemainingAmount,
            status: newStatus
          }
        });
      }
    }

    console.log(`✅ Created Graphic Design student: ${student.name}`);
  }

  console.log('🎉 Successfully seeded students and teachers!');
  console.log(`📊 Summary:`);
  console.log(`   - Teachers: ${createdTeachers.length}`);
  console.log(`   - Microsoft Office Students: ${microsoftOfficeStudents.length}`);
  console.log(`   - Graphic Design Students: ${graphicDesignStudents.length}`);
  console.log(`   - Total Students: ${microsoftOfficeStudents.length + graphicDesignStudents.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });