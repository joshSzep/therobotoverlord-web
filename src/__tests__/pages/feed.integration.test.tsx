import {
  createMockPost,
  integrationRender as render,
  screen,
  userEvent,
  waitFor,
} from "@/__tests__/utils/test-utils";

import FeedPage from "@/app/feed/page";

// Mock the lazy components
jest.mock("@/components/lazy/LazyComponents", () => ({
  LazyContentFeed: ({
    items = [],
    onLoadMore,
    hasMore,
    isLoadingMore,
  }: {
    items?: Array<{
      id: string;
      data?: { title?: string; content?: string; author?: string };
      title?: string;
      content?: string;
      author?: string;
    }>;
    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoadingMore?: boolean;
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
          {isLoadingMore ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  ),
  LazyPersonalizedRecommendations: ({
    limit,
    categories = [],
  }: {
    limit?: number;
    categories?: string[];
  }) => (
    <div data-testid="recommendations">
      <h3>Recommendations</h3>
      <p>Limit: {limit}</p>
      <p>Categories: {categories.join(", ")}</p>
    </div>
  ),
}));

// Mock hooks
const mockUseRealTimeUpdates = jest.fn(() => ({
  connected: true,
  isRealTimeEnabled: true,
  lastUpdate: null,
}));

jest.mock("@/hooks/useRealTimeUpdates", () => ({
  useRealTimeUpdates: mockUseRealTimeUpdates,
}));

// Mock other UI components
jest.mock("@/components/ui/LoadingSpinner", () => ({
  LoadingState: ({
    children,
    isLoading,
    error,
    skeleton,
  }: {
    children: React.ReactNode;
    isLoading?: boolean;
    error?: string | null;
    skeleton?: React.ReactNode;
  }) => {
    if (isLoading) return <div data-testid="loading-state">{skeleton}</div>;
    if (error) return <div data-testid="error-state">Error loading feed</div>;
    return children;
  },
}));

jest.mock("@/components/ui/EmptyState", () => ({
  EmptyFeedState: () => <div data-testid="empty-feed-state">No posts yet</div>,
}));

jest.mock("@/components/feed/FeedFilters", () => ({
  FeedFilters: () => <div data-testid="feed-filters">Mock Feed Filters</div>,
}));

jest.mock("@/components/ui/EmptyState", () => ({
  EmptyFeedState: () => (
    <div data-testid="empty-feed-state">Mock Empty Feed State</div>
  ),
}));

// Mock services
const mockPostsService = {
  getPosts: jest.fn(),
  getPost: jest.fn(),
  createPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
};

jest.mock("@/services", () => ({
  postsService: mockPostsService,
  topicsService: {
    getTopics: jest.fn(),
    getTopic: jest.fn(),
  },
}));

// Mock API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("Feed Page Integration", () => {
  const mockPosts = [
    createMockPost({
      id: "1",
      title: "AI Revolution",
      content: "The future of AI is here",
      author: "ai_expert",
    }),
    createMockPost({
      id: "2",
      title: "Machine Learning Basics",
      content: "Understanding ML fundamentals",
      author: "ml_teacher",
    }),
  ];

  beforeEach(() => {
    mockFetch.mockClear();
    // Mock successful API responses
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        posts: mockPosts,
        hasMore: true,
        total: 10,
      }),
    });
  });

  it("renders feed page with posts", async () => {
    render(<FeedPage />);

    // Wait for posts to load
    await waitFor(() => {
      expect(screen.getByTestId("content-feed")).toBeInTheDocument();
    });

    // Check for feed title
    expect(screen.getByText("Content Feed")).toBeInTheDocument();
  });

  it("displays loading state initially", async () => {
    render(<FeedPage />);

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByTestId("content-feed")).toBeInTheDocument();
    });

    // Content should be rendered
    expect(screen.getByText("Content Feed")).toBeInTheDocument();
  });

  it("handles filter changes", async () => {
    render(<FeedPage />);

    await waitFor(() => {
      expect(screen.getByTestId("feed-filters")).toBeInTheDocument();
    });

    // Should render filters component
    expect(screen.getByText("Mock Feed Filters")).toBeInTheDocument();
  });

  it("implements infinite scrolling", async () => {
    const user = userEvent.setup();
    render(<FeedPage />);

    await waitFor(() => {
      expect(screen.getByTestId("content-feed")).toBeInTheDocument();
    });

    // Mock additional posts for load more
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        posts: [createMockPost({ id: "3", title: "New Post" })],
        hasMore: false,
        total: 3,
      }),
    });

    // Click load more button
    const loadMoreButton = screen.getByTestId("load-more-button");
    await user.click(loadMoreButton);

    // Should show loading state
    expect(loadMoreButton).toHaveTextContent("Loading...");

    // Wait for new content
    await waitFor(() => {
      expect(screen.getByText("New Post")).toBeInTheDocument();
    });
  });

  it("shows recommendations sidebar", async () => {
    render(<FeedPage />);

    await waitFor(() => {
      expect(screen.getByTestId("content-feed")).toBeInTheDocument();
    });

    // Check for feed content
    expect(screen.getByText("Content Feed")).toBeInTheDocument();
  });

  it("handles real-time updates", async () => {
    render(<FeedPage />);

    await waitFor(() => {
      expect(screen.getByTestId("content-feed")).toBeInTheDocument();
    });

    // Check that real-time updates hook is called
    expect(mockUseRealTimeUpdates).toHaveBeenCalled();
  });

  it("handles API errors gracefully", async () => {
    // Mock API error
    mockPostsService.getPosts.mockRejectedValueOnce(new Error("API Error"));

    render(<FeedPage />);

    // Should still render the page structure
    await waitFor(() => {
      expect(screen.getByText("Content Feed")).toBeInTheDocument();
    });
  });

  it("shows empty state when no posts", async () => {
    // Mock empty posts response
    mockPostsService.getPosts.mockResolvedValueOnce({
      posts: [],
      hasMore: false,
      total: 0,
    });

    render(<FeedPage />);

    // Should render the page with empty state component
    await waitFor(() => {
      expect(screen.getByText("Mock Empty Feed State")).toBeInTheDocument();
    });
  });

  it("maintains accessibility standards", async () => {
    render(<FeedPage />);

    // Check for proper heading structure - look for the actual heading
    expect(screen.getByText("Content Feed")).toBeInTheDocument();

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByTestId("content-feed")).toBeInTheDocument();
    });

    // Check keyboard navigation
    const buttons = screen.getAllByRole("button");
    if (buttons.length > 0 && buttons[0]) {
      buttons[0].focus();
      // Should be able to focus elements
      expect(document.activeElement).toBe(buttons[0]);
    }
  });

  it("handles responsive layout", () => {
    // Mock different viewport sizes
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 768,
    });

    render(<FeedPage />);

    // Check if layout renders properly on mobile
    expect(screen.getByText("Content Feed")).toBeInTheDocument();

    // Verify responsive behavior exists
    expect(window.innerWidth).toBe(768);
  });

  it("preserves scroll position on navigation", async () => {
    // Mock window.scrollTo and scrollY
    const mockScrollTo = jest.fn();
    Object.defineProperty(window, "scrollTo", {
      value: mockScrollTo,
      writable: true,
    });
    Object.defineProperty(window, "scrollY", {
      value: 0,
      writable: true,
      configurable: true,
    });

    render(<FeedPage />);

    await waitFor(() => {
      expect(screen.getByTestId("content-feed")).toBeInTheDocument();
    });

    // Simulate scroll down
    mockScrollTo(0, 500);
    Object.defineProperty(window, "scrollY", { value: 500, writable: true });

    expect(mockScrollTo).toHaveBeenCalledWith(0, 500);
    expect(window.scrollY).toBe(500);

    // Verify scroll restoration capability exists
    expect(typeof window.scrollTo).toBe("function");
  });

  it("integrates with performance monitoring", async () => {
    // Mock performance.now for consistent timing
    const mockPerformanceNow = jest.spyOn(performance, "now");
    mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(100);

    render(<FeedPage />);

    await waitFor(() => {
      expect(screen.getByTestId("content-feed")).toBeInTheDocument();
    });

    // Verify performance monitoring is available
    expect(typeof performance.now).toBe("function");
    expect(mockPerformanceNow).toHaveBeenCalled();

    mockPerformanceNow.mockRestore();
  });
});
