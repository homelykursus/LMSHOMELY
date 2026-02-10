'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
  ArrowRight,
  FileText,
  Palette,
  Video,
  Code,
  TrendingUp,
  Sheet,
  BookOpen,
  CreditCard,
  UserCheck,
  Package,
  MessageSquare
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { InstagramIcon } from '@/components/ui/instagram-icon';
import RegistrationToast from '@/components/landing/registration-toast';
import AlumniAvatars from '@/components/landing/alumni-avatars';

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
  photo: string | null;
  education: string;
  specialization: string | null;
  instagramUsername: string | null;
}

interface GalleryImage {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  order: number;
}

export default function LandingPage() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Testimonial slider state
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  // Gallery slider state
  const [currentGallerySlide, setCurrentGallerySlide] = useState(0);
  
  // Active section state for navigation
  const [activeSection, setActiveSection] = useState('home');

  // Mentors state - fetch from database
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mentorsLoading, setMentorsLoading] = useState(true);

  // Hero state - fetch from database (no fallback)
  const [heroData, setHeroData] = useState<{
    badgeText: string;
    title: string;
    description: string;
    imageUrl: string;
    animatedWords: string[];
  } | null>(null);
  const [heroLoading, setHeroLoading] = useState(true);
  const [heroError, setHeroError] = useState(false);

  // Facilities state - fetch from database (no fallback)
  const [facilitiesData, setFacilitiesData] = useState<Facility[]>([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);
  const [facilitiesError, setFacilitiesError] = useState(false);

  // Testimonials state - fetch from database (no fallback)
  const [testimonialsData, setTestimonialsData] = useState<Testimonial[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [testimonialsError, setTestimonialsError] = useState(false);

  // Gallery state - fetch from database (no fallback)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [galleryError, setGalleryError] = useState(false);

  // Location state - fetch from database (no fallback)
  const [locationData, setLocationData] = useState<{
    title: string;
    subtitle: string;
    address: string;
    whatsappNumber: string;
    whatsappDisplay: string;
    instagramUsername: string;
    instagramUrl: string;
    googleMapsEmbed: string;
    googleMapsLink: string;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);

  // Generate words array with gradients based on heroData.animatedWords
  const gradients = [
    'from-green-500 to-emerald-600',
    'from-orange-500 to-red-600',
    'from-pink-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-purple-500 to-pink-600',
    'from-yellow-500 to-orange-600'
  ];

  const words = heroData?.animatedWords.map((text, index) => ({
    text,
    gradient: gradients[index % gradients.length]
  })) || [];

  // Program Kursus
  const courses: Course[] = [
    {
      id: '1',
      name: 'Microsoft Office',
      description: 'Cocok untuk Sekolah atau Perkantoran',
      duration: '12 Pertemuan',
      icon: FileText,
      slug: 'microsoft-office'
    },
    {
      id: '2',
      name: 'Desain Grafis',
      description: 'Cocok untuk peningkatan Skill Desain Grafis',
      duration: '16 Pertemuan',
      icon: Palette,
      slug: 'desain-grafis'
    },
    {
      id: '3',
      name: 'Video Editing',
      description: 'Cocok untuk Peningkatan Skill dan Content Creator',
      duration: '14 Pertemuan',
      icon: Video,
      slug: 'video-editing'
    },
    {
      id: '4',
      name: 'Pembuatan Website',
      description: 'Pengembangan web tanpa Coding dengan Wordpress dan AI',
      duration: '20 Pertemuan',
      icon: Code,
      slug: 'web-design'
    },
    {
      id: '5',
      name: 'Digital Marketing',
      description: 'Teknik Pemasaran produk secara digital dan Beriklan di Sosial Media',
      duration: '12 Pertemuan',
      icon: TrendingUp,
      slug: 'digital-marketing'
    },
    {
      id: '6',
      name: 'Microsoft Excel Lanjutan',
      description: 'Tingkatkan kemampuan Microsoft Excel untuk tujuan yang lebih spesifik',
      duration: '6x Pertemuan',
      icon: Sheet,
      slug: 'microsoft-excel-lanjutan'
    }
  ];

  // Fasilitas - removed hardcoded data, now fetched from database

  // Testimonials - removed hardcoded data, now fetched from database

  // Fetch hero data from database (no fallback)
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await fetch('/api/web-content/hero/active');
        if (response.ok) {
          const data = await response.json();
          
          // Parse animated words from database
          let parsedWords: string[] = [];
          if (data.animatedWords) {
            try {
              // Try parsing as JSON array first
              parsedWords = JSON.parse(data.animatedWords);
            } catch {
              // If not JSON, split by comma
              parsedWords = data.animatedWords.split(',').map((w: string) => w.trim()).filter((w: string) => w);
            }
          }
          
          setHeroData({
            badgeText: data.badgeText || '📍 Kursus Komputer Pekanbaru',
            title: data.title,
            description: data.description,
            imageUrl: data.imageUrl,
            animatedWords: parsedWords
          });
          setHeroError(false);
        } else {
          setHeroError(true);
        }
      } catch (error) {
        console.error('Error fetching hero data:', error);
        setHeroError(true);
      } finally {
        setHeroLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  // Fetch mentors from database
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await fetch('/api/landing/teachers');
        if (response.ok) {
          const data = await response.json();
          setMentors(data);
        }
      } catch (error) {
        console.error('Error fetching mentors:', error);
      } finally {
        setMentorsLoading(false);
      }
    };

    fetchMentors();
  }, []);

  // Fetch facilities from database (no fallback)
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await fetch('/api/web-content/facilities/active');
        if (response.ok) {
          const data = await response.json();
          setFacilitiesData(data);
          setFacilitiesError(false);
        } else {
          setFacilitiesError(true);
        }
      } catch (error) {
        console.error('Error fetching facilities:', error);
        setFacilitiesError(true);
      } finally {
        setFacilitiesLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  // Fetch testimonials from database (no fallback)
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/web-content/testimonials/active');
        if (response.ok) {
          const data = await response.json();
          setTestimonialsData(data);
          setTestimonialsError(false);
        } else {
          setTestimonialsError(true);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setTestimonialsError(true);
      } finally {
        setTestimonialsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Fetch gallery images from database (no fallback)
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch('/api/web-content/gallery/active');
        if (response.ok) {
          const data = await response.json();
          setGalleryImages(data);
          setGalleryError(false);
        } else {
          setGalleryError(true);
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error);
        setGalleryError(true);
      } finally {
        setGalleryLoading(false);
      }
    };

    fetchGallery();
  }, []);

  // Fetch location info from database (no fallback)
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch('/api/web-content/location/active');
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setLocationData(data);
            setLocationError(false);
          } else {
            setLocationError(true);
          }
        } else {
          setLocationError(true);
        }
      } catch (error) {
        console.error('Error fetching location info:', error);
        setLocationError(true);
      } finally {
        setLocationLoading(false);
      }
    };

    fetchLocation();
  }, []);

  // Typing animation effect
  useEffect(() => {
    // Guard: Don't run if words array is empty or heroData is not loaded
    if (!words || words.length === 0 || !heroData) {
      return;
    }

    const currentWord = words[wordIndex]?.text;
    if (!currentWord) {
      return;
    }

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
  }, [typingText, isDeleting, wordIndex, words, heroData]);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for active section detection
  useEffect(() => {
    const sections = ['home', 'programs', 'facilities', 'mentors', 'gallery', 'location', 'testimonials'];
    
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach((sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  // Gallery swipe handlers
  // Function untuk mendapatkan gradient color berdasarkan course
  const getCourseGradient = (courseId: string) => {
    const gradients: { [key: string]: string } = {
      '1': 'from-blue-500 to-blue-600',      // Microsoft Office - Blue
      '2': 'from-purple-500 to-pink-500',    // Desain Grafis - Purple/Pink
      '3': 'from-red-500 to-orange-500',     // Video Editing - Red/Orange
      '4': 'from-green-500 to-teal-500',     // Web Design - Green/Teal
      '5': 'from-yellow-500 to-orange-500',  // Digital Marketing - Yellow/Orange
      '6': 'from-green-600 to-emerald-600'   // Microsoft Excel Lanjutan - Green
    };
    return gradients[courseId] || 'from-blue-500 to-blue-600';
  };

  const whatsappMessage = encodeURIComponent('Halo, saya tertarik untuk mendaftar kursus di Homely Kursus Komputer. Mohon informasi lebih lanjut.');

  // Helper function to map icon names to icon components
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      MapPin,
      Wifi,
      Users,
      Award,
      Clock,
      Monitor,
      BookOpen,
      CreditCard,
      UserCheck
    };
    return iconMap[iconName] || MapPin; // Default to MapPin if icon not found
  };

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
                <h1 className="text-lg md:text-xl font-bold text-gray-900">Homely Kursus Komputer</h1>
              </div>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => scrollToSection('home')} 
                className={`transition-colors font-medium text-sm relative ${
                  activeSection === 'home' 
                    ? 'text-blue-600 font-bold' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Beranda
                {activeSection === 'home' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
                )}
              </button>
              <button 
                onClick={() => scrollToSection('programs')} 
                className={`transition-colors font-medium text-sm relative ${
                  activeSection === 'programs' 
                    ? 'text-blue-600 font-bold' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Program
                {activeSection === 'programs' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
                )}
              </button>
              <button 
                onClick={() => scrollToSection('facilities')} 
                className={`transition-colors font-medium text-sm relative ${
                  activeSection === 'facilities' 
                    ? 'text-blue-600 font-bold' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Fasilitas
                {activeSection === 'facilities' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
                )}
              </button>
              <button 
                onClick={() => scrollToSection('mentors')} 
                className={`transition-colors font-medium text-sm relative ${
                  activeSection === 'mentors' 
                    ? 'text-blue-600 font-bold' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Mentor
                {activeSection === 'mentors' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
                )}
              </button>
              <button 
                onClick={() => scrollToSection('gallery')} 
                className={`transition-colors font-medium text-sm relative ${
                  activeSection === 'gallery' 
                    ? 'text-blue-600 font-bold' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Galeri
                {activeSection === 'gallery' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
                )}
              </button>
              <button 
                onClick={() => scrollToSection('location')} 
                className={`transition-colors font-medium text-sm relative ${
                  activeSection === 'location' 
                    ? 'text-blue-600 font-bold' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Lokasi
                {activeSection === 'location' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
                )}
              </button>
              <Link 
                href="/blog" 
                className={`transition-colors font-medium text-sm relative ${
                  pathname?.startsWith('/blog') 
                    ? 'text-blue-600 font-bold' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Blog
                {pathname?.startsWith('/blog') && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
                )}
              </Link>
              <Link
                href="/pendaftaran"
                className="bg-gradient-to-br from-orange-400 via-orange-500 to-pink-500 hover:from-orange-500 hover:via-orange-600 hover:to-pink-600 text-white px-6 py-2 rounded-full font-medium transition-all flex items-center space-x-2 text-sm shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5"
                style={{
                  boxShadow: '0 4px 15px rgba(251, 146, 60, 0.4), inset 0 -2px 5px rgba(0, 0, 0, 0.2)',
                }}
              >
                <FileText className="w-4 h-4" />
                <span>Daftar</span>
              </Link>
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
                <button 
                  onClick={() => scrollToSection('home')} 
                  className={`transition-colors font-medium text-left ${
                    activeSection === 'home' 
                      ? 'text-blue-600 font-bold' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Beranda
                </button>
                <button 
                  onClick={() => scrollToSection('programs')} 
                  className={`transition-colors font-medium text-left ${
                    activeSection === 'programs' 
                      ? 'text-blue-600 font-bold' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Program
                </button>
                <button 
                  onClick={() => scrollToSection('facilities')} 
                  className={`transition-colors font-medium text-left ${
                    activeSection === 'facilities' 
                      ? 'text-blue-600 font-bold' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Fasilitas
                </button>
                <button 
                  onClick={() => scrollToSection('mentors')} 
                  className={`transition-colors font-medium text-left ${
                    activeSection === 'mentors' 
                      ? 'text-blue-600 font-bold' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Mentor
                </button>
                <button 
                  onClick={() => scrollToSection('gallery')} 
                  className={`transition-colors font-medium text-left ${
                    activeSection === 'gallery' 
                      ? 'text-blue-600 font-bold' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Galeri
                </button>
                <button 
                  onClick={() => scrollToSection('location')} 
                  className={`transition-colors font-medium text-left ${
                    activeSection === 'location' 
                      ? 'text-blue-600 font-bold' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Lokasi
                </button>
                <button 
                  onClick={() => scrollToSection('testimonials')} 
                  className={`transition-colors font-medium text-left ${
                    activeSection === 'testimonials' 
                      ? 'text-blue-600 font-bold' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Testimoni
                </button>
                <Link 
                  href="/blog" 
                  className={`transition-colors font-medium text-left ${
                    pathname?.startsWith('/blog') 
                      ? 'text-blue-600 font-bold' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Blog
                </Link>
                <Link
                  href="/pendaftaran"
                  className="bg-gradient-to-br from-orange-400 via-orange-500 to-pink-500 hover:from-orange-500 hover:via-orange-600 hover:to-pink-600 text-white px-6 py-3 rounded-full font-medium transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  style={{
                    boxShadow: '0 4px 15px rgba(251, 146, 60, 0.4), inset 0 -2px 5px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <FileText className="w-5 h-5" />
                  <span>Daftar Sekarang</span>
                </Link>
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
          {/* Loading State */}
          {heroLoading && (
            <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat data...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!heroLoading && heroError && (
            <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] py-12">
              <div className="text-center">
                <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4 inline-block">
                  <p className="font-semibold">Gagal memuat data hero</p>
                  <p className="text-sm mt-2">Silakan refresh halaman atau hubungi admin</p>
                </div>
              </div>
            </div>
          )}

          {/* Hero Content - Only show when data is loaded */}
          {!heroLoading && !heroError && heroData && (
            <>
          {/* Mobile Layout */}
          <div className="lg:hidden flex flex-col min-h-[calc(100vh-5rem)] py-12 space-y-8">
            {/* 1. Text Content - TOP */}
            <div className="text-left space-y-6 z-10">
              <div className="inline-block">
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                  {heroData.badgeText}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                {heroData.title}
                {words.length > 0 && (
                  <span className={`block text-transparent bg-clip-text bg-gradient-to-r ${words[wordIndex]?.gradient || 'from-blue-500 to-purple-600'}`}>
                    {typingText}
                    <span className="animate-pulse">|</span>
                  </span>
                )}
              </h1>
              
              <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                {heroData.description}
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
                    src={heroData.imageUrl}
                    alt="Kursus Komputer Pekanbaru - Siswa Belajar Komputer dengan Instruktur Profesional"
                    className="w-full h-auto rounded-3xl"
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
                href={`https://wa.me/${locationData?.whatsappNumber || '628216457578'}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <WhatsAppIcon className="text-white" size={24} />
                <span>Hubungi Admin</span>
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
            <div className="flex items-center justify-center gap-12 z-10">
              {/* Alumni Avatars */}
              <div className="flex-shrink-0">
                <AlumniAvatars />
              </div>
              
              {/* Rating Google */}
              <div className="text-center flex-shrink-0">
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
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-5rem)] py-12">
            {/* Left Content */}
            <div className="text-left z-10">
              <div className="space-y-6 mb-8">
                <div className="inline-block">
                  <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                    {heroData.badgeText}
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  {heroData.title}
                  {words.length > 0 && (
                    <span className={`block text-transparent bg-clip-text bg-gradient-to-r ${words[wordIndex]?.gradient || 'from-blue-500 to-purple-600'}`}>
                      {typingText}
                      <span className="animate-pulse">|</span>
                    </span>
                  )}
                </h1>
                
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  {heroData.description}
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a
                  href={`https://wa.me/${locationData?.whatsappNumber || '628216457578'}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <WhatsAppIcon className="text-white" size={24} />
                  <span>Hubungi Admin</span>
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
              <div className="flex items-center gap-8 pt-8">
                {/* Alumni Avatars */}
                <div className="flex-shrink-0">
                  <AlumniAvatars />
                </div>
                
                {/* Rating Google */}
                <div className="text-center flex-shrink-0">
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
                    src={heroData.imageUrl}
                    alt="Tempat Kursus Komputer Terbaik di Pekanbaru - Homely Kursus Komputer"
                    className="w-full h-auto rounded-3xl"
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
            </>
          )}
        </div>
      </section>

      {/* Program Kursus Section */}
      <section id="programs" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Program Kursus
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pilih program kursus yang sesuai dengan kebutuhan dan minat Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/program/${course.slug}`}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 duration-300 cursor-pointer group"
              >
                {/* 3D Icon Container with Gradient */}
                <div className={`bg-gradient-to-br ${getCourseGradient(course.id)} w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <course.icon className="w-10 h-10 text-white drop-shadow-lg" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {course.name}
                </h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {course.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
                    <span>Lihat Detail</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Fasilitas Section */}
      <section id="facilities" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fasilitas Kursus
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Kami menyediakan fasilitas terbaik untuk kenyamanan belajar Anda
            </p>
          </div>

          {/* Loading State */}
          {facilitiesLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat fasilitas...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!facilitiesLoading && facilitiesError && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="bg-red-100 text-red-600 p-4 rounded-lg inline-block">
                  <p className="font-semibold">Gagal memuat data fasilitas</p>
                  <p className="text-sm mt-2">Silakan refresh halaman atau hubungi admin</p>
                </div>
              </div>
            </div>
          )}

          {/* Facilities Grid - Only show when data is loaded */}
          {!facilitiesLoading && !facilitiesError && facilitiesData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {facilitiesData.map((facility) => {
                const IconComponent = getIconComponent(facility.icon);
                return (
                  <div
                    key={facility.id}
                    className="flex items-start space-x-4 p-6 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-green-600" />
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
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!facilitiesLoading && !facilitiesError && facilitiesData.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Belum ada fasilitas yang ditampilkan</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mentors Section */}
      <section id="mentors" className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Mentor Profesional Kami
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Belajar langsung dari instruktur berpengalaman dan bersertifikat
            </p>
          </div>

          {/* Mobile Layout - Grid Only (No Image) */}
          <div className="grid grid-cols-2 md:hidden gap-4">
            {mentorsLoading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 shadow-lg border border-gray-100 animate-pulse">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))
            ) : mentors.length > 0 ? (
              mentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 duration-300 border border-gray-100"
                >
                  <div className="text-center">
                    <div className="relative inline-block mb-3">
                      <img
                        src={mentor.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=6366f1&color=fff&size=200`}
                        alt={mentor.name}
                        className="w-20 h-20 rounded-full mx-auto border-2 border-white shadow-lg object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1">
                        <Award className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1 leading-tight">
                      {mentor.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-1 leading-tight">
                      {mentor.specialization || 'Instruktur'}
                    </p>
                    {mentor.instagramUsername && (
                      <a
                        href={`https://instagram.com/${mentor.instagramUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-pink-600 hover:text-pink-700 font-medium transition-colors"
                      >
                        <InstagramIcon size={12} />
                        <span>@{mentor.instagramUsername}</span>
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-500">
                Belum ada data mentor
              </div>
            )}
          </div>

          {/* Desktop Layout - Image Left, Cards Right */}
          <div className="hidden md:flex md:gap-8 items-end -mb-20">
            {/* Left Side - Mentor Image (40% width, scaled up 4%, moved up 3%, extends beyond section bottom) */}
            <div className="w-[40%] flex items-end">
              <img
                src="https://res.cloudinary.com/dzksnkl72/image/upload/v1770717919/TUNJUK_SAMPING_ATAS_ASLI_ytxmgo.webp"
                alt="Mentor Profesional"
                className="w-full h-auto object-contain scale-[1.04] -translate-y-[3%]"
              />
            </div>

            {/* Right Side - Mentor Cards Grid (60% width, 3 columns x 2 rows) */}
            <div className="w-[60%] grid grid-cols-3 gap-4 mb-20">
              {mentorsLoading ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 shadow-lg border border-gray-100 animate-pulse">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3"></div>
                      <div className="h-3 bg-gray-300 rounded mb-2"></div>
                      <div className="h-2 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))
              ) : mentors.length > 0 ? (
                mentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 duration-300 border border-gray-100"
                  >
                    <div className="text-center">
                      <div className="relative inline-block mb-3">
                        <img
                          src={mentor.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=6366f1&color=fff&size=200`}
                          alt={mentor.name}
                          className="w-16 h-16 rounded-full mx-auto border-2 border-white shadow-lg object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1">
                          <Award className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xs font-bold text-gray-900 mb-1 leading-tight">
                        {mentor.name}
                      </h3>
                      <p className="text-[10px] text-gray-600 mb-1 leading-tight">
                        {mentor.specialization || 'Instruktur'}
                      </p>
                      {mentor.instagramUsername && (
                        <a
                          href={`https://instagram.com/${mentor.instagramUsername}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-pink-600 hover:text-pink-700 font-medium transition-colors"
                        >
                          <InstagramIcon size={10} />
                          <span>@{mentor.instagramUsername}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  Belum ada data mentor
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-12 md:py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Apa Kata Mereka?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Testimoni dari siswa yang telah bergabung dengan Homely Kursus Komputer
            </p>
          </div>

          {/* Loading State */}
          {testimonialsLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat testimonial...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!testimonialsLoading && testimonialsError && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="bg-red-100 text-red-600 p-4 rounded-lg inline-block">
                  <p className="font-semibold">Gagal memuat testimonial</p>
                  <p className="text-sm mt-2">Silakan refresh halaman atau hubungi admin</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!testimonialsLoading && !testimonialsError && testimonialsData.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Belum ada testimonial yang ditampilkan</p>
              </div>
            </div>
          )}

          {/* Testimonials Slider - Only show when data is loaded */}
          {!testimonialsLoading && !testimonialsError && testimonialsData.length > 0 && (
            <>
              {/* Horizontal Slider Container */}
              <div className="relative max-w-7xl mx-auto">
                {/* Overflow Container */}
                <div className="overflow-hidden">
                  {/* Sliding Track - Mobile: 1 card, Tablet: 2 cards, Desktop: 4 cards */}
                  <div 
                    className="flex transition-transform duration-500 ease-out"
                    style={{ 
                      transform: `translateX(-${currentTestimonial * 100}%)` 
                    }}
                  >
                    {testimonialsData.map((testimonial, index) => (
                      <div
                        key={testimonial.id}
                        className="flex-shrink-0 w-full md:w-1/2 lg:w-1/4 px-3"
                      >
                        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all h-full">
                          <div className="flex items-center mb-4">
                            <img
                              src={testimonial.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=3b82f6&color=fff`}
                              alt={testimonial.name}
                              className="w-12 h-12 rounded-full mr-3"
                            />
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm">{testimonial.name}</h4>
                              <p className="text-xs text-gray-600">{testimonial.course}</p>
                            </div>
                          </div>
                          <div className="flex mb-3">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                          <p className="text-gray-700 italic text-sm">
                            "{testimonial.comment}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons - Hidden on desktop when all 4 cards visible */}
                <div className="flex items-center justify-center space-x-4 mt-4 md:mt-8 lg:hidden">
                  <button
                    onClick={() => setCurrentTestimonial((prev) => (prev === 0 ? testimonialsData.length - 1 : prev - 1))}
                    disabled={currentTestimonial === 0}
                    className="bg-white hover:bg-blue-600 hover:text-white text-blue-600 p-3 rounded-full shadow-lg transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-600"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  {/* Dots Indicator */}
                  <div className="flex space-x-2">
                    {testimonialsData.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTestimonial(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === currentTestimonial 
                            ? 'bg-blue-600 w-8' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to testimonial ${index + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentTestimonial((prev) => (prev === testimonialsData.length - 1 ? 0 : prev + 1))}
                    disabled={currentTestimonial === testimonialsData.length - 1}
                    className="bg-white hover:bg-blue-600 hover:text-white text-blue-600 p-3 rounded-full shadow-lg transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-600"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Desktop Navigation - Show when more than 4 cards */}
                <div className="hidden lg:flex items-center justify-center space-x-4 mt-8">
                  <button
                    onClick={() => setCurrentTestimonial((prev) => Math.max(0, prev - 1))}
                    disabled={currentTestimonial === 0}
                    className="bg-white hover:bg-blue-600 hover:text-white text-blue-600 p-3 rounded-full shadow-lg transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-600"
                    aria-label="Previous testimonials"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  {/* Dots Indicator for Desktop - Show slides of 4 */}
                  <div className="flex space-x-2">
                    {[0, 1].map((slideIndex) => (
                      <button
                        key={slideIndex}
                        onClick={() => setCurrentTestimonial(slideIndex)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          currentTestimonial === slideIndex
                            ? 'bg-blue-600 w-8' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to slide ${slideIndex + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentTestimonial((prev) => Math.min(1, prev + 1))}
                    disabled={currentTestimonial === 1}
                    className="bg-white hover:bg-blue-600 hover:text-white text-blue-600 p-3 rounded-full shadow-lg transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-600"
                    aria-label="Next testimonials"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-12 md:py-20 bg-white">
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
            {galleryLoading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Memuat galeri...</p>
              </div>
            ) : galleryError ? (
              <div className="col-span-full text-center py-12">
                <p className="text-red-600">Gagal memuat galeri foto</p>
              </div>
            ) : galleryImages.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">Belum ada foto galeri</p>
              </div>
            ) : (
              galleryImages.map((item, index) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 aspect-[4/3]"
                >
                  <img
                    src={item.imageUrl}
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
                </div>
              ))
            )}
          </div>

          {/* Mobile Slider Layout - Same style as Testimonials */}
          <div className="md:hidden">
            {galleryLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Memuat galeri...</p>
              </div>
            ) : galleryError ? (
              <div className="text-center py-12">
                <p className="text-red-600">Gagal memuat galeri foto</p>
              </div>
            ) : galleryImages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Belum ada foto galeri</p>
              </div>
            ) : (
              <div className="relative max-w-7xl mx-auto">
                {/* Overflow Container */}
                <div className="overflow-hidden">
                  {/* Sliding Track */}
                  <div 
                    className="flex transition-transform duration-500 ease-out"
                    style={{ 
                      transform: `translateX(-${currentGallerySlide * 100}%)` 
                    }}
                  >
                    {galleryImages.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex-shrink-0 w-full px-3"
                      >
                        <div
                          className="relative overflow-hidden rounded-2xl shadow-lg aspect-[4/3]"
                        >
                          <img
                            src={item.imageUrl}
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
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-center space-x-4 mt-4">
                  <button
                    onClick={() => setCurrentGallerySlide((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                    disabled={currentGallerySlide === 0}
                    className="bg-white hover:bg-blue-600 hover:text-white text-blue-600 p-3 rounded-full shadow-lg transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-600"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  {/* Dots Indicator */}
                  <div className="flex space-x-2">
                    {galleryImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentGallerySlide(index)}
                        className={`transition-all duration-300 rounded-full ${
                          index === currentGallerySlide
                            ? 'w-8 h-3 bg-blue-600'
                            : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentGallerySlide((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                    disabled={currentGallerySlide === galleryImages.length - 1}
                    className="bg-white hover:bg-blue-600 hover:text-white text-blue-600 p-3 rounded-full shadow-lg transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-600"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Swipe Instruction */}
                <p className="text-center text-sm text-gray-500 mt-4">
                  Geser untuk melihat foto lainnya
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {locationLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat informasi lokasi...</p>
            </div>
          ) : locationError || !locationData ? (
            <div className="text-center py-12">
              <p className="text-red-600">Gagal memuat informasi lokasi</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {locationData.title}
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {locationData.subtitle}
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
                        <p className="text-gray-600 whitespace-pre-line">
                          {locationData.address}
                        </p>
                      </div>
                    </div>

                    {/* 2-Column Grid for Social Media */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column: WhatsApp & Instagram */}
                      <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                          <div className="bg-green-100 p-3 rounded-lg">
                            <WhatsAppIcon className="text-green-600" size={24} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">WhatsApp</h3>
                            <a
                              href={`https://wa.me/${locationData.whatsappNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-700 font-medium"
                            >
                              {locationData.whatsappDisplay}
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
                              href={locationData.instagramUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-pink-600 hover:text-pink-700 font-medium"
                            >
                              @{locationData.instagramUsername}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map - Right Side (1 column) */}
                <div className="lg:col-span-1 flex flex-col space-y-4">
                  <div className="rounded-2xl overflow-hidden shadow-xl h-[300px]">
                    <iframe
                      src={locationData.googleMapsEmbed}
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
                    href={locationData.googleMapsLink}
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
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Blur Effects */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">
            {/* Mobile Image - Shows on mobile only, positioned ABOVE text */}
            <div className="lg:hidden flex justify-center items-center mb-8">
              <img
                src="https://res.cloudinary.com/dzksnkl72/image/upload/v1770457338/hp_piy5pr.webp"
                alt="Konsultasi Gratis"
                className="w-[95%] sm:w-[85%] max-w-lg object-contain"
              />
            </div>

            {/* Left Content - Text & Button */}
            <div className="text-center lg:text-left flex flex-col justify-center items-center lg:items-start">
              <p className="text-xl text-gray-600 mb-4">
                Masih ada yang ingin di tanyakan ?
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                Yuk Konsultasikan dengan Admin
              </h2>
              <div>
                <a
                  href={`https://wa.me/${locationData?.whatsappNumber || '628216457578'}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-10 py-5 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-2xl"
                >
                  <WhatsAppIcon size={24} />
                  <span>Chat admin sekarang</span>
                </a>
              </div>
            </div>

            {/* Desktop Image - Shows on desktop only */}
            <div className="hidden lg:flex lg:justify-end lg:items-stretch -mr-4 -my-20">
              <img
                src="https://res.cloudinary.com/dzksnkl72/image/upload/v1770457338/hp_piy5pr.webp"
                alt="Konsultasi Gratis"
                className="w-[69%] h-full object-contain"
              />
            </div>
          </div>
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
                  <h3 className="text-xl font-bold">Homely Kursus Komputer</h3>
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
                  href={`https://wa.me/${locationData?.whatsappNumber || '628216457578'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <WhatsAppIcon className="text-green-400" size={20} />
                  <span>{locationData?.whatsappDisplay || '+62 821-6457-578'}</span>
                </a>
                <a
                  href={locationData?.instagramUrl || 'https://instagram.com/homelykursus'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <InstagramIcon className="text-pink-400" size={20} />
                  <span>@{locationData?.instagramUsername || 'homelykursus'}</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2026 Homely Kursus Komputer. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Registration Toast Notifications */}
      <RegistrationToast />
    </div>
  );
}