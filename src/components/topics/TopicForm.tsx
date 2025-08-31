/**
 * Topic form component for The Robot Overlord
 * Handles topic creation and editing
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useAppStore } from '@/stores/appStore';
import { Topic, TopicCategory } from '@/types/topics';

interface TopicFormProps {
  onSubmit: (topicData: unknown) => void;
  onCancel: () => void;
  initialData?: Partial<Topic>;
  categories: TopicCategory[];
  mode?: 'create' | 'edit';
  allowedTags?: string[];
  className?: string;
}

export function TopicForm({
  onSubmit,
  onCancel,
  initialData,
  categories,
  mode = 'create',
  allowedTags = [],
  className = '',
}: TopicFormProps) {
  const { addNotification } = useAppStore();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    categoryId: initialData?.categoryId || '',
    tags: initialData?.tags || [],
    initialPost: {
      title: '',
      content: '',
    },
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (mode === 'create' && !formData.initialPost.content.trim()) {
      newErrors.initialPostContent = 'Initial post content is required';
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
      const topicData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        tags: formData.tags.filter(tag => tag.trim().length > 0),
        ...(mode === 'create' && {
          initialPost: {
            title: formData.initialPost.title.trim() || formData.title.trim(),
            content: formData.initialPost.content.trim(),
          }
        })
      };
      
      await onSubmit(topicData);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Submission Error',
        message: 'Failed to submit topic. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: unknown) => {
    if (field.startsWith('initialPost.')) {
      const postField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        initialPost: {
          ...prev.initialPost,
          [postField as string]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field as string]: value
      }));
    }
    
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
    return mode === 'edit' ? 'Edit Topic' : 'Create New Topic';
  };

  return (
    <Card variant="bordered" className={className}>
      <CardHeader className="pb-4">
        <h3 className="text-lg font-bold text-light-text">{getTitle()}</h3>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">
              Topic Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter a descriptive title for your topic..."
              className={`w-full px-3 py-2 bg-dark-bg border rounded-md text-light-text placeholder-muted-light focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent ${
                errors.title ? 'border-rejected-red' : 'border-muted/30'
              }`}
              maxLength={200}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-rejected-red">{errors.title}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide a brief description of what this topic is about..."
              rows={4}
              className={`w-full px-3 py-2 bg-dark-bg border rounded-md text-light-text placeholder-muted-light focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent resize-vertical ${
                errors.description ? 'border-rejected-red' : 'border-muted/30'
              }`}
              maxLength={1000}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-rejected-red">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-muted-light">
              {formData.description.length}/1000 characters
            </p>
          </div>

          {/* Category Field */}
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">
              Category *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => handleInputChange('categoryId', e.target.value)}
              className={`w-full px-3 py-2 bg-dark-bg border rounded-md text-light-text focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent ${
                errors.categoryId ? 'border-rejected-red' : 'border-muted/30'
              }`}
            >
              <option value="">Select a category...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-rejected-red">{errors.categoryId}</p>
            )}
          </div>

          {/* Tags Field */}
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="Enter tags separated by commas (e.g., ai, robotics, discussion)..."
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

          {/* Initial Post (only for create mode) */}
          {mode === 'create' && (
            <div className="border-t border-muted/20 pt-6">
              <h4 className="text-md font-semibold text-light-text mb-4">
                Initial Post
              </h4>
              
              {/* Initial Post Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-light-text mb-2">
                  Post Title (optional)
                </label>
                <input
                  type="text"
                  value={formData.initialPost.title}
                  onChange={(e) => handleInputChange('initialPost.title', e.target.value)}
                  placeholder="Leave empty to use topic title..."
                  className="w-full px-3 py-2 bg-dark-bg border border-muted/30 rounded-md text-light-text placeholder-muted-light focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent"
                  maxLength={200}
                />
              </div>

              {/* Initial Post Content */}
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Post Content *
                </label>
                <textarea
                  value={formData.initialPost.content}
                  onChange={(e) => handleInputChange('initialPost.content', e.target.value)}
                  placeholder="Write the first post for this topic..."
                  rows={8}
                  className={`w-full px-3 py-2 bg-dark-bg border rounded-md text-light-text placeholder-muted-light focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent resize-vertical ${
                    errors.initialPostContent ? 'border-rejected-red' : 'border-muted/30'
                  }`}
                  maxLength={10000}
                />
                {errors.initialPostContent && (
                  <p className="mt-1 text-sm text-rejected-red">{errors.initialPostContent}</p>
                )}
                <p className="mt-1 text-xs text-muted-light">
                  {formData.initialPost.content.length}/10000 characters
                </p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-muted/20">
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
              disabled={isSubmitting || !formData.title.trim() || !formData.description.trim() || !formData.categoryId}
              className="flex items-center space-x-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              <span>
                {isSubmitting 
                  ? 'Creating...' 
                  : mode === 'edit' 
                  ? 'Update Topic' 
                  : 'Create Topic'
                }
              </span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
