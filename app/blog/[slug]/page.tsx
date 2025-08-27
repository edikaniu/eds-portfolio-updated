import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  CalendarDays, 
  Clock, 
  ArrowLeft
} from 'lucide-react'
import { ShareButton } from '@/components/blog/share-button'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

interface BlogPost {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string
  date: string
  readTime: string
  category: string
  tags: string[]
  image: string
  author: string
  metaTitle?: string
  metaDescription?: string
}

// Fallback blog posts data
const fallbackBlogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'ai-marketing-transformation',
    title: 'How AI is Transforming Marketing: A Practical Guide',
    content: `
      <h2>The AI Marketing Revolution</h2>
      <p>Artificial intelligence is no longer a futuristic concept – it's revolutionizing how we approach marketing today. From personalized customer experiences to predictive analytics, AI is becoming an essential tool for marketers who want to stay competitive.</p>
      
      <h3>Key Areas Where AI is Making an Impact</h3>
      <p>AI-powered marketing is transforming several key areas:</p>
      <ul>
        <li><strong>Customer Segmentation:</strong> AI algorithms can analyze vast amounts of customer data to create more precise segments than traditional methods.</li>
        <li><strong>Content Personalization:</strong> Dynamic content that adapts to individual user preferences and behaviors.</li>
        <li><strong>Predictive Analytics:</strong> Forecasting customer behavior and campaign performance with greater accuracy.</li>
        <li><strong>Automated Campaign Optimization:</strong> Real-time adjustments to campaigns based on performance data.</li>
      </ul>
      
      <h3>Implementing AI in Your Marketing Strategy</h3>
      <p>Start small and scale gradually. Begin with one area like email personalization or customer segmentation, then expand to more complex applications as your team becomes comfortable with the technology.</p>
      
      <p>The key to success is combining AI capabilities with human creativity and strategic thinking. AI handles the data processing and optimization, while humans provide the creative vision and strategic direction.</p>
    `,
    excerpt: 'Discover how artificial intelligence is revolutionizing marketing strategies and learn practical ways to implement AI in your campaigns.',
    date: '2024-01-15',
    readTime: '8 min read',
    category: 'AI & Marketing',
    tags: ['AI', 'Marketing', 'Technology', 'Strategy'],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&crop=center',
    author: 'Edikan Udoibuot'
  },
  {
    id: '2',
    slug: 'growth-hacking-strategies',
    title: '10 Growth Hacking Strategies That Actually Work',
    content: `
      <h2>Proven Growth Hacking Techniques</h2>
      <p>Growth hacking isn't about shortcuts or tricks – it's about finding scalable, repeatable ways to grow your business rapidly. Here are 10 strategies I've used to help scale products from hundreds to thousands of users.</p>
      
      <h3>1. Referral Programs That Drive Results</h3>
      <p>Design referral programs that benefit both the referrer and the referred. The key is making the reward valuable enough to motivate sharing but not so expensive that it hurts your unit economics.</p>
      
      <h3>2. Content Marketing with a Growth Twist</h3>
      <p>Create content that naturally encourages sharing and linking. Interactive content, original research, and actionable guides tend to perform exceptionally well.</p>
      
      <h3>3. Strategic Partnerships</h3>
      <p>Partner with complementary businesses to access new customer bases. Look for win-win opportunities where both parties can provide value to each other's audiences.</p>
      
      <h3>4. Product-Led Growth</h3>
      <p>Build growth mechanisms directly into your product. Features like social sharing, collaborative workflows, or public profiles can turn users into growth drivers.</p>
      
      <h3>5. Data-Driven Experimentation</h3>
      <p>Run continuous A/B tests on everything from landing pages to email subject lines. Small improvements compound over time to create significant growth.</p>
      
      <p>Remember: sustainable growth comes from understanding your customers deeply and providing exceptional value. These tactics work because they're grounded in customer psychology and value creation.</p>
    `,
    excerpt: 'Learn proven growth hacking techniques that helped scale products from 100 to 10,000+ users in just months.',
    date: '2024-01-10',
    readTime: '12 min read',
    category: 'Growth Marketing',
    tags: ['Growth Hacking', 'Marketing', 'Strategy', 'Scaling'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&crop=center',
    author: 'Edikan Udoibuot'
  },
  {
    id: '3',
    slug: 'email-marketing-mastery',
    title: 'Email Marketing Mastery: From 3K to 25K Subscribers',
    content: `
      <h2>The Email Marketing Transformation</h2>
      <p>In just 3 months, I helped transform an email marketing program from 3,000 subscribers with poor engagement to 25,000+ highly engaged subscribers. Here's exactly how we did it.</p>
      
      <h3>Strategy 1: Segmentation Revolution</h3>
      <p>We moved from basic demographic segmentation to behavioral and psychographic segmentation. This allowed us to send highly relevant content to each subscriber segment.</p>
      
      <h3>Strategy 2: Value-First Content</h3>
      <p>Instead of always promoting products, we focused on providing genuine value in every email. Educational content, industry insights, and exclusive tips became the foundation of our strategy.</p>
      
      <h3>Strategy 3: Automation Workflows</h3>
      <p>We implemented sophisticated automation workflows for:</p>
      <ul>
        <li>Welcome sequences that nurture new subscribers</li>
        <li>Re-engagement campaigns for inactive subscribers</li>
        <li>Behavioral triggers based on website activity</li>
        <li>Post-purchase follow-up sequences</li>
      </ul>
      
      <h3>Strategy 4: Interactive Elements</h3>
      <p>Adding polls, surveys, and interactive content to emails significantly increased engagement rates and provided valuable customer insights.</p>
      
      <h3>Results That Matter</h3>
      <p>The transformation resulted in:</p>
      <ul>
        <li>733% increase in subscriber count</li>
        <li>5x improvement in engagement rates</li>
        <li>300% increase in email-driven revenue</li>
        <li>65% reduction in unsubscribe rate</li>
      </ul>
      
      <p>The key lesson: treat your email list as a community, not a broadcasting channel. When you provide consistent value and respect your subscribers' time, remarkable growth follows.</p>
    `,
    excerpt: 'The exact strategies and tactics I used to achieve 733% email list growth in just 3 months.',
    date: '2024-01-05',
    readTime: '15 min read',
    category: 'Email Marketing',
    tags: ['Email Marketing', 'Growth', 'Automation', 'Strategy'],
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop&crop=center',
    author: 'Edikan Udoibuot'
  }
]

// Fetch single blog post
async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/blog/${slug}`, {
      next: { revalidate: 3600 } // Revalidate every hour
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        // Try fallback data
        const fallbackPost = fallbackBlogPosts.find(post => post.slug === slug)
        return fallbackPost || null
      }
      throw new Error('Failed to fetch blog post')
    }
    
    const data = await response.json()
    return data.success ? data.data : (fallbackBlogPosts.find(post => post.slug === slug) || null)
  } catch (error) {
    console.error('Error fetching blog post:', error)
    // Return fallback data
    const fallbackPost = fallbackBlogPosts.find(post => post.slug === slug)
    return fallbackPost || null
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)
  
  if (!post) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.'
    }
  }
  
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    }
  }
}


interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  
  if (!post) {
    notFound()
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="py-12 bg-gradient-to-b from-muted/30 to-background mt-16">
        <div className="container mx-auto px-6 lg:px-12 xl:px-16">
          <div className="max-w-4xl mx-auto">
            <Link href="/blog">
              <Button variant="ghost" className="mb-8 -ml-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
            
            <div className="mb-6">
              <Badge variant="secondary" className="mb-4">
                {post.category}
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                {post.title}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8">
                {post.excerpt}
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime}</span>
                  </div>
                  <span>By {post.author}</span>
                </div>
                
                <div className="hidden sm:block">
                  <ShareButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Image */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content */}
      <div className="py-16">
        <div className="container mx-auto px-6 lg:px-12 xl:px-16">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: post.content }}
                className="text-foreground leading-relaxed"
              />
            </div>
            
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Mobile Share */}
            <div className="sm:hidden mt-8 pt-8 border-t">
              <ShareButton />
            </div>
            
            {/* Navigation */}
            <div className="mt-16 pt-8 border-t">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <Link href="/blog">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    More Articles
                  </Button>
                </Link>
                
                <Link href="/contact">
                  <Button>
                    Get in Touch
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}