import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Common test utilities
export const createMockRouter = (overrides = {}) => ({
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  ...overrides,
})

export const mockFetch = (data: any, status = 200) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
      headers: new Headers(),
    })
  ) as jest.Mock
}

export const mockFetchError = (error: string, status = 500) => {
  global.fetch = jest.fn(() =>
    Promise.reject(new Error(error))
  ) as jest.Mock
}

// Database test utilities
export const createMockPrisma = () => ({
  blogPost: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  project: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  caseStudy: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  adminUser: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),
  $transaction: jest.fn(),
})

// API test utilities
export const createMockRequest = (
  method: string = 'GET',
  url: string = 'http://localhost:3000/api/test',
  body?: any,
  headers?: Record<string, string>
) => {
  const request = {
    method,
    url,
    headers: new Headers(headers),
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(JSON.stringify(body)),
    nextUrl: new URL(url),
  }

  return request as any
}

export const createMockResponse = () => {
  const response = {
    json: jest.fn(),
    text: jest.fn(),
    status: jest.fn(),
    headers: new Headers(),
  }

  return response as any
}

// Component test utilities
export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 100))

export const createMockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  })
  window.IntersectionObserver = mockIntersectionObserver
}

// Form test utilities
export const submitForm = async (form: HTMLFormElement) => {
  const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
  form.dispatchEvent(submitEvent)
}

// Mock data factories
export const createMockBlogPost = (overrides = {}) => ({
  id: '1',
  title: 'Test Blog Post',
  slug: 'test-blog-post',
  excerpt: 'This is a test blog post excerpt',
  content: 'This is the full content of the test blog post',
  featuredImage: 'https://example.com/image.jpg',
  category: 'Technology',
  tags: ['test', 'blog'],
  publishedAt: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  isDraft: false,
  ...overrides,
})

export const createMockProject = (overrides = {}) => ({
  id: '1',
  title: 'Test Project',
  slug: 'test-project',
  description: 'This is a test project description',
  technologies: ['React', 'TypeScript', 'Next.js'],
  image: 'https://example.com/project-image.jpg',
  demoUrl: 'https://example.com/demo',
  githubUrl: 'https://github.com/test/project',
  category: 'Web Development',
  status: 'Live',
  isActive: true,
  featured: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

export const createMockCaseStudy = (overrides = {}) => ({
  id: '1',
  title: 'Test Case Study',
  slug: 'test-case-study',
  client: 'Test Client',
  industry: 'Technology',
  description: 'This is a test case study description',
  challenge: 'The challenge description',
  solution: 'The solution description',
  results: ['Improved performance by 50%', 'Reduced costs by 30%'],
  technologies: ['React', 'Node.js', 'PostgreSQL'],
  image: 'https://example.com/case-study-image.jpg',
  duration: '3 months',
  teamSize: 4,
  featured: false,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})