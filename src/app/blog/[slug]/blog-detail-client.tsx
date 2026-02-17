'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, Tag, Eye } from 'lucide-react';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  category: string;
  tags: string | null;
  publishedAt: string | null;
  authorName: string;
  viewCount: number;
  readTime: number | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogImage: string | null;
}

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

const getDefaultImage = (category: string) => {
  const images: { [key: string]: string } = {
    'Tutorial': 'https://res.cloudinary.com/dzksnkl72/image/upload/v1738835142/microsoft-office_iqvqxe.png',
    'Tips & Trik': 'https://res.cloudinary.com/dzksnkl72/image/upload/v1738835142/microsoft-excel_zxcvbn.png',
    'Berita': 'https://res.cloudinary.com/dzksnkl72/image/upload/v1738835142/digital-marketing_plqwer.png',
    'Panduan': 'https://res.cloudinary.com/dzksnkl72/image/upload/v1738835142/corel-draw_aqhqxe.png',
    'Artikel': 'https://res.cloudinary.com/dzksnkl72/image/upload/v1738835142/adobe-photoshop_mnbvcx.png',
    'Desain': 'https://res.cloudinary.com/dzksnkl72/image/upload/v1738835142/corel-draw_aqhqxe.png',
    'Video Editing': 'https://res.cloudinary.com/dzksnkl72/image/upload/v1738835142/adobe-premiere_xqhqwe.png',
    'Marketing': 'https://res.cloudinary.com/dzksnkl72/image/upload/v1738835142/digital-marketing_plqwer.png'
  };
  return images[category] || 'https://res.cloudinary.com/dzksnkl72/image/upload/v1738835142/microsoft-office_iqvqxe.png';
};

export default function BlogDetailClient({ blogPost }: { blogPost: BlogPost }) {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const currentUrl = `${baseUrl}/blog/${blogPost.slug}`;

  // Structured Data (JSON-LD) untuk SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blogPost.title,
    description: blogPost.excerpt,
    image: blogPost.featuredImage || getDefaultImage(blogPost.category),
    datePublished: blogPost.publishedAt || new Date().toISOString(),
    dateModified: blogPost.publishedAt || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: blogPost.authorName
    },
    publisher: {
      '@type': 'Organization',
      name: 'Homely Kursus',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': currentUrl
    },
    keywords: blogPost.tags || blogPost.category,
    articleSection: blogPost.category,
    wordCount: blogPost.content.split(' ').length,
    timeRequired: `PT${blogPost.readTime || 5}M`
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        
        {/* Back Button Section with top padding for fixed header */}
        <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm mt-16 md:mt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => router.push('/blog')}
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Kembali ke Blog</span>
            </button>
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Category Badge */}
          <div className="mb-6">
            <span className={`${getCategoryColor(blogPost.category)} text-white text-sm font-bold px-4 py-2 rounded-full inline-flex items-center space-x-2`}>
              <Tag size={16} />
              <span>{blogPost.category}</span>
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {blogPost.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center space-x-6 text-gray-600 mb-8 pb-8 border-b">
            <div className="flex items-center space-x-2">
              <Calendar size={18} />
              <time dateTime={blogPost.publishedAt || undefined}>
                {blogPost.publishedAt 
                  ? new Date(blogPost.publishedAt).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })
                  : 'Belum dipublish'
                }
              </time>
            </div>
            <div className="flex items-center space-x-2">
              <Clock size={18} />
              <span>{blogPost.readTime || 5} menit baca</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye size={18} />
              <span>{blogPost.viewCount} views</span>
            </div>
          </div>

          {/* Author */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {blogPost.authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">Oleh {blogPost.authorName}</p>
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={blogPost.featuredImage || getDefaultImage(blogPost.category)}
              alt={blogPost.title}
              className="w-full h-auto object-cover"
              loading="eager"
            />
          </div>

          {/* Excerpt */}
          <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <p className="text-lg text-gray-700 italic leading-relaxed">
              {blogPost.excerpt}
            </p>
          </div>

          {/* Tags */}
          {blogPost.tags && (
            <div className="flex flex-wrap gap-2 mb-8">
              {blogPost.tags.split(',').map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Article Body */}
          <div 
            className="prose prose-lg max-w-none whitespace-pre-wrap
              prose-headings:text-gray-900 prose-headings:font-bold
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-p:mt-0
              prose-ul:my-6 prose-ul:space-y-2
              prose-ol:my-6 prose-ol:space-y-2
              prose-li:text-gray-700
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic
              prose-img:rounded-lg prose-img:shadow-lg prose-img:my-8
              [&_p]:block [&_p]:mb-4 [&_p]:mt-0 [&_p]:leading-relaxed
              [&_br]:block [&_br]:content-[''] [&_br]:my-1
              [&>*]:whitespace-normal"
            dangerouslySetInnerHTML={{ __html: blogPost.content }}
          />

          {/* Share Section */}
          <div className="mt-16 p-8 bg-white rounded-2xl shadow-lg border">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Bagikan Artikel Ini</h3>
            <div className="flex flex-wrap gap-4">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                aria-label="Bagikan ke Facebook"
              >
                Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(blogPost.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-semibold"
                aria-label="Bagikan ke Twitter"
              >
                Twitter
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(blogPost.title + ' ' + currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                aria-label="Bagikan ke WhatsApp"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 p-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Tertarik Belajar Lebih Lanjut?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Daftar sekarang di Homely Kursus dan kuasai skill yang Anda butuhkan dengan bimbingan mentor profesional.
            </p>
            <Link
              href="/pendaftaran"
              className="inline-block bg-white text-blue-600 font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
            >
              Daftar Sekarang
            </Link>
          </div>

          {/* Back to Blog Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => router.push('/blog')}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold shadow-md border"
            >
              <ArrowLeft size={20} />
              <span>Lihat Artikel Lainnya</span>
            </button>
          </div>
        </article>
        
        <Footer />
      </div>
    </>
  );
}
