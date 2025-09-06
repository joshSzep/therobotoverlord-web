"use client";

import React from "react";
import { StarburstBackground } from "@/components/overlord/StarburstBackground";
import type { Post, PostThread } from "@/types/api";

interface PostCardProps {
  post: Post | PostThread;
  className?: string;
  isReply?: boolean;
}

/**
 * PostCard Component - Displays individual post/comment with dystopian styling
 * Shows post content, author info, status, and Overlord feedback
 */
export const PostCard: React.FC<PostCardProps> = ({ post, className = "", isReply = false }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-status-approved-green';
      case 'rejected':
        return 'text-status-rejected-red';
      case 'pending':
        return 'text-status-pending-yellow';
      case 'in_transit':
        return 'text-status-transit-blue';
      default:
        return 'text-overlord-muted-light';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'APPROVED';
      case 'rejected':
        return 'REJECTED';
      case 'pending':
        return 'PENDING';
      case 'in_transit':
        return 'IN TRANSIT';
      default:
        return 'UNKNOWN';
    }
  };

  // Handle different post types
  const isPostThread = 'author_username' in post;
  const authorUsername = isPostThread ? post.author_username : post.author?.username;
  const authorLoyalty = isPostThread ? 'Unknown' : post.author?.loyalty_score;
  const replyCount = isPostThread ? post.reply_count : 0;
  
  // Check if this is a Robot Overlord post (no author)
  const isOverlordPost = !authorUsername;

  return (
    <div className={`relative ${isReply ? 'ml-8 border-l-2 border-overlord-gold/30 pl-4' : ''} ${className}`}>
      <StarburstBackground className="rounded-lg">
        <div className="relative bg-overlord-dark-bg/90 backdrop-blur-sm border border-overlord-gold/20 rounded-lg p-6 shadow-lg">
          
          {/* Author Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {isOverlordPost ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  <span className="text-overlord-gold font-overlord font-bold uppercase tracking-widest">
                    The Robot Overlord
                  </span>
                  <span className="text-overlord-red text-xs font-bold uppercase tracking-wider">
                    Official Response
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-overlord-muted-light">
                    Citizen: <span className="text-overlord-light-text font-medium">{authorUsername}</span>
                  </span>
                  <span className="text-overlord-muted-light">
                    Loyalty: <span className="text-overlord-gold">{authorLoyalty || 'Unknown'}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(post.status)} border border-current/30`}>
              {getStatusLabel(post.status)}
            </div>
          </div>

          {/* Post Content */}
          <div className="mb-4">
            <p className={`${isOverlordPost ? 'font-overlord text-overlord-gold' : 'text-overlord-light-text'} leading-relaxed`}>
              {post.content}
            </p>
          </div>

          {/* Overlord Feedback */}
          {post.overlord_feedback && (
            <div className="mb-4 p-4 bg-overlord-gold/10 border border-overlord-gold/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🤖</span>
                <span className="text-overlord-gold font-overlord font-bold text-sm uppercase tracking-widest">
                  Overlord Feedback
                </span>
              </div>
              <p className="text-overlord-gold font-overlord text-sm">
                {post.overlord_feedback}
              </p>
            </div>
          )}

          {/* Post Metadata */}
          <div className="flex items-center justify-between text-xs text-overlord-muted-light">
            <div className="flex items-center gap-4">
              <span>Submitted: {formatDate(post.submitted_at)}</span>
              {post.approved_at && (
                <span>Approved: {formatDate(post.approved_at)}</span>
              )}
            </div>
            
            {/* Reply Count (if available) */}
            {replyCount > 0 && (
              <span className="flex items-center gap-1">
                <span>💬</span>
                <span>{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
              </span>
            )}
          </div>
        </div>
      </StarburstBackground>
    </div>
  );
};
