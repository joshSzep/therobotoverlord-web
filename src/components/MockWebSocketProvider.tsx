/**
 * Mock WebSocket Provider for visitor browsing mode
 * Provides a non-functional WebSocket context to prevent errors
 */

"use client";

import React, { createContext, useContext } from "react";

interface WebSocketContextType {
  connected: boolean;
  client: null;
  subscribe: (eventType: string, handler: (data: unknown) => void) => void;
  unsubscribe: (eventType: string, handler: (data: unknown) => void) => void;
  subscribeToChannel: (channel: string) => void;
  sendChatMessage: (message: string, conversationId?: string) => void;
}

const MockWebSocketContext = createContext<WebSocketContextType | null>(null);

interface MockWebSocketProviderProps {
  children: React.ReactNode;
}

export function MockWebSocketProvider({
  children,
}: MockWebSocketProviderProps) {
  const contextValue: WebSocketContextType = {
    connected: false,
    client: null,
    subscribe: () => {}, // No-op for visitor mode
    unsubscribe: () => {}, // No-op for visitor mode
    subscribeToChannel: () => {}, // No-op for visitor mode
    sendChatMessage: () => {}, // No-op for visitor mode
  };

  return (
    <MockWebSocketContext.Provider value={contextValue}>
      {children}
    </MockWebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(MockWebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
}
