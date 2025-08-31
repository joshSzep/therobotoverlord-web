/**
 * WebSocket client for real-time updates in The Robot Overlord platform.
 */

export interface WebSocketMessage {
  event_type: string;
  data: unknown;
  timestamp: string;
  user_id?: string;
  message_id?: string;
}

export interface WebSocketConfig {
  url: string;
  token: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private eventHandlers: Map<string, Set<(data: unknown) => void>> = new Map();
  private connectionHandlers: Set<(connected: boolean) => void> = new Set();

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      ...config,
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || this.isConnected()) {
        resolve();
        return;
      }

      this.isConnecting = true;
      const wsUrl = `${this.config.url}?token=${encodeURIComponent(this.config.token)}`;
      
      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.notifyConnectionHandlers(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.ws = null;
          this.notifyConnectionHandlers(false);
          
          if (event.code !== 1000) { // Not a normal closure
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  send(message: unknown): void {
    if (!this.isConnected()) {
      console.warn('WebSocket not connected, message not sent:', message);
      return;
    }

    try {
      this.ws!.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
    }
  }

  subscribe(eventType: string, handler: (data: unknown) => void): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);
  }

  unsubscribe(eventType: string, handler: (data: unknown) => void): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(eventType);
      }
    }
  }

  onConnectionChange(handler: (connected: boolean) => void): void {
    this.connectionHandlers.add(handler);
  }

  offConnectionChange(handler: (connected: boolean) => void): void {
    this.connectionHandlers.delete(handler);
  }

  subscribeToChannel(channel: string): void {
    this.send({
      type: 'subscribe',
      channel: channel,
    });
  }

  unsubscribeFromChannel(channel: string): void {
    this.send({
      type: 'unsubscribe',
      channel: channel,
    });
  }

  sendChatMessage(message: string, conversationId?: string): void {
    this.send({
      type: 'chat_message',
      message: message,
      conversation_id: conversationId,
    });
  }

  ping(): void {
    this.send({ type: 'ping' });
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.eventHandlers.get(message.event_type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message.data);
        } catch (error) {
          console.error(`Error in WebSocket handler for ${message.event_type}:`, error);
        }
      });
    }
  }

  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(connected);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts!) {
      console.error('Max reconnection attempts reached');
      return;
    }

    const delay = this.config.reconnectInterval! * Math.pow(2, this.reconnectAttempts);
    console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }
}

// React hook for WebSocket integration
import { useEffect, useRef, useState } from 'react';

export interface UseWebSocketOptions {
  url: string;
  token: string;
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const clientRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    const client = new WebSocketClient({
      url: options.url,
      token: options.token,
    });

    clientRef.current = client;

    client.onConnectionChange((isConnected) => {
      setConnected(isConnected);
      if (isConnected) {
        setError(null);
        options.onConnect?.();
      } else {
        options.onDisconnect?.();
      }
    });

    if (options.autoConnect !== false) {
      client.connect().catch(setError);
    }

    return () => {
      client.disconnect();
    };
  }, [options.url, options.token]);

  const subscribe = (eventType: string, handler: (data: unknown) => void) => {
    clientRef.current?.subscribe(eventType, handler);
  };

  const unsubscribe = (eventType: string, handler: (data: unknown) => void) => {
    clientRef.current?.unsubscribe(eventType, handler);
  };

  const send = (message: unknown) => {
    clientRef.current?.send(message);
  };

  const subscribeToChannel = (channel: string) => {
    clientRef.current?.subscribeToChannel(channel);
  };

  const sendChatMessage = (message: string, conversationId?: string) => {
    clientRef.current?.sendChatMessage(message, conversationId);
  };

  return {
    connected,
    error,
    subscribe,
    unsubscribe,
    send,
    subscribeToChannel,
    sendChatMessage,
    client: clientRef.current,
  };
}
