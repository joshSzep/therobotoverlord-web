/**
 * Topic creation page for The Robot Overlord
 * Allows users to create new discussion topics
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopicForm } from '@/components/topics/TopicForm';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/stores/appStore';
import { topicsService } from '@/services';
import { TopicCategory } from '@/types/topics';
import { ApiResponse } from '@/types/api';

export default function CreateTopicPage() {
  const router = useRouter();
  const { addNotification } = useAppStore();
  
  const [categories, setCategories] = useState<TopicCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories
  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await topicsService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        throw new Error('Failed to load categories');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load categories';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error Loading Categories',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadCategories();
  }, []);

  // Handle topic creation
  const handleTopicSubmit = async (topicData: any) => {
    try {
      const response = await topicsService.createTopic(topicData);

      if (response.success && response.data) {
        addNotification({
          type: 'success',
          title: 'Topic Created',
          message: 'Your topic has been created successfully',
        });

        // Redirect to the new topic
        router.push(`/topics/${response.data.slug}`);
      } else {
        throw new Error('Failed to create topic');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create topic';
      addNotification({
        type: 'error',
        title: 'Topic Creation Error',
        message: errorMessage,
      });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/topics');
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
            <div className="h-4 bg-muted/20 rounded w-1/4"></div>
            <div className="h-10 bg-muted/20 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-light-text mb-2">
            Unable to Load Categories
          </h3>
          <p className="text-muted-light mb-6">
            {error}
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button variant="ghost" onClick={() => router.push('/topics')}>
              Back to Topics
            </Button>
            <Button variant="primary" onClick={loadCategories}>
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
          <h1 className="text-3xl font-bold text-light-text">Create New Topic</h1>
          <p className="text-muted-light mt-1">
            Start a new discussion in the Robot Overlord community
          </p>
        </div>
        <Button variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
      </div>

      {/* Topic Creation Form */}
      <TopicForm
        onSubmit={handleTopicSubmit}
        onCancel={handleCancel}
        categories={categories}
        mode="create"
      />
    </div>
  );
}
