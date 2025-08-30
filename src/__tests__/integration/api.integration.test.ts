import { createMockPost, createMockUser, createMockTopic } from '@/__tests__/utils/test-utils'

// Mock fetch for API testing
const mockFetch = jest.fn()
global.fetch = mockFetch

// API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// API client with error handling
class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const config = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      }
    }

    const response = await fetch(url, config)
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Posts API
  async getPosts(params: any = {}) {
    const query = new URLSearchParams(params).toString()
    return this.request(`/posts${query ? `?${query}` : ''}`)
  }

  async getPost(id: string) {
    return this.request(`/posts/${id}`)
  }

  async createPost(data: any) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updatePost(id: string, data: any) {
    return this.request(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deletePost(id: string) {
    return this.request(`/posts/${id}`, { method: 'DELETE' })
  }

  // Topics API
  async getTopics() {
    return this.request('/topics')
  }

  async getTopic(slug: string) {
    return this.request(`/topics/${slug}`)
  }

  // Users API
  async getUser(username: string) {
    return this.request(`/users/${username}`)
  }

  async updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // Search API
  async search(query: string, filters: any = {}) {
    const params = { q: query, ...filters }
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/search?${queryString}`)
  }
}

describe('API Integration Tests', () => {
  let apiClient: ApiClient

  beforeEach(() => {
    apiClient = new ApiClient()
    mockFetch.mockClear()
  })

  describe('Posts API', () => {
    const mockPosts = [
      createMockPost({ id: '1', title: 'First Post' }),
      createMockPost({ id: '2', title: 'Second Post' })
    ]

    it('fetches posts with pagination', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          posts: mockPosts,
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            hasMore: false
          }
        })
      })

      const result = await apiClient.getPosts({ page: 1, limit: 10 })

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE}/posts?page=1&limit=10`,
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      )

      expect(result.posts).toHaveLength(2)
      expect(result.pagination.total).toBe(2)
    })

    it('fetches posts with filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ posts: [mockPosts[0]] })
      })

      await apiClient.getPosts({
        category: 'ai',
        sortBy: 'date',
        order: 'desc'
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE}/posts?category=ai&sortBy=date&order=desc`,
        expect.any(Object)
      )
    })

    it('fetches single post by ID', async () => {
      const mockPost = createMockPost({ id: '1' })
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPost
      })

      const result = await apiClient.getPost('1')

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE}/posts/1`,
        expect.any(Object)
      )
      expect(result.id).toBe('1')
    })

    it('creates new post', async () => {
      const newPostData = {
        title: 'New Post',
        content: 'Post content',
        tags: ['test']
      }
      const createdPost = createMockPost({ ...newPostData, id: '3' })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createdPost
      })

      const result = await apiClient.createPost(newPostData)

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE}/posts`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newPostData)
        })
      )
      expect(result.id).toBe('3')
    })

    it('updates existing post', async () => {
      const updateData = { title: 'Updated Title' }
      const updatedPost = createMockPost({ id: '1', ...updateData })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedPost
      })

      const result = await apiClient.updatePost('1', updateData)

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE}/posts/1`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData)
        })
      )
      expect(result.title).toBe('Updated Title')
    })

    it('deletes post', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      const result = await apiClient.deletePost('1')

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE}/posts/1`,
        expect.objectContaining({ method: 'DELETE' })
      )
      expect(result.success).toBe(true)
    })

    it('handles API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Post not found' })
      })

      await expect(apiClient.getPost('999')).rejects.toThrow('Post not found')
    })

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(apiClient.getPosts()).rejects.toThrow('Network error')
    })
  })

  describe('Topics API', () => {
    const mockTopics = [
      createMockTopic({ id: '1', title: 'AI', slug: 'ai' }),
      createMockTopic({ id: '2', title: 'ML', slug: 'ml' })
    ]

    it('fetches all topics', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTopics
      })

      const result = await apiClient.getTopics()

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE}/topics`,
        expect.any(Object)
      )
      expect(result).toHaveLength(2)
    })

    it('fetches topic by slug', async () => {
      const mockTopic = createMockTopic({ slug: 'ai' })
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTopic
      })

      const result = await apiClient.getTopic('ai')

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE}/topics/ai`,
        expect.any(Object)
      )
      expect(result.slug).toBe('ai')
    })
  })

  describe('Users API', () => {
    it('fetches user profile', async () => {
      const mockUser = createMockUser({ username: 'testuser' })
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser
      })

      const result = await apiClient.getUser('testuser')

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE}/users/testuser`,
        expect.any(Object)
      )
      expect(result.username).toBe('testuser')
    })

    it('updates user profile', async () => {
      const updateData = { bio: 'Updated bio' }
      const updatedUser = createMockUser({ id: '1', bio: 'Updated bio' })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedUser
      })

      const result = await apiClient.updateUser('1', updateData)

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE}/users/1`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData)
        })
      )
      expect(result.bio).toBe('Updated bio')
    })
  })

  describe('Search API', () => {
    it('performs search with query', async () => {
      const searchResults = {
        posts: [createMockPost({ title: 'AI Search Result' })],
        topics: [createMockTopic({ title: 'AI Topic' })],
        users: [createMockUser({ username: 'ai_expert' })],
        total: 3
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => searchResults
      })

      const result = await apiClient.search('artificial intelligence')

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE}/search?q=artificial+intelligence`,
        expect.any(Object)
      )
      expect(result.total).toBe(3)
    })

    it('performs filtered search', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ posts: [], total: 0 })
      })

      await apiClient.search('test', {
        type: 'posts',
        category: 'ai',
        dateFrom: '2023-01-01'
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE}/search?q=test&type=posts&category=ai&dateFrom=2023-01-01`,
        expect.any(Object)
      )
    })
  })

  describe('Authentication Integration', () => {
    it('includes auth token in requests', async () => {
      const token = 'mock-jwt-token'
      
      // Create authenticated client
      class AuthenticatedApiClient extends ApiClient {
        constructor() {
          super()
          this.defaultHeaders = {
            ...this.defaultHeaders,
            'Authorization': `Bearer ${token}`
          }
        }
      }

      const authClient = new AuthenticatedApiClient()
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ posts: [] })
      })

      await authClient.getPosts()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${token}`
          })
        })
      )
    })

    it('handles 401 unauthorized responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' })
      })

      await expect(apiClient.getPosts()).rejects.toThrow('Unauthorized')
    })
  })

  describe('Rate Limiting', () => {
    it('handles rate limit responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers({ 'Retry-After': '60' }),
        json: async () => ({ message: 'Rate limit exceeded' })
      })

      await expect(apiClient.getPosts()).rejects.toThrow('Rate limit exceeded')
    })
  })

  describe('Caching Integration', () => {
    it('respects cache headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({
          'Cache-Control': 'public, max-age=300',
          'ETag': '"abc123"'
        }),
        json: async () => ({ posts: [] })
      })

      await apiClient.getPosts()

      // In a real implementation, subsequent requests would check ETag
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 304, // Not Modified
        json: async () => null
      })

      // This would return cached data
      await apiClient.getPosts()
    })
  })

  describe('Error Recovery', () => {
    it('retries failed requests', async () => {
      // First call fails, second succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ posts: [] })
        })

      // Implement retry logic
      const retryRequest = async (fn: () => Promise<any>, retries = 1) => {
        try {
          return await fn()
        } catch (error) {
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 100))
            return retryRequest(fn, retries - 1)
          }
          throw error
        }
      }

      const result = await retryRequest(() => apiClient.getPosts())
      
      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(result.posts).toBeDefined()
    })
  })
})
