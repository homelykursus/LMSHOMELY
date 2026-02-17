import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch single blog post by slug for public
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const blogPost = await db.blogPost.findUnique({
      where: {
        slug: params.slug,
        status: 'published'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        featuredImage: true,
        category: true,
        tags: true,
        publishedAt: true,
        authorName: true,
        viewCount: true,
        readTime: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
        ogImage: true
      }
    });

    if (!blogPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await db.blogPost.update({
      where: { id: blogPost.id },
      data: { viewCount: { increment: 1 } }
    });

    return NextResponse.json(blogPost);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}
