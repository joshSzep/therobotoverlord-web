import { NextResponse } from 'next/server';

// Users sitemap - dynamic content
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://robotoverlord.com';
  
  try {
    // In a real implementation, fetch public user profiles from your database
    // For now, we'll create a placeholder structure
    const users = [
      {
        id: '1',
        username: 'ai-researcher',
        updatedAt: new Date().toISOString(),
        priority: '0.6'
      },
      {
        id: '2',
        username: 'ml-engineer',
        updatedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        priority: '0.5'
      },
      {
        id: '3',
        username: 'robotics-expert',
        updatedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        priority: '0.5'
      },
      {
        id: '4',
        username: 'data-scientist',
        updatedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        priority: '0.4'
      }
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${users.map(user => `  <url>
    <loc>${baseUrl}/users/${user.username}</loc>
    <lastmod>${user.updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${user.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600' // 1 hour cache
      }
    });
  } catch (error) {
    console.error('Error generating users sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
