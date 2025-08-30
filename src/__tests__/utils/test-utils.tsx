import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock providers for testing
const MockProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div data-testid="mock-providers">
      {children}
    </div>
  )
}

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { wrapper: MockProviders, ...options })
}

// Test utilities
export const createMockUser = (overrides = {}) => ({
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  avatar: '/images/avatar.png',
  role: 'user',
  createdAt: new Date().toISOString(),
  ...overrides
})

export const createMockPost = (overrides = {}) => ({
  id: '1',
  title: 'Test Post',
  content: 'This is a test post content',
  author: createMockUser(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  likes: 0,
  comments: 0,
  tags: ['test'],
  ...overrides
})

export const createMockTopic = (overrides = {}) => ({
  id: '1',
  title: 'Test Topic',
  description: 'This is a test topic',
  slug: 'test-topic',
  postCount: 5,
  followerCount: 10,
  createdAt: new Date().toISOString(),
  ...overrides
})

// Mock API responses
export const mockApiResponse = <T>(data: T, delay = 0) => {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(data), delay)
  })
}

export const mockApiError = (message = 'API Error', status = 500, delay = 0) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      const error = new Error(message)
      ;(error as any).status = status
      reject(error)
    }, delay)
  })
}

// Form testing utilities
export const fillForm = async (form: HTMLFormElement, data: Record<string, string>) => {
  const user = userEvent.setup()
  
  for (const [name, value] of Object.entries(data)) {
    const field = form.querySelector(`[name="${name}"]`) as HTMLInputElement
    if (field) {
      await user.clear(field)
      await user.type(field, value)
    }
  }
}

export const submitForm = async (form: HTMLFormElement) => {
  const user = userEvent.setup()
  const submitButton = form.querySelector('[type="submit"]') as HTMLButtonElement
  if (submitButton) {
    await user.click(submitButton)
  }
}

// Accessibility testing utilities
export const expectToBeAccessible = async (container: HTMLElement) => {
  // Check for basic accessibility requirements
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const buttons = container.querySelectorAll('button')
  const links = container.querySelectorAll('a')
  const images = container.querySelectorAll('img')
  const inputs = container.querySelectorAll('input, textarea, select')

  // Check that buttons have accessible names
  buttons.forEach(button => {
    expect(
      button.textContent || 
      button.getAttribute('aria-label') || 
      button.getAttribute('aria-labelledby')
    ).toBeTruthy()
  })

  // Check that links have accessible names
  links.forEach(link => {
    expect(
      link.textContent || 
      link.getAttribute('aria-label') || 
      link.getAttribute('aria-labelledby')
    ).toBeTruthy()
  })

  // Check that images have alt text
  images.forEach(img => {
    expect(img.getAttribute('alt')).toBeDefined()
  })

  // Check that form inputs have labels
  inputs.forEach(input => {
    const id = input.getAttribute('id')
    const ariaLabel = input.getAttribute('aria-label')
    const ariaLabelledby = input.getAttribute('aria-labelledby')
    
    if (id) {
      const label = container.querySelector(`label[for="${id}"]`)
      expect(label || ariaLabel || ariaLabelledby).toBeTruthy()
    } else {
      expect(ariaLabel || ariaLabelledby).toBeTruthy()
    }
  })
}

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now()
  renderFn()
  const end = performance.now()
  return end - start
}

// Mock intersection observer for lazy loading tests
export const mockIntersectionObserver = (isIntersecting = true) => {
  const mockObserver = jest.fn().mockImplementation((callback) => ({
    observe: jest.fn().mockImplementation((element) => {
      callback([{ target: element, isIntersecting }])
    }),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))
  
  global.IntersectionObserver = mockObserver
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

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { userEvent }

// Export custom render as default render
export { customRender as render }
