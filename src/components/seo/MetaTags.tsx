'use client';

import Head from 'next/head';
import { usePathname } from 'next/navigation';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
  canonical?: string;
}

const DEFAULT_META = {
  title: 'The Robot Overlord - AI-Powered Community Platform',
  description: 'Join The Robot Overlord community for AI discussions, insights, and cutting-edge technology conversations. Connect with AI enthusiasts and experts.',
  keywords: ['AI', 'artificial intelligence', 'machine learning', 'technology', 'community', 'discussion', 'forum'],
  image: '/images/og-default.png',
  type: 'website' as const,
  author: 'The Robot Overlord Team'
};

export const MetaTags: React.FC<MetaTagsProps> = ({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  noIndex = false,
  canonical
}) => {
  const pathname = usePathname();
  
  const metaTitle = title ? `${title} | The Robot Overlord` : DEFAULT_META.title;
  const metaDescription = description || DEFAULT_META.description;
  const metaKeywords = [...DEFAULT_META.keywords, ...keywords].join(', ');
  const metaImage = image || DEFAULT_META.image;
  const metaUrl = url || `${process.env.NEXT_PUBLIC_SITE_URL}${pathname}`;
  const metaAuthor = author || DEFAULT_META.author;
  const canonicalUrl = canonical || metaUrl;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="author" content={metaAuthor} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="The Robot Overlord" />
      <meta property="og:locale" content="en_US" />

      {/* Article-specific Open Graph */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@robotoverlord" />
      <meta name="twitter:creator" content="@robotoverlord" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#1f2937" />
      <meta name="msapplication-TileColor" content="#1f2937" />
      <meta name="application-name" content="The Robot Overlord" />
      <meta name="apple-mobile-web-app-title" content="Robot Overlord" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Head>
  );
};

// Hook for generating meta tags based on page content
export const useMetaTags = () => {
  const generatePostMeta = (post: {
    title: string;
    content: string;
    author: string;
    createdAt: string;
    updatedAt?: string;
    tags?: string[];
    image?: string;
  }) => ({
    title: post.title,
    description: post.content.slice(0, 160).replace(/<[^>]*>/g, ''),
    author: post.author,
    publishedTime: new Date(post.createdAt).toISOString(),
    modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
    tags: post.tags || [],
    image: post.image,
    type: 'article' as const
  });

  const generateTopicMeta = (topic: {
    title: string;
    description: string;
    postCount: number;
    image?: string;
  }) => ({
    title: topic.title,
    description: `${topic.description} - ${topic.postCount} posts in this topic.`,
    image: topic.image,
    type: 'website' as const
  });

  const generateUserMeta = (user: {
    username: string;
    bio?: string;
    avatar?: string;
    postCount: number;
  }) => ({
    title: `${user.username}'s Profile`,
    description: user.bio || `View ${user.username}'s profile and ${user.postCount} posts on The Robot Overlord.`,
    image: user.avatar,
    type: 'profile' as const
  });

  return {
    generatePostMeta,
    generateTopicMeta,
    generateUserMeta
  };
};

export default MetaTags;
