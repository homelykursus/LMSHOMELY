'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Users, Award, CheckCircle, BookOpen, Target, FileText, Palette, Video, Code, TrendingUp, Sheet, ChevronDown } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';

interface CurriculumTopic {
  title: string;
  subtopics: string[];
}

interface CourseDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  fullDescription: string;
  duration: string;
  sessionDuration: string;
  method: string;
  practicePercentage: string;
  equipment: string;
  iconComponent: any;
  gradient: string;
  curriculum: CurriculumTopic[];
  benefits: string[];
  targetAudience: string[];
  software?: { name: string; icon: string; description: string; }[];
  pricing?: { originalPrice: number; discountedPrice: number; };
}

// Helper function to get icon component based on slug
const getCourseIcon = (slug: string) => {
  const iconMap: { [key: string]: any } = {
    'microsoft-office': FileText,
    'desain-grafis': Palette,
    'video-editing': Video,
    'web-design': Code,
    'digital-marketing': TrendingUp,
    'microsoft-excel-lanjutan': Sheet
  };
  return iconMap[slug] || FileText;
};

const courseDetails: CourseDetail[] = [
  {
    id: '1',
    name: 'Microsoft Office',
    slug: 'microsoft-office',
    description: 'Kuasai Word, Excel, PowerPoint untuk kebutuhan kantor dan bisnis',
    fullDescription: 'Program kursus Microsoft Office dirancang untuk membantu Anda menguasai aplikasi perkantoran yang paling banyak digunakan di dunia. Dari pembuatan dokumen profesional, pengolahan data, hingga presentasi yang menarik.',
    duration: '12x Pertemuan',
    sessionDuration: '1,5 Jam',
    method: 'Tatap Muka',
    practicePercentage: '100% Full Praktik',
    equipment: 'Peralatan Belajar Sudah Disediakan',
    iconComponent: FileText,
    gradient: 'from-blue-500 to-cyan-500',
    curriculum: [
      {
        title: 'Microsoft Word',
        subtopics: [
          'Pembuatan dokumen profesional',
          'Formatting dan styling teks',
          'Mail merge untuk surat massal',
          'Table of contents dan referensi'
        ]
      },
      {
        title: 'Microsoft Excel',
        subtopics: [
          'Formula dan fungsi dasar',
          'Pivot table untuk analisis data',
          'Grafik dan visualisasi data',
          'Data validation dan conditional formatting'
        ]
      },
      {
        title: 'Microsoft PowerPoint',
        subtopics: [
          'Desain presentasi yang menarik',
          'Animasi dan transisi',
          'Master slide dan template',
          'Tips presentasi efektif'
        ]
      },
      {
        title: 'Produktivitas & Integrasi',
        subtopics: [
          'Tips & trik produktivitas Office',
          'Integrasi antar aplikasi Office',
          'Studi kasus: Laporan dan proposal bisnis'
        ]
      }
    ],
    benefits: [
      'Meningkatkan produktivitas kerja',
      'Membuat dokumen profesional',
      'Mengelola data dengan efisien',
      'Presentasi yang menarik dan efektif'
    ],
    targetAudience: [
      'Karyawan kantoran',
      'Mahasiswa',
      'Pengusaha',
      'Siapa saja yang ingin meningkatkan skill perkantoran'
    ],
    software: [
      {
        name: 'Microsoft Word',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg/200px-Microsoft_Office_Word_%282019%E2%80%93present%29.svg.png',
        description: 'Document processing'
      },
      {
        name: 'PowerPoint',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Microsoft_Office_PowerPoint_%282019%E2%80%93present%29.svg/200px-Microsoft_Office_PowerPoint_%282019%E2%80%93present%29.svg.png',
        description: 'Presentation design'
      },
      {
        name: 'Microsoft Excel',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg/200px-Microsoft_Office_Excel_%282019%E2%80%93present%29.svg.png',
        description: 'Data management'
      },
      {
        name: 'ChatGPT',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/200px-ChatGPT_logo.svg.png',
        description: 'AI assistant'
      },
      {
        name: 'Canva',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Canva_icon_2021.svg/200px-Canva_icon_2021.svg.png',
        description: 'Design tool'
      },
      {
        name: 'Google Workspace',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Google_Workspace_Logo.svg/200px-Google_Workspace_Logo.svg.png',
        description: 'Cloud productivity'
      }
    ],
    pricing: {
      originalPrice: 950000,
      discountedPrice: 700000
    }
  },
  {
    id: '2',
    name: 'Desain Grafis',
    slug: 'desain-grafis',
    description: 'Belajar Adobe Photoshop, Illustrator, dan CorelDraw',
    fullDescription: 'Program kursus Desain Grafis mengajarkan Anda cara membuat desain visual yang menarik dan profesional menggunakan software industry standard seperti Adobe Photoshop, Illustrator, dan CorelDraw.',
    duration: '16x Pertemuan',
    sessionDuration: '1,5 Jam',
    method: 'Tatap Muka',
    practicePercentage: '100% Full Praktik',
    equipment: 'Peralatan Belajar Sudah Disediakan',
    iconComponent: Palette,
    gradient: 'from-purple-500 to-pink-500',
    curriculum: [
      {
        title: 'Adobe Photoshop',
        subtopics: [
          'Photo editing dan retouching',
          'Image manipulation',
          'Layer dan masking',
          'Color correction'
        ]
      },
      {
        title: 'Adobe Illustrator',
        subtopics: [
          'Vector design basics',
          'Logo dan icon design',
          'Typography dan text effects',
          'Pen tool mastery'
        ]
      },
      {
        title: 'CorelDraw',
        subtopics: [
          'Layout design',
          'Brochure dan banner',
          'Business card design',
          'Print preparation'
        ]
      },
      {
        title: 'Teori Desain',
        subtopics: [
          'Teori warna dan komposisi',
          'Typography dan pemilihan font',
          'Project: Logo, poster, social media content'
        ]
      }
    ],
    benefits: [
      'Membuat desain profesional',
      'Peluang kerja sebagai desainer grafis',
      'Bisa freelance dan buka usaha desain',
      'Kreativitas tanpa batas'
    ],
    targetAudience: [
      'Pemula yang ingin belajar desain',
      'Content creator',
      'Marketing & social media specialist',
      'Pengusaha yang ingin desain sendiri'
    ],
    software: [
      {
        name: 'CorelDraw',
        icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3e/CorelDRAW_logo.svg/200px-CorelDRAW_logo.svg.png',
        description: 'Vector design & layout'
      },
      {
        name: 'Canva',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Canva_icon_2021.svg/200px-Canva_icon_2021.svg.png',
        description: 'Online design tool'
      },
      {
        name: 'ChatGPT',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/200px-ChatGPT_logo.svg.png',
        description: 'AI assistant for ideas'
      },
      {
        name: 'Freepik',
        icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968705.png',
        description: 'Design resources'
      }
    ],
    pricing: {
      originalPrice: 1200000,
      discountedPrice: 950000
    }
  },
  {
    id: '3',
    name: 'Video Editing',
    slug: 'video-editing',
    description: 'Editing video profesional dengan Adobe Premiere & After Effects',
    fullDescription: 'Program kursus Video Editing mengajarkan teknik editing video profesional menggunakan Adobe Premiere Pro dan After Effects. Cocok untuk content creator, YouTuber, dan videographer.',
    duration: '14x Pertemuan',
    sessionDuration: '1,5 Jam',
    method: 'Tatap Muka',
    practicePercentage: '100% Full Praktik',
    equipment: 'Peralatan Belajar Sudah Disediakan',
    iconComponent: Video,
    gradient: 'from-red-500 to-orange-500',
    curriculum: [
      {
        title: 'Adobe Premiere Pro',
        subtopics: [
          'Basic editing dan cutting',
          'Transitions dan effects',
          'Multi-camera editing',
          'Export settings'
        ]
      },
      {
        title: 'Color Grading',
        subtopics: [
          'Color correction basics',
          'Color grading techniques',
          'LUTs dan presets',
          'Matching colors'
        ]
      },
      {
        title: 'Audio Editing',
        subtopics: [
          'Audio mixing dan balancing',
          'Sound effects',
          'Music synchronization',
          'Noise reduction'
        ]
      },
      {
        title: 'Adobe After Effects',
        subtopics: [
          'Motion graphics',
          'Visual effects',
          'Text animation',
          'Lower thirds dan titles'
        ]
      },
      {
        title: 'Final Project',
        subtopics: [
          'YouTube video production',
          'Commercial video',
          'Short film editing'
        ]
      }
    ],
    benefits: [
      'Membuat video berkualitas profesional',
      'Peluang karir sebagai video editor',
      'Bisa kerja remote dan freelance',
      'Skill yang sangat dibutuhkan di era digital'
    ],
    targetAudience: [
      'Content creator & YouTuber',
      'Social media specialist',
      'Videographer',
      'Siapa saja yang ingin membuat video'
    ],
    software: [
      {
        name: 'CapCut',
        icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968534.png',
        description: 'Video editing app'
      },
      {
        name: 'Canva',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Canva_icon_2021.svg/200px-Canva_icon_2021.svg.png',
        description: 'Design & video tool'
      },
      {
        name: 'ChatGPT',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/200px-ChatGPT_logo.svg.png',
        description: 'AI assistant'
      },
      {
        name: 'Grok AI',
        icon: 'https://cdn-icons-png.flaticon.com/512/8943/8943377.png',
        description: 'AI tool'
      },
      {
        name: 'Gemini',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Google_Gemini_logo.svg/200px-Google_Gemini_logo.svg.png',
        description: 'Google AI'
      }
    ],
    pricing: {
      originalPrice: 1200000,
      discountedPrice: 950000
    }
  },
  {
    id: '4',
    name: 'Web Design',
    slug: 'web-design',
    description: 'Membuat website menarik dengan HTML, CSS, dan JavaScript',
    fullDescription: 'Program kursus Web Design mengajarkan cara membuat website modern dan responsif dari nol menggunakan HTML, CSS, dan JavaScript. Cocok untuk pemula yang ingin terjun ke dunia web development.',
    duration: '20x Pertemuan',
    sessionDuration: '1,5 Jam',
    method: 'Tatap Muka',
    practicePercentage: '100% Full Praktik',
    equipment: 'Peralatan Belajar Sudah Disediakan',
    iconComponent: Code,
    gradient: 'from-green-500 to-teal-500',
    curriculum: [
      {
        title: 'HTML Fundamentals',
        subtopics: [
          'HTML structure dan semantic markup',
          'Forms dan input elements',
          'HTML5 features',
          'Best practices'
        ]
      },
      {
        title: 'CSS Styling',
        subtopics: [
          'CSS selectors dan properties',
          'Flexbox dan Grid layout',
          'Responsive design',
          'CSS animations'
        ]
      },
      {
        title: 'JavaScript Basics',
        subtopics: [
          'JavaScript fundamentals',
          'DOM manipulation',
          'Event handling',
          'Interactive features'
        ]
      },
      {
        title: 'Bootstrap Framework',
        subtopics: [
          'Bootstrap components',
          'Grid system',
          'Responsive utilities',
          'Customization'
        ]
      },
      {
        title: 'Final Project',
        subtopics: [
          'Portfolio website',
          'Landing page',
          'Company profile website'
        ]
      }
    ],
    benefits: [
      'Membuat website sendiri',
      'Peluang karir sebagai web designer',
      'Freelance dengan penghasilan menjanjikan',
      'Dasar untuk menjadi full-stack developer'
    ],
    targetAudience: [
      'Pemula yang ingin belajar web',
      'Pengusaha yang ingin website sendiri',
      'Mahasiswa IT',
      'Siapa saja yang tertarik web development'
    ],
    software: [
      {
        name: 'WordPress',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/WordPress_blue_logo.svg/200px-WordPress_blue_logo.svg.png',
        description: 'CMS platform'
      },
      {
        name: 'ChatGPT',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/200px-ChatGPT_logo.svg.png',
        description: 'AI assistant'
      },
      {
        name: 'Elementor',
        icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968705.png',
        description: 'Page builder'
      },
      {
        name: 'Canva',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Canva_icon_2021.svg/200px-Canva_icon_2021.svg.png',
        description: 'Design tool'
      }
    ],
    pricing: {
      originalPrice: 2000000,
      discountedPrice: 1600000
    }
  },
  {
    id: '5',
    name: 'Digital Marketing',
    slug: 'digital-marketing',
    description: 'Strategi pemasaran digital dan social media marketing',
    fullDescription: 'Program kursus Digital Marketing mengajarkan strategi pemasaran online yang efektif, dari social media marketing, SEO, hingga iklan berbayar. Cocok untuk pengusaha dan marketer.',
    duration: '12x Pertemuan',
    sessionDuration: '1,5 Jam',
    method: 'Tatap Muka',
    practicePercentage: '100% Full Praktik',
    equipment: 'Peralatan Belajar Sudah Disediakan',
    iconComponent: TrendingUp,
    gradient: 'from-yellow-500 to-orange-500',
    curriculum: [
      {
        title: 'Digital Marketing Fundamentals',
        subtopics: [
          'Konsep dasar digital marketing',
          'Marketing funnel',
          'Target audience analysis',
          'Marketing strategy'
        ]
      },
      {
        title: 'Social Media Marketing',
        subtopics: [
          'Instagram marketing',
          'Facebook marketing',
          'TikTok marketing',
          'Content planning'
        ]
      },
      {
        title: 'Content Marketing',
        subtopics: [
          'Content creation',
          'Copywriting techniques',
          'Visual content design',
          'Content calendar'
        ]
      },
      {
        title: 'SEO & Paid Advertising',
        subtopics: [
          'Search Engine Optimization',
          'Google Ads',
          'Facebook Ads',
          'Campaign optimization'
        ]
      },
      {
        title: 'Analytics & ROI',
        subtopics: [
          'Google Analytics',
          'Measuring performance',
          'ROI calculation',
          'Reporting'
        ]
      }
    ],
    benefits: [
      'Meningkatkan penjualan online',
      'Membangun brand awareness',
      'Peluang karir sebagai digital marketer',
      'Skill yang sangat dibutuhkan bisnis'
    ],
    targetAudience: [
      'Pengusaha & UMKM',
      'Marketing specialist',
      'Content creator',
      'Siapa saja yang ingin jualan online'
    ],
    software: [
      {
        name: 'Google Ads',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Ads_logo.svg/200px-Google_Ads_logo.svg.png',
        description: 'Advertising platform'
      },
      {
        name: 'Facebook',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/200px-2023_Facebook_icon.svg.png',
        description: 'Social media'
      },
      {
        name: 'Instagram',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/200px-Instagram_logo_2016.svg.png',
        description: 'Social media'
      },
      {
        name: 'TikTok',
        icon: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png',
        description: 'Video platform'
      },
      {
        name: 'Shopee',
        icon: 'https://cdn-icons-png.flaticon.com/512/5977/5977575.png',
        description: 'E-commerce'
      },
      {
        name: 'ChatGPT',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/200px-ChatGPT_logo.svg.png',
        description: 'AI assistant'
      },
      {
        name: 'CapCut',
        icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968534.png',
        description: 'Video editing'
      },
      {
        name: 'Canva',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Canva_icon_2021.svg/200px-Canva_icon_2021.svg.png',
        description: 'Design tool'
      }
    ],
    pricing: {
      originalPrice: 2000000,
      discountedPrice: 1600000
    }
  },
  {
    id: '6',
    name: 'Microsoft Excel Lanjutan',
    slug: 'microsoft-excel-lanjutan',
    description: 'Tingkatkan kemampuan Microsoft Excel untuk tujuan yang lebih spesifik',
    fullDescription: 'Program kursus Microsoft Excel Lanjutan dirancang khusus untuk pembelajaran private dengan metode 1 guru 1 siswa. Fokus pada penguasaan fitur-fitur advanced Excel yang sangat berguna untuk analisis data, pelaporan, dan otomasi pekerjaan.',
    duration: '6x Pertemuan',
    sessionDuration: '1,5 Jam',
    method: 'Private 1 Guru 1 Siswa',
    practicePercentage: '100% Full Praktik',
    equipment: 'Peralatan Belajar Sudah Disediakan',
    iconComponent: Sheet,
    gradient: 'from-green-600 to-emerald-600',
    curriculum: [
      {
        title: 'Formula & Fungsi Lanjutan',
        subtopics: [
          'VLOOKUP dan HLOOKUP',
          'INDEX-MATCH combination',
          'Array formulas',
          'Nested functions'
        ]
      },
      {
        title: 'Pivot Table & Analysis',
        subtopics: [
          'Pivot table creation',
          'Pivot chart visualization',
          'Slicers dan filters',
          'Data analysis techniques'
        ]
      },
      {
        title: 'Data Management',
        subtopics: [
          'Conditional formatting',
          'Data validation',
          'Data cleaning',
          'Import/export data'
        ]
      },
      {
        title: 'Automation dengan Macro',
        subtopics: [
          'Recording macros',
          'VBA basics',
          'Automating repetitive tasks',
          'Custom functions'
        ]
      },
      {
        title: 'Dashboard & Reporting',
        subtopics: [
          'Professional dashboard design',
          'Interactive reports',
          'Charts dan visualizations',
          'Tips produktivitas Excel'
        ]
      }
    ],
    benefits: [
      'Menguasai Excel tingkat lanjut',
      'Meningkatkan efisiensi kerja secara signifikan',
      'Pembelajaran fokus dengan metode private',
      'Skill yang sangat dibutuhkan di dunia kerja'
    ],
    targetAudience: [
      'Karyawan yang ingin upgrade skill Excel',
      'Profesional yang bekerja dengan data',
      'Mahasiswa yang perlu Excel untuk tugas/skripsi',
      'Siapa saja yang ingin menguasai Excel lanjutan'
    ],
    software: [
      {
        name: 'Microsoft Excel',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg/200px-Microsoft_Office_Excel_%282019%E2%80%93present%29.svg.png',
        description: 'Advanced data analysis'
      },
      {
        name: 'ChatGPT',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/200px-ChatGPT_logo.svg.png',
        description: 'AI assistant for formulas'
      }
    ],
    pricing: {
      originalPrice: 950000,
      discountedPrice: 700000
    }
  }
];

// Accordion Item Component
function AccordionItem({ topic, index, gradient }: { topic: CurriculumTopic; index: number; gradient: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden transition-all hover:shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r ${gradient} text-white font-bold text-sm`}>
            {index + 1}
          </div>
          <h3 className="text-left font-semibold text-gray-900">{topic.title}</h3>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 pt-2 bg-gray-50">
          <ul className="space-y-2">
            {topic.subtopics.map((subtopic, subIndex) => (
              <li key={subIndex} className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{subtopic}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const course = courseDetails.find(c => c.slug === slug);

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Program tidak ditemukan</h1>
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const whatsappNumber = '628216457578';
  const whatsappMessage = encodeURIComponent(`Halo, saya tertarik untuk mendaftar kursus ${course.name}. Mohon informasi lebih lanjut.`);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Kembali</span>
            </button>

            <div className="flex items-center space-x-3">
              <img 
                src="https://res.cloudinary.com/dzksnkl72/image/upload/v1770305224/logo_innhbv.jpg" 
                alt="Homely Logo" 
                className="h-10 w-10 md:h-12 md:w-12 rounded object-cover"
              />
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900">Homely Kursus Komputer</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${course.gradient} text-white mb-6 shadow-lg`}>
              <course.iconComponent className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {course.name}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {course.description}
            </p>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-4 shadow-md text-center">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Durasi</p>
              <p className="font-bold text-gray-900">{course.duration}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md text-center">
              <BookOpen className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Per Sesi</p>
              <p className="font-bold text-gray-900">{course.sessionDuration}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md text-center">
              <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Metode</p>
              <p className="font-bold text-gray-900">{course.method}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md text-center">
              <Award className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Praktik</p>
              <p className="font-bold text-gray-900">100%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tentang Program</h2>
                <p className="text-gray-600 leading-relaxed">
                  {course.fullDescription}
                </p>
              </div>

              {/* Software Section - Only for courses with software */}
              {course.software && course.software.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Software yang Digunakan</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {course.software.map((software, index) => (
                      <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow text-center">
                        <div className="flex justify-center mb-4">
                          <img 
                            src={software.icon} 
                            alt={software.name}
                            className="w-16 h-16 object-contain"
                          />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">{software.name}</h3>
                        <p className="text-sm text-gray-600">{software.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Curriculum */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Materi Pembelajaran</h2>
                <div className="space-y-3">
                  {course.curriculum.map((topic, index) => (
                    <AccordionItem
                      key={index}
                      topic={topic}
                      index={index}
                      gradient={course.gradient}
                    />
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Manfaat yang Didapat</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3 bg-white rounded-xl p-4">
                      <Award className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Cocok Untuk</h2>
                <div className="space-y-3">
                  {course.targetAudience.map((audience, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Target className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <p className="text-gray-700">{audience}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Image pointing down - positioned above CTA Card */}
                <div className="relative flex justify-center -mb-2.5 z-0">
                  <img 
                    src="https://res.cloudinary.com/dzksnkl72/image/upload/v1770570143/tunjuk_bawah_dlp3pf.webp"
                    alt="Daftar Sekarang"
                    className="w-72 h-auto object-contain drop-shadow-lg"
                  />
                </div>

                {/* CTA Card with Pricing */}
                <div className={`bg-gradient-to-br ${course.gradient} rounded-2xl p-6 shadow-xl text-white relative z-10`}>
                  {/* Pricing Info - Only for courses with pricing */}
                  {course.pricing && (
                    <div className="mb-6">
                      <div className="space-y-3">
                        {/* Original Price */}
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">Harga Normal</span>
                          <span className="text-white/60 line-through text-lg">
                            Rp {course.pricing.originalPrice.toLocaleString('id-ID')}
                          </span>
                        </div>
                        
                        {/* Divider */}
                        <div className="border-t border-white/20"></div>
                        
                        {/* Discounted Price */}
                        <div className="flex items-center justify-between">
                          <span className="text-white font-semibold">Harga Promo</span>
                          <span className="text-white font-bold text-2xl">
                            Rp {course.pricing.discountedPrice.toLocaleString('id-ID')}
                          </span>
                        </div>
                        
                        {/* Savings Badge */}
                        <div className="text-center pt-2">
                          <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-semibold">
                            💰 Hemat Rp {(course.pricing.originalPrice - course.pricing.discountedPrice).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* WhatsApp Button */}
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-white text-gray-900 text-center px-6 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <WhatsAppIcon className="text-green-600" size={24} />
                      <span>Daftar Sekarang</span>
                    </div>
                  </a>
                </div>


              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2024 Homely Kursus Komputer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
