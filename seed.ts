import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample courses
  const courses = [
    {
      name: 'Web Development Fundamental',
      description: 'Belajar dasar-dasar pengembangan web dengan HTML, CSS, dan JavaScript',
      duration: 24,
      category: 'programming',
      pricing: [
        {
          courseType: 'regular',
          basePrice: 1500000,
          discountRate: 10
        },
        {
          courseType: 'private',
          basePrice: 3500000,
          discountRate: 0
        }
      ]
    },
    {
      name: 'Python Programming',
      description: 'Master bahasa pemrograman Python dari dasar hingga lanjutan',
      duration: 30,
      category: 'programming',
      pricing: [
        {
          courseType: 'regular',
          basePrice: 2000000,
          discountRate: 15
        },
        {
          courseType: 'private',
          basePrice: 4500000,
          discountRate: 5
        }
      ]
    },
    {
      name: 'Graphic Design Basic',
      description: 'Belajar desain grafis dengan tools profesional',
      duration: 20,
      category: 'design',
      pricing: [
        {
          courseType: 'regular',
          basePrice: 1200000,
          discountRate: 20
        },
        {
          courseType: 'private',
          basePrice: 2800000,
          discountRate: 10
        }
      ]
    },
    {
      name: 'Microsoft Office Mastery',
      description: 'Kuasai Microsoft Word, Excel, dan PowerPoint untuk produktivitas kerja',
      duration: 16,
      category: 'office',
      pricing: [
        {
          courseType: 'regular',
          basePrice: 800000,
          discountRate: 25
        },
        {
          courseType: 'private',
          basePrice: 1800000,
          discountRate: 15
        }
      ]
    },
    {
      name: 'Digital Marketing Strategy',
      description: 'Strategi pemasaran digital untuk bisnis modern',
      duration: 18,
      category: 'marketing',
      pricing: [
        {
          courseType: 'regular',
          basePrice: 1800000,
          discountRate: 12
        },
        {
          courseType: 'private',
          basePrice: 4000000,
          discountRate: 8
        }
      ]
    },
    {
      name: 'Data Science Introduction',
      description: 'Pengenalan data science dan machine learning dengan Python',
      duration: 36,
      category: 'data',
      pricing: [
        {
          courseType: 'regular',
          basePrice: 2500000,
          discountRate: 8
        },
        {
          courseType: 'private',
          basePrice: 5500000,
          discountRate: 0
        }
      ]
    }
  ];

  for (const courseData of courses) {
    const course = await prisma.course.create({
      data: {
        name: courseData.name,
        description: courseData.description,
        duration: courseData.duration,
        category: courseData.category,
        pricing: {
          create: courseData.pricing
        }
      }
    });
    console.log(`Created course: ${course.name}`);
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });