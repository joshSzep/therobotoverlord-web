import { NextResponse } from 'next/server';

// Posts sitemap - dynamic content
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://robotoverlord.com';
  
  try {
    // In a real implementation, fetch posts from your database
    // For now, we'll create a placeholder structure
    const posts = [
      {
        id: '1',
        slug: 'welcome-to-robot-overlord',
        updatedAt: new Date().toISOString(),
        priority: '0.8'
      },
      {
        id: '2', 
        slug: 'ai-future-predictions',
        updatedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        priority: '0.7'
      },
      {
        id: '3',
        slug: 'machine-learning-basics',
        updatedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        priority: '0.6'
      }
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${posts.map(post => `  <url>
    <loc>${baseUrl}/posts/${post.slug}</loc>
    <lastmod>${post.updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${post.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800' // 30 minutes cache
      }
    });
  } catch (error) {
    console.error('Error generating posts sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
