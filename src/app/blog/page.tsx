'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string | null;
  category: string;
  tags: string | null;
  publishedAt: string | null;
  authorName: string;
  viewCount: number;
  createdAt: string;
}

// Helper function to get category color
const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    'Tutorial': 'bg-blue-500',
    'Tips & Trik': 'bg-green-500',
    'Berita': 'bg-red-500',
    'Panduan': 'bg-purple-500',
    'Artikel': 'bg-yellow-500',
    'Desain': 'bg-purple-500',
    'Video Editing': 'bg-pink-500',
    'Marketing': 'bg-green-500'
  };
  return colors[category] || 'bg-gray-500';
};

// Helper function to calculate read time (estimate 5 minutes per post)
const getReadTime = () => '5 menit';

// Default image if no featured image
const getDefaultImage = () => 'https://res.cloudinary.com/dzksnkl72/image/upload/v1738835142/microsoft-office_iqvqxe.png';

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch blog posts from API
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await fetch('/api/blog');
        if (response.ok) {
          const data = await response.json();
          setBlogPosts(data);
        } else {
          console.error('Failed to fetch blog posts');
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  // Get unique categories from blog posts
  const categories = ['Semua', ...Array.from(new Set(blogPosts.map(post => post.category)))];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'Semua' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      {/* Hero Section with top padding for fixed header */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900 py-20 mt-16 md:mt-20 overflow-hidden">
        {/* Soft blur circles for modern effect - matching landing page hero */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center relative">
            {/* Floating 3D Icons - 2 icons di depan teks (z-index lebih tinggi) */}
            {/* Icon 1: Light bulb - Top Left, di depan teks */}
            <div className="absolute -top-8 left-1/4 md:left-1/3 opacity-75 blur-[2.5px] z-20 animate-float-continuous">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-2xl rotate-12">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>

            {/* Icon 2: Book - Top Right, di depan teks */}
            <div className="absolute -top-6 right-1/4 md:right-1/3 opacity-75 blur-[2.5px] z-20 animate-float-continuous animation-delay-2000">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-2xl -rotate-12">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>

            {/* Icon 3: Monitor - Bottom Left, di belakang teks */}
            <div className="absolute top-16 left-[10%] md:left-[18%] opacity-65 blur-[2px] z-0 animate-float-continuous animation-delay-4000">
              <div className="bg-gradient-to-br from-pink-400 to-pink-600 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-2xl rotate-6">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            {/* Icon 4: Code - Bottom Right, di belakang teks */}
            <div className="absolute top-14 right-[10%] md:right-[18%] opacity-65 blur-[2px] z-0 animate-float-continuous animation-delay-6000">
              <div className="bg-gradient-to-br from-green-400 to-green-600 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-2xl -rotate-6">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 relative z-10">
              Blog Homely Kursus
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto relative z-10">
              Tips, tutorial, dan artikel seputar dunia komputer dan teknologi
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter */}
        <div className="mb-12">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari artikel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-4">Memuat artikel...</p>
          </div>
        ) : (
          <>
            {/* Blog Grid */}
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
                      <img
                        src={post.featuredImage || getDefaultImage()}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`${getCategoryColor(post.category)} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                          {post.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h2>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>
                              {post.publishedAt 
                                ? new Date(post.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                : new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                              }
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{getReadTime()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Read More Button */}
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center space-x-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors group"
                      >
                        <span>Baca Selengkapnya</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Tidak ada artikel yang ditemukan</p>
              </div>
            )}
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
