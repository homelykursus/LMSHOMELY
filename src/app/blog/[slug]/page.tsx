import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogDetailClient from './blog-detail-client';

// Fungsi untuk fetch data blog post (server-side)
async function getBlogPost(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/blog/${slug}`, {
      cache: 'no-store' // Selalu ambil data terbaru
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

// Generate metadata untuk SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blogPost = await getBlogPost(params.slug);
  
  if (!blogPost) {
    return {
      title: 'Artikel Tidak Ditemukan | Homely Kursus',
      description: 'Artikel yang Anda cari tidak tersedia.'
    };
  }

  const title = blogPost.metaTitle || blogPost.title;
  const description = blogPost.metaDescription || blogPost.excerpt;
  const keywords = blogPost.metaKeywords || `${blogPost.category}, ${blogPost.tags || ''}`;
  const ogImage = blogPost.ogImage || blogPost.featuredImage || 'https://res.cloudinary.com/dzksnkl72/image/upload/v1738835142/microsoft-office_iqvqxe.png';
  const publishedTime = blogPost.publishedAt || new Date().toISOString();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = `${baseUrl}/blog/${params.slug}`;

  return {
    title: `${title} | Homely Kursus`,
    description: description,
    keywords: keywords,
    authors: [{ name: blogPost.authorName }],
    creator: blogPost.authorName,
    publisher: 'Homely Kursus',
    
    // Open Graph
    openGraph: {
      type: 'article',
      title: title,
      description: description,
      url: url,
      siteName: 'Homely Kursus',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      publishedTime: publishedTime,
      authors: [blogPost.authorName],
      tags: blogPost.tags ? blogPost.tags.split(',').map((t: string) => t.trim()) : []
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [ogImage],
      creator: '@homelykursus'
    },
    
    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Canonical URL
    alternates: {
      canonical: url
    },
    
    // Additional metadata
    category: blogPost.category,
  };
}

// Main page component (Server Component)
export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const blogPost = await getBlogPost(params.slug);
  
  if (!blogPost) {
    notFound();
  }

  return <BlogDetailClient blogPost={blogPost} />;
}
