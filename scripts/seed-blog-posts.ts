import { prisma } from '../lib/prisma'

const blogPosts = [
  {
    id: "ai-marketing-transformation",
    title: "How AI is Transforming Marketing: A Practical Guide",
    excerpt: "Discover how artificial intelligence is revolutionizing marketing strategies and learn practical ways to implement AI in your campaigns.",
    date: "2024-01-15",
    readTime: "8 min read",
    category: "AI & Marketing",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop&crop=center",
    author: "Edikan Udoibuot",
  },
  {
    id: "growth-hacking-strategies",
    title: "10 Growth Hacking Strategies That Actually Work",
    excerpt: "Learn proven growth hacking techniques that helped scale products from 100 to 10,000+ users in just months.",
    date: "2024-01-10",
    readTime: "12 min read",
    category: "Growth Marketing",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop&crop=center",
    author: "Edikan Udoibuot",
  },
  {
    id: "email-marketing-mastery",
    title: "Email Marketing Mastery: From 3K to 25K Subscribers",
    excerpt: "The exact strategies and tactics I used to achieve 733% email list growth in just 3 months.",
    date: "2024-01-05",
    readTime: "10 min read",
    category: "Email Marketing",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop&crop=center",
    author: "Edikan Udoibuot",
  },
  {
    id: "data-driven-marketing",
    title: "Building a Data-Driven Marketing Strategy",
    excerpt: "How to leverage analytics and performance data to optimize your marketing campaigns and improve ROI.",
    date: "2024-01-03",
    readTime: "11 min read",
    category: "Analytics",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop&crop=center",
    author: "Edikan Udoibuot",
  },
  {
    id: "conversion-optimization",
    title: "The Complete Guide to Conversion Rate Optimization",
    excerpt: "Learn how to systematically improve your conversion rates using data-driven testing and optimization techniques.",
    date: "2024-01-08",
    readTime: "10 min read",
    category: "Conversion Optimization",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop&crop=center",
    author: "Edikan Udoibuot",
  },
  {
    id: "social-media-growth",
    title: "Scaling Social Media: 70K Followers in 6 Months",
    excerpt: "The proven strategies and tactics I used to grow social media followings by 70,000+ engaged followers.",
    date: "2024-01-01",
    readTime: "8 min read",
    category: "Social Media",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop&crop=center",
    author: "Edikan Udoibuot",
  },
]

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function generateContent(excerpt: string, readTime: string): string {
  return `${excerpt}

This comprehensive guide covers everything you need to know about this topic. With practical examples and actionable strategies, you'll learn how to implement these concepts in your own marketing efforts.

## Key Takeaways

- Understand the fundamental principles
- Learn practical implementation strategies
- See real-world examples and case studies
- Get actionable tips you can use immediately

## Introduction

${excerpt} In this detailed guide, we'll explore the strategies, tools, and techniques that have proven successful in real-world scenarios.

## The Strategy

The approach I'm sharing here has been tested and refined through multiple campaigns and implementations. Each technique has been validated through actual results and performance data.

## Implementation

Here's how you can implement these strategies in your own marketing efforts:

1. **Assessment**: Start by evaluating your current situation
2. **Planning**: Develop a comprehensive strategy
3. **Execution**: Implement the tactics systematically
4. **Optimization**: Continuously improve based on data

## Results

The strategies outlined in this guide have helped achieve significant results across various campaigns and implementations. The key is consistent application and continuous optimization.

## Conclusion

By following the principles and strategies outlined in this guide, you'll be well-equipped to achieve similar results in your own marketing efforts. Remember to adapt these concepts to your specific situation and continuously measure and optimize your approach.

*Estimated reading time: ${readTime}*`
}

async function seedBlogPosts() {
  try {
    console.log('🌱 Starting blog post seeding...')

    // Clear existing blog posts
    await prisma.blogPost.deleteMany({})
    console.log('🗑️  Cleared existing blog posts')

    // Insert blog posts
    for (const post of blogPosts) {
      const slug = post.id // Use the existing ID as slug
      const content = generateContent(post.excerpt, post.readTime)
      
      await prisma.blogPost.create({
        data: {
          title: post.title,
          slug: slug,
          content: content,
          excerpt: post.excerpt,
          featuredImage: post.image,
          category: post.category,
          tags: JSON.stringify([post.category.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(), 'marketing', 'strategy']),
          metaTitle: post.title,
          metaDescription: post.excerpt,
          isDraft: false,
          publishedAt: new Date(post.date),
          createdAt: new Date(post.date),
          updatedAt: new Date(post.date)
        }
      })
      
      console.log(`✅ Created blog post: ${post.title}`)
    }

    console.log(`🎉 Successfully seeded ${blogPosts.length} blog posts!`)
  } catch (error) {
    console.error('❌ Error seeding blog posts:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedBlogPosts()
}

export { seedBlogPosts }