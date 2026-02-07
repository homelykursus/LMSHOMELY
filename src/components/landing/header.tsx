'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    // If we're on a different page, navigate to home first
    if (window.location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <img 
              src="https://res.cloudinary.com/dzksnkl72/image/upload/v1770305224/logo_innhbv.jpg" 
              alt="Homely Logo" 
              className="h-10 w-10 md:h-12 md:w-12 rounded object-cover"
            />
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">Homely Kursus Komputer</h1>
            </div>
          </Link>

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
            <Link href="/blog" className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm">
              Blog
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
              <Link href="/blog" className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-left">
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
  );
}
