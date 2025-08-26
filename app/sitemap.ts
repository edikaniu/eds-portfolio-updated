import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://edikanudoibuot.com'
  
  try {
    // Static pages with their priority and change frequency
    const staticPages = [
      {
        url: `${baseUrl}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl}/projects`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/case-studies`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      },
    ]

    // Get dynamic content from database
    const [blogPosts, projects, caseStudies] = await Promise.all([
      // Published blog posts
      prisma.blogPost.findMany({
        where: { published: true },
        select: {
          slug: true,
          updatedAt: true,
          createdAt: true,
        },
        orderBy: { updatedAt: 'desc' }
      }),

      // Published projects
      prisma.project.findMany({
        where: { isActive: true },
        select: {
          slug: true,
          updatedAt: true,
          createdAt: true,
        },
        orderBy: { updatedAt: 'desc' }
      }),

      // Published case studies
      prisma.caseStudy.findMany({
        where: { isActive: true },
        select: {
          slug: true,
          updatedAt: true,
          createdAt: true,
        },
        orderBy: { updatedAt: 'desc' }
      }),
    ])

    // Generate dynamic blog post URLs
    const blogUrls = blogPosts.map(post => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    // Generate dynamic project URLs
    const projectUrls = projects.map(project => ({
      url: `${baseUrl}/project/${project.slug}`,
      lastModified: project.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    // Generate dynamic case study URLs
    const caseStudyUrls = caseStudies.map(caseStudy => ({
      url: `${baseUrl}/case-study/${caseStudy.slug}`,
      lastModified: caseStudy.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    // Combine all URLs
    const allUrls = [
      ...staticPages,
      ...blogUrls,
      ...projectUrls,
      ...caseStudyUrls,
    ]

    logger.info('Sitemap generated successfully', {
      staticPages: staticPages.length,
      blogPosts: blogUrls.length,
      projects: projectUrls.length,
      caseStudies: caseStudyUrls.length,
      totalUrls: allUrls.length
    })

    return allUrls

  } catch (error) {
    logger.error('Sitemap generation failed', error)
    
    // Return minimal sitemap on error
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/projects`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/case-studies`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
    ]
  }
}