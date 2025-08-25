import type { Metadata } from 'next'

export interface PageMetadata {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
}

export function generateMetadata(data: PageMetadata): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://edikanudoibuot.com'
  const defaultImage = `${baseUrl}/og-image.jpg`
  
  const metadata: Metadata = {
    title: data.title,
    description: data.description,
    keywords: data.keywords?.join(', '),
    authors: data.author ? [{ name: data.author }] : [{ name: 'Edikan Udoibuot' }],
    creator: 'Edikan Udoibuot',
    publisher: 'Edikan Udoibuot',
    alternates: {
      canonical: data.url ? `${baseUrl}${data.url}` : baseUrl,
    },
    openGraph: {
      type: data.type || 'website',
      locale: 'en_US',
      url: data.url ? `${baseUrl}${data.url}` : baseUrl,
      siteName: 'Edikan Udoibuot Portfolio',
      title: data.title,
      description: data.description,
      images: [
        {
          url: data.image || defaultImage,
          width: 1200,
          height: 630,
          alt: data.title,
        },
      ],
      ...(data.type === 'article' && {
        publishedTime: data.publishedTime,
        modifiedTime: data.modifiedTime,
        section: data.section,
        authors: [data.author || 'Edikan Udoibuot'],
        tags: data.tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      site: '@edikan_udoibuot',
      creator: '@edikan_udoibuot',
      title: data.title,
      description: data.description,
      images: [data.image || defaultImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  }

  return metadata
}

export function generateBlogPostMetadata(post: {
  id: number
  title: string
  excerpt: string
  content: string
  slug: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
}): Metadata {
  const url = `/blog/${post.slug}`
  const keywords = [...post.tags, 'marketing', 'growth', 'strategy', 'AI', 'fintech']
  
  return generateMetadata({
    title: `${post.title} | Edikan Udoibuot Blog`,
    description: post.excerpt || post.content.substring(0, 160).replace(/<[^>]*>/g, '') + '...',
    keywords,
    url,
    type: 'article',
    publishedTime: post.createdAt.toISOString(),
    modifiedTime: post.updatedAt.toISOString(),
    author: 'Edikan Udoibuot',
    section: 'Marketing & Growth',
    tags: post.tags,
  })
}

export function generateProjectMetadata(project: {
  id: number
  title: string
  description: string
  slug: string
  category: string
  technologies: string[]
  createdAt: Date
  updatedAt: Date
}): Metadata {
  const url = `/project/${project.slug}`
  const keywords = [
    ...project.technologies, 
    project.category,
    'marketing project',
    'growth strategy',
    'case study'
  ]
  
  return generateMetadata({
    title: `${project.title} | Projects | Edikan Udoibuot`,
    description: project.description,
    keywords,
    url,
    type: 'article',
    publishedTime: project.createdAt.toISOString(),
    modifiedTime: project.updatedAt.toISOString(),
    section: 'Projects',
    tags: project.technologies,
  })
}

export function generateCaseStudyMetadata(caseStudy: {
  id: number
  title: string
  description: string
  slug: string
  client: string
  industry: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
}): Metadata {
  const url = `/case-study/${caseStudy.slug}`
  const keywords = [
    ...caseStudy.tags,
    caseStudy.industry,
    caseStudy.client,
    'case study',
    'marketing results',
    'growth strategy'
  ]
  
  return generateMetadata({
    title: `${caseStudy.title} | Case Studies | Edikan Udoibuot`,
    description: caseStudy.description,
    keywords,
    url,
    type: 'article',
    publishedTime: caseStudy.createdAt.toISOString(),
    modifiedTime: caseStudy.updatedAt.toISOString(),
    section: 'Case Studies',
    tags: caseStudy.tags,
  })
}

// Default metadata for main pages
export const homeMetadata = generateMetadata({
  title: 'Edikan Udoibuot | Marketing & Growth Leader | AI-Powered Strategies',
  description: 'Marketing professional with 7+ years scaling products from 100 to 10,000+ users. Specialized in AI-driven marketing, growth strategies, and product marketing.',
  keywords: [
    'Growth Marketing Expert Nigeria',
    'AI Marketing Strategist',
    'Product Marketing Lead Fintech',
    'Digital Marketing Specialist Lagos',
    'Marketing Growth Hacker',
    'Performance Marketing Manager',
    'SaaS Marketing Expert',
    'Conversion Rate Optimization'
  ],
  url: '/',
})

export const projectsMetadata = generateMetadata({
  title: 'Marketing Projects & Case Studies | Edikan Udoibuot',
  description: 'Explore my portfolio of successful marketing projects, growth campaigns, and strategic initiatives that drove measurable results across various industries.',
  keywords: [
    'marketing projects',
    'growth case studies',
    'marketing portfolio',
    'campaign results',
    'growth experiments',
    'marketing strategy',
    'conversion optimization',
    'user acquisition'
  ],
  url: '/projects',
})

export const blogMetadata = generateMetadata({
  title: 'Marketing Insights & Growth Strategies | Edikan Udoibuot Blog',
  description: 'Learn from proven marketing strategies, growth tactics, and AI-powered marketing insights. Get actionable tips for scaling your business.',
  keywords: [
    'marketing blog',
    'growth strategies',
    'marketing insights',
    'AI marketing',
    'growth hacking',
    'marketing tips',
    'conversion optimization',
    'user retention'
  ],
  url: '/blog',
})

export const caseStudiesMetadata = generateMetadata({
  title: 'Marketing Case Studies & Results | Edikan Udoibuot',
  description: 'Detailed case studies showcasing marketing campaigns, growth strategies, and measurable results across fintech, SaaS, and e-commerce industries.',
  keywords: [
    'marketing case studies',
    'growth results',
    'marketing ROI',
    'campaign analysis',
    'growth metrics',
    'marketing success stories',
    'conversion case studies',
    'user growth'
  ],
  url: '/case-studies',
})