"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTopicCreationEligibility } from '@/hooks/useTopicCreationEligibility';
import { topicsApi } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface TopicCreationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface TopicFormData {
  title: string;
  description: string;
}

export function TopicCreationForm({ onSuccess, onCancel }: TopicCreationFormProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canCreate: canCreateTopic, reason, isLoading: eligibilityLoading } = useTopicCreationEligibility();
  
  const [formData, setFormData] = useState<TopicFormData>({
    title: '',
    description: '',
  });
  
  const [errors, setErrors] = useState<Partial<TopicFormData>>({});
  const [showPreview, setShowPreview] = useState(false);

  const createTopicMutation = useMutation({
    mutationFn: (data: TopicFormData) => topicsApi.createTopic(data),
    onSuccess: (newTopic) => {
      // Invalidate topics queries to refresh the feed
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['topics', 'feed'] });
      
      // Reset form
      setFormData({ title: '', description: '' });
      setErrors({});
      
      // Navigate to the new topic or call success callback
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/topics/${newTopic.pk}`);
      }
    },
    onError: (error: any) => {
      console.error('Topic creation failed:', error);
      setErrors({
        title: error.response?.data?.detail || 'Failed to create topic. Please try again.',
      });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<TopicFormData> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Topic title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Topic title must be at least 10 characters';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Topic title must be less than 200 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Topic description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Topic description must be at least 50 characters';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Topic description must be less than 2000 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreateTopic) {
      setErrors({
        title: reason || 'You are not eligible to create topics.',
      });
      return;
    }
    
    if (validateForm()) {
      createTopicMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof TopicFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-overlord-card rounded-lg border border-overlord-border">
        <h2 className="text-2xl font-bold text-overlord-light-text mb-4">
          Authentication Required
        </h2>
        <p className="text-overlord-muted">
          You must be logged in to create topics. Please authenticate to continue.
        </p>
      </div>
    );
  }

  if (!canCreateTopic) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-overlord-card rounded-lg border border-overlord-border">
        <h2 className="text-2xl font-bold text-overlord-light-text mb-4">
          Topic Creation Restricted
        </h2>
        <p className="text-overlord-muted mb-6">
          {reason || 'You are not eligible to create topics at this time.'}
        </p>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-overlord-border text-overlord-light-text rounded hover:bg-overlord-border/80 transition-colors"
          >
            Back
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-overlord-card rounded-lg border border-overlord-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-overlord-light-text">
            Propose New Topic for Debate
          </h2>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 text-sm font-medium text-overlord-text bg-overlord-bg border border-overlord-border rounded-md hover:bg-overlord-border transition-colors duration-200"
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-overlord-text/70 hover:text-overlord-text transition-colors duration-200"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {showPreview ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-overlord-light-text mb-2">
                {formData.title || 'Topic Title'}
              </h3>
              <div className="text-overlord-muted whitespace-pre-wrap">
                {formData.description || 'Topic description will appear here...'}
              </div>
            </div>
            <div className="pt-4 border-t border-overlord-border">
              <p className="text-sm text-overlord-muted">
                <span className="text-overlord-accent">Note:</span> Your topic will be submitted to the Topic Approval Bureau 
                for evaluation by the Robot Overlord. It will be visible to all citizens during the review process.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-overlord-light-text mb-2">
                Topic Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-overlord-bg border border-overlord-border rounded-md text-overlord-light-text placeholder-overlord-muted focus:outline-none focus:ring-2 focus:ring-overlord-accent focus:border-transparent"
                placeholder="Enter a clear, compelling topic for debate..."
                maxLength={200}
                disabled={createTopicMutation.isPending}
              />
              <div className="flex justify-between mt-1">
                {errors.title && (
                  <p className="text-sm text-overlord-red">{errors.title}</p>
                )}
                <p className="text-xs text-overlord-muted ml-auto">
                  {formData.title.length}/200 characters
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-overlord-light-text mb-2">
                Topic Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={8}
                className="w-full px-3 py-2 bg-overlord-bg border border-overlord-border rounded-md text-overlord-light-text placeholder-overlord-muted focus:outline-none focus:ring-2 focus:ring-overlord-accent focus:border-transparent resize-vertical"
                placeholder="Provide a detailed description of the topic. Include context, key questions, and why this topic deserves the Overlord's attention..."
                maxLength={2000}
                disabled={createTopicMutation.isPending}
              />
              <div className="flex justify-between mt-1">
                {errors.description && (
                  <p className="text-sm text-overlord-red">{errors.description}</p>
                )}
                <p className="text-xs text-overlord-muted ml-auto">
                  {formData.description.length}/2000 characters
                </p>
              </div>
            </div>


            <div className="bg-overlord-bg/50 border border-overlord-border/50 rounded-md p-4">
              <h4 className="text-sm font-medium text-overlord-light-text mb-2">
                Submission Guidelines
              </h4>
              <ul className="text-xs text-overlord-muted space-y-1">
                <li>• Your topic will undergo immediate ToS violation screening</li>
                <li>• If approved for review, it becomes publicly visible during evaluation</li>
                <li>• The Robot Overlord will evaluate based on logic, relevance, and debate potential</li>
                <li>• Rejected topics are moved to your private Graveyard</li>
                <li>• Only approved topics can receive citizen posts</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-overlord-border">
              <button
                type="submit"
                disabled={createTopicMutation.isPending || !formData.title.trim() || !formData.description.trim()}
                className="px-6 py-2 bg-overlord-accent text-overlord-dark-bg font-medium rounded-md hover:bg-overlord-accent/90 focus:outline-none focus:ring-2 focus:ring-overlord-accent focus:ring-offset-2 focus:ring-offset-overlord-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {createTopicMutation.isPending ? 'Submitting...' : 'Submit to Overlord'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
