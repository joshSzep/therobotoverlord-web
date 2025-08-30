import { test, expect } from '@playwright/test'

test.describe('Navigation and Core User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate through main pages', async ({ page }) => {
    // Test home page
    await expect(page.getByRole('heading', { name: /the robot overlord/i })).toBeVisible()
    
    // Navigate to feed
    await page.getByRole('link', { name: /feed/i }).click()
    await expect(page.url()).toContain('/feed')
    await expect(page.getByText(/latest posts/i)).toBeVisible()
    
    // Navigate to topics
    await page.getByRole('link', { name: /topics/i }).click()
    await expect(page.url()).toContain('/topics')
    await expect(page.getByText(/browse topics/i)).toBeVisible()
    
    // Navigate to about
    await page.getByRole('link', { name: /about/i }).click()
    await expect(page.url()).toContain('/about')
  })

  test('should display responsive navigation menu', async ({ page }) => {
    // Test desktop navigation
    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page.getByRole('link', { name: /feed/i })).toBeVisible()
    
    // Test mobile navigation (simulate mobile viewport)
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Mobile menu button should be visible
    await expect(page.getByRole('button', { name: /menu/i })).toBeVisible()
    
    // Click mobile menu
    await page.getByRole('button', { name: /menu/i }).click()
    await expect(page.getByRole('link', { name: /feed/i })).toBeVisible()
  })

  test('should handle search functionality', async ({ page }) => {
    const searchInput = page.getByRole('searchbox', { name: /search/i })
    await expect(searchInput).toBeVisible()
    
    await searchInput.fill('artificial intelligence')
    await searchInput.press('Enter')
    
    await expect(page.url()).toContain('/search')
    await expect(page.getByText(/search results/i)).toBeVisible()
    await expect(page.getByText(/artificial intelligence/i)).toBeVisible()
  })

  test('should display 404 page for invalid routes', async ({ page }) => {
    await page.goto('/invalid-route')
    
    await expect(page.getByText(/404/i)).toBeVisible()
    await expect(page.getByText(/page not found/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /go home/i })).toBeVisible()
  })

  test('should handle back navigation correctly', async ({ page }) => {
    // Navigate to feed
    await page.getByRole('link', { name: /feed/i }).click()
    await expect(page.url()).toContain('/feed')
    
    // Navigate to a specific post
    await page.getByRole('link', { name: /read more/i }).first().click()
    await expect(page.url()).toContain('/posts/')
    
    // Go back
    await page.goBack()
    await expect(page.url()).toContain('/feed')
    
    // Go back to home
    await page.goBack()
    await expect(page.url()).toBe('http://localhost:3000/')
  })
})

test.describe('Feed and Content Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/feed')
  })

  test('should display feed posts', async ({ page }) => {
    await expect(page.getByText(/latest posts/i)).toBeVisible()
    
    // Should show post cards
    const posts = page.getByTestId('post-card')
    await expect(posts.first()).toBeVisible()
    
    // Each post should have title, author, and date
    await expect(posts.first().getByRole('heading')).toBeVisible()
    await expect(posts.first().getByText(/by/i)).toBeVisible()
    await expect(posts.first().getByText(/ago/i)).toBeVisible()
  })

  test('should filter posts by category', async ({ page }) => {
    // Click on a category filter
    await page.getByRole('button', { name: /ai/i }).click()
    
    // URL should update with filter
    await expect(page.url()).toContain('category=ai')
    
    // Posts should be filtered
    await expect(page.getByText(/ai posts/i)).toBeVisible()
  })

  test('should load more posts on scroll', async ({ page }) => {
    const initialPosts = await page.getByTestId('post-card').count()
    
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    
    // Wait for new posts to load
    await page.waitForTimeout(2000)
    
    const newPostCount = await page.getByTestId('post-card').count()
    expect(newPostCount).toBeGreaterThan(initialPosts)
  })

  test('should open post in detail view', async ({ page }) => {
    await page.getByRole('link', { name: /read more/i }).first().click()
    
    // Should navigate to post detail page
    await expect(page.url()).toContain('/posts/')
    await expect(page.getByRole('article')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})

test.describe('Real-time Features', () => {
  test('should display live chat interface', async ({ page }) => {
    await page.goto('/chat')
    
    await expect(page.getByText(/overlord chat/i)).toBeVisible()
    await expect(page.getByRole('textbox', { name: /message/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /send/i })).toBeVisible()
  })

  test('should send and receive chat messages', async ({ page }) => {
    await page.goto('/chat')
    
    const messageInput = page.getByRole('textbox', { name: /message/i })
    const sendButton = page.getByRole('button', { name: /send/i })
    
    await messageInput.fill('Hello, Robot Overlord!')
    await sendButton.click()
    
    // Message should appear in chat
    await expect(page.getByText('Hello, Robot Overlord!')).toBeVisible()
    
    // Input should be cleared
    await expect(messageInput).toHaveValue('')
  })

  test('should show connection status', async ({ page }) => {
    await page.goto('/chat')
    
    // Should show connection status
    await expect(page.getByText(/connected/i)).toBeVisible()
  })
})
