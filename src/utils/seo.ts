'use client';

// SEO utility functions
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

export const truncateDescription = (text: string, maxLength: number = 160): string => {
  // Remove HTML tags
  const cleanText = text.replace(/<[^>]*>/g, '');
  
  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  
  // Find the last space before maxLength to avoid cutting words
  const truncated = cleanText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
};

export const extractKeywords = (content: string, maxKeywords: number = 10): string[] => {
  // Remove HTML tags and convert to lowercase
  const cleanContent = content.replace(/<[^>]*>/g, '').toLowerCase();
  
  // Common stop words to filter out
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
  ]);
  
  // Extract words and count frequency
  const words = cleanContent
    .split(/\W+/)
    .filter(word => word.length > 3 && !stopWords.has(word));
  
  const wordCount = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Sort by frequency and return top keywords
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word);
};

export const generateCanonicalUrl = (path: string, baseUrl?: string): string => {
  const base = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://robotoverlord.com';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

export const generateOpenGraphImage = (
  title: string,
  description?: string,
  type: 'article' | 'topic' | 'profile' | 'default' = 'default'
): string => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://robotoverlord.com';
  
  // In a real implementation, you might generate dynamic OG images
  // For now, return appropriate static images based on type
  const images = {
    article: '/images/og-article.png',
    topic: '/images/og-topic.png',
    profile: '/images/og-profile.png',
    default: '/images/og-default.png'
  };
  
  return `${baseUrl}${images[type]}`;
};

export const validateMetaTags = (meta: {
  title?: string;
  description?: string;
  keywords?: string[];
}): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  
  // Title validation
  if (!meta.title) {
    warnings.push('Title is missing');
  } else if (meta.title.length < 30) {
    warnings.push('Title is too short (recommended: 30-60 characters)');
  } else if (meta.title.length > 60) {
    warnings.push('Title is too long (recommended: 30-60 characters)');
  }
  
  // Description validation
  if (!meta.description) {
    warnings.push('Description is missing');
  } else if (meta.description.length < 120) {
    warnings.push('Description is too short (recommended: 120-160 characters)');
  } else if (meta.description.length > 160) {
    warnings.push('Description is too long (recommended: 120-160 characters)');
  }
  
  // Keywords validation
  if (!meta.keywords || meta.keywords.length === 0) {
    warnings.push('Keywords are missing');
  } else if (meta.keywords.length > 10) {
    warnings.push('Too many keywords (recommended: 5-10 keywords)');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
};

export const generateBreadcrumbs = (pathname: string): Array<{
  name: string;
  url: string;
}> => {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Home', url: '/' }];
  
  let currentPath = '';
  
  paths.forEach((path, index) => {
    currentPath += `/${path}`;
    
    // Convert path segments to readable names
    const name = path
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbs.push({
      name,
      url: currentPath
    });
  });
  
  return breadcrumbs;
};

export const generateRSSFeed = async (posts: Array<{
  title: string;
  description: string;
  content: string;
  author: string;
  publishedAt: string;
  slug: string;
}>): Promise<string> => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://robotoverlord.com';
  const now = new Date().toUTCString();
  
  const rssItems = posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.description}]]></description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
      <author>${post.author}</author>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <link>${baseUrl}/posts/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/posts/${post.slug}</guid>
    </item>
  `).join('');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Robot Overlord</title>
    <description>AI-powered community platform for technology discussions and insights</description>
    <link>${baseUrl}</link>
    <language>en-US</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;
};

// SEO performance tracking
export const trackSEOMetrics = (page: string, metrics: {
  loadTime: number;
  interactionTime: number;
  cumulativeLayoutShift: number;
  largestContentfulPaint: number;
}) => {
  // In production, send to analytics service
  if (process.env.NODE_ENV === 'production') {
    console.log('SEO Metrics for', page, metrics);
    // Example: Send to Google Analytics, Adobe Analytics, etc.
  }
};

export default {
  generateSlug,
  truncateDescription,
  extractKeywords,
  generateCanonicalUrl,
  generateOpenGraphImage,
  validateMetaTags,
  generateBreadcrumbs,
  generateRSSFeed,
  trackSEOMetrics
};
