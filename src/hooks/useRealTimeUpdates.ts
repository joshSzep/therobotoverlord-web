/**
 * Real-time updates hook for The Robot Overlord
 * Handles WebSocket events for posts, moderation, and notifications
 */

"use client";

import { useCallback, useEffect } from "react";
import { useAppStore } from "@/stores/appStore";

import { User } from "@/types/user";
import { useWebSocketContext } from "@/components/MockWebSocketProvider";

export interface RealTimeEvent {
  type: string;
  data: unknown;
  timestamp: string;
  userId?: string;
}

// Simplified post interface for real-time updates
export interface PostData {
  id: string;
  title?: string;
  content: string;
  author_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Simplified topic interface for real-time updates
export interface TopicData {
  id: string;
  title: string;
  description?: string;
  author_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PostUpdateEvent {
  type:
    | "post_created"
    | "post_updated"
    | "post_deleted"
    | "post_approved"
    | "post_rejected";
  post: PostData;
  moderatorId?: string;
  reason?: string;
}

export interface TopicUpdateEvent {
  type: "topic_created" | "topic_updated" | "topic_deleted";
  topic: TopicData;
}

export interface ModerationEvent {
  type: "moderation_queue_updated" | "post_flagged" | "user_sanctioned";
  data: {
    postId?: string;
    userId?: string;
    action?: string;
    reason?: string;
    moderatorId?: string;
  };
}

export interface NotificationEvent {
  type: "notification_created" | "badge_earned" | "rank_changed";
  data: {
    id: string;
    title: string;
    message: string;
    category: "system" | "moderation" | "achievement" | "social";
    priority: "low" | "medium" | "high";
    actionUrl?: string;
    metadata?: Record<string, unknown>;
  };
}

export interface UserActivityEvent {
  type: "user_online" | "user_offline" | "user_typing";
  userId: string;
  data?: {
    topicId?: string;
    lastSeen?: string;
  };
}

export function useRealTimeUpdates() {
  const { connected, subscribe, unsubscribe, subscribeToChannel } =
    useWebSocketContext();
  const { addNotification } = useAppStore();

  // Handle post updates
  const handlePostUpdate = useCallback(
    (data: unknown) => {
      const event = data as PostUpdateEvent;
      switch (event.type) {
        case "post_created":
          addNotification({
            type: "info",
            title: "New Post",
            message: `New post created: "${event.post.title?.slice(0, 50)}..."`,
          });
          break;

        case "post_approved":
          if (event.post.author_id === "current-user") {
            // Replace with actual user ID check
            addNotification({
              type: "success",
              title: "Post Approved! 🎉",
              message: `Your post "${event.post.title?.slice(0, 50)}..." has been approved by the Robot Overlord.`,
            });
          }
          // Post update would be handled by individual components
          break;

        case "post_rejected":
          if (event.post.author_id === "current-user") {
            addNotification({
              type: "error",
              title: "Post Rejected",
              message: `Your post was rejected. Reason: ${event.reason || "No reason provided"}`,
            });
          }
          // Post update would be handled by individual components
          break;

        case "post_updated":
          // Post update would be handled by individual components
          break;

        case "post_deleted":
          // Handle post deletion
          break;
      }
    },
    [addNotification]
  );

  // Handle topic updates
  const handleTopicUpdate = useCallback(
    (data: unknown) => {
      const event = data as TopicUpdateEvent;
      switch (event.type) {
        case "topic_created":
          addNotification({
            type: "info",
            title: "New Topic",
            message: `New topic created: "${event.topic.title}"`,
          });
          break;

        case "topic_updated":
          // Topic update would be handled by individual components
          break;

        case "topic_deleted":
          // Handle topic deletion
          break;
      }
    },
    [addNotification]
  );

  // Handle moderation events
  const handleModerationEvent = useCallback(
    (data: unknown) => {
      const event = data as ModerationEvent;
      switch (event.type) {
        case "moderation_queue_updated":
          addNotification({
            type: "warning",
            title: "Moderation Queue Updated",
            message: "New items require moderation attention.",
          });
          break;

        case "post_flagged":
          addNotification({
            type: "warning",
            title: "Post Flagged",
            message: `A post has been flagged for review: ${event.data.reason}`,
          });
          break;

        case "user_sanctioned":
          addNotification({
            type: "error",
            title: "User Sanctioned",
            message: `User action taken: ${event.data.action}`,
          });
          break;
      }
    },
    [addNotification]
  );

  // Handle notifications
  const handleNotification = useCallback(
    (data: unknown) => {
      const event = data as NotificationEvent;
      const notificationType =
        event.data.priority === "high"
          ? "error"
          : event.data.priority === "medium"
            ? "warning"
            : "info";

      switch (event.type) {
        case "badge_earned":
          addNotification({
            type: "success",
            title: "🏆 Badge Earned!",
            message: event.data.message,
            duration: 8000, // Longer duration for achievements
          });
          break;

        case "rank_changed":
          addNotification({
            type: "info",
            title: "📈 Rank Updated",
            message: event.data.message,
          });
          break;

        case "notification_created":
          addNotification({
            type: notificationType,
            title: event.data.title,
            message: event.data.message,
          });
          break;
      }
    },
    [addNotification]
  );

  // Handle user activity
  const handleUserActivity = useCallback((data: unknown) => {
    const event = data as UserActivityEvent;
    // This could be used for showing online status, typing indicators, etc.
    // For now, we'll just log it
    console.log("User activity:", event);
  }, []);

  // Subscribe to real-time events
  useEffect(() => {
    if (!connected) return;

    // Subscribe to various event types
    subscribe("post_update", handlePostUpdate);
    subscribe("topic_update", handleTopicUpdate);
    subscribe("moderation_event", handleModerationEvent);
    subscribe("notification", handleNotification);
    subscribe("user_activity", handleUserActivity);

    // Subscribe to relevant channels
    subscribeToChannel("posts");
    subscribeToChannel("topics");
    subscribeToChannel("moderation");
    subscribeToChannel("notifications");
    subscribeToChannel("user_activity");

    return () => {
      unsubscribe("post_update", handlePostUpdate);
      unsubscribe("topic_update", handleTopicUpdate);
      unsubscribe("moderation_event", handleModerationEvent);
      unsubscribe("notification", handleNotification);
      unsubscribe("user_activity", handleUserActivity);
    };
  }, [
    connected,
    subscribe,
    unsubscribe,
    subscribeToChannel,
    handlePostUpdate,
    handleTopicUpdate,
    handleModerationEvent,
    handleNotification,
    handleUserActivity,
  ]);

  return {
    connected,
    isRealTimeEnabled: connected,
  };
}

// Hook for specific post updates
export function usePostRealTimeUpdates(postId?: string) {
  const { connected, subscribe, unsubscribe } = useWebSocketContext();
  const { addNotification } = useAppStore();

  useEffect(() => {
    if (!connected || !postId) return;

    const handlePostSpecificUpdate = (data: unknown) => {
      const event = data as PostUpdateEvent;
      if (event.post.id === postId) {
        // Notify about post updates for the specific post
        addNotification({
          type: "info",
          title: "Post Updated",
          message: "This post has been updated.",
        });
      }
    };

    subscribe("post_update", handlePostSpecificUpdate);

    return () => {
      unsubscribe("post_update", handlePostSpecificUpdate);
    };
  }, [connected, postId, subscribe, unsubscribe, addNotification]);

  return {
    connected,
  };
}

// Hook for moderation queue real-time updates
export function useModerationRealTimeUpdates() {
  const { connected, subscribe, unsubscribe, subscribeToChannel } =
    useWebSocketContext();
  const { addNotification } = useAppStore();

  useEffect(() => {
    if (!connected) return;

    const handleModerationUpdate = (data: unknown) => {
      const event = data as ModerationEvent;
      if (event.type === "moderation_queue_updated") {
        addNotification({
          type: "warning",
          title: "Moderation Required",
          message: "New items in moderation queue require attention.",
        });
      }
    };

    subscribe("moderation_event", handleModerationUpdate);
    subscribeToChannel("moderation");

    return () => {
      unsubscribe("moderation_event", handleModerationUpdate);
    };
  }, [connected, subscribe, unsubscribe, subscribeToChannel, addNotification]);

  return {
    connected,
  };
}
