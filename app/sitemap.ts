import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

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

    // Dynamic blog posts
    const blogPosts = await prisma.blogPost.findMany({
      where: { published: true },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 100 // Limit for performance
    })

    const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

    // Dynamic projects
    const projects = await prisma.project.findMany({
      where: { isActive: true },
      select: {
        id: true,
        slug: true,
        updatedAt: true,
      },
      orderBy: { order: 'asc' },
      take: 50 // Limit for performance
    })

    const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
      url: `${baseUrl}/project/${project.id}`,
      lastModified: project.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))

    // Dynamic case studies
    const caseStudies = await prisma.caseStudy.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { order: 'asc' },
      take: 50 // Limit for performance
    })

    const caseStudyPages: MetadataRoute.Sitemap = caseStudies.map((study) => ({
      url: `${baseUrl}/case-study/${study.slug}`,
      lastModified: study.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))

    return [...staticPages, ...blogPages, ...projectPages, ...caseStudyPages]

  } catch (error) {
    console.error('Sitemap generation failed', error)
    
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