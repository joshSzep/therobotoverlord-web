/**
 * Post form component for The Robot Overlord
 * Handles post creation and editing with rich text editor
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useAppStore } from '@/stores/appStore';
import { Post } from '@/types/posts';

interface PostFormProps {
  onSubmit: (postData: any) => void;
  onCancel: () => void;
  initialData?: Partial<Post>;
  topicId?: string;
  parentId?: string;
  mode?: 'create' | 'edit' | 'reply';
  allowedTags?: string[];
  maxLength?: number;
  showPreview?: boolean;
  className?: string;
}

export function PostForm({
  onSubmit,
  onCancel,
  initialData,
  topicId,
  parentId,
  mode = 'create',
  allowedTags = [],
  maxLength = 10000,
  showPreview = true,
  className = '',
}: PostFormProps) {
  const { addNotification } = useAppStore();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    tags: initialData?.tags || [],
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreviewMode, setShowPreviewMode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (mode !== 'reply' && !formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (formData.content.length > maxLength) {
      newErrors.content = `Content must be less than ${maxLength} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const postData = {
        ...formData,
        topicId,
        parentId,
      };
      
      await onSubmit(postData);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Submission Error',
        message: 'Failed to submit post. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle tag input
  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 10); // Limit to 10 tags
    
    handleInputChange('tags', tags);
  };

  const getTitle = () => {
    switch (mode) {
      case 'edit':
        return 'Edit Post';
      case 'reply':
        return 'Reply to Post';
      default:
        return 'Create New Post';
    }
  };

  return (
    <Card variant="bordered" className={className}>
      <CardHeader className="pb-4">
        <h3 className="text-lg font-bold text-light-text">{getTitle()}</h3>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Field (not shown for replies) */}
          {mode !== 'reply' && (
            <div>
              <label className="block text-sm font-medium text-light-text mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter post title..."
                className={`w-full px-3 py-2 bg-dark-bg border rounded-md text-light-text placeholder-muted-light focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent ${
                  errors.title ? 'border-rejected-red' : 'border-muted/30'
                }`}
                maxLength={200}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-rejected-red">{errors.title}</p>
              )}
            </div>
          )}

          {/* Content Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-light-text">
                Content *
              </label>
              {showPreview && (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPreviewMode(false)}
                    className={`px-3 py-1 text-sm rounded ${
                      !showPreviewMode 
                        ? 'bg-overlord-red text-white' 
                        : 'text-muted-light hover:text-light-text'
                    }`}
                  >
                    Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreviewMode(true)}
                    className={`px-3 py-1 text-sm rounded ${
                      showPreviewMode 
                        ? 'bg-overlord-red text-white' 
                        : 'text-muted-light hover:text-light-text'
                    }`}
                  >
                    Preview
                  </button>
                </div>
              )}
            </div>

            {showPreviewMode ? (
              <div className="min-h-[200px] p-3 bg-dark-bg border border-muted/30 rounded-md">
                <div 
                  className="prose prose-invert max-w-none text-light-text"
                  dangerouslySetInnerHTML={{ 
                    __html: formData.content || '<p class="text-muted-light italic">Nothing to preview</p>' 
                  }}
                />
              </div>
            ) : (
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Write your post content here..."
                rows={8}
                className={`w-full px-3 py-2 bg-dark-bg border rounded-md text-light-text placeholder-muted-light focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent resize-vertical ${
                  errors.content ? 'border-rejected-red' : 'border-muted/30'
                }`}
                maxLength={maxLength}
              />
            )}
            
            <div className="flex items-center justify-between mt-2">
              {errors.content && (
                <p className="text-sm text-rejected-red">{errors.content}</p>
              )}
              <p className="text-xs text-muted-light ml-auto">
                {formData.content.length}/{maxLength} characters
              </p>
            </div>
          </div>

          {/* Tags Field (not shown for replies) */}
          {mode !== 'reply' && (
            <div>
              <label className="block text-sm font-medium text-light-text mb-2">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="Enter tags separated by commas..."
                className="w-full px-3 py-2 bg-dark-bg border border-muted/30 rounded-md text-light-text placeholder-muted-light focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent"
              />
              <p className="mt-1 text-xs text-muted-light">
                Separate tags with commas. Maximum 10 tags.
              </p>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-overlord-red/20 text-overlord-red"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-muted/20">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !formData.content.trim()}
              className="flex items-center space-x-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              <span>
                {isSubmitting 
                  ? 'Submitting...' 
                  : mode === 'edit' 
                  ? 'Update Post' 
                  : mode === 'reply'
                  ? 'Post Reply'
                  : 'Create Post'
                }
              </span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
