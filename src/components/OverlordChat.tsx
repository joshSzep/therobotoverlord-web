/**
 * Real-time Overlord chat component.
 */

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useWebSocketContext } from './WebSocketProvider';

interface ChatMessage {
  id: string;
  message: string;
  is_overlord: boolean;
  timestamp: string;
  response_to?: string;
}

interface OverlordChatProps {
  userId: string;
  conversationId?: string;
}

export function OverlordChat({ userId, conversationId }: OverlordChatProps) {
  const { connected, subscribe, unsubscribe, sendChatMessage } = useWebSocketContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOverlordMessage = (data: unknown) => {
      const newMessage: ChatMessage = {
        id: (data as any).metadata?.message_id || Date.now().toString(),
        message: (data as any).message,
        is_overlord: true,
        timestamp: (data as any).metadata?.timestamp || new Date().toISOString(),
        response_to: (data as any).response_to,
      };
      
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
      scrollToBottom();
    };

    if (connected) {
      subscribe('overlord_message', handleOverlordMessage);
    }

    return () => {
      unsubscribe('overlord_message', handleOverlordMessage);
    };
  }, [connected, subscribe, unsubscribe]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !connected) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      is_overlord: false,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Send message via WebSocket
    sendChatMessage(inputMessage, conversationId);
    
    setInputMessage('');
    scrollToBottom();
  };

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-96 bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm font-bold">RO</span>
          </div>
          <div>
            <h3 className="font-semibold">Robot Overlord</h3>
            <div className="flex items-center text-sm text-gray-500">
              <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              {connected ? 'Online' : 'Connecting...'}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-red-600 text-lg font-bold">RO</span>
            </div>
            <p>Start a conversation with the Robot Overlord</p>
            <p className="text-sm mt-1">Ask about your loyalty score, queue status, or platform rules</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.is_overlord ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.is_overlord
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-blue-600 text-white'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.message}</p>
              <p className={`text-xs mt-1 ${
                message.is_overlord ? 'text-gray-500' : 'text-blue-100'
              }`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={connected ? "Ask the Robot Overlord..." : "Connecting..."}
            disabled={!connected}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!connected || !inputMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
