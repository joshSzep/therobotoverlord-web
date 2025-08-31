/**
 * Post editing page for The Robot Overlord
 * Allows users to edit their existing posts
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PostForm } from '@/components/posts/PostForm';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/stores/appStore';
import { postsService } from '@/services';
import { Post } from '@/types/posts';
import { ApiResponse } from '@/types/api';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const { addNotification } = useAppStore();
  
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const postId = params.id as string;

  // Load post data
  const loadPost = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await postsService.getPost(postId);
      if (response.success && response.data) {
        // Check if user can edit this post
        if (!response.data.userPermissions?.canEdit) {
          throw new Error('You do not have permission to edit this post');
        }
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

  // Initial load
  useEffect(() => {
    loadPost();
  }, [postId]);

  // Handle post update
  const handlePostSubmit = async (postData: unknown) => {
    if (!post) return;

    try {
      const response = await postsService.updatePost(post.id, postData as any);

      if (response.success && response.data) {
        addNotification({
          type: 'success',
          title: 'Post Updated',
          message: 'Your post has been updated successfully',
        });

        // Redirect back to the post or topic
        if (post.topic) {
          router.push(`/topics/${post.topic.slug}`);
        } else {
          router.push('/dashboard');
        }
      } else {
        throw new Error('Failed to update post');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update post';
      addNotification({
        type: 'error',
        title: 'Update Error',
        message: errorMessage,
      });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (post?.topic) {
      router.push(`/topics/${post.topic.slug}`);
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card variant="bordered" className="animate-pulse">
          <CardHeader className="pb-4">
            <div className="h-8 bg-muted/20 rounded w-1/3"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-4 bg-muted/20 rounded w-1/4"></div>
            <div className="h-10 bg-muted/20 rounded"></div>
            <div className="h-4 bg-muted/20 rounded w-1/4"></div>
            <div className="h-32 bg-muted/20 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-light-text mb-2">
            Unable to Edit Post
          </h3>
          <p className="text-muted-light mb-6">
            {error || 'The post you are trying to edit does not exist or you do not have permission to edit it.'}
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-light-text">Edit Post</h1>
          <p className="text-muted-light mt-1">
            Make changes to your post
          </p>
          {post.topic && (
            <p className="text-sm text-muted-light mt-1">
              in{' '}
              <span 
                className="text-overlord-red hover:underline cursor-pointer"
                onClick={() => router.push(`/topics/${post.topic!.slug}`)}
              >
                {post.topic.title}
              </span>
            </p>
          )}
        </div>
        <Button variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
      </div>

      {/* Edit Form */}
      <PostForm
        onSubmit={handlePostSubmit}
        onCancel={handleCancel}
        initialData={post}
        mode="edit"
        showPreview={true}
      />
    </div>
  );
}
