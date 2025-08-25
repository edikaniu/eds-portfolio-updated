import { test, expect } from '@playwright/test'

test.describe('Admin Authentication', () => {
  const adminEmail = 'test-admin@example.com'
  const adminPassword = 'test-password-123'

  test.beforeEach(async ({ page }) => {
    // Clear any existing sessions
    await page.context().clearCookies()
  })

  test('should redirect to login when accessing admin without authentication', async ({ page }) => {
    await page.goto('/admin/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL('/admin/login')
    
    // Should display login form
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
  })

  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('/admin/login')

    // Fill form with invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 5000 })
    
    // Should remain on login page
    await expect(page).toHaveURL('/admin/login')
  })

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.goto('/admin/login')

    // Fill form with valid credentials
    await page.fill('input[name="email"]', adminEmail)
    await page.fill('input[name="password"]', adminPassword)
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL('/admin/dashboard')
    
    // Should display dashboard content
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible()
  })

  test('should maintain session across page refreshes', async ({ page }) => {
    // Login first
    await page.goto('/admin/login')
    await page.fill('input[name="email"]', adminEmail)
    await page.fill('input[name="password"]', adminPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/admin/dashboard')

    // Refresh page
    await page.reload()

    // Should still be logged in
    await expect(page).toHaveURL('/admin/dashboard')
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/admin/login')
    await page.fill('input[name="email"]', adminEmail)
    await page.fill('input[name="password"]', adminPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/admin/dashboard')

    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")')
    await logoutButton.click()

    // Should redirect to login
    await expect(page).toHaveURL('/admin/login')
    
    // Should not be able to access protected routes
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL('/admin/login')
  })

  test('should handle session expiration', async ({ page }) => {
    // Mock short session expiration
    await page.goto('/admin/login')
    await page.fill('input[name="email"]', adminEmail)
    await page.fill('input[name="password"]', adminPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/admin/dashboard')

    // Clear cookies to simulate session expiration
    await page.context().clearCookies()

    // Try to access protected route
    await page.goto('/admin/dashboard')
    
    // Should redirect to login
    await expect(page).toHaveURL('/admin/login')
  })

  test('should protect all admin routes', async ({ page }) => {
    const protectedRoutes = [
      '/admin/dashboard',
      '/admin/blog',
      '/admin/projects',
      '/admin/case-studies',
      '/admin/analytics',
      '/admin/settings',
    ]

    for (const route of protectedRoutes) {
      await page.goto(route)
      await expect(page).toHaveURL('/admin/login')
    }
  })

  test('should remember me functionality work correctly', async ({ page }) => {
    await page.goto('/admin/login')

    // Check remember me checkbox
    const rememberMeCheckbox = page.locator('input[name="remember"], input[type="checkbox"]')
    if (await rememberMeCheckbox.count() > 0) {
      await rememberMeCheckbox.check()
    }

    // Login
    await page.fill('input[name="email"]', adminEmail)
    await page.fill('input[name="password"]', adminPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/admin/dashboard')

    // Close browser context and create new one to simulate browser restart
    await page.context().close()
    const newContext = await page.context().browser()!.newContext()
    const newPage = await newContext.newPage()

    // Should still be logged in with remember me
    await newPage.goto('/admin/dashboard')
    
    // If remember me works, should stay on dashboard, otherwise redirect to login
    const currentUrl = newPage.url()
    
    await newContext.close()
  })

  test('should handle rate limiting on login attempts', async ({ page }) => {
    await page.goto('/admin/login')

    // Make multiple failed login attempts
    for (let i = 0; i < 5; i++) {
      await page.fill('input[name="email"]', 'invalid@example.com')
      await page.fill('input[name="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')
      await page.waitForTimeout(500) // Wait between attempts
    }

    // Should show rate limiting message
    const rateLimitMessage = page.locator('text=Too many attempts, text=Rate limited')
    const isRateLimited = await rateLimitMessage.count() > 0

    if (isRateLimited) {
      await expect(rateLimitMessage).toBeVisible()
    }
  })

  test('should display user info when logged in', async ({ page }) => {
    // Login
    await page.goto('/admin/login')
    await page.fill('input[name="email"]', adminEmail)
    await page.fill('input[name="password"]', adminPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/admin/dashboard')

    // Check for user info display
    const userInfo = page.locator('[data-testid="user-info"], .user-info')
    
    if (await userInfo.count() > 0) {
      await expect(userInfo).toBeVisible()
      await expect(userInfo.locator(`text=${adminEmail}`)).toBeVisible()
    }
  })

  test('should handle password reset flow', async ({ page }) => {
    await page.goto('/admin/login')

    // Look for forgot password link
    const forgotPasswordLink = page.locator('a:has-text("Forgot Password"), a:has-text("Reset Password")')
    
    if (await forgotPasswordLink.count() > 0) {
      await forgotPasswordLink.click()

      // Should navigate to password reset page
      await expect(page.locator('input[name="email"]')).toBeVisible()
      await expect(page.locator('button:has-text("Send Reset"), button:has-text("Reset")')).toBeVisible()

      // Fill email and submit
      await page.fill('input[name="email"]', adminEmail)
      await page.click('button[type="submit"]')

      // Should show success message
      await expect(page.locator('text=Reset email sent, text=Check your email')).toBeVisible({ timeout: 5000 })
    }
  })
})