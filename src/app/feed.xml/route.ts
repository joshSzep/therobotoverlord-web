import { NextResponse } from 'next/server';
import { generateRSSFeed } from '@/utils/seo';

// RSS feed endpoint
export async function GET() {
  try {
    // In a real implementation, fetch posts from your database
    // For now, we'll create sample posts
    const posts = [
      {
        title: 'Welcome to The Robot Overlord',
        description: 'Introducing our AI-powered community platform for technology discussions and insights.',
        content: '<p>Welcome to The Robot Overlord, where artificial intelligence meets human discourse. Our platform provides a unique space for discussing the latest developments in AI, machine learning, and robotics.</p>',
        author: 'The Robot Overlord Team',
        publishedAt: new Date().toISOString(),
        slug: 'welcome-to-robot-overlord'
      },
      {
        title: 'The Future of AI: Predictions and Possibilities',
        description: 'Exploring the potential developments in artificial intelligence over the next decade.',
        content: '<p>As we stand on the brink of unprecedented technological advancement, artificial intelligence continues to evolve at an exponential rate. This post explores the key trends and predictions for AI development.</p>',
        author: 'AI Research Team',
        publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        slug: 'ai-future-predictions'
      },
      {
        title: 'Machine Learning Fundamentals for Beginners',
        description: 'A comprehensive guide to understanding the basics of machine learning and its applications.',
        content: '<p>Machine learning has become one of the most important technologies of our time. This beginner-friendly guide covers the fundamental concepts, algorithms, and real-world applications.</p>',
        author: 'ML Education Team',
        publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        slug: 'machine-learning-basics'
      }
    ];

    const rssContent = await generateRSSFeed(posts);

    return new NextResponse(rssContent, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800' // 30 minutes cache
      }
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}
