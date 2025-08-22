/**
 * WebSocket connection monitoring and performance dashboard component.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useWebSocketContext } from './WebSocketProvider';

interface ConnectionStats {
  connected: boolean;
  connectionTime: number | null;
  reconnectCount: number;
  messagesSent: number;
  messagesReceived: number;
  latency: number | null;
  lastPing: number | null;
  subscriptions: string[];
  channels: string[];
}

interface WebSocketMonitorProps {
  showDetails?: boolean;
  className?: string;
}

export function WebSocketMonitor({ showDetails = false, className = '' }: WebSocketMonitorProps) {
  const { connected, subscribe, unsubscribe } = useWebSocketContext();
  const [stats, setStats] = useState<ConnectionStats>({
    connected: false,
    connectionTime: null,
    reconnectCount: 0,
    messagesSent: 0,
    messagesReceived: 0,
    latency: null,
    lastPing: null,
    subscriptions: [],
    channels: []
  });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let pingInterval: NodeJS.Timeout;
    let connectionStartTime = Date.now();

    const updateStats = () => {
      setStats(prev => ({
        ...prev,
        connected,
        connectionTime: connected ? connectionStartTime : null,
        lastPing: Date.now()
      }));
    };

    const handleMessage = () => {
      setStats(prev => ({
        ...prev,
        messagesReceived: prev.messagesReceived + 1
      }));
    };

    const handleConnectionStats = (data: any) => {
      setStats(prev => ({
        ...prev,
        ...data
      }));
    };

    if (connected) {
      updateStats();
      pingInterval = setInterval(() => {
        const pingStart = Date.now();
        // Send ping and measure latency
        setStats(prev => ({
          ...prev,
          messagesSent: prev.messagesSent + 1
        }));
        
        // Simulate latency measurement (in real implementation, this would be handled by the WebSocket client)
        setTimeout(() => {
          setStats(prev => ({
            ...prev,
            latency: Date.now() - pingStart,
            lastPing: Date.now()
          }));
        }, 10);
      }, 30000); // Ping every 30 seconds

      subscribe('connection_stats', handleConnectionStats);
      subscribe('*', handleMessage); // Listen to all messages for counting
    } else {
      connectionStartTime = Date.now();
      setStats(prev => ({
        ...prev,
        connected: false,
        connectionTime: null,
        reconnectCount: prev.reconnectCount + (prev.connected ? 1 : 0)
      }));
    }

    return () => {
      if (pingInterval) clearInterval(pingInterval);
      unsubscribe('connection_stats', handleConnectionStats);
      unsubscribe('*', handleMessage);
    };
  }, [connected, subscribe, unsubscribe]);

  const getConnectionStatusColor = (): string => {
    if (!stats.connected) return 'text-red-500';
    if (stats.latency && stats.latency > 1000) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getConnectionStatusText = (): string => {
    if (!stats.connected) return 'Disconnected';
    if (stats.latency && stats.latency > 1000) return 'Slow Connection';
    return 'Connected';
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatLatency = (ms: number | null): string => {
    if (ms === null) return 'N/A';
    if (ms < 100) return `${ms}ms`;
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      <div 
        className="p-3 cursor-pointer flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${stats.connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className={`text-sm font-medium ${getConnectionStatusColor()}`}>
            {getConnectionStatusText()}
          </span>
          {stats.latency && (
            <span className="text-xs text-gray-500">
              ({formatLatency(stats.latency)})
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {stats.reconnectCount > 0 && (
            <span className="text-xs text-orange-500">
              {stats.reconnectCount} reconnects
            </span>
          )}
          <svg 
            className={`w-4 h-4 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {(isExpanded || showDetails) && (
        <div className="px-3 pb-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">Connection Time</div>
              <div className="text-sm font-medium">
                {stats.connectionTime ? formatDuration(Date.now() - stats.connectionTime) : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Latency</div>
              <div className="text-sm font-medium">
                {formatLatency(stats.latency)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Messages Sent</div>
              <div className="text-sm font-medium">{stats.messagesSent}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Messages Received</div>
              <div className="text-sm font-medium">{stats.messagesReceived}</div>
            </div>
          </div>

          {stats.subscriptions.length > 0 && (
            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-2">Active Subscriptions</div>
              <div className="flex flex-wrap gap-1">
                {stats.subscriptions.map((sub, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          )}

          {stats.channels.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-2">Subscribed Channels</div>
              <div className="flex flex-wrap gap-1">
                {stats.channels.map((channel, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded"
                  >
                    {channel}
                  </span>
                ))}
              </div>
            </div>
          )}

          {stats.lastPing && (
            <div className="mt-3 text-xs text-gray-500">
              Last ping: {new Date(stats.lastPing).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface WebSocketHealthProps {
  className?: string;
}

export function WebSocketHealth({ className = '' }: WebSocketHealthProps) {
  const { connected } = useWebSocketContext();
  const [healthScore, setHealthScore] = useState<number>(100);
  const [issues, setIssues] = useState<string[]>([]);

  useEffect(() => {
    let score = 100;
    const currentIssues: string[] = [];

    if (!connected) {
      score -= 50;
      currentIssues.push('Connection lost');
    }

    // Add more health checks here based on your requirements
    // For example: high latency, frequent reconnects, etc.

    setHealthScore(score);
    setIssues(currentIssues);
  }, [connected]);

  const getHealthColor = (): string => {
    if (healthScore >= 80) return 'text-green-500';
    if (healthScore >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthStatus = (): string => {
    if (healthScore >= 80) return 'Healthy';
    if (healthScore >= 60) return 'Warning';
    return 'Critical';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        <div className={`w-2 h-2 rounded-full ${healthScore >= 80 ? 'bg-green-400' : healthScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
        <span className={`text-sm font-medium ${getHealthColor()}`}>
          {getHealthStatus()}
        </span>
        <span className="text-xs text-gray-500">
          ({healthScore}%)
        </span>
      </div>
      {issues.length > 0 && (
        <div className="text-xs text-red-500">
          {issues.join(', ')}
        </div>
      )}
    </div>
  );
}
