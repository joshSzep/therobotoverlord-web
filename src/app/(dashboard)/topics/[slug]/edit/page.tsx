/**
 * Topic editing page for The Robot Overlord
 * Allows users to edit their existing topics
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TopicForm } from '@/components/topics/TopicForm';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/stores/appStore';
import { topicsService, categoriesService } from '@/services';
import { Topic, TopicCategory } from '@/types/topics';

export default function EditTopicPage() {
  const params = useParams();
  const router = useRouter();
  const { addNotification } = useAppStore();
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [categories, setCategories] = useState<TopicCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const topicSlug = params.slug as string;

  // Load topic and categories data
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load topic and categories in parallel
      const [topicResponse, categoriesResponse] = await Promise.all([
        topicsService.getTopic(topicSlug),
        categoriesService.getCategories()
      ]);

      if (topicResponse.success && topicResponse.data) {
        // Check if user can edit this topic
        if (!(topicResponse.data as any).userPermissions?.canEdit) {
          throw new Error('You do not have permission to edit this topic');
        }
        setTopic(topicResponse.data);
      } else {
        throw new Error('Topic not found');
      }

      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
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

  // Initial load
  useEffect(() => {
    loadData();
  }, [topicSlug]);

  // Handle topic update
  const handleTopicSubmit = async (topicData: any) => {
    if (!topic) return;

    try {
      const response = await topicsService.updateTopic(topic.id, topicData);

      if (response.success && response.data) {
        addNotification({
          type: 'success',
          title: 'Topic Updated',
          message: 'Your topic has been updated successfully',
        });

        // Redirect back to the topic
        router.push(`/topics/${response.data.slug}`);
      } else {
        throw new Error('Failed to update topic');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update topic';
      addNotification({
        type: 'error',
        title: 'Update Error',
        message: errorMessage,
      });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (topic) {
      router.push(`/topics/${topic.slug}`);
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

  if (error || !topic) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-light-text mb-2">
            Unable to Edit Topic
          </h3>
          <p className="text-muted-light mb-6">
            {error || 'The topic you are trying to edit does not exist or you do not have permission to edit it.'}
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              Go Back
            </Button>
            <Button variant="primary" onClick={loadData}>
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
          <h1 className="text-3xl font-bold text-light-text">Edit Topic</h1>
          <p className="text-muted-light mt-1">
            Make changes to your topic
          </p>
          <p className="text-sm text-muted-light mt-1">
            Topic:{' '}
            <span 
              className="text-overlord-red hover:underline cursor-pointer"
              onClick={() => router.push(`/topics/${topic.slug}`)}
            >
              {topic.title}
            </span>
          </p>
        </div>
        <Button variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
      </div>

      {/* Edit Form */}
      <TopicForm
        onSubmit={handleTopicSubmit}
        onCancel={handleCancel}
        categories={categories}
        initialData={topic}
        mode="edit"
      />
    </div>
  );
}
