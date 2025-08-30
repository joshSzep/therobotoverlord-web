'use client';

import Head from 'next/head';

// Schema.org structured data types
interface Organization {
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
  contactPoint?: {
    '@type': 'ContactPoint';
    contactType: string;
    email?: string;
    url?: string;
  };
}

interface WebSite {
  '@type': 'WebSite';
  name: string;
  url: string;
  description: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

interface Article {
  '@type': 'Article';
  headline: string;
  description: string;
  author: {
    '@type': 'Person';
    name: string;
    url?: string;
  };
  publisher: Organization;
  datePublished: string;
  dateModified?: string;
  image?: string[];
  url: string;
  mainEntityOfPage: string;
  keywords?: string[];
  articleSection?: string;
  wordCount?: number;
}

interface BreadcrumbList {
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

interface FAQPage {
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

interface StructuredDataProps {
  data: Organization | WebSite | Article | BreadcrumbList | FAQPage | any;
}

export const StructuredData: React.FC<StructuredDataProps> = ({ data }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    ...data
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData, null, 2)
        }}
      />
    </Head>
  );
};

// Predefined structured data for common use cases
export const OrganizationStructuredData: React.FC = () => {
  const organizationData: Organization = {
    '@type': 'Organization',
    name: 'The Robot Overlord',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://robotoverlord.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`,
    description: 'AI-powered community platform for technology discussions and insights',
    sameAs: [
      'https://twitter.com/robotoverlord',
      'https://github.com/robotoverlord',
      'https://linkedin.com/company/robotoverlord'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@robotoverlord.com',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/contact`
    }
  };

  return <StructuredData data={organizationData} />;
};

export const WebSiteStructuredData: React.FC = () => {
  const websiteData: WebSite = {
    '@type': 'WebSite',
    name: 'The Robot Overlord',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://robotoverlord.com',
    description: 'AI-powered community platform for technology discussions and insights',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  return <StructuredData data={websiteData} />;
};

// Hook for generating structured data
export const useStructuredData = () => {
  const generateArticleData = (article: {
    title: string;
    description: string;
    content: string;
    author: string;
    authorUrl?: string;
    publishedAt: string;
    updatedAt?: string;
    image?: string;
    url: string;
    keywords?: string[];
    section?: string;
  }): Article => ({
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
      url: article.authorUrl
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Robot Overlord',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://robotoverlord.com',
      logo: `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`,
      description: 'AI-powered community platform',
      sameAs: []
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    image: article.image ? [article.image] : undefined,
    url: article.url,
    mainEntityOfPage: article.url,
    keywords: article.keywords,
    articleSection: article.section,
    wordCount: article.content.split(' ').length
  });

  const generateBreadcrumbData = (breadcrumbs: Array<{
    name: string;
    url: string;
  }>): BreadcrumbList => ({
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  });

  const generateFAQData = (faqs: Array<{
    question: string;
    answer: string;
  }>): FAQPage => ({
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  });

  const generateForumData = (forum: {
    name: string;
    description: string;
    url: string;
    postCount: number;
    memberCount: number;
  }) => ({
    '@type': 'DiscussionForumPosting',
    name: forum.name,
    description: forum.description,
    url: forum.url,
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CommentAction',
        userInteractionCount: forum.postCount
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/JoinAction',
        userInteractionCount: forum.memberCount
      }
    ]
  });

  const generatePersonData = (person: {
    name: string;
    bio?: string;
    url: string;
    image?: string;
    sameAs?: string[];
    jobTitle?: string;
    worksFor?: string;
  }) => ({
    '@type': 'Person',
    name: person.name,
    description: person.bio,
    url: person.url,
    image: person.image,
    sameAs: person.sameAs || [],
    jobTitle: person.jobTitle,
    worksFor: person.worksFor ? {
      '@type': 'Organization',
      name: person.worksFor
    } : undefined
  });

  return {
    generateArticleData,
    generateBreadcrumbData,
    generateFAQData,
    generateForumData,
    generatePersonData
  };
};

export default StructuredData;
