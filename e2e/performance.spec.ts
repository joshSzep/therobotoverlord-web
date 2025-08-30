import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('should load home page within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds
    
    // Check Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const vitals: Record<string, number> = {}
          
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime
            }
            if (entry.name === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime
            }
          })
          
          resolve(vitals)
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] })
        
        // Fallback timeout
        setTimeout(() => resolve({}), 5000)
      })
    })
    
    console.log('Performance metrics:', metrics)
  })

  test('should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/feed')
    
    const startTime = Date.now()
    
    // Scroll through multiple pages of content
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(1000)
    }
    
    const scrollTime = Date.now() - startTime
    expect(scrollTime).toBeLessThan(10000) // Should handle scrolling within 10 seconds
    
    // Check memory usage doesn't grow excessively
    const memoryUsage = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0
    })
    
    // Memory usage should be reasonable (less than 50MB)
    expect(memoryUsage).toBeLessThan(50 * 1024 * 1024)
  })

  test('should optimize image loading', async ({ page }) => {
    await page.goto('/feed')
    
    // Check that images are lazy loaded
    const images = page.getByRole('img')
    const imageCount = await images.count()
    
    if (imageCount > 0) {
      // Check first image loads quickly
      const firstImage = images.first()
      await expect(firstImage).toBeVisible()
      
      // Check that images have proper attributes
      await expect(firstImage).toHaveAttribute('alt')
      await expect(firstImage).toHaveAttribute('loading', 'lazy')
    }
  })

  test('should handle concurrent requests efficiently', async ({ page }) => {
    const startTime = Date.now()
    
    // Navigate to multiple pages simultaneously
    const promises = [
      page.goto('/'),
      page.goto('/feed'),
      page.goto('/topics'),
      page.goto('/about')
    ]
    
    await Promise.all(promises)
    
    const totalTime = Date.now() - startTime
    expect(totalTime).toBeLessThan(5000) // All pages should load within 5 seconds
  })
})

test.describe('Cross-Browser Compatibility', () => {
  test('should work consistently across browsers', async ({ page, browserName }) => {
    await page.goto('/')
    
    // Basic functionality should work in all browsers
    await expect(page.getByRole('heading', { name: /the robot overlord/i })).toBeVisible()
    await expect(page.getByRole('navigation')).toBeVisible()
    
    // Navigation should work
    await page.getByRole('link', { name: /feed/i }).click()
    await expect(page.url()).toContain('/feed')
    
    console.log(`Test passed in ${browserName}`)
  })

  test('should handle CSS features gracefully', async ({ page }) => {
    await page.goto('/')
    
    // Check that layout is not broken
    const navigation = page.getByRole('navigation')
    await expect(navigation).toBeVisible()
    
    // Check responsive design
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(navigation).toBeVisible()
    
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(navigation).toBeVisible()
  })

  test('should handle JavaScript features across browsers', async ({ page }) => {
    await page.goto('/feed')
    
    // Test interactive features
    const searchInput = page.getByRole('searchbox')
    if (await searchInput.isVisible()) {
      await searchInput.fill('test search')
      await expect(searchInput).toHaveValue('test search')
    }
    
    // Test form submission
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })
})

test.describe('Mobile Responsiveness', () => {
  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Mobile navigation should work
    const mobileMenu = page.getByRole('button', { name: /menu/i })
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click()
      await expect(page.getByRole('link', { name: /feed/i })).toBeVisible()
    }
    
    // Content should be readable
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should handle touch interactions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/feed')
    
    // Test touch scrolling
    await page.touchscreen.tap(200, 300)
    
    // Test swipe gestures (if implemented)
    const posts = page.getByTestId('post-card')
    if (await posts.first().isVisible()) {
      const box = await posts.first().boundingBox()
      if (box) {
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
      }
    }
  })

  test('should optimize for different screen sizes', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 }, // iPhone SE
      { width: 375, height: 667 }, // iPhone 8
      { width: 414, height: 896 }, // iPhone 11
      { width: 768, height: 1024 }, // iPad
      { width: 1024, height: 768 }, // iPad Landscape
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.goto('/')
      
      // Content should be visible and accessible
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page.getByRole('navigation')).toBeVisible()
      
      console.log(`Layout works at ${viewport.width}x${viewport.height}`)
    }
  })
})
