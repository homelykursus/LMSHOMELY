'use client';

import Link from 'next/link';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { InstagramIcon } from '@/components/ui/instagram-icon';

export default function Footer() {
  const whatsappNumber = '6282164575788';

  const scrollToSection = (sectionId: string) => {
    // If we're on a different page, navigate to home first
    if (window.location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
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
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
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
  );
}
