import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display login form', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click()
    
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByText(/email is required/i)).toBeVisible()
    await expect(page.getByText(/password is required/i)).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click()
    
    await page.getByLabel(/email/i).fill('invalid@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByText(/invalid credentials/i)).toBeVisible()
  })

  test('should successfully log in with valid credentials', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click()
    
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should redirect to dashboard or show user menu
    await expect(page.getByText(/welcome/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /profile/i })).toBeVisible()
  })

  test('should display signup form', async ({ page }) => {
    await page.getByRole('link', { name: /sign up/i }).click()
    
    await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible()
    await expect(page.getByLabel(/username/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
  })

  test('should successfully create new account', async ({ page }) => {
    await page.getByRole('link', { name: /sign up/i }).click()
    
    await page.getByLabel(/username/i).fill('newuser')
    await page.getByLabel(/email/i).fill('newuser@example.com')
    await page.getByLabel(/password/i).fill('newpassword123')
    await page.getByRole('button', { name: /create account/i }).click()

    // Should redirect to welcome page or dashboard
    await expect(page.getByText(/account created/i)).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Then logout
    await page.getByRole('button', { name: /profile/i }).click()
    await page.getByRole('button', { name: /logout/i }).click()

    // Should redirect to home page
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('should persist login across page refreshes', async ({ page }) => {
    // Login
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByRole('button', { name: /profile/i })).toBeVisible()

    // Refresh page
    await page.reload()

    // Should still be logged in
    await expect(page.getByRole('button', { name: /profile/i })).toBeVisible()
  })

  test('should redirect to login when accessing protected routes', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to login page
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
    await expect(page.url()).toContain('/login')
  })
})
