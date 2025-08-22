/**
 * WebSocket Provider component for real-time updates.
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWebSocket, WebSocketClient } from '@/lib/websocket';

interface WebSocketContextType {
  connected: boolean;
  client: WebSocketClient | null;
  subscribe: (eventType: string, handler: (data: any) => void) => void;
  unsubscribe: (eventType: string, handler: (data: any) => void) => void;
  subscribeToChannel: (channel: string) => void;
  sendChatMessage: (message: string, conversationId?: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: React.ReactNode;
  token: string;
}

export function WebSocketProvider({ children, token }: WebSocketProviderProps) {
  const [wsUrl, setWsUrl] = useState<string>('');

  useEffect(() => {
    // Determine WebSocket URL based on environment
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NODE_ENV === 'production' 
      ? 'api.therobotoverlord.com' 
      : 'localhost:8000';
    setWsUrl(`${protocol}//${host}/ws/connect`);
  }, []);

  const {
    connected,
    subscribe,
    unsubscribe,
    subscribeToChannel,
    sendChatMessage,
    client,
  } = useWebSocket({
    url: wsUrl,
    token,
    autoConnect: true,
    onConnect: () => {
      console.log('WebSocket connected successfully');
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
    },
  });

  const contextValue: WebSocketContextType = {
    connected,
    client,
    subscribe,
    unsubscribe,
    subscribeToChannel,
    sendChatMessage,
  };

  if (!wsUrl) {
    return <>{children}</>;
  }

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}
