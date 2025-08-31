import {
  generateSlug,
  truncateDescription,
  extractKeywords,
  generateCanonicalUrl,
  validateMetaTags,
  generateBreadcrumbs
} from '@/utils/seo'

describe('SEO Utilities', () => {
  describe('generateSlug', () => {
    it('converts title to URL-friendly slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
      expect(generateSlug('The Robot Overlord: AI Discussion')).toBe('the-robot-overlord-ai-discussion')
      expect(generateSlug('Special Characters!@#$%')).toBe('special-characters')
    })

    it('handles multiple spaces and hyphens', () => {
      expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces')
      expect(generateSlug('Already-Has--Hyphens')).toBe('already-has-hyphens')
    })

    it('handles empty and edge cases', () => {
      expect(generateSlug('')).toBe('')
      expect(generateSlug('   ')).toBe('-')
      expect(generateSlug('123')).toBe('123')
    })
  })

  describe('truncateDescription', () => {
    const longText = 'This is a very long description that exceeds the maximum length limit and should be truncated properly without cutting words in the middle.'

    it('truncates text to specified length', () => {
      const result = truncateDescription(longText, 50)
      expect(result.length).toBeLessThanOrEqual(53) // 50 + '...'
      expect(result).toMatch(/\.\.\.$/)
    })

    it('does not truncate short text', () => {
      const shortText = 'Short description'
      expect(truncateDescription(shortText, 100)).toBe(shortText)
    })

    it('removes HTML tags', () => {
      const htmlText = '<p>This is <strong>HTML</strong> content</p>'
      const result = truncateDescription(htmlText, 100)
      expect(result).toBe('This is HTML content')
    })

    it('breaks at word boundaries', () => {
      const result = truncateDescription('One two three four five', 10)
      expect(result).toBe('One two...')
    })
  })

  describe('extractKeywords', () => {
    const content = 'Artificial intelligence and machine learning are transforming technology. AI systems use neural networks for deep learning applications.'

    it('extracts relevant keywords', () => {
      const keywords = extractKeywords(content, 5)
      expect(keywords).toHaveLength(5)
      expect(keywords).toContain('artificial')
      expect(keywords).toContain('intelligence')
      expect(keywords).toContain('machine')
      expect(keywords).toContain('learning')
    })

    it('filters out stop words', () => {
      const keywords = extractKeywords(content)
      expect(keywords).not.toContain('and')
      expect(keywords).not.toContain('are')
      expect(keywords).not.toContain('for')
    })

    it('handles HTML content', () => {
      const htmlContent = '<p>Machine <strong>learning</strong> algorithms</p>'
      const keywords = extractKeywords(htmlContent)
      expect(keywords).toContain('machine')
      expect(keywords).toContain('learning')
      expect(keywords).toContain('algorithms')
    })
  })

  describe('generateCanonicalUrl', () => {
    const originalEnv = process.env.NEXT_PUBLIC_SITE_URL

    afterEach(() => {
      process.env.NEXT_PUBLIC_SITE_URL = originalEnv
    })

    it('generates canonical URL with base URL', () => {
      const result = generateCanonicalUrl('/posts/test', 'https://example.com')
      expect(result).toBe('https://example.com/posts/test')
    })

    it('uses environment variable when no base URL provided', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://robotoverlord.com'
      const result = generateCanonicalUrl('/posts/test')
      expect(result).toBe('https://robotoverlord.com/posts/test')
    })

    it('handles paths without leading slash', () => {
      const result = generateCanonicalUrl('posts/test', 'https://example.com')
      expect(result).toBe('https://example.com/posts/test')
    })
  })

  describe('validateMetaTags', () => {
    it('validates complete meta tags', () => {
      const meta = {
        title: 'Perfect Title Length for SEO Optimization',
        description: 'This is a well-crafted meta description that provides enough detail about the content while staying within the recommended character limit.',
        keywords: ['seo', 'optimization', 'meta', 'tags']
      }

      const result = validateMetaTags(meta)
      expect(result.isValid).toBe(true)
      expect(result.warnings).toHaveLength(0)
    })

    it('identifies missing title', () => {
      const meta = {
        description: 'Good description',
        keywords: ['test']
      }

      const result = validateMetaTags(meta)
      expect(result.isValid).toBe(false)
      expect(result.warnings).toContain('Title is missing')
    })

    it('identifies title length issues', () => {
      const shortTitle = { title: 'Short' }
      const longTitle = { title: 'This is an extremely long title that exceeds the recommended character limit for SEO' }

      expect(validateMetaTags(shortTitle).warnings).toContain('Title is too short (recommended: 30-60 characters)')
      expect(validateMetaTags(longTitle).warnings).toContain('Title is too long (recommended: 30-60 characters)')
    })

    it('identifies description issues', () => {
      const shortDesc = { title: 'Valid Title Length For Testing', description: 'Too short', keywords: ['test'] }
      const longDesc = { title: 'Valid Title Length For Testing', description: 'This is an extremely long meta description that far exceeds the recommended character limit for search engine optimization and should be flagged as too long because it contains way too many characters and goes beyond the 160 character limit that is recommended for optimal SEO performance in search engine results pages.', keywords: ['test'] }

      expect(validateMetaTags(shortDesc).warnings).toContain('Description is too short (recommended: 120-160 characters)')
      expect(validateMetaTags(longDesc).warnings).toContain('Description is too long (recommended: 120-160 characters)')
    })
  })

  describe('generateBreadcrumbs', () => {
    it('generates breadcrumbs for simple path', () => {
      const breadcrumbs = generateBreadcrumbs('/posts/my-first-post')
      expect(breadcrumbs).toEqual([
        { name: 'Home', url: '/' },
        { name: 'Posts', url: '/posts' },
        { name: 'My First Post', url: '/posts/my-first-post' }
      ])
    })

    it('generates breadcrumbs for nested path', () => {
      const breadcrumbs = generateBreadcrumbs('/admin/users/edit/123')
      expect(breadcrumbs).toEqual([
        { name: 'Home', url: '/' },
        { name: 'Admin', url: '/admin' },
        { name: 'Users', url: '/admin/users' },
        { name: 'Edit', url: '/admin/users/edit' },
        { name: '123', url: '/admin/users/edit/123' }
      ])
    })

    it('handles root path', () => {
      const breadcrumbs = generateBreadcrumbs('/')
      expect(breadcrumbs).toEqual([
        { name: 'Home', url: '/' }
      ])
    })

    it('handles hyphenated segments', () => {
      const breadcrumbs = generateBreadcrumbs('/topics/machine-learning')
      expect(breadcrumbs).toEqual([
        { name: 'Home', url: '/' },
        { name: 'Topics', url: '/topics' },
        { name: 'Machine Learning', url: '/topics/machine-learning' }
      ])
    })
  })
})
