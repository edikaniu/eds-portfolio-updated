import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load homepage successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/portfolio/i)

    // Check main heading
    const mainHeading = page.locator('h1').first()
    await expect(mainHeading).toBeVisible()
    await expect(mainHeading).toContainText('Edikan')
  })

  test('should display navigation menu', async ({ page }) => {
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()

    // Check navigation links
    const navLinks = ['Home', 'About', 'Projects', 'Blog', 'Contact']
    
    for (const linkText of navLinks) {
      const link = page.locator('nav a', { hasText: linkText })
      await expect(link).toBeVisible()
    }
  })

  test('should display hero section', async ({ page }) => {
    // Check hero section exists
    const heroSection = page.locator('section').first()
    await expect(heroSection).toBeVisible()

    // Check hero content
    await expect(page.locator('text=Full Stack Developer')).toBeVisible()
    await expect(page.locator('text=I create modern web applications')).toBeVisible()

    // Check CTA buttons
    const ctaButtons = page.locator('a[href*="projects"], a[href*="contact"]')
    await expect(ctaButtons.first()).toBeVisible()
  })

  test('should display featured projects section', async ({ page }) => {
    const projectsSection = page.locator('section:has-text("Featured Projects")')
    await expect(projectsSection).toBeVisible()

    // Wait for projects to load
    await page.waitForSelector('[data-testid="project-card"]', { timeout: 10000 })

    // Check that project cards are displayed
    const projectCards = page.locator('[data-testid="project-card"]')
    await expect(projectCards).toHaveCount(3) // Expecting 3 featured projects

    // Check project card content
    const firstProject = projectCards.first()
    await expect(firstProject.locator('h3')).toBeVisible()
    await expect(firstProject.locator('p')).toBeVisible()
    await expect(firstProject.locator('img')).toBeVisible()
  })

  test('should display blog section', async ({ page }) => {
    const blogSection = page.locator('section:has-text("Latest Blog Posts")')
    await expect(blogSection).toBeVisible()

    // Wait for blog posts to load
    await page.waitForSelector('[data-testid="blog-card"]', { timeout: 10000 })

    // Check that blog cards are displayed
    const blogCards = page.locator('[data-testid="blog-card"]')
    const cardCount = await blogCards.count()
    expect(cardCount).toBeGreaterThan(0)

    // Check blog card content
    if (cardCount > 0) {
      const firstBlog = blogCards.first()
      await expect(firstBlog.locator('h3')).toBeVisible()
      await expect(firstBlog.locator('p')).toBeVisible()
    }
  })

  test('should display skills section', async ({ page }) => {
    const skillsSection = page.locator('section:has-text("Skills")')
    await expect(skillsSection).toBeVisible()

    // Check for skill categories
    const skillCategories = ['Frontend', 'Backend', 'Database', 'Tools']
    
    for (const category of skillCategories) {
      await expect(page.locator(`text=${category}`)).toBeVisible()
    }
  })

  test('should display footer', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    // Check footer content
    await expect(footer.locator('text=© 2024')).toBeVisible()
    
    // Check social links
    const socialLinks = footer.locator('a[href*="github"], a[href*="linkedin"], a[href*="twitter"]')
    const socialLinkCount = await socialLinks.count()
    expect(socialLinkCount).toBeGreaterThan(0)
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that mobile menu toggle exists
    const menuToggle = page.locator('[data-testid="mobile-menu-toggle"]')
    await expect(menuToggle).toBeVisible()

    // Test mobile menu functionality
    await menuToggle.click()
    
    const mobileMenu = page.locator('[data-testid="mobile-menu"]')
    await expect(mobileMenu).toBeVisible()

    // Check mobile navigation links
    const mobileNavLinks = mobileMenu.locator('a')
    const linkCount = await mobileNavLinks.count()
    expect(linkCount).toBeGreaterThan(0)
  })

  test('should handle smooth scrolling', async ({ page }) => {
    // Click on navigation link
    const aboutLink = page.locator('nav a[href="#about"]')
    if (await aboutLink.count() > 0) {
      await aboutLink.click()

      // Wait for scroll animation
      await page.waitForTimeout(1000)

      // Check that page has scrolled
      const scrollTop = await page.evaluate(() => window.scrollY)
      expect(scrollTop).toBeGreaterThan(100)
    }
  })

  test('should load images correctly', async ({ page }) => {
    // Wait for images to load
    await page.waitForLoadState('networkidle')

    // Check that images are loaded
    const images = page.locator('img')
    const imageCount = await images.count()

    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const image = images.nth(i)
      await expect(image).toBeVisible()
      
      // Check that image has loaded (not broken)
      const naturalWidth = await image.evaluate((img: HTMLImageElement) => img.naturalWidth)
      expect(naturalWidth).toBeGreaterThan(0)
    }
  })

  test('should have good performance scores', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/', { waitUntil: 'networkidle' })

    // Measure performance
    const performanceTiming = await page.evaluate(() => {
      const timing = performance.timing
      return {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstByte: timing.responseStart - timing.navigationStart,
      }
    })

    // Assert reasonable load times (in milliseconds)
    expect(performanceTiming.loadTime).toBeLessThan(5000) // 5 seconds
    expect(performanceTiming.domReady).toBeLessThan(3000) // 3 seconds
    expect(performanceTiming.firstByte).toBeLessThan(1000) // 1 second
  })

  test('should handle contact form submission', async ({ page }) => {
    const contactSection = page.locator('section:has-text("Contact")')
    
    if (await contactSection.count() > 0) {
      await contactSection.scrollIntoViewIfNeeded()

      // Fill out contact form
      await page.fill('input[name="name"]', 'Test User')
      await page.fill('input[name="email"]', 'test@example.com')
      await page.fill('textarea[name="message"]', 'This is a test message')

      // Submit form
      await page.click('button[type="submit"]')

      // Check for success message
      await expect(page.locator('text=Message sent successfully')).toBeVisible({ timeout: 5000 })
    }
  })

  test('should handle keyboard navigation', async ({ page }) => {
    // Start from the top of the page
    await page.keyboard.press('Tab')

    // Check that focus is visible on navigation
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()

    // Continue tabbing through interactive elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      const currentFocus = page.locator(':focus')
      await expect(currentFocus).toBeVisible()
    }
  })
})