import { Page, expect } from '@playwright/test'

/**
 * Test utilities for E2E tests
 */

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Login with test credentials
   */
  async login(email = 'test@example.com', password = 'password123') {
    await this.page.getByRole('button', { name: /sign in/i }).click()
    await this.page.getByLabel(/email/i).fill(email)
    await this.page.getByLabel(/password/i).fill(password)
    await this.page.getByRole('button', { name: /sign in/i }).click()
    
    // Wait for login to complete
    await expect(this.page.getByRole('button', { name: /profile/i })).toBeVisible()
  }

  /**
   * Logout current user
   */
  async logout() {
    await this.page.getByRole('button', { name: /profile/i }).click()
    await this.page.getByRole('button', { name: /logout/i }).click()
    
    // Wait for logout to complete
    await expect(this.page.getByRole('button', { name: /sign in/i })).toBeVisible()
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForLoadState('domcontentloaded')
  }

  /**
   * Take a screenshot with timestamp
   */
  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    await this.page.screenshot({ 
      path: `screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    })
  }

  /**
   * Check accessibility violations
   */
  async checkAccessibility() {
    // Basic accessibility checks
    const headings = this.page.getByRole('heading')
    const buttons = this.page.getByRole('button')
    const links = this.page.getByRole('link')
    
    // Check that interactive elements have accessible names
    const buttonCount = await buttons.count()
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const hasAccessibleName = await button.getAttribute('aria-label') || 
                               await button.textContent()
      expect(hasAccessibleName).toBeTruthy()
    }
    
    const linkCount = await links.count()
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i)
      const hasAccessibleName = await link.getAttribute('aria-label') || 
                               await link.textContent()
      expect(hasAccessibleName).toBeTruthy()
    }
  }

  /**
   * Simulate slow network conditions
   */
  async simulateSlowNetwork() {
    await this.page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.continue()
    })
  }

  /**
   * Mock API responses
   */
  async mockApiResponse(endpoint: string, response: any) {
    await this.page.route(`**/api/${endpoint}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      })
    })
  }

  /**
   * Fill form with data
   */
  async fillForm(formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      const input = this.page.getByLabel(new RegExp(field, 'i'))
      await input.fill(value)
    }
  }

  /**
   * Wait for element to be visible with timeout
   */
  async waitForElement(selector: string, timeout = 5000) {
    await this.page.waitForSelector(selector, { 
      state: 'visible', 
      timeout 
    })
  }

  /**
   * Scroll to element
   */
  async scrollToElement(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded()
  }

  /**
   * Check performance metrics
   */
  async getPerformanceMetrics() {
    return await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')
      
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      }
    })
  }

  /**
   * Test responsive design at different breakpoints
   */
  async testResponsiveBreakpoints() {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ]

    for (const breakpoint of breakpoints) {
      await this.page.setViewportSize({ 
        width: breakpoint.width, 
        height: breakpoint.height 
      })
      
      // Check that navigation is still accessible
      await expect(this.page.getByRole('navigation')).toBeVisible()
      
      console.log(`✓ Layout works at ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`)
    }
  }
}

/**
 * Custom matchers for Playwright tests
 */
export const customMatchers = {
  async toHaveLoadedWithin(page: Page, maxTime: number) {
    const startTime = Date.now()
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    expect(loadTime).toBeLessThan(maxTime)
  },

  async toBeAccessible(page: Page) {
    const helper = new TestHelpers(page)
    await helper.checkAccessibility()
  }
}

/**
 * Mock data generators
 */
export const mockData = {
  user: {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    displayName: 'Test User'
  },

  post: {
    id: '1',
    title: 'Test Post',
    content: 'This is a test post content',
    author: 'testuser',
    createdAt: new Date().toISOString(),
    tags: ['test', 'automation']
  },

  posts: Array.from({ length: 10 }, (_, i) => ({
    id: String(i + 1),
    title: `Test Post ${i + 1}`,
    content: `This is test post content ${i + 1}`,
    author: 'testuser',
    createdAt: new Date().toISOString(),
    tags: ['test']
  }))
}
