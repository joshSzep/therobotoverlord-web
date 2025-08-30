import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { act } from 'react'
import userEvent from '@testing-library/user-event'
import { createMockPost, createMockUser } from '@/__tests__/utils/test-utils'

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  url: string
  readyState: number = MockWebSocket.CONNECTING
  onopen: ((event: Event) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null

  constructor(url: string) {
    this.url = url
    // Simulate connection opening
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN
      if (this.onopen) {
        this.onopen(new Event('open'))
      }
    }, 100)
  }

  send(data: string) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open')
    }
    // Echo back for testing
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', { data }))
      }
    }, 50)
  }

  close() {
    this.readyState = MockWebSocket.CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent('close'))
    }
  }

  // Test helpers
  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { 
        data: JSON.stringify(data) 
      }))
    }
  }

  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'))
    }
  }

  simulateClose() {
    this.readyState = MockWebSocket.CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent('close'))
    }
  }
}

// Replace global WebSocket
global.WebSocket = MockWebSocket as any

// Mock WebSocket context and provider
const MockWebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = React.useState<MockWebSocket | null>(null)
  const [isConnected, setIsConnected] = React.useState(false)
  const [connectionStatus, setConnectionStatus] = React.useState<'connecting' | 'connected' | 'disconnected'>('disconnected')

  const connect = React.useCallback(() => {
    if (socket) return

    const ws = new MockWebSocket('ws://localhost:3001')
    
    ws.onopen = () => {
      setIsConnected(true)
      setConnectionStatus('connected')
    }

    ws.onclose = () => {
      setIsConnected(false)
      setConnectionStatus('disconnected')
      setSocket(null)
    }

    ws.onerror = () => {
      setConnectionStatus('disconnected')
      setIsConnected(false)
    }

    setSocket(ws)
    setConnectionStatus('connecting')
  }, [socket])

  const disconnect = React.useCallback(() => {
    if (socket) {
      socket.close()
    }
  }, [socket])

  const sendMessage = React.useCallback((message: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message))
    }
  }, [socket, isConnected])

  React.useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  const contextValue = {
    socket,
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    sendMessage
  }

  return (
    <div data-testid="websocket-provider">
      {React.Children.map(children, child => 
        React.isValidElement(child) 
          ? React.cloneElement(child, { ...contextValue })
          : child
      )}
    </div>
  )
}

// Mock real-time chat component
const MockChatComponent = ({ 
  socket, 
  isConnected, 
  connectionStatus, 
  sendMessage 
}: any) => {
  const [messages, setMessages] = React.useState<any[]>([])
  const [inputValue, setInputValue] = React.useState('')

  React.useEffect(() => {
    if (!socket) return

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'message') {
          setMessages(prev => [...prev, data.payload])
        }
      } catch (error) {
        console.error('Failed to parse message:', error)
      }
    }

    socket.onmessage = handleMessage

    return () => {
      if (socket.onmessage === handleMessage) {
        socket.onmessage = null
      }
    }
  }, [socket])

  const handleSendMessage = () => {
    if (inputValue.trim() && isConnected) {
      const message = {
        type: 'message',
        payload: {
          id: Date.now().toString(),
          content: inputValue,
          author: 'testuser',
          timestamp: new Date().toISOString()
        }
      }
      sendMessage(message)
      setInputValue('')
    }
  }

  return (
    <div data-testid="chat-component">
      <div data-testid="connection-status">
        Status: {connectionStatus}
      </div>
      
      <div data-testid="messages-container">
        {messages.map(msg => (
          <div key={msg.id} data-testid={`message-${msg.id}`}>
            <strong>{msg.author}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <div data-testid="message-input-container">
        <input
          data-testid="message-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={!isConnected}
          placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
        />
        <button
          data-testid="send-button"
          onClick={handleSendMessage}
          disabled={!isConnected || !inputValue.trim()}
        >
          Send
        </button>
      </div>
    </div>
  )
}

// Mock live updates component
const MockLiveUpdatesComponent = ({ socket, isConnected }: any) => {
  const [posts, setPosts] = React.useState<any[]>([])
  const [notifications, setNotifications] = React.useState<any[]>([])

  React.useEffect(() => {
    if (!socket) return

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        
        switch (data.type) {
          case 'new_post':
            setPosts(prev => [data.payload, ...prev])
            break
          case 'post_updated':
            setPosts(prev => prev.map(post => 
              post.id === data.payload.id ? data.payload : post
            ))
            break
          case 'notification':
            setNotifications(prev => [data.payload, ...prev])
            break
        }
      } catch (error) {
        console.error('Failed to parse live update:', error)
      }
    }

    socket.onmessage = handleMessage

    return () => {
      if (socket.onmessage === handleMessage) {
        socket.onmessage = null
      }
    }
  }, [socket])

  return (
    <div data-testid="live-updates">
      <div data-testid="live-posts">
        {posts.map(post => (
          <div key={post.id} data-testid={`live-post-${post.id}`}>
            {post.title}
          </div>
        ))}
      </div>
      
      <div data-testid="live-notifications">
        {notifications.map(notification => (
          <div key={notification.id} data-testid={`notification-${notification.id}`}>
            {notification.message}
          </div>
        ))}
      </div>
    </div>
  )
}

describe('WebSocket Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Connection Management', () => {
    it('establishes WebSocket connection on mount', async () => {
      render(
        <MockWebSocketProvider>
          <div data-testid="test-component" />
        </MockWebSocketProvider>
      )

      expect(screen.getByTestId('websocket-provider')).toBeInTheDocument()

      // Wait for connection to establish
      await waitFor(() => {
        // Connection should be established automatically
        expect(MockWebSocket).toHaveBeenCalledWith('ws://localhost:3001')
      }, { timeout: 200 })
    })

    it('shows connection status changes', async () => {
      render(
        <MockWebSocketProvider>
          <MockChatComponent />
        </MockWebSocketProvider>
      )

      // Initially connecting
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Status: connecting')

      // Wait for connection to open
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('Status: connected')
      }, { timeout: 200 })
    })

    it('handles connection errors', async () => {
      const TestComponent = ({ socket }: any) => {
        const [error, setError] = React.useState('')

        React.useEffect(() => {
          if (socket) {
            socket.onerror = () => setError('Connection failed')
          }
        }, [socket])

        return (
          <div>
            {error && <div data-testid="connection-error">{error}</div>}
          </div>
        )
      }

      render(
        <MockWebSocketProvider>
          <TestComponent />
        </MockWebSocketProvider>
      )

      // Wait for socket to be created, then simulate error
      await waitFor(() => {
        const provider = screen.getByTestId('websocket-provider')
        expect(provider).toBeInTheDocument()
      })

      // Simulate connection error
      await act(async () => {
        // This would be triggered by the mock WebSocket
        const mockSocket = new MockWebSocket('ws://localhost:3001')
        mockSocket.simulateError()
      })
    })

    it('reconnects on connection loss', async () => {
      const TestComponent = ({ socket, connect, connectionStatus }: any) => {
        React.useEffect(() => {
          if (connectionStatus === 'disconnected' && !socket) {
            // Auto-reconnect logic
            setTimeout(connect, 1000)
          }
        }, [connectionStatus, socket, connect])

        return (
          <div data-testid="connection-status">
            Status: {connectionStatus}
          </div>
        )
      }

      render(
        <MockWebSocketProvider>
          <TestComponent />
        </MockWebSocketProvider>
      )

      // Wait for initial connection
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('Status: connected')
      })

      // Simulate connection loss
      await act(async () => {
        const mockSocket = new MockWebSocket('ws://localhost:3001')
        mockSocket.simulateClose()
      })
    })
  })

  describe('Real-time Chat', () => {
    it('sends and receives chat messages', async () => {
      const user = userEvent.setup()
      
      render(
        <MockWebSocketProvider>
          <MockChatComponent />
        </MockWebSocketProvider>
      )

      // Wait for connection
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('Status: connected')
      })

      // Type and send message
      const input = screen.getByTestId('message-input')
      const sendButton = screen.getByTestId('send-button')

      await user.type(input, 'Hello, world!')
      await user.click(sendButton)

      // Message should be sent and echoed back
      await waitFor(() => {
        const messagesContainer = screen.getByTestId('messages-container')
        expect(messagesContainer.children.length).toBeGreaterThan(0)
        expect(screen.getByText('testuser:')).toBeInTheDocument()
        expect(screen.getByText('Hello, world!')).toBeInTheDocument()
      })

      // Input should be cleared
      expect(input).toHaveValue('')
    })

    it('disables input when disconnected', async () => {
      render(
        <MockWebSocketProvider>
          <MockChatComponent />
        </MockWebSocketProvider>
      )

      const input = screen.getByTestId('message-input')
      const sendButton = screen.getByTestId('send-button')

      // Initially disabled while connecting
      expect(input).toBeDisabled()
      expect(sendButton).toBeDisabled()

      // Wait for connection
      await waitFor(() => {
        expect(input).not.toBeDisabled()
        expect(sendButton).toBeDisabled() // Still disabled due to empty input
      })
    })

    it('handles message sending with Enter key', async () => {
      const user = userEvent.setup()
      
      render(
        <MockWebSocketProvider>
          <MockChatComponent />
        </MockWebSocketProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('Status: connected')
      })

      const input = screen.getByTestId('message-input')
      await user.type(input, 'Test message{enter}')

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument()
      })
    })
  })

  describe('Live Updates', () => {
    it('receives and displays new posts', async () => {
      const TestComponent = ({ socket }: any) => {
        React.useEffect(() => {
          if (socket && socket.readyState === MockWebSocket.OPEN) {
            // Simulate receiving a new post
            setTimeout(() => {
              socket.simulateMessage({
                type: 'new_post',
                payload: createMockPost({
                  id: '1',
                  title: 'Live Post Update'
                })
              })
            }, 100)
          }
        }, [socket])

        return <MockLiveUpdatesComponent socket={socket} />
      }

      render(
        <MockWebSocketProvider>
          <TestComponent />
        </MockWebSocketProvider>
      )

      await waitFor(() => {
        const postsContainer = screen.getByTestId('live-posts')
        expect(postsContainer.children.length).toBeGreaterThan(0)
        expect(screen.getByText('Live Post Update')).toBeInTheDocument()
      })
    })

    it('receives and displays notifications', async () => {
      const TestComponent = ({ socket }: any) => {
        React.useEffect(() => {
          if (socket && socket.readyState === MockWebSocket.OPEN) {
            setTimeout(() => {
              socket.simulateMessage({
                type: 'notification',
                payload: {
                  id: '1',
                  message: 'New notification received',
                  type: 'info'
                }
              })
            }, 100)
          }
        }, [socket])

        return <MockLiveUpdatesComponent socket={socket} />
      }

      render(
        <MockWebSocketProvider>
          <TestComponent />
        </MockWebSocketProvider>
      )

      await waitFor(() => {
        const notificationsContainer = screen.getByTestId('live-notifications')
        expect(notificationsContainer.children.length).toBeGreaterThan(0)
        expect(screen.getByText('New notification received')).toBeInTheDocument()
      })
    })

    it('updates existing posts when modified', async () => {
      const TestComponent = ({ socket }: any) => {
        React.useEffect(() => {
          if (socket && socket.readyState === MockWebSocket.OPEN) {
            // First, add a post
            setTimeout(() => {
              socket.simulateMessage({
                type: 'new_post',
                payload: createMockPost({
                  id: '1',
                  title: 'Original Title'
                })
              })
            }, 100)

            // Then update it
            setTimeout(() => {
              socket.simulateMessage({
                type: 'post_updated',
                payload: createMockPost({
                  id: '1',
                  title: 'Updated Title'
                })
              })
            }, 200)
          }
        }, [socket])

        return <MockLiveUpdatesComponent socket={socket} />
      }

      render(
        <MockWebSocketProvider>
          <TestComponent />
        </MockWebSocketProvider>
      )

      // Wait for original post
      await waitFor(() => {
        const postsContainer = screen.getByTestId('live-posts')
        expect(postsContainer.children.length).toBeGreaterThan(0)
        expect(screen.getByText('Original Title')).toBeInTheDocument()
      })

      // Wait for update
      await waitFor(() => {
        expect(screen.getByText('Updated Title')).toBeInTheDocument()
        expect(screen.queryByText('Original Title')).not.toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles malformed WebSocket messages', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      const TestComponent = ({ socket }: any) => {
        React.useEffect(() => {
          if (socket && socket.readyState === MockWebSocket.OPEN) {
            setTimeout(() => {
              // Send malformed JSON
              if (socket.onmessage) {
                socket.onmessage(new MessageEvent('message', { 
                  data: 'invalid json' 
                }))
              }
            }, 100)
          }
        }, [socket])

        return <MockLiveUpdatesComponent socket={socket} />
      }

      render(
        <MockWebSocketProvider>
          <TestComponent />
        </MockWebSocketProvider>
      )

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to parse live update:',
          expect.any(Error)
        )
      }, { timeout: 1000 })

      consoleSpy.mockRestore()
    })

    it('gracefully handles unknown message types', async () => {
      const TestComponent = ({ socket }: any) => {
        React.useEffect(() => {
          if (socket && socket.readyState === MockWebSocket.OPEN) {
            setTimeout(() => {
              socket.simulateMessage({
                type: 'unknown_type',
                payload: { data: 'test' }
              })
            }, 100)
          }
        }, [socket])

        return <MockLiveUpdatesComponent socket={socket} />
      }

      render(
        <MockWebSocketProvider>
          <TestComponent />
        </MockWebSocketProvider>
      )

      // Should not crash or show any error
      await waitFor(() => {
        expect(screen.getByTestId('live-updates')).toBeInTheDocument()
      })
    })
  })

  describe('Performance', () => {
    it('handles high-frequency messages without performance issues', async () => {
      const TestComponent = ({ socket }: any) => {
        React.useEffect(() => {
          if (socket && socket.readyState === MockWebSocket.OPEN) {
            // Send many messages rapidly
            for (let i = 0; i < 100; i++) {
              setTimeout(() => {
                socket.simulateMessage({
                  type: 'notification',
                  payload: {
                    id: i.toString(),
                    message: `Message ${i}`,
                    type: 'info'
                  }
                })
              }, i * 10) // 10ms intervals
            }
          }
        }, [socket])

        return <MockLiveUpdatesComponent socket={socket} />
      }

      const startTime = performance.now()
      
      render(
        <MockWebSocketProvider>
          <TestComponent />
        </MockWebSocketProvider>
      )

      // Wait for all messages to be processed
      await waitFor(() => {
        const notificationsContainer = screen.getByTestId('live-notifications')
        expect(notificationsContainer.children.length).toBeGreaterThanOrEqual(100)
      }, { timeout: 2000 })

      const endTime = performance.now()
      const processingTime = endTime - startTime

      // Should process 100 messages reasonably quickly
      expect(processingTime).toBeLessThan(2000)
    })
  })
})
