import { NextResponse } from 'next/server';

// Static pages sitemap
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://robotoverlord.com';
  
  const staticPages = [
    {
      url: '',
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      url: '/feed',
      lastmod: new Date().toISOString(),
      changefreq: 'hourly',
      priority: '0.9'
    },
    {
      url: '/topics',
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: '0.8'
    },
    {
      url: '/search',
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.7'
    },
    {
      url: '/about',
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.6'
    },
    {
      url: '/contact',
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.5'
    },
    {
      url: '/privacy',
      lastmod: new Date().toISOString(),
      changefreq: 'yearly',
      priority: '0.3'
    },
    {
      url: '/terms',
      lastmod: new Date().toISOString(),
      changefreq: 'yearly',
      priority: '0.3'
    }
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}
