export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
  auth?: 'admin' | 'public'
  parameters?: Array<{
    name: string
    type: string
    required: boolean
    description: string
    location: 'query' | 'body' | 'path'
  }>
  requestBody?: {
    contentType: string
    schema: Record<string, any>
    example?: any
  }
  responses: Array<{
    status: number
    description: string
    schema?: Record<string, any>
    example?: any
  }>
  tags: string[]
}

export const API_DOCUMENTATION: APIEndpoint[] = [
  // Health & Monitoring
  {
    method: 'GET',
    path: '/api/health',
    description: 'Get system health status and performance metrics',
    auth: 'public',
    responses: [
      {
        status: 200,
        description: 'System is healthy',
        example: {
          status: 'healthy',
          timestamp: '2024-01-15T10:00:00Z',
          uptime: '3600s',
          checks: {
            database: { status: 'healthy', responseTime: '45ms' },
            memory: { status: 'healthy', usage: { heapUsed: '128MB' } }
          }
        }
      },
      {
        status: 503,
        description: 'System is unhealthy or degraded',
        example: {
          status: 'degraded',
          checks: {
            database: { status: 'unhealthy', error: 'Connection timeout' }
          }
        }
      }
    ],
    tags: ['monitoring']
  },

  // Admin Authentication
  {
    method: 'POST',
    path: '/api/admin/auth/login',
    description: 'Authenticate admin user and receive JWT token',
    auth: 'public',
    requestBody: {
      contentType: 'application/json',
      schema: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 }
        }
      },
      example: {
        email: 'admin@example.com',
        password: 'securepassword'
      }
    },
    responses: [
      {
        status: 200,
        description: 'Authentication successful',
        example: {
          success: true,
          user: {
            id: 'user_123',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin'
          }
        }
      },
      {
        status: 401,
        description: 'Authentication failed',
        example: {
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Invalid credentials'
          }
        }
      }
    ],
    tags: ['auth']
  },

  {
    method: 'POST',
    path: '/api/admin/auth/logout',
    description: 'Logout admin user and invalidate session',
    auth: 'admin',
    responses: [
      {
        status: 200,
        description: 'Logout successful',
        example: {
          success: true,
          message: 'Logged out successfully'
        }
      }
    ],
    tags: ['auth']
  },

  // Blog Management
  {
    method: 'GET',
    path: '/api/blog',
    description: 'Get all published blog posts',
    auth: 'public',
    parameters: [
      {
        name: 'page',
        type: 'integer',
        required: false,
        description: 'Page number for pagination',
        location: 'query'
      },
      {
        name: 'limit',
        type: 'integer',
        required: false,
        description: 'Number of posts per page (max 50)',
        location: 'query'
      },
      {
        name: 'category',
        type: 'string',
        required: false,
        description: 'Filter by category',
        location: 'query'
      }
    ],
    responses: [
      {
        status: 200,
        description: 'Blog posts retrieved successfully',
        example: {
          success: true,
          data: [
            {
              id: 'post_123',
              title: 'Getting Started with Next.js',
              slug: 'getting-started-nextjs',
              excerpt: 'Learn how to build modern web applications...',
              publishedAt: '2024-01-15T10:00:00Z',
              category: 'development',
              tags: ['nextjs', 'react', 'tutorial']
            }
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            pages: 1
          }
        }
      }
    ],
    tags: ['blog']
  },

  {
    method: 'POST',
    path: '/api/admin/blog',
    description: 'Create a new blog post',
    auth: 'admin',
    requestBody: {
      contentType: 'application/json',
      schema: {
        type: 'object',
        required: ['title', 'content'],
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          excerpt: { type: 'string' },
          category: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          published: { type: 'boolean' },
          imageUrl: { type: 'string' }
        }
      },
      example: {
        title: 'My New Blog Post',
        content: '<p>This is the content of my blog post...</p>',
        excerpt: 'A brief summary of the post',
        category: 'development',
        tags: ['nextjs', 'tutorial'],
        published: true,
        imageUrl: 'https://example.com/image.jpg'
      }
    },
    responses: [
      {
        status: 201,
        description: 'Blog post created successfully',
        example: {
          success: true,
          data: {
            id: 'post_456',
            title: 'My New Blog Post',
            slug: 'my-new-blog-post',
            createdAt: '2024-01-15T10:00:00Z'
          }
        }
      },
      {
        status: 400,
        description: 'Validation error',
        example: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: [
              {
                field: 'title',
                message: 'Title is required'
              }
            ]
          }
        }
      }
    ],
    tags: ['blog', 'admin']
  },

  // Content Management
  {
    method: 'GET',
    path: '/api/admin/content/schedule',
    description: 'Get all scheduled blog posts',
    auth: 'admin',
    parameters: [
      {
        name: 'limit',
        type: 'integer',
        required: false,
        description: 'Maximum number of scheduled posts to return',
        location: 'query'
      }
    ],
    responses: [
      {
        status: 200,
        description: 'Scheduled posts retrieved successfully',
        example: {
          success: true,
          data: [
            {
              id: 'post_789',
              title: 'Upcoming Post',
              publishedAt: '2024-01-20T10:00:00Z',
              isScheduled: true,
              timeUntilPublish: 432000000
            }
          ]
        }
      }
    ],
    tags: ['content', 'scheduling', 'admin']
  },

  {
    method: 'POST',
    path: '/api/admin/content/schedule',
    description: 'Schedule a new blog post for future publication',
    auth: 'admin',
    requestBody: {
      contentType: 'application/json',
      schema: {
        type: 'object',
        required: ['title', 'content', 'publishAt'],
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          publishAt: { type: 'string', format: 'date-time' },
          autoPublish: { type: 'boolean', default: true },
          notifyOnPublish: { type: 'boolean', default: false }
        }
      },
      example: {
        title: 'Future Blog Post',
        content: '<p>This will be published later...</p>',
        publishAt: '2024-01-20T10:00:00Z',
        autoPublish: true,
        notifyOnPublish: false
      }
    },
    responses: [
      {
        status: 201,
        description: 'Post scheduled successfully',
        example: {
          success: true,
          data: {
            id: 'post_101112',
            title: 'Future Blog Post',
            publishedAt: '2024-01-20T10:00:00Z',
            isScheduled: true
          },
          message: 'Post scheduled successfully'
        }
      }
    ],
    tags: ['content', 'scheduling', 'admin']
  },

  // Projects API
  {
    method: 'GET',
    path: '/api/projects',
    description: 'Get all active projects',
    auth: 'public',
    parameters: [
      {
        name: 'category',
        type: 'string',
        required: false,
        description: 'Filter projects by category',
        location: 'query'
      },
      {
        name: 'limit',
        type: 'integer',
        required: false,
        description: 'Maximum number of projects to return',
        location: 'query'
      }
    ],
    responses: [
      {
        status: 200,
        description: 'Projects retrieved successfully',
        example: {
          success: true,
          data: [
            {
              id: 'project_123',
              title: 'E-commerce Platform',
              description: 'A modern e-commerce solution...',
              technologies: ['Next.js', 'Prisma', 'Stripe'],
              githubUrl: 'https://github.com/user/project',
              liveUrl: 'https://project-demo.com',
              category: 'web-development'
            }
          ]
        }
      }
    ],
    tags: ['projects']
  },

  // Case Studies API
  {
    method: 'GET',
    path: '/api/case-studies',
    description: 'Get all case studies',
    auth: 'public',
    responses: [
      {
        status: 200,
        description: 'Case studies retrieved successfully',
        example: {
          success: true,
          data: [
            {
              id: 'case_123',
              title: 'Marketing Campaign Optimization',
              description: 'How we increased conversion rates by 200%',
              metrics: '200% increase in conversions',
              results: '$50k additional revenue',
              category: 'marketing'
            }
          ]
        }
      }
    ],
    tags: ['case-studies']
  },

  // Search API
  {
    method: 'GET',
    path: '/api/search',
    description: 'Search across all content types',
    auth: 'public',
    parameters: [
      {
        name: 'q',
        type: 'string',
        required: true,
        description: 'Search query',
        location: 'query'
      },
      {
        name: 'type',
        type: 'string',
        required: false,
        description: 'Content type to search (blog, projects, case-studies)',
        location: 'query'
      },
      {
        name: 'limit',
        type: 'integer',
        required: false,
        description: 'Maximum number of results',
        location: 'query'
      }
    ],
    responses: [
      {
        status: 200,
        description: 'Search results retrieved successfully',
        example: {
          success: true,
          data: {
            results: [
              {
                type: 'blog',
                id: 'post_123',
                title: 'Next.js Tutorial',
                excerpt: 'Learn Next.js basics...',
                relevance: 0.95
              }
            ],
            total: 1,
            query: 'nextjs'
          }
        }
      }
    ],
    tags: ['search']
  },

  // Performance API
  {
    method: 'GET',
    path: '/api/performance',
    description: 'Get performance metrics and Core Web Vitals',
    auth: 'public',
    responses: [
      {
        status: 200,
        description: 'Performance metrics retrieved successfully',
        example: {
          success: true,
          data: {
            coreWebVitals: {
              lcp: 1.2,
              fid: 0.08,
              cls: 0.05
            },
            pageLoadTime: 850,
            timestamp: '2024-01-15T10:00:00Z'
          }
        }
      }
    ],
    tags: ['performance']
  }
]

export function generateOpenAPISpec() {
  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'Portfolio API',
      version: '1.0.0',
      description: 'API for Edikan Udoibuot\'s portfolio website with comprehensive content management',
      contact: {
        name: 'Edikan Udoibuot',
        email: 'edikanudoibuot@gmail.com',
        url: 'https://edikanudoibuot.com'
      }
    },
    servers: [
      {
        url: 'https://edikanudoibuot.com',
        description: 'Production server'
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    security: [
      {
        cookieAuth: []
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'auth-token'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                requestId: { type: 'string' }
              }
            }
          }
        },
        BlogPost: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' },
            content: { type: 'string' },
            excerpt: { type: 'string' },
            category: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            published: { type: 'boolean' },
            publishedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            technologies: { type: 'array', items: { type: 'string' } },
            githubUrl: { type: 'string' },
            liveUrl: { type: 'string' },
            category: { type: 'string' },
            isActive: { type: 'boolean' }
          }
        }
      }
    },
    paths: {} as Record<string, any>,
    tags: [
      { name: 'auth', description: 'Authentication endpoints' },
      { name: 'blog', description: 'Blog post operations' },
      { name: 'projects', description: 'Project portfolio operations' },
      { name: 'case-studies', description: 'Case study operations' },
      { name: 'content', description: 'Content management' },
      { name: 'scheduling', description: 'Content scheduling' },
      { name: 'search', description: 'Search functionality' },
      { name: 'monitoring', description: 'System monitoring' },
      { name: 'performance', description: 'Performance metrics' },
      { name: 'admin', description: 'Admin-only endpoints' }
    ]
  }

  // Convert our endpoints to OpenAPI format
  for (const endpoint of API_DOCUMENTATION) {
    if (!spec.paths[endpoint.path]) {
      spec.paths[endpoint.path] = {}
    }

    const method = endpoint.method.toLowerCase()
    spec.paths[endpoint.path][method] = {
      summary: endpoint.description,
      tags: endpoint.tags,
      security: endpoint.auth === 'admin' ? [{ cookieAuth: [] }] : [],
      parameters: endpoint.parameters?.map(param => ({
        name: param.name,
        in: param.location,
        required: param.required,
        description: param.description,
        schema: { type: param.type }
      })),
      requestBody: endpoint.requestBody ? {
        required: true,
        content: {
          [endpoint.requestBody.contentType]: {
            schema: endpoint.requestBody.schema,
            example: endpoint.requestBody.example
          }
        }
      } : undefined,
      responses: endpoint.responses.reduce((acc, response) => {
        acc[response.status] = {
          description: response.description,
          content: {
            'application/json': {
              schema: response.schema || { type: 'object' },
              example: response.example
            }
          }
        }
        return acc
      }, {} as Record<string, any>)
    }
  }

  return spec
}