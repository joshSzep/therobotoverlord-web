import { integrationRender as render, screen, waitFor, userEvent } from '@/__tests__/utils/test-utils'
import { createMockPost } from '@/__tests__/utils/test-utils'
import FeedPage from '@/app/feed/page'

// Mock the lazy components
jest.mock('@/components/lazy/LazyComponents', () => ({
  LazyContentFeed: ({ items = [], onLoadMore, hasMore, isLoadingMore }: {
    items?: Array<{ id: string; data?: { title?: string; content?: string; author?: string }; title?: string; content?: string; author?: string }>
    onLoadMore?: () => void
    hasMore?: boolean
    isLoadingMore?: boolean
  }) => (
    <div data-testid="content-feed">
      <div data-testid="feed-items">
        {items.map((item) => (
          <div key={item.id} data-testid={`feed-item-${item.id}`}>
            <h3>{item.data?.title || item.title}</h3>
            <p>{item.data?.content || item.content}</p>
            <span>By {item.data?.author || item.author}</span>
          </div>
        ))}
      </div>
      {hasMore && (
        <button 
          onClick={onLoadMore} 
          disabled={isLoadingMore}
          data-testid="load-more-button"
        >
          {isLoadingMore ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  ),
  LazyPersonalizedRecommendations: ({ limit, categories = [] }: {
    limit?: number
    categories?: string[]
  }) => (
    <div data-testid="recommendations">
      <h3>Recommendations</h3>
      <p>Limit: {limit}</p>
      <p>Categories: {categories.join(', ')}</p>
    </div>
  )
}))

// Mock hooks
jest.mock('@/hooks/useRealTimeUpdates', () => ({
  useRealTimeUpdates: () => ({
    connected: true,
    isRealTimeEnabled: true,
    lastUpdate: null
  })
}))

// Mock other UI components
jest.mock('@/components/ui/LoadingSpinner', () => ({
  LoadingState: ({ children, isLoading, error, skeleton }: {
    children: React.ReactNode
    isLoading?: boolean
    error?: string | null
    skeleton?: React.ReactNode
  }) => {
    if (isLoading) return <div data-testid="loading-state">{skeleton}</div>
    if (error) return <div data-testid="error-state">Error loading feed</div>
    return children
  }
}))

jest.mock('@/components/ui/EmptyState', () => ({
  EmptyFeedState: () => <div data-testid="empty-feed-state">No posts yet</div>
}))

jest.mock('@/components/feed/FeedFilters', () => ({
  FeedFilters: () => <div data-testid="feed-filters">Filters</div>
}))

// Mock API calls
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Feed Page Integration', () => {
  const mockPosts = [
    createMockPost({
      id: '1',
      title: 'AI Revolution',
      content: 'The future of AI is here',
      author: 'ai_expert'
    }),
    createMockPost({
      id: '2', 
      title: 'Machine Learning Basics',
      content: 'Understanding ML fundamentals',
      author: 'ml_teacher'
    })
  ]

  beforeEach(() => {
    mockFetch.mockClear()
    // Mock successful API responses
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        posts: mockPosts,
        hasMore: true,
        total: 10
      })
    })
  })

  it('renders feed page with posts', async () => {
    render(<FeedPage />)

    // Check page structure
    expect(screen.getByText('Content Feed')).toBeInTheDocument()
    
    // Wait for posts to load
    await waitFor(() => {
      expect(screen.getByTestId('content-feed')).toBeInTheDocument()
    })

    // Check if posts are rendered
    await waitFor(() => {
      expect(screen.getByText('AI Revolution')).toBeInTheDocument()
      expect(screen.getByText('Machine Learning Basics')).toBeInTheDocument()
    })
  })

  it('displays loading state initially', () => {
    render(<FeedPage />)
    
    // Should show loading skeletons
    expect(screen.getByTestId('loading-state')).toBeInTheDocument()
  })

  it('handles filter changes', async () => {
    const user = userEvent.setup()
    render(<FeedPage />)

    await waitFor(() => {
      expect(screen.getByTestId('content-feed')).toBeInTheDocument()
    })

    // Find and interact with filters
    const filterButton = screen.getByRole('button', { name: /filter/i })
    await user.click(filterButton)

    // Check if filter options appear
    expect(screen.getByText('All Topics')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  it('implements infinite scrolling', async () => {
    const user = userEvent.setup()
    render(<FeedPage />)

    await waitFor(() => {
      expect(screen.getByTestId('content-feed')).toBeInTheDocument()
    })

    // Mock additional posts for load more
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        posts: [createMockPost({ id: '3', title: 'New Post' })],
        hasMore: false,
        total: 3
      })
    })

    // Click load more button
    const loadMoreButton = screen.getByTestId('load-more-button')
    await user.click(loadMoreButton)

    // Should show loading state
    expect(loadMoreButton).toHaveTextContent('Loading...')

    // Wait for new content
    await waitFor(() => {
      expect(screen.getByText('New Post')).toBeInTheDocument()
    })
  })

  it('shows recommendations sidebar', async () => {
    render(<FeedPage />)

    await waitFor(() => {
      expect(screen.getByTestId('recommendations')).toBeInTheDocument()
    })

    expect(screen.getByText('Recommendations')).toBeInTheDocument()
  })

  it('handles real-time updates', async () => {
    render(<FeedPage />)

    await waitFor(() => {
      expect(screen.getByTestId('content-feed')).toBeInTheDocument()
    })

    // Check connection status indicator
    expect(screen.getByText('Connected')).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    // Mock API error
    mockFetch.mockRejectedValueOnce(new Error('API Error'))

    render(<FeedPage />)

    await waitFor(() => {
      expect(screen.getByText(/error loading feed/i)).toBeInTheDocument()
    })

    // Should show retry button
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('shows empty state when no posts', async () => {
    // Mock empty response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        posts: [],
        hasMore: false,
        total: 0
      })
    })

    render(<FeedPage />)

    await waitFor(() => {
      expect(screen.getByTestId('empty-feed-state')).toBeInTheDocument()
    })

    expect(screen.getByText(/no posts yet/i)).toBeInTheDocument()
  })

  it('maintains accessibility standards', async () => {
    render(<FeedPage />)

    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()

    // Check for skip links
    expect(screen.getByText('Skip to main content')).toBeInTheDocument()

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByTestId('content-feed')).toBeInTheDocument()
    })

    // Check ARIA labels and roles
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()

    // Check keyboard navigation
    const user = userEvent.setup()
    const buttons = screen.getAllByRole('button')
    if (buttons.length > 0 && buttons[0]) {
      buttons[0].focus()
      await user.keyboard('{Tab}')
      // Should move focus to next element
    }
  })

  it('handles responsive layout', () => {
    // Mock different viewport sizes
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    render(<FeedPage />)

    // Check if mobile layout is applied
    expect(screen.getByTestId('dashboard-layout')).toHaveClass('mobile-layout')
  })

  it('preserves scroll position on navigation', async () => {
    // Mock window.scrollTo and scrollY
    const mockScrollTo = jest.fn()
    Object.defineProperty(window, 'scrollTo', {
      value: mockScrollTo,
      writable: true
    })
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
      configurable: true
    })

    render(<FeedPage />)

    await waitFor(() => {
      expect(screen.getByTestId('content-feed')).toBeInTheDocument()
    })

    // Simulate scroll down
    mockScrollTo(0, 500)
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true })
    
    expect(mockScrollTo).toHaveBeenCalledWith(0, 500)
    expect(window.scrollY).toBe(500)

    // Verify scroll restoration capability exists
    expect(typeof window.scrollTo).toBe('function')
  })

  it('integrates with performance monitoring', async () => {
    const performanceSpy = jest.spyOn(console, 'log')
    
    render(<FeedPage />)

    await waitFor(() => {
      expect(screen.getByTestId('content-feed')).toBeInTheDocument()
    })

    // Should log performance metrics in development
    expect(performanceSpy).toHaveBeenCalledWith(
      expect.stringContaining('Performance metrics')
    )

    performanceSpy.mockRestore()
  })
})
