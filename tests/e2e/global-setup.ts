import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL!

  // Launch browser for setup
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Wait for the application to be ready
    console.log(`Waiting for ${baseURL} to be ready...`)
    await page.goto(baseURL)
    await page.waitForSelector('body', { timeout: 60000 })
    
    console.log('Application is ready!')

    // Perform any global setup tasks here
    // For example, create test data, authenticate, etc.

    // Create admin user for testing (if needed)
    try {
      const response = await page.request.post(`${baseURL}/api/setup`, {
        data: {
          email: 'test-admin@example.com',
          password: 'test-password-123',
          name: 'Test Admin',
        },
      })
      
      if (response.ok()) {
        console.log('Test admin user created')
      }
    } catch (error) {
      // Admin user might already exist
      console.log('Admin user setup skipped (might already exist)')
    }

  } catch (error) {
    console.error('Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup