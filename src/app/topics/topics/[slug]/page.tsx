/**
 * Topic detail/thread view page for The Robot Overlord
 * Displays topic information and associated posts
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TopicHeader } from '@/components/topics/TopicHeader';
import { PostList } from '@/components/posts/PostList';
import { PostForm } from '@/components/posts/PostForm';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useAppStore } from '@/stores/appStore';
import { topicsService, postsService } from '@/services';
import { Topic } from '@/types/topics';
import { Post } from '@/types/posts';
import { ApiResponse, PaginatedResponse } from '@/types/api';

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addNotification } = useAppStore();
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showPostForm, setShowPostForm] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [timeframe, setTimeframe] = useState('all');

  const slug = params.slug as string;

  // Load topic details
  const loadTopic = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await topicsService.getTopic(slug);
      if (response.success && response.data) {
        setTopic(response.data as Topic);
      } else {
        throw new Error('Topic not found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load topic';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error Loading Topic',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load posts for the topic
  const loadPosts = async (page: number = 1) => {
    if (!topic) return;

    try {
      setIsLoadingPosts(true);

      const postsResponse = await postsService.getPosts({
        topicId: topic.id,
        page: currentPage,
        limit: 20,
        sortBy: sortBy as any
      });

      if (postsResponse && Array.isArray(postsResponse)) {
        const newPosts = postsResponse;
        const hasMore = false; // Simplified pagination
        setTotalPages(1); // Simplified pagination
        setPosts(newPosts);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadTopic();
  }, [slug]);

  // Load posts when topic is loaded
  useEffect(() => {
    if (topic) {
      loadPosts();
    }
  }, [topic]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadPosts(page);
  };

  // Handle topic subscription
  const handleSubscribe = async () => {
    if (!topic) return;

    try {
      if (topic.userSubscribed) {
        await topicsService.unsubscribeTopic(topic.id);
        addNotification({
          type: 'success',
          title: 'Unsubscribed',
          message: `You have unsubscribed from "${topic.title}"`,
        });
      } else {
        await topicsService.subscribeTopic(topic.id);
        addNotification({
          type: 'success',
          title: 'Subscribed',
          message: `You are now subscribed to "${topic.title}"`,
        });
      }

      // Update local state
      setTopic({
        ...topic,
        userSubscribed: !topic.userSubscribed,
        subscriberCount: topic.userSubscribed ? topic.subscriberCount - 1 : topic.subscriberCount + 1
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update subscription';
      addNotification({
        type: 'error',
        title: 'Subscription Error',
        message: errorMessage,
      });
    }
  };

  // Handle post creation
  const handlePostSubmit = async (postData: unknown) => {
    if (!topic) return;

    try {
      const response = await postsService.createPost({
        ...(postData as any),
        topicId: topic.id,
      });

      if (response.success && response.data) {
        addNotification({
          type: 'success',
          title: 'Post Created',
          message: 'Your post has been submitted successfully',
        });

        // Refresh posts
        loadPosts(currentPage);
        setShowPostForm(false);

        // Update topic post count
        setTopic({
          ...topic,
          postCount: topic.postCount + 1
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post';
      addNotification({
        type: 'error',
        title: 'Post Creation Error',
        message: errorMessage,
      });
    }
  };

  // Handle post vote
  const handlePostVote = async (postId: string, voteType: 'up' | 'down') => {
    try {
      await postsService.votePost(postId, voteType);
      
      // Update local post state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          const currentVote = post.userVote;
          let upvotes = post.upvotes;
          let downvotes = post.downvotes;
          let newVote = voteType;

          // Handle vote logic
          if (currentVote === voteType) {
            // Remove vote
            newVote = null as any;
            if (voteType === 'up') upvotes--;
            else downvotes--;
          } else {
            // Add or change vote
            if (currentVote === 'up') upvotes--;
            else if (currentVote === 'down') downvotes--;
            
            if (voteType === 'up') upvotes++;
            else downvotes++;
          }

          return {
            ...post,
            userVote: newVote,
            upvotes,
            downvotes,
            score: upvotes - downvotes
          };
        }
        return post;
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to vote';
      addNotification({
        type: 'error',
        title: 'Vote Error',
        message: errorMessage,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Topic Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-muted/20 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted/20 rounded w-1/2 mb-6"></div>
          <div className="flex space-x-4 mb-6">
            <div className="h-10 bg-muted/20 rounded w-24"></div>
            <div className="h-10 bg-muted/20 rounded w-32"></div>
          </div>
        </div>

        {/* Posts Skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} variant="bordered" className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="h-6 w-6 bg-muted/20 rounded"></div>
                    <div className="h-4 w-8 bg-muted/20 rounded"></div>
                    <div className="h-6 w-6 bg-muted/20 rounded"></div>
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted/20 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-muted/20 rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted/20 rounded w-3/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🤖</div>
        <h3 className="text-xl font-bold text-light-text mb-2">
          Topic Not Found
        </h3>
        <p className="text-muted-light mb-6">
          {error || 'The topic you are looking for does not exist or has been removed.'}
        </p>
        <Button variant="primary" onClick={() => router.push('/topics')}>
          Back to Topics
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Topic Header */}
      <TopicHeader
        topic={topic}
        onSubscribe={handleSubscribe}
        onEdit={() => router.push(`/topics/${topic.slug}/edit`)}
        canEdit={topic.userPermissions?.canModerate || false}
      />

      {/* New Post Button */}
      {!topic.isLocked && (
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-light-text">
            Discussion ({topic.postCount} posts)
          </h2>
          <Button
            variant="primary"
            onClick={() => setShowPostForm(!showPostForm)}
            disabled={!topic.userPermissions?.canPost}
          >
            {showPostForm ? 'Cancel' : 'New Post'}
          </Button>
        </div>
      )}

      {/* Post Creation Form */}
      {showPostForm && !topic.isLocked && (
        <Card variant="bordered">
          <CardContent className="p-6">
            <PostForm
              onSubmit={handlePostSubmit}
              onCancel={() => setShowPostForm(false)}
              topicId={topic.id}
              mode="create"
            />
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      <PostList
        posts={posts}
        onVote={handlePostVote}
        onReply={(postId) => console.log('Reply to:', postId)}
        onEdit={(postId) => console.log('Edit post:', postId)}
        onDelete={(postId) => console.log('Delete post:', postId)}
        onReport={(postId) => console.log('Report post:', postId)}
        showPagination={true}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={isLoadingPosts}
        isEmpty={posts.length === 0 && !isLoadingPosts}
        emptyText="No posts in this topic yet. Be the first to start the discussion!"
      />
    </div>
  );
}
