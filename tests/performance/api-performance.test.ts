import { performance } from 'perf_hooks'

describe('API Performance Tests', () => {
  const baseURL = process.env.TEST_URL || 'http://localhost:3000'
  const maxResponseTime = 1000 // 1 second
  const maxSlowResponseTime = 2000 // 2 seconds for complex queries

  beforeAll(() => {
    // Warm up the server
    return Promise.all([
      fetch(`${baseURL}/api/blog`),
      fetch(`${baseURL}/api/projects`),
      fetch(`${baseURL}/api/case-studies`),
    ]).catch(() => {
      // Ignore warm-up errors
    })
  })

  describe('/api/blog', () => {
    it('should respond within acceptable time limits', async () => {
      const start = performance.now()
      
      const response = await fetch(`${baseURL}/api/blog`)
      
      const duration = performance.now() - start
      
      expect(response.ok).toBe(true)
      expect(duration).toBeLessThan(maxResponseTime)
    })

    it('should handle pagination efficiently', async () => {
      const requests = [
        fetch(`${baseURL}/api/blog?page=1&limit=10`),
        fetch(`${baseURL}/api/blog?page=2&limit=10`),
        fetch(`${baseURL}/api/blog?page=3&limit=10`),
      ]

      const start = performance.now()
      const responses = await Promise.all(requests)
      const duration = performance.now() - start

      // All requests should complete within reasonable time
      expect(duration).toBeLessThan(maxResponseTime * 2)
      responses.forEach(response => {
        expect(response.ok).toBe(true)
      })
    })

    it('should handle filtered queries efficiently', async () => {
      const start = performance.now()
      
      const response = await fetch(`${baseURL}/api/blog?category=Technology&featured=true`)
      
      const duration = performance.now() - start
      
      expect(response.ok).toBe(true)
      expect(duration).toBeLessThan(maxResponseTime)
    })

    it('should handle search queries within acceptable time', async () => {
      const start = performance.now()
      
      const response = await fetch(`${baseURL}/api/blog?search=react`)
      
      const duration = performance.now() - start
      
      expect(response.ok).toBe(true)
      expect(duration).toBeLessThan(maxSlowResponseTime) // Search might be slower
    })
  })

  describe('/api/projects', () => {
    it('should respond within acceptable time limits', async () => {
      const start = performance.now()
      
      const response = await fetch(`${baseURL}/api/projects`)
      
      const duration = performance.now() - start
      
      expect(response.ok).toBe(true)
      expect(duration).toBeLessThan(maxResponseTime)
    })

    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 10
      const requests = Array.from({ length: concurrentRequests }, () =>
        fetch(`${baseURL}/api/projects`)
      )

      const start = performance.now()
      const responses = await Promise.all(requests)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(maxResponseTime * 2)
      responses.forEach(response => {
        expect(response.ok).toBe(true)
      })
    })
  })

  describe('/api/case-studies', () => {
    it('should respond within acceptable time limits', async () => {
      const start = performance.now()
      
      const response = await fetch(`${baseURL}/api/case-studies`)
      
      const duration = performance.now() - start
      
      expect(response.ok).toBe(true)
      expect(duration).toBeLessThan(maxResponseTime)
    })

    it('should handle limited queries efficiently', async () => {
      const start = performance.now()
      
      const response = await fetch(`${baseURL}/api/case-studies?limit=5`)
      
      const duration = performance.now() - start
      
      expect(response.ok).toBe(true)
      expect(duration).toBeLessThan(maxResponseTime)
    })
  })

  describe('Cache Performance', () => {
    it('should serve cached responses faster on subsequent requests', async () => {
      const url = `${baseURL}/api/blog`

      // First request (cache miss)
      const start1 = performance.now()
      const response1 = await fetch(url)
      const duration1 = performance.now() - start1

      expect(response1.ok).toBe(true)

      // Second request (should be cached)
      const start2 = performance.now()
      const response2 = await fetch(url)
      const duration2 = performance.now() - start2

      expect(response2.ok).toBe(true)
      
      // Second request should be significantly faster
      // Allow some tolerance for network variations
      expect(duration2).toBeLessThan(duration1 * 0.8)
    })

    it('should handle cache headers correctly', async () => {
      const response = await fetch(`${baseURL}/api/blog`)
      
      expect(response.ok).toBe(true)
      expect(response.headers.get('cache-control')).toBeTruthy()
      expect(response.headers.get('x-cache')).toBeTruthy()
    })
  })

  describe('Admin API Performance', () => {
    let authToken: string

    beforeAll(async () => {
      // Login to get auth token
      try {
        const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test-admin@example.com',
            password: 'test-password-123',
          }),
        })

        if (loginResponse.ok) {
          const loginData = await loginResponse.json()
          authToken = loginData.token || 'mock-token'
        }
      } catch (error) {
        // Use mock token if login fails
        authToken = 'mock-token'
      }
    })

    it('should handle admin dashboard API efficiently', async () => {
      const start = performance.now()
      
      const response = await fetch(`${baseURL}/api/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      
      const duration = performance.now() - start
      
      // Admin endpoints might be slower due to auth checks
      expect(duration).toBeLessThan(maxSlowResponseTime)
    })

    it('should handle performance metrics API efficiently', async () => {
      const start = performance.now()
      
      const response = await fetch(`${baseURL}/api/admin/performance`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      
      const duration = performance.now() - start
      
      // Performance API might be slower due to data aggregation
      expect(duration).toBeLessThan(maxSlowResponseTime)
    })
  })

  describe('Response Size Optimization', () => {
    it('should return reasonably sized responses', async () => {
      const response = await fetch(`${baseURL}/api/blog`)
      const data = await response.text()
      const sizeInBytes = new Blob([data]).size
      const sizeInKB = sizeInBytes / 1024

      expect(response.ok).toBe(true)
      expect(sizeInKB).toBeLessThan(100) // Should be less than 100KB
    })

    it('should support compression headers', async () => {
      const response = await fetch(`${baseURL}/api/blog`, {
        headers: {
          'Accept-Encoding': 'gzip, deflate, br',
        },
      })

      expect(response.ok).toBe(true)
      
      // Check if response is compressed
      const contentEncoding = response.headers.get('content-encoding')
      if (contentEncoding) {
        expect(['gzip', 'deflate', 'br']).toContain(contentEncoding)
      }
    })
  })

  describe('Error Response Performance', () => {
    it('should handle 404 errors quickly', async () => {
      const start = performance.now()
      
      const response = await fetch(`${baseURL}/api/non-existent-endpoint`)
      
      const duration = performance.now() - start
      
      expect(response.status).toBe(404)
      expect(duration).toBeLessThan(500) // Error responses should be fast
    })

    it('should handle malformed requests quickly', async () => {
      const start = performance.now()
      
      const response = await fetch(`${baseURL}/api/blog?page=invalid`)
      
      const duration = performance.now() - start
      
      expect(duration).toBeLessThan(maxResponseTime)
    })
  })

  describe('Load Testing', () => {
    it('should handle burst of concurrent requests', async () => {
      const concurrentRequests = 20
      const requests = Array.from({ length: concurrentRequests }, (_, i) =>
        fetch(`${baseURL}/api/blog?page=${i % 3 + 1}`)
      )

      const start = performance.now()
      const responses = await Promise.all(requests)
      const duration = performance.now() - start

      // All requests should complete within reasonable time
      expect(duration).toBeLessThan(maxSlowResponseTime * 2)
      
      // Most requests should succeed
      const successCount = responses.filter(r => r.ok).length
      expect(successCount / concurrentRequests).toBeGreaterThan(0.8) // At least 80% success
    })
  })
})