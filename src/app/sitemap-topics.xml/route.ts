import { NextResponse } from 'next/server';

// Topics sitemap - dynamic content
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://robotoverlord.com';
  
  try {
    // In a real implementation, fetch topics from your database
    // For now, we'll create a placeholder structure
    const topics = [
      {
        id: '1',
        slug: 'artificial-intelligence',
        updatedAt: new Date().toISOString(),
        priority: '0.9'
      },
      {
        id: '2',
        slug: 'machine-learning',
        updatedAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        priority: '0.8'
      },
      {
        id: '3',
        slug: 'robotics',
        updatedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        priority: '0.8'
      },
      {
        id: '4',
        slug: 'deep-learning',
        updatedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        priority: '0.7'
      },
      {
        id: '5',
        slug: 'neural-networks',
        updatedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        priority: '0.7'
      }
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${topics.map(topic => `  <url>
    <loc>${baseUrl}/topics/${topic.slug}</loc>
    <lastmod>${topic.updatedAt}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${topic.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800' // 30 minutes cache
      }
    });
  } catch (error) {
    console.error('Error generating topics sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
