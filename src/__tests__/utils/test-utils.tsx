import React from 'react'
import { render as rtlRender, RenderOptions, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Types
interface Post {
  id: string
  title: string
  content: string
  author: string
  createdAt: string
  updatedAt: string
  tags: string[]
  category: string
}

interface User {
  id: string
  username: string
  email: string
  displayName: string
  avatar?: string
  bio?: string
  createdAt?: string
}

// Create stable mock functions to prevent re-renders


// Mock the AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    user: { id: '1', username: 'testuser', email: 'test@example.com', displayName: 'Test User' },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: jest.fn(),
    loginWithGoogle: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    updateProfile: jest.fn(),
    refreshToken: jest.fn(),
    clearError: jest.fn(),
    updateUser: jest.fn(),
  }),
  useRequireAuth: () => ({
    user: { id: '1', username: 'testuser', email: 'test@example.com', displayName: 'Test User' },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: jest.fn(),
    loginWithGoogle: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    updateProfile: jest.fn(),
    refreshToken: jest.fn(),
    clearError: jest.fn(),
    updateUser: jest.fn(),
  }),
}))

// Mock Zustand store
const mockAddNotification = jest.fn()
const mockSetSidebarOpen = jest.fn()
const mockToggleSidebar = jest.fn()

jest.mock('@/stores/appStore', () => ({
  useAppStore: () => ({
    addNotification: mockAddNotification,
    notifications: [],
    removeNotification: jest.fn(),
  }),
  useUI: () => ({
    ui: {
      sidebarOpen: false,
      theme: 'dark',
      isLoading: false,
    },
    setSidebarOpen: mockSetSidebarOpen,
    toggleSidebar: mockToggleSidebar,
    setTheme: jest.fn(),
    setLoading: jest.fn(),
  })
}))

// Mock API services with sample data
const mockPosts = [
  {
    id: '1',
    title: 'Test Post',
    content: 'Test content',
    author: 'testuser',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    tags: ['test'],
    category: 'general',
    score: 10
  }
]

jest.mock('@/services', () => ({
  postsService: {
    getFeed: jest.fn().mockResolvedValue({
      data: mockPosts,
      hasMore: true,
      total: 1
    })
  },
  topicsService: {
    getFeed: jest.fn().mockResolvedValue({
      data: [],
      hasMore: false,
      total: 0
    })
  }
}))

// Mock real-time updates hook
jest.mock('@/hooks/useRealTimeUpdates', () => ({
  useRealTimeUpdates: () => ({
    connected: true,
    isRealTimeEnabled: true,
    lastUpdate: null
  })
}))

// Basic mock provider for simple component tests
const MockProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

// Create a proper AuthContext mock

// Specialized mock provider for integration tests with stable state
export const IntegrationMockProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Create stable mock context value to prevent re-renders
  React.useMemo(() => ({
    user: { 
      id: '1', 
      username: 'testuser', 
      email: 'test@example.com', 
      displayName: 'Test User',
      name: 'Test User'
    },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: jest.fn(),
    loginWithGoogle: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    updateProfile: jest.fn(),
    refreshToken: jest.fn(),
    clearError: jest.fn(),
    updateUser: jest.fn(),
  }), []);

  return (
    <div data-testid="mock-provider-wrapper">
      {children}
    </div>
  )
}

// Custom render function that includes providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => rtlRender(ui, { wrapper: MockProviders, ...options })

// Integration test render function with stable providers
const integrationRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => rtlRender(ui, { wrapper: IntegrationMockProviders, ...options })

// Mock data creators
export const createMockPost = (overrides: Partial<Post> = {}): Post => ({
  id: '1',
  title: 'Test Post',
  content: 'Test content',
  author: 'testuser',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  tags: ['test'],
  category: 'general',
  ...overrides
})

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  displayName: 'Test User',
  avatar: '/avatars/default.png',
  bio: 'Test user bio',
  createdAt: '2023-01-01T00:00:00Z',
  ...overrides
})

export const createMockTopic = (overrides = {}) => ({
  id: '1',
  title: 'Test Topic',
  slug: 'test-topic',
  description: 'Test topic description',
  postCount: 10,
  ...overrides
})

// API response mocks
export const mockApiResponse = <T,>(data: T, delay = 0): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay)
  })
}

export const mockApiError = (message = 'API Error', delay = 0): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), delay)
  })
}

// Form helpers
export const fillForm = async (fields: Record<string, string>): Promise<void> => {
  const user = userEvent.setup()
  
  for (const [label, value] of Object.entries(fields)) {
    const input = screen.getByLabelText(new RegExp(label, 'i'))
    await user.clear(input)
    await user.type(input, value)
  }
}

export const submitForm = async (submitButton?: HTMLElement) => {
  const user = userEvent.setup()
  const button = submitButton || screen.getByRole('button', { name: /submit/i })
  await user.click(button)
}

// Accessibility helpers
export const expectAccessibleButton = (button: HTMLElement) => {
  expect(button).toHaveAttribute('type')
  expect(button).toHaveAttribute('aria-label')
  expect(button).not.toHaveAttribute('aria-disabled', 'true')
}

export const expectAccessibleLink = (link: HTMLElement) => {
  expect(link).toHaveAttribute('href')
  expect(link).toHaveAttribute('aria-label')
  expect(link).not.toHaveAttribute('aria-disabled', 'true')
}

export const expectAccessibleImage = (img: HTMLElement) => {
  expect(img).toHaveAttribute('alt')
}

// Performance helpers
export const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const start = performance.now()
  renderFn()
  await waitFor(() => {})
  return performance.now() - start
}

export const expectPerformance = (duration: number, maxDuration: number) => {
  expect(duration).toBeLessThan(maxDuration)
}

// Mock IntersectionObserver
export const mockIntersectionObserver = (isIntersecting = true) => {
  const mockObserver = {
    observe: jest.fn(),
    disconnect: jest.fn(),
    unobserve: jest.fn(),
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: jest.fn().mockImplementation((callback) => {
      callback([{ isIntersecting }])
      return mockObserver
    }),
  })

  return mockObserver
}

// Wait for async operations
export const waitForAsync = (ms = 0) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Custom matchers
export const customMatchers = {
  toHaveAccessibleName: (element: HTMLElement, name: string) => {
    const accessibleName = 
      element.textContent ||
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby')
    
    return {
      pass: accessibleName === name,
      message: () => `Expected element to have accessible name "${name}", but got "${accessibleName}"`
    }
  },
  
  toBeVisibleToScreenReader: (element: HTMLElement) => {
    const isHidden = 
      element.getAttribute('aria-hidden') === 'true' ||
      element.style.display === 'none' ||
      element.style.visibility === 'hidden'
    
    return {
      pass: !isHidden,
      message: () => `Expected element to be visible to screen readers`
    }
  }
}

// Re-export testing library functions
export { screen, waitFor, userEvent }
export { customRender as render, integrationRender }
