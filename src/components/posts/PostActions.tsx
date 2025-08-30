/**
 * Post actions component for The Robot Overlord
 * Handles post deletion and other administrative actions
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useAppStore } from '@/stores/appStore';
import { postsService } from '@/services';
import { Post } from '@/types/posts';

interface PostActionsProps {
  post: Post;
  onPostDeleted?: () => void;
  onPostUpdated?: (updatedPost: Post) => void;
  className?: string;
}

export function PostActions({
  post,
  onPostDeleted,
  onPostUpdated,
  className = '',
}: PostActionsProps) {
  const { addNotification } = useAppStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle post deletion
  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await postsService.deletePost(post.id);
      
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Post Deleted',
          message: 'The post has been deleted successfully',
        });
        
        onPostDeleted?.();
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete post';
      addNotification({
        type: 'error',
        title: 'Delete Error',
        message: errorMessage,
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle post reporting
  const handleReport = async () => {
    try {
      const response = await postsService.reportPost(post.id, {
        reason: 'inappropriate_content',
        details: 'Reported via post actions',
      });
      
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Post Reported',
          message: 'The post has been reported to moderators',
        });
      } else {
        throw new Error('Failed to report post');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to report post';
      addNotification({
        type: 'error',
        title: 'Report Error',
        message: errorMessage,
      });
    }
  };

  if (showDeleteConfirm) {
    return (
      <Card variant="bordered" className={`border-rejected-red/50 ${className}`}>
        <CardHeader className="pb-4">
          <h3 className="text-lg font-bold text-rejected-red">Delete Post</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-light-text">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            
            <div className="bg-rejected-red/10 border border-rejected-red/20 rounded-lg p-4">
              <p className="text-sm text-rejected-red font-medium mb-2">
                ⚠️ Warning
              </p>
              <ul className="text-sm text-muted-light space-y-1">
                <li>• The post content will be permanently removed</li>
                <li>• All replies to this post will also be deleted</li>
                <li>• This action cannot be reversed</li>
              </ul>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-rejected-red hover:bg-rejected-red/80 flex items-center space-x-2"
              >
                {isDeleting && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
                <span>{isDeleting ? 'Deleting...' : 'Delete Post'}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="bordered" className={className}>
      <CardHeader className="pb-4">
        <h3 className="text-lg font-bold text-light-text">Post Actions</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Edit Action */}
          {post.userPermissions?.canEdit && (
            <Button
              variant="ghost"
              className="w-full justify-start text-light-text hover:text-overlord-red"
              onClick={() => window.location.href = `/posts/${post.id}/edit`}
            >
              <span className="mr-2">✏️</span>
              Edit Post
            </Button>
          )}

          {/* Delete Action */}
          {post.userPermissions?.canDelete && (
            <Button
              variant="ghost"
              className="w-full justify-start text-rejected-red hover:bg-rejected-red/10"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <span className="mr-2">🗑️</span>
              Delete Post
            </Button>
          )}

          {/* Report Action */}
          <Button
            variant="ghost"
            className="w-full justify-start text-warning-amber hover:bg-warning-amber/10"
            onClick={handleReport}
          >
            <span className="mr-2">🚩</span>
            Report Post
          </Button>

          {/* Moderation Actions (for moderators) */}
          {post.userPermissions?.canModerate && (
            <>
              <div className="border-t border-muted/20 pt-3 mt-3">
                <p className="text-sm font-medium text-light-text mb-2">
                  Moderation Actions
                </p>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-warning-amber hover:bg-warning-amber/10 mb-2"
                  onClick={() => console.log('Pin post')}
                >
                  <span className="mr-2">📌</span>
                  Pin Post
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-rejected-red hover:bg-rejected-red/10"
                  onClick={() => console.log('Lock post')}
                >
                  <span className="mr-2">🔒</span>
                  Lock Post
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
