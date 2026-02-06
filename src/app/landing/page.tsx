'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight,
  Monitor,
  Wifi,
  Users,
  Award,
  Clock,
  MapPin,
  Star,
  ArrowRight
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { InstagramIcon } from '@/components/ui/instagram-icon';
import RegistrationToast from '@/components/landing/registration-toast';

interface Course {
  id: string;
  name: string;
  description: string;
  duration: string;
  icon: any;
  slug: string;
}

interface Facility {
  id: string;
  name: string;
  description: string;
  icon: any;
}

interface Testimonial {
  id: string;
  name: string;
  course: string;
  rating: number;
  comment: string;
  photo?: string;
}

interface Mentor {
  id: string;
  name: string;
  instagram: string;
  photo: string;
  specialization: string;
}

interface GalleryImage {
  id: string;
  image: string;
  title: string;
  category: string;
}

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Gallery stacked cards state
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const words = [
    { text: 'Mudah', gradient: 'from-green-500 to-emerald-600' },
    { text: 'Cepat', gradient: 'from-orange-500 to-red-600' },
    { text: 'Menyenangkan', gradient: 'from-pink-500 to-purple-600' }
  ];

  // Program Kursus
  const courses: Course[] = [
    {
      id: '1',
      name: 'Microsoft Office',
      description: 'Kuasai Word, Excel, PowerPoint untuk kebutuhan kantor dan bisnis',
      duration: '12 Pertemuan',
      icon: Monitor,
      slug: 'microsoft-office'
    },
    {
      id: '2',
      name: 'Desain Grafis',
      description: 'Belajar Adobe Photoshop, Illustrator, dan CorelDraw',
      duration: '16 Pertemuan',
      icon: Monitor,
      slug: 'desain-grafis'
    },
    {
      id: '3',
      name: 'Video Editing',
      description: 'Editing video profesional dengan Adobe Premiere & After Effects',
      duration: '14 Pertemuan',
      icon: Monitor,
      slug: 'video-editing'
    },
    {
      id: '4',
      name: 'Web Design',
      description: 'Membuat website menarik dengan HTML, CSS, dan JavaScript',
      duration: '20 Pertemuan',
      icon: Monitor,
      slug: 'web-design'
    },
    {
      id: '5',
      name: 'Digital Marketing',
      description: 'Strategi pemasaran digital dan social media marketing',
      duration: '12 Pertemuan',
      icon: Monitor,
      slug: 'digital-marketing'
    },
    {
      id: '6',
      name: 'Programming',
      description: 'Belajar coding dari dasar hingga membuat aplikasi',
      duration: '24 Pertemuan',
      icon: Monitor,
      slug: 'programming'
    }
  ];

  // Fasilitas
  const facilities: Facility[] = [
    {
      id: '1',
      name: 'Ruang Ber-AC',
      description: 'Ruang kelas nyaman dengan pendingin udara',
      icon: MapPin
    },
    {
      id: '2',
      name: 'WiFi Gratis',
      description: 'Internet cepat untuk mendukung pembelajaran',
      icon: Wifi
    },
    {
      id: '3',
      name: 'Kelas Kecil',
      description: 'Maksimal 5 siswa per kelas untuk pembelajaran optimal',
      icon: Users
    },
    {
      id: '4',
      name: 'Sertifikat',
      description: 'Sertifikat resmi setelah menyelesaikan kursus',
      icon: Award
    },
    {
      id: '5',
      name: 'Jadwal Fleksibel',
      description: 'Pilih jadwal sesuai kebutuhan Anda',
      icon: Clock
    },
    {
      id: '6',
      name: 'Komputer Modern',
      description: 'Perangkat komputer terbaru dan terawat',
      icon: Monitor
    }
  ];

  // Testimonials
  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Budi Santoso',
      course: 'Microsoft Office',
      rating: 5,
      comment: 'Instrukturnya sabar dan materi mudah dipahami. Sekarang saya lebih percaya diri menggunakan Excel untuk pekerjaan.',
      photo: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=3b82f6&color=fff'
    },
    {
      id: '2',
      name: 'Siti Nurhaliza',
      course: 'Desain Grafis',
      rating: 5,
      comment: 'Kursus yang sangat membantu! Saya bisa membuat desain sendiri untuk bisnis online saya. Terima kasih Homely!',
      photo: 'https://ui-avatars.com/api/?name=Siti+Nurhaliza&background=ec4899&color=fff'
    },
    {
      id: '3',
      name: 'Ahmad Rizki',
      course: 'Video Editing',
      rating: 5,
      comment: 'Fasilitas lengkap, ruangan nyaman, dan yang paling penting ilmunya sangat bermanfaat. Recommended!',
      photo: 'https://ui-avatars.com/api/?name=Ahmad+Rizki&background=10b981&color=fff'
    }
  ];

  // Mentors
  const mentors: Mentor[] = [
    {
      id: '1',
      name: 'Ibu Rina Wijaya',
      instagram: '@rinawijaya',
      photo: 'https://ui-avatars.com/api/?name=Rina+Wijaya&background=6366f1&color=fff&size=200',
      specialization: 'Microsoft Office & Administrasi'
    },
    {
      id: '2',
      name: 'Bapak Andi Pratama',
      instagram: '@andipratama',
      photo: 'https://ui-avatars.com/api/?name=Andi+Pratama&background=8b5cf6&color=fff&size=200',
      specialization: 'Desain Grafis & Multimedia'
    },
    {
      id: '3',
      name: 'Ibu Sarah Kusuma',
      instagram: '@sarahkusuma',
      photo: 'https://ui-avatars.com/api/?name=Sarah+Kusuma&background=ec4899&color=fff&size=200',
      specialization: 'Video Editing & Motion Graphics'
    },
    {
      id: '4',
      name: 'Bapak Dimas Prasetyo',
      instagram: '@dimaspras',
      photo: 'https://ui-avatars.com/api/?name=Dimas+Prasetyo&background=14b8a6&color=fff&size=200',
      specialization: 'Web Design & Programming'
    },
    {
      id: '5',
      name: 'Ibu Maya Sari',
      instagram: '@mayasari',
      photo: 'https://ui-avatars.com/api/?name=Maya+Sari&background=f59e0b&color=fff&size=200',
      specialization: 'Digital Marketing & SEO'
    },
    {
      id: '6',
      name: 'Bapak Rudi Hartono',
      instagram: '@rudihartono',
      photo: 'https://ui-avatars.com/api/?name=Rudi+Hartono&background=ef4444&color=fff&size=200',
      specialization: 'Database & Networking'
    }
  ];

  // Gallery Images
  const galleryImages: GalleryImage[] = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop',
      title: 'Ruang Kelas Modern',
      category: 'Fasilitas'
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
      title: 'Suasana Belajar',
      category: 'Aktivitas'
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop',
      title: 'Lab Komputer',
      category: 'Fasilitas'
    },
    {
      id: '4',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
      title: 'Praktik Desain Grafis',
      category: 'Aktivitas'
    },
    {
      id: '5',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop',
      title: 'Kelas Video Editing',
      category: 'Aktivitas'
    },
    {
      id: '6',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
      title: 'Ruang Tunggu',
      category: 'Fasilitas'
    }
  ];

  // Typing animation effect
  useEffect(() => {
    const currentWord = words[wordIndex].text;
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseTime = 2000;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (typingText.length < currentWord.length) {
          setTypingText(currentWord.substring(0, typingText.length + 1));
        } else {
          // Pause before deleting
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        // Deleting
        if (typingText.length > 0) {
          setTypingText(currentWord.substring(0, typingText.length - 1));
        } else {
          // Move to next word
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [typingText, isDeleting, wordIndex, words]);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'unset'; // Restore scrolling
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  // Handle keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [lightboxOpen]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  // Gallery swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && activeCardIndex < galleryImages.length - 1) {
      setActiveCardIndex(prev => prev + 1);
    }
    if (isRightSwipe && activeCardIndex > 0) {
      setActiveCardIndex(prev => prev - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const goToCard = (index: number) => {
    setActiveCardIndex(index);
  };

  const whatsappNumber = '628216457578';
  const whatsappMessage = encodeURIComponent('Halo, saya tertarik untuk mendaftar kursus di Homely Kursus Komputer. Mohon informasi lebih lanjut.');

  return (
    <div className="min-h-screen bg-white">
      {/* Header / Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src="https://res.cloudinary.com/dzksnkl72/image/upload/v1770305224/logo_innhbv.jpg" 
                alt="Homely Logo" 
                className="h-10 w-10 md:h-12 md:w-12 rounded object-cover"
              />
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900">Homely</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Kursus Komputer</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center space-x-6">
              <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm">
                Beranda
              </button>
              <button onClick={() => scrollToSection('programs')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm">
                Program
              </button>
              <button onClick={() => scrollToSection('facilities')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm">
                Fasilitas
              </button>
              <button onClick={() => scrollToSection('mentors')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm">
                Mentor
              </button>
              <button onClick={() => scrollToSection('gallery')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm">
                Galeri
              </button>
              <button onClick={() => scrollToSection('location')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm">
                Lokasi
              </button>
              <a
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center space-x-2 text-sm"
              >
                <WhatsAppIcon className="text-white" size={18} />
                <span>Daftar</span>
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className={`block h-0.5 w-full bg-gray-900 transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`block h-0.5 w-full bg-gray-900 transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block h-0.5 w-full bg-gray-900 transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-left">
                  Beranda
                </button>
                <button onClick={() => scrollToSection('programs')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-left">
                  Program
                </button>
                <button onClick={() => scrollToSection('facilities')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-left">
                  Fasilitas
                </button>
                <button onClick={() => scrollToSection('mentors')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-left">
                  Mentor
                </button>
                <button onClick={() => scrollToSection('gallery')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-left">
                  Galeri
                </button>
                <button onClick={() => scrollToSection('location')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-left">
                  Lokasi
                </button>
                <button onClick={() => scrollToSection('testimonials')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-left">
                  Testimoni
                </button>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <WhatsAppIcon className="text-white" size={20} />
                  <span>Daftar Sekarang</span>
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen mt-16 md:mt-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Mobile Layout */}
          <div className="lg:hidden flex flex-col min-h-[calc(100vh-5rem)] py-12 space-y-8">
            {/* 1. Text Content - TOP */}
            <div className="text-left space-y-6 z-10">
              <div className="inline-block">
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                  🎓 Kursus Komputer Terpercaya
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Wujudkan Impian
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Karir Digital Anda
                </span>
                <span className={`block text-transparent bg-clip-text bg-gradient-to-r ${words[wordIndex].gradient}`}>
                  {typingText}
                  <span className="animate-pulse">|</span>
                </span>
              </h1>
              
              <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                Belajar komputer dengan metode praktis dan mudah dipahami. Dibimbing langsung oleh instruktur berpengalaman dengan fasilitas modern.
              </p>
            </div>

            {/* 2. Image - MIDDLE */}
            <div className="relative flex items-center justify-center z-10">
              <div className="relative w-full max-w-sm">
                {/* Background Circle */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-3xl"></div>
                
                {/* Main Image */}
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop&crop=faces"
                    alt="Perempuan Indonesia menggunakan laptop"
                    className="w-full h-auto rounded-3xl shadow-2xl"
                  />
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-3 animate-float">
                    <div className="flex items-center space-x-2">
                      <div className="bg-green-100 p-2 rounded-xl">
                        <Award className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-900">Sertifikat</div>
                        <div className="text-xs text-gray-600">Resmi</div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-3 animate-float animation-delay-2000">
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-100 p-2 rounded-xl">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-900">Kelas Kecil</div>
                        <div className="text-xs text-gray-600">Max 5 Siswa</div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-1/2 -right-6 bg-white rounded-2xl shadow-xl p-3 animate-float animation-delay-4000">
                    <div className="flex items-center space-x-2">
                      <div className="bg-purple-100 p-2 rounded-xl">
                        <Clock className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-900">Jadwal</div>
                        <div className="text-xs text-gray-600">Fleksibel</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. CTA Buttons - BELOW IMAGE */}
            <div className="flex flex-col gap-4 z-10">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <WhatsAppIcon className="text-white" size={24} />
                <span>Daftar Sekarang</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              <button
                onClick={() => scrollToSection('programs')}
                className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-full font-semibold text-lg transition-all border-2 border-gray-200 hover:border-gray-300"
              >
                <span>Lihat Program</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* 4. Statistics - BOTTOM */}
            <div className="grid grid-cols-3 gap-4 z-10">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-gray-900">1500+</div>
                <div className="text-xs text-gray-600">Alumni</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2 space-x-0.5">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                </div>
                <div className="text-xl font-bold text-gray-900">5.0</div>
                <div className="text-xs text-gray-600">Rating Google</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Monitor className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-xl font-bold text-gray-900">6</div>
                <div className="text-xs text-gray-600">Program Kursus</div>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-5rem)] py-12">
            {/* Left Content */}
            <div className="text-left z-10">
              <div className="space-y-6 mb-8">
                <div className="inline-block">
                  <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                    🎓 Kursus Komputer Terpercaya
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Wujudkan Impian
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    Karir Digital Anda
                  </span>
                  <span className={`block text-transparent bg-clip-text bg-gradient-to-r ${words[wordIndex].gradient}`}>
                    {typingText}
                    <span className="animate-pulse">|</span>
                  </span>
                </h1>
                
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  Belajar komputer dengan metode praktis dan mudah dipahami. Dibimbing langsung oleh instruktur berpengalaman dengan fasilitas modern.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <WhatsAppIcon className="text-white" size={24} />
                  <span>Daftar Sekarang</span>
                  <ArrowRight className="w-5 h-5" />
                </a>
                <button
                  onClick={() => scrollToSection('programs')}
                  className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-full font-semibold text-lg transition-all border-2 border-gray-200 hover:border-gray-300"
                >
                  <span>Lihat Program</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">1500+</div>
                  <div className="text-sm text-gray-600">Alumni</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2 space-x-1">
                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">5.0</div>
                  <div className="text-sm text-gray-600">Rating Google</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Monitor className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">6</div>
                  <div className="text-sm text-gray-600">Program Kursus</div>
                </div>
              </div>
            </div>

            {/* Right Content - Illustration */}
            <div className="relative lg:h-[600px] flex items-center justify-center z-10">
              <div className="relative w-full max-w-lg">
                {/* Background Circle */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-3xl"></div>
                
                {/* Main Image */}
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop&crop=faces"
                    alt="Perempuan Indonesia menggunakan laptop"
                    className="w-full h-auto rounded-3xl shadow-2xl"
                  />
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 animate-float">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-3 rounded-xl">
                        <Award className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Sertifikat</div>
                        <div className="text-xs text-gray-600">Resmi</div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 animate-float animation-delay-2000">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-3 rounded-xl">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Kelas Kecil</div>
                        <div className="text-xs text-gray-600">Max 5 Siswa</div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-1/2 -right-8 bg-white rounded-2xl shadow-xl p-4 animate-float animation-delay-4000">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 p-3 rounded-xl">
                        <Clock className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Jadwal</div>
                        <div className="text-xs text-gray-600">Fleksibel</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Kursus Section */}
      <section id="programs" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Program Kursus Kami
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pilih program kursus yang sesuai dengan kebutuhan dan minat Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/landing/program/${course.slug}`}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 duration-300 cursor-pointer"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                  <course.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {course.name}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {course.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-blue-600 font-medium">
                    <Clock className="w-4 h-4 mr-2" />
                    {course.duration}
                  </div>
                  <ArrowRight className="w-5 h-5 text-blue-600" />
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold transition-all transform hover:scale-105"
            >
              <span>Lihat Semua Program</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Fasilitas Section */}
      <section id="facilities" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fasilitas Lengkap
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Kami menyediakan fasilitas terbaik untuk kenyamanan belajar Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((facility) => (
              <div
                key={facility.id}
                className="flex items-start space-x-4 p-6 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  <facility.icon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {facility.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {facility.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentors Section */}
      <section id="mentors" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Mentor Profesional Kami
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Belajar langsung dari instruktur berpengalaman dan bersertifikat
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 duration-300 border border-gray-100"
              >
                <div className="text-center">
                  <div className="relative inline-block mb-3">
                    <img
                      src={mentor.photo}
                      alt={mentor.name}
                      className="w-20 h-20 rounded-full mx-auto border-2 border-white shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1">
                      <Award className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1 leading-tight">
                    {mentor.name}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2 leading-tight">
                    {mentor.specialization}
                  </p>
                  <a
                    href={`https://instagram.com/${mentor.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-pink-600 hover:text-pink-700 font-medium transition-colors text-xs"
                  >
                    <InstagramIcon className="text-pink-600" size={14} />
                    <span className="truncate">{mentor.instagram}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Apa Kata Mereka?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Testimoni dari siswa yang telah bergabung dengan Homely Kursus Komputer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.photo}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.course}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 italic">
                  "{testimonial.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Galeri Foto
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Lihat suasana belajar dan fasilitas kami
            </p>
          </div>

          {/* Desktop Grid Layout */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((item, index) => (
              <div
                key={item.id}
                onClick={() => openLightbox(index)}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 aspect-[4/3] cursor-pointer"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="inline-block px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full mb-2">
                      {item.category}
                    </span>
                    <h3 className="text-white text-xl font-bold">
                      {item.title}
                    </h3>
                  </div>
                </div>
                {/* Click indicator */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Stacked Cards Layout */}
          <div className="md:hidden">
            <div 
              className="relative h-[500px] flex items-center justify-center"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {galleryImages.map((item, index) => {
                const position = index - activeCardIndex;
                const isActive = index === activeCardIndex;
                
                return (
                  <div
                    key={item.id}
                    onClick={() => isActive && openLightbox(index)}
                    className={`gallery-card absolute w-[85%] max-w-sm transition-all duration-500 ease-out cursor-pointer ${
                      isActive ? 'z-30' : 'z-10'
                    }`}
                    style={{
                      transform: `
                        translateX(${position * 20}px)
                        translateY(${Math.abs(position) * 15}px)
                        scale(${1 - Math.abs(position) * 0.1})
                        rotateZ(${position * 2}deg)
                      `,
                      opacity: Math.abs(position) > 2 ? 0 : 1 - Math.abs(position) * 0.2,
                      pointerEvents: isActive ? 'auto' : 'none'
                    }}
                  >
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl aspect-[4/3]">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <span className="inline-block px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full mb-2">
                            {item.category}
                          </span>
                          <h3 className="text-white text-xl font-bold">
                            {item.title}
                          </h3>
                        </div>
                      </div>
                      {/* Click indicator for active card */}
                      {isActive && (
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 animate-pulse">
                          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center items-center space-x-2 mt-8">
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToCard(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === activeCardIndex
                      ? 'w-8 h-3 bg-blue-600'
                      : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>

            {/* Swipe Instruction */}
            <p className="text-center text-sm text-gray-500 mt-4">
              Geser untuk melihat foto lainnya
            </p>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Lokasi Kami
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Kunjungi kami dan rasakan pengalaman belajar yang menyenangkan
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info - Left Side (2 columns) */}
            <div className="lg:col-span-2 flex flex-col justify-center space-y-6">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Alamat</h3>
                    <p className="text-gray-600">
                      Jl. Kasah Ujung, No. 3, Pekanbaru<br />
                      Riau, Indonesia
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 mb-6">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <WhatsAppIcon className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">WhatsApp</h3>
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      +62 821-6457-578
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-pink-100 p-3 rounded-lg">
                    <InstagramIcon className="text-pink-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Instagram</h3>
                    <a
                      href="https://instagram.com/homelykursus"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-700 font-medium"
                    >
                      @homelykursus
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Map - Right Side (1 column) */}
            <div className="lg:col-span-1 flex flex-col space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-xl h-[300px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15958.850753834!2d101.43638!3d0.50729!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d5a8e9e4c8f8e9%3A0x1234567890abcdef!2sJl.%20Kasah%20Ujung%2C%20No.%203%2C%20Pekanbaru%20-%20Riau!5e0!3m2!1sen!2sid!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Homely Kursus Komputer"
                ></iframe>
              </div>

              <a
                href="https://maps.app.goo.gl/1WPaH5dPRuhyhfVv6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                <MapPin className="w-5 h-5" />
                <span>Buka di Google Maps</span>
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Siap Memulai Perjalanan Belajar Anda?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Daftar sekarang dan dapatkan konsultasi gratis!
          </p>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-3 bg-green-500 hover:bg-green-600 text-white px-10 py-5 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-2xl"
          >
            <WhatsAppIcon className="text-white" size={28} />
            <span>Hubungi Kami di WhatsApp</span>
            <ArrowRight className="w-6 h-6" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* About */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="https://res.cloudinary.com/dzksnkl72/image/upload/v1770305224/logo_innhbv.jpg" 
                  alt="Homely Logo" 
                  className="h-10 w-10 rounded object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold">Homely</h3>
                  <p className="text-sm text-gray-400">Kursus Komputer</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Tempat terbaik untuk belajar komputer dengan metode praktis dan mudah dipahami.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-4">Menu</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => scrollToSection('home')} className="text-gray-400 hover:text-white transition-colors">
                    Beranda
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('programs')} className="text-gray-400 hover:text-white transition-colors">
                    Program
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('facilities')} className="text-gray-400 hover:text-white transition-colors">
                    Fasilitas
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('mentors')} className="text-gray-400 hover:text-white transition-colors">
                    Mentor
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('gallery')} className="text-gray-400 hover:text-white transition-colors">
                    Galeri
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('location')} className="text-gray-400 hover:text-white transition-colors">
                    Lokasi
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('testimonials')} className="text-gray-400 hover:text-white transition-colors">
                    Testimoni
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-bold mb-4">Hubungi Kami</h4>
              <div className="space-y-3">
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <WhatsAppIcon className="text-green-400" size={20} />
                  <span>+62 821-6457-578</span>
                </a>
                <a
                  href="https://instagram.com/homelykursus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <InstagramIcon className="text-pink-400" size={20} />
                  <span>@homelykursus</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2026 Homely Kursus Komputer. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 z-50 animate-bounce"
      >
        <WhatsAppIcon className="text-white" size={32} />
      </a>

      {/* Registration Toast Notifications */}
      <RegistrationToast />

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Close"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous Button */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 hover:bg-black/70 rounded-full p-3 z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          {/* Image Container */}
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center px-16">
            <img
              src={galleryImages[lightboxIndex].image}
              alt={galleryImages[lightboxIndex].title}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            {/* Image Info */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-6 py-3 rounded-full">
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full mr-2">
                  {galleryImages[lightboxIndex].category}
                </span>
                <span className="text-white font-semibold">
                  {galleryImages[lightboxIndex].title}
                </span>
                <span className="text-gray-300 text-sm ml-3">
                  {lightboxIndex + 1} / {galleryImages.length}
                </span>
              </div>
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 hover:bg-black/70 rounded-full p-3 z-10"
            aria-label="Next"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Keyboard Hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-400 text-sm">
            Gunakan ← → atau klik tombol untuk navigasi • ESC untuk tutup
          </div>
        </div>
      )}
    </div>
  );
}