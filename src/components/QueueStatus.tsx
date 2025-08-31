/**
 * Real-time queue status component.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useWebSocketContext } from './WebSocketProvider';

interface QueuePosition {
  queue_type: string;
  old_position: number | null;
  new_position: number;
  estimated_wait_time: number | null;
  total_queue_size: number;
}

interface QueueStatusProps {
  userId: string;
}

export function QueueStatus({ userId }: QueueStatusProps) {
  const { connected, subscribe, unsubscribe } = useWebSocketContext();
  const [queuePositions, setQueuePositions] = useState<Map<string, QueuePosition>>(new Map());
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const handleQueueUpdate = (data: unknown) => {
      setQueuePositions(prev => {
        const updated = new Map(prev);
        updated.set((data as QueuePosition).queue_type, data as QueuePosition);
        return updated;
      });
      setLastUpdate(new Date());
    };

    const handleQueueStatusChange = (data: unknown) => {
      // Handle general queue status changes
      setLastUpdate(new Date());
    };

    if (connected) {
      subscribe('queue_position_update', handleQueueUpdate);
      subscribe('queue_status_change', handleQueueStatusChange);
    }

    return () => {
      unsubscribe('queue_position_update', handleQueueUpdate);
      unsubscribe('queue_status_change', handleQueueStatusChange);
    };
  }, [connected, subscribe, unsubscribe]);

  const formatWaitTime = (seconds: number | null): string => {
    if (!seconds) return 'Unknown';
    
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getQueueDisplayName = (queueType: string): string => {
    switch (queueType) {
      case 'topic_creation': return 'Topic Creation';
      case 'post_moderation': return 'Post Moderation';
      case 'private_message': return 'Message Moderation';
      default: return queueType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  if (!connected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
          <span className="text-yellow-800">Connecting to real-time updates...</span>
        </div>
      </div>
    );
  }

  if (queuePositions.size === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
          <span className="text-green-800">No items in queue</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Queue Status</h3>
        <div className="flex items-center text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
          Live Updates
        </div>
      </div>

      <div className="space-y-3">
        {Array.from(queuePositions.entries()).map(([queueType, position]) => (
          <div key={queueType} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{getQueueDisplayName(queueType)}</h4>
              <span className="text-sm text-gray-500">
                Position {position.new_position} of {position.total_queue_size}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(5, (1 - (position.new_position - 1) / position.total_queue_size) * 100)}%`
                }}
              ></div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                {position.old_position && position.old_position !== position.new_position
                  ? `Moved from position ${position.old_position}`
                  : 'In queue'
                }
              </span>
              <span>
                Est. wait: {formatWaitTime(position.estimated_wait_time)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {lastUpdate && (
        <div className="text-xs text-gray-500 text-center">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
