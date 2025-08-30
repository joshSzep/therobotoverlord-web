/**
 * Post detail/thread view page for The Robot Overlord
 * Displays individual post with replies and actions
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PostCard } from '@/components/posts/PostCard';
import { PostForm } from '@/components/posts/PostForm';
import { PostActions } from '@/components/posts/PostActions';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useAppStore } from '@/stores/appStore';
import { postsService } from '@/services';
import { Post } from '@/types/posts';
import { ApiResponse } from '@/types/api';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addNotification } = useAppStore();
  
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const postId = params.id as string;

  // Load post details
  const loadPost = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await postsService.getPost(postId);
      if (response.success && response.data) {
        setPost(response.data);
      } else {
        throw new Error('Post not found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load post';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error Loading Post',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load replies for the post
  const loadReplies = async () => {
    if (!post) return;

    try {
      setIsLoadingReplies(true);

      const response = await postsService.getReplies(post.id);
      if (response.data) {
        setReplies(response.data || []);
      }
    } catch (err) {
      console.error('Failed to load replies:', err);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadPost();
  }, [postId]);

  // Load replies when post is loaded
  useEffect(() => {
    if (post) {
      loadReplies();
    }
  }, [post]);

  // Handle post vote
  const handlePostVote = async (votePostId: string, voteType: 'up' | 'down') => {
    try {
      await postsService.votePost(votePostId, voteType);
      
      // Update local state for main post
      if (post && post.id === votePostId) {
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

        setPost({
          ...post,
          userVote: newVote,
          upvotes,
          downvotes,
          score: upvotes - downvotes
        });
      }

      // Update local state for replies
      setReplies(replies.map(reply => {
        if (reply.id === votePostId) {
          const currentVote = reply.userVote;
          let upvotes = reply.upvotes;
          let downvotes = reply.downvotes;
          let newVote = voteType;

          if (currentVote === voteType) {
            newVote = null as any;
            if (voteType === 'up') upvotes--;
            else downvotes--;
          } else {
            if (currentVote === 'up') upvotes--;
            else if (currentVote === 'down') downvotes--;
            
            if (voteType === 'up') upvotes++;
            else downvotes++;
          }

          return {
            ...reply,
            userVote: newVote,
            upvotes,
            downvotes,
            score: upvotes - downvotes
          };
        }
        return reply;
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

  // Handle reply submission
  const handleReplySubmit = async (replyData: any) => {
    if (!post) return;

    try {
      const response = await postsService.createPost({
        ...replyData,
        topicId: post.topicId,
        parentId: post.id,
      });

      if (response.success && response.data) {
        addNotification({
          type: 'success',
          title: 'Reply Posted',
          message: 'Your reply has been posted successfully',
        });

        // Refresh replies
        loadReplies();
        setShowReplyForm(false);

        // Update post reply count
        setPost({
          ...post,
          replyCount: post.replyCount + 1
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to post reply';
      addNotification({
        type: 'error',
        title: 'Reply Error',
        message: errorMessage,
      });
    }
  };

  // Handle post deletion
  const handlePostDeleted = () => {
    addNotification({
      type: 'success',
      title: 'Post Deleted',
      message: 'The post has been deleted',
    });
    
    // Redirect to topic or dashboard
    if (post?.topic) {
      router.push(`/topics/${post.topic.slug}`);
    } else {
      router.push('/dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Post Skeleton */}
        <Card variant="bordered" className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <div className="flex flex-col items-center space-y-2">
                <div className="h-6 w-6 bg-muted/20 rounded"></div>
                <div className="h-4 w-8 bg-muted/20 rounded"></div>
                <div className="h-6 w-6 bg-muted/20 rounded"></div>
              </div>
              <div className="flex-1">
                <div className="h-4 bg-muted/20 rounded w-1/4 mb-2"></div>
                <div className="h-6 bg-muted/20 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted/20 rounded w-full mb-2"></div>
                <div className="h-4 bg-muted/20 rounded w-2/3"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-bold text-light-text mb-2">
            Post Not Found
          </h3>
          <p className="text-muted-light mb-6">
            {error || 'The post you are looking for does not exist or has been removed.'}
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              Go Back
            </Button>
            <Button variant="primary" onClick={loadPost}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      {post.topic && (
        <div className="flex items-center space-x-2 text-sm text-muted-light">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/topics/${post.topic!.slug}`)}
            className="text-overlord-red hover:underline p-0 h-auto"
          >
            {post.topic.title}
          </Button>
          <span>→</span>
          <span>Post</span>
        </div>
      )}

      {/* Main Post */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <PostCard
            post={post}
            onVote={handlePostVote}
            onReply={() => setShowReplyForm(!showReplyForm)}
            onEdit={() => router.push(`/posts/${post.id}/edit`)}
            onReport={() => console.log('Report post')}
            showTopic={false}
          />

          {/* Reply Form */}
          {showReplyForm && (
            <Card variant="bordered" className="mt-6">
              <CardContent className="p-6">
                <PostForm
                  onSubmit={handleReplySubmit}
                  onCancel={() => setShowReplyForm(false)}
                  parentId={post.id}
                  topicId={post.topicId}
                  mode="reply"
                />
              </CardContent>
            </Card>
          )}

          {/* Replies Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-light-text">
                Replies ({post.replyCount})
              </h2>
              {!showReplyForm && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowReplyForm(true)}
                >
                  Reply
                </Button>
              )}
            </div>

            {/* Replies List */}
            {isLoadingReplies ? (
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
                          <div className="h-4 bg-muted/20 rounded w-2/3"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : replies.length > 0 ? (
              <div className="space-y-4">
                {replies.map((reply) => (
                  <PostCard
                    key={reply.id}
                    post={reply}
                    onVote={handlePostVote}
                    onReply={() => console.log('Reply to reply')}
                    onEdit={() => router.push(`/posts/${reply.id}/edit`)}
                    onReport={() => console.log('Report reply')}
                    showTopic={false}
                    compact={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-bold text-light-text mb-2">
                  No Replies Yet
                </h3>
                <p className="text-muted-light mb-4">
                  Be the first to reply to this post
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowReplyForm(true)}
                >
                  Write Reply
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Post Actions */}
            <PostActions
              post={post}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={setPost}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
