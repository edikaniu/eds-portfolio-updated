import { MetadataRoute } from 'next'

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

    // For security and performance, return static pages only in sitemap
    // Dynamic content will be discovered through internal linking
    return staticPages

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