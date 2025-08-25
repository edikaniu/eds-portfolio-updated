// Structured data generators for SEO
export interface StructuredDataConfig {
  baseUrl?: string
  siteName?: string
  author?: {
    name: string
    email?: string
    url?: string
    image?: string
    jobTitle?: string
    worksFor?: string
  }
}

const defaultConfig: StructuredDataConfig = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://edikanudoibuot.com',
  siteName: 'Edikan Udoibuot Portfolio',
  author: {
    name: 'Edikan Udoibuot',
    email: 'edikanudoibuot@gmail.com',
    url: 'https://edikanudoibuot.com',
    jobTitle: 'Marketing & Growth Leader',
    worksFor: 'Freelance Marketing Consultant'
  }
}

// Person/Author structured data
export function generatePersonSchema(config = defaultConfig) {
  const author = config.author!
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: config.baseUrl,
    email: author.email,
    jobTitle: author.jobTitle,
    worksFor: {
      '@type': 'Organization',
      name: author.worksFor
    },
    sameAs: [
      'https://www.linkedin.com/in/edikanudoibuot/',
      'https://x.com/edikanudoibuot',
      'https://github.com/edikanius'
    ],
    knowsAbout: [
      'Digital Marketing',
      'Growth Marketing',
      'Product Marketing',
      'AI Marketing',
      'Marketing Analytics',
      'Customer Acquisition',
      'Conversion Optimization'
    ]
  }
}

// Website structured data
export function generateWebsiteSchema(config = defaultConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.siteName,
    url: config.baseUrl,
    author: {
      '@type': 'Person',
      name: config.author?.name
    },
    description: 'Marketing professional with 7+ years scaling products from 100 to 10,000+ users through data-driven growth strategies and AI-powered marketing.',
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${config.baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }
}

// Organization structured data (for professional services)
export function generateOrganizationSchema(config = defaultConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Edikan Udoibuot Marketing Services',
    url: config.baseUrl,
    logo: `${config.baseUrl}/logo.png`,
    description: 'Professional marketing and growth services specializing in AI-powered marketing strategies, customer acquisition, and product growth.',
    founder: {
      '@type': 'Person',
      name: config.author?.name
    },
    serviceType: 'Marketing Consulting',
    areaServed: 'Global',
    availableLanguage: 'English',
    priceRange: '$$',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-XXX-XXX-XXXX',
      contactType: 'Customer Service',
      email: config.author?.email,
      availableLanguage: 'English'
    }
  }
}

// Blog post structured data
export function generateBlogPostSchema(post: {
  title: string
  content: string
  excerpt?: string
  slug: string
  category?: string
  tags?: string
  publishedAt: Date
  updatedAt: Date
  featuredImage?: string
}, config = defaultConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.content.slice(0, 160),
    author: {
      '@type': 'Person',
      name: config.author?.name,
      url: config.baseUrl
    },
    publisher: {
      '@type': 'Organization',
      name: config.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${config.baseUrl}/logo.png`
      }
    },
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    url: `${config.baseUrl}/blog/${post.slug}`,
    image: post.featuredImage || `${config.baseUrl}/og-image.png`,
    keywords: post.tags?.split(',').map(tag => tag.trim()).join(', '),
    articleSection: post.category,
    inLanguage: 'en-US',
    wordCount: post.content.replace(/<[^>]*>/g, '').split(/\s+/).length,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${config.baseUrl}/blog/${post.slug}`
    }
  }
}

// Project structured data
export function generateProjectSchema(project: {
  title: string
  description: string
  slug: string
  technologies?: string
  category?: string
  demoUrl?: string
  githubUrl?: string
  featuredImage?: string
  startDate?: Date
  endDate?: Date
}, config = defaultConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${config.baseUrl}/project/${project.slug}`,
    name: project.title,
    description: project.description,
    url: `${config.baseUrl}/project/${project.slug}`,
    creator: {
      '@type': 'Person',
      name: config.author?.name,
      url: config.baseUrl
    },
    image: project.featuredImage,
    keywords: project.technologies,
    genre: project.category,
    ...(project.demoUrl && {
      sameAs: [project.demoUrl, project.githubUrl].filter(Boolean)
    }),
    ...(project.startDate && {
      dateCreated: project.startDate.toISOString()
    }),
    inLanguage: 'en-US'
  }
}

// Case study structured data
export function generateCaseStudySchema(caseStudy: {
  title: string
  description: string
  slug: string
  category?: string
  challenge?: string
  solution?: string
  results?: string
  clientName?: string
  duration?: string
  featuredImage?: string
  publishedAt: Date
}, config = defaultConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${config.baseUrl}/case-study/${caseStudy.slug}`,
    headline: caseStudy.title,
    description: caseStudy.description,
    author: {
      '@type': 'Person',
      name: config.author?.name,
      url: config.baseUrl
    },
    publisher: {
      '@type': 'Organization',
      name: config.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${config.baseUrl}/logo.png`
      }
    },
    datePublished: caseStudy.publishedAt.toISOString(),
    url: `${config.baseUrl}/case-study/${caseStudy.slug}`,
    image: caseStudy.featuredImage || `${config.baseUrl}/og-image.png`,
    articleSection: caseStudy.category,
    about: {
      '@type': 'Thing',
      name: caseStudy.clientName || 'Marketing Campaign'
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${config.baseUrl}/case-study/${caseStudy.slug}`
    }
  }
}

// Breadcrumb structured data
export function generateBreadcrumbSchema(breadcrumbs: Array<{
  name: string
  url: string
}>, config = defaultConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  }
}

// FAQ structured data
export function generateFAQSchema(faqs: Array<{
  question: string
  answer: string
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

// Portfolio/Collection structured data
export function generatePortfolioSchema(config = defaultConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Marketing Portfolio',
    description: 'A collection of successful marketing campaigns, growth strategies, and case studies.',
    url: `${config.baseUrl}/projects`,
    author: {
      '@type': 'Person',
      name: config.author?.name
    },
    mainEntity: {
      '@type': 'ItemList',
      name: 'Marketing Projects',
      description: 'Successful marketing projects and campaigns'
    }
  }
}

// Service/Offering structured data
export function generateServiceSchema(service: {
  name: string
  description: string
  category: string
  priceRange?: string
}, config = defaultConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'Person',
      name: config.author?.name,
      url: config.baseUrl
    },
    serviceType: service.category,
    areaServed: 'Global',
    availableLanguage: 'English',
    ...(service.priceRange && { priceRange: service.priceRange })
  }
}