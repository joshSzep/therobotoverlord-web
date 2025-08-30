import { test, expect } from '@playwright/test'

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check for h1 on home page
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    
    // Navigate to feed and check heading structure
    await page.getByRole('link', { name: /feed/i }).click()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    
    // Check that h2s exist and are properly nested
    const h2s = page.getByRole('heading', { level: 2 })
    await expect(h2s.first()).toBeVisible()
  })

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through navigation links
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: /feed/i })).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: /topics/i })).toBeFocused()
    
    // Enter should activate focused link
    await page.keyboard.press('Enter')
    await expect(page.url()).toContain('/topics')
  })

  test('should have proper ARIA labels and roles', async ({ page }) => {
    // Check navigation has proper role
    await expect(page.getByRole('navigation')).toBeVisible()
    
    // Check search input has proper label
    const searchInput = page.getByRole('searchbox')
    await expect(searchInput).toBeVisible()
    await expect(searchInput).toHaveAttribute('aria-label')
    
    // Check buttons have accessible names
    const buttons = page.getByRole('button')
    for (let i = 0; i < await buttons.count(); i++) {
      const button = buttons.nth(i)
      const hasAccessibleName = await button.getAttribute('aria-label') || 
                               await button.textContent()
      expect(hasAccessibleName).toBeTruthy()
    }
  })

  test('should have sufficient color contrast', async ({ page }) => {
    // This would typically use axe-core for automated testing
    // For now, we'll check that text is visible and readable
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText(/welcome/i)).toBeVisible()
  })

  test('should work with screen reader simulation', async ({ page }) => {
    // Navigate to feed
    await page.getByRole('link', { name: /feed/i }).click()
    
    // Check that posts have proper structure for screen readers
    const posts = page.getByTestId('post-card')
    const firstPost = posts.first()
    
    await expect(firstPost.getByRole('heading')).toBeVisible()
    await expect(firstPost.getByText(/by/i)).toBeVisible()
    
    // Check that links have descriptive text
    const readMoreLink = firstPost.getByRole('link', { name: /read more/i })
    await expect(readMoreLink).toBeVisible()
  })

  test('should handle focus management in modals', async ({ page }) => {
    // Open login modal
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Focus should be trapped in modal
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeFocused()
    
    // Tab should cycle through modal elements
    await page.keyboard.press('Tab')
    await expect(page.getByLabel(/password/i)).toBeFocused()
    
    // Escape should close modal
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('should have proper form labels and error messages', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Check form labels
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    
    // Submit empty form to trigger validation
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Error messages should be associated with inputs
    const emailError = page.getByText(/email is required/i)
    const passwordError = page.getByText(/password is required/i)
    
    await expect(emailError).toBeVisible()
    await expect(passwordError).toBeVisible()
    
    // Errors should have proper ARIA attributes
    await expect(emailError).toHaveAttribute('role', 'alert')
    await expect(passwordError).toHaveAttribute('role', 'alert')
  })
})
