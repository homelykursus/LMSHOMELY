'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Users, Award, CheckCircle, BookOpen, Target, FileText, Palette, Video, Code, TrendingUp, Sheet, ChevronDown, Loader2 } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';

interface CurriculumTopic {
  title: string;
  subtopics: string[];
}

interface Software {
  name: string;
  icon: string;
  description: string;
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
  gradient: string;
  curriculum: CurriculumTopic[];
  benefits: string[];
  targetAudience: string[];
  software?: Software[];
  originalPrice?: number;
  discountedPrice?: number;
  icon: string;
}

// Helper function to get icon component based on icon name
const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    'FileText': FileText,
    'Palette': Palette,
    'Video': Video,
    'Code': Code,
    'TrendingUp': TrendingUp,
    'Sheet': Sheet
  };
  return iconMap[iconName] || FileText;
};

// Removed hardcoded courseDetails - now fetching from database

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

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/web-content/landing-courses/slug/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('not_found');
          } else {
            setError('server_error');
          }
          return;
        }

        const data = await response.json();
        
        // Helper function to parse JSON fields safely
        const parseJsonField = (field: any): any => {
          if (!field) return [];
          
          // If it's already an array/object, return it
          if (typeof field === 'object') return field;
          
          // If it's a string, try to parse it
          if (typeof field === 'string') {
            try {
              return JSON.parse(field);
            } catch {
              return [];
            }
          }
          
          return [];
        };
        
        // Transform the data to match CourseDetail interface
        const transformedCourse: CourseDetail = {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description,
          fullDescription: data.fullDescription || data.description,
          duration: data.duration,
          sessionDuration: data.sessionDuration || '1,5 Jam',
          method: data.method || 'Tatap Muka',
          practicePercentage: data.practicePercentage || '100% Full Praktik',
          equipment: data.equipment || 'Peralatan Belajar Sudah Disediakan',
          gradient: data.gradient || 'from-blue-500 to-cyan-500',
          curriculum: parseJsonField(data.curriculum),
          benefits: parseJsonField(data.benefits),
          targetAudience: parseJsonField(data.targetAudience),
          software: parseJsonField(data.software),
          originalPrice: data.originalPrice,
          discountedPrice: data.discountedPrice,
          icon: data.icon
        };

        setCourse(transformedCourse);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('server_error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat data program...</p>
        </div>
      </div>
    );
  }

  if (error === 'not_found' || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Program tidak ditemukan</h1>
          <p className="text-gray-600 mb-6">Program kursus yang Anda cari tidak tersedia atau sudah tidak aktif.</p>
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

  if (error === 'server_error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Terjadi Kesalahan</h1>
          <p className="text-gray-600 mb-6">Maaf, terjadi kesalahan saat memuat data. Silakan coba lagi.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium mr-4"
          >
            Coba Lagi
          </button>
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
  
  const IconComponent = getIconComponent(course.icon);

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
              <IconComponent className="w-10 h-10" />
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
              {course.software && Array.isArray(course.software) && course.software.length > 0 && (
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
                {course.curriculum && Array.isArray(course.curriculum) && course.curriculum.length > 0 ? (
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
                ) : (
                  <p className="text-gray-500 text-center py-4">Materi pembelajaran belum tersedia</p>
                )}
              </div>

              {/* Benefits */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Manfaat yang Didapat</h2>
                {course.benefits && Array.isArray(course.benefits) && course.benefits.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start space-x-3 bg-white rounded-xl p-4">
                        <Award className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">{benefit}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Manfaat belum tersedia</p>
                )}
              </div>

              {/* Target Audience */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Cocok Untuk</h2>
                {course.targetAudience && Array.isArray(course.targetAudience) && course.targetAudience.length > 0 ? (
                  <div className="space-y-3">
                    {course.targetAudience.map((audience, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Target className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        <p className="text-gray-700">{audience}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Target audience belum tersedia</p>
                )}
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Image pointing down - positioned above CTA Card */}
                <div className="relative flex justify-center -mb-2.5 z-0">
                  <img 
                    src="https://res.cloudinary.com/dzksnkl72/image/upload/v1770717919/TUNJUK_BAWAH_ASLI_rjahgd.webp"
                    alt="Daftar Sekarang"
                    className="w-72 h-auto object-contain drop-shadow-lg"
                  />
                </div>

                {/* CTA Card with Pricing */}
                <div className={`bg-gradient-to-br ${course.gradient} rounded-2xl p-6 shadow-xl text-white relative z-10`}>
                  {/* Pricing Info - Only for courses with pricing */}
                  {course.originalPrice && course.discountedPrice && (
                    <div className="mb-6">
                      <div className="space-y-3">
                        {/* Original Price */}
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">Harga Normal</span>
                          <span className="text-white/60 line-through text-lg">
                            Rp {course.originalPrice.toLocaleString('id-ID')}
                          </span>
                        </div>
                        
                        {/* Divider */}
                        <div className="border-t border-white/20"></div>
                        
                        {/* Discounted Price */}
                        <div className="flex items-center justify-between">
                          <span className="text-white font-semibold">Harga Promo</span>
                          <span className="text-white font-bold text-2xl">
                            Rp {course.discountedPrice.toLocaleString('id-ID')}
                          </span>
                        </div>
                        
                        {/* Savings Badge */}
                        <div className="text-center pt-2">
                          <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-semibold">
                            💰 Hemat Rp {(course.originalPrice - course.discountedPrice).toLocaleString('id-ID')}
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
