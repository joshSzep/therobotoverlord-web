"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { StarburstBackground } from "@/components/overlord/StarburstBackground";
import type { Topic } from "@/types/api";

interface TopicCardProps {
  topic: Topic;
  className?: string;
}

/**
 * TopicCard Component - Displays individual topic with dystopian styling
 * Shows topic title, description, author, and metadata
 */
export const TopicCard: React.FC<TopicCardProps> = ({ topic, className = "" }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/topics/${topic.pk}`);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-status-approved-green';
      case 'rejected': return 'text-status-rejected-red';
      case 'pending': return 'text-status-warning-amber';
      default: return 'text-overlord-muted-light';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'APPROVED BY OVERLORD';
      case 'rejected': return 'REJECTED BY OVERLORD';
      case 'pending': return 'AWAITING JUDGMENT';
      default: return status.toUpperCase();
    }
  };

  return (
    <div 
      className={`relative bg-overlord-card-dark border-2 border-overlord-gold p-6 mb-6 rounded-lg overflow-hidden hover:border-overlord-red transition-colors cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <StarburstBackground />
      <div className="absolute inset-0 bg-overlord-card-dark/80" />
      <div className="relative z-10">
        {/* Topic Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold uppercase tracking-widest text-overlord-gold mb-2 font-display">
              {topic.title}
            </h2>
            <div className="flex items-center gap-4 text-sm">
              {!topic.created_by_overlord && topic.author_username ? (
                <>
                  <span className="text-overlord-muted-light">
                    Citizen: <span className="text-overlord-light-text font-medium">{topic.author_username}</span>
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  <span className="text-overlord-gold font-overlord font-bold uppercase tracking-widest">
                    The Robot Overlord
                  </span>
                  <span className="text-overlord-red text-xs font-bold uppercase tracking-wider">
                    Official Decree
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-xs font-bold uppercase tracking-wider ${getStatusColor(topic.status)}`}>
              {getStatusLabel(topic.status)}
            </div>
            {/* Status Badge */}
            <div className="absolute -top-2 -right-2 bg-overlord-gold text-overlord-dark px-2 py-1 text-xs font-bold uppercase tracking-wider clip-hexagon">
              {topic.status}
            </div>
          </div>
        </div>

        {/* Topic Description */}
        <p className="text-overlord-light-text leading-relaxed font-body mb-4">
          {topic.description}
        </p>

        {/* Topic Metadata */}
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-overlord-muted-light">
              <span>Posts: <span className="text-overlord-light-text">{topic.post_count}</span></span>
            </div>
          </div>
          <div className="text-overlord-muted-light">
            {formatDate(topic.created_at)}
          </div>
        </div>

        {/* Tags */}
        {topic.tags && topic.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {topic.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-overlord-surface-dark border border-overlord-gold/30 text-overlord-gold text-xs uppercase tracking-wider rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
