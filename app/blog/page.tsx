import { Metadata } from 'next'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CalendarDays, Clock, Search, ArrowRight } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: string
  category: string
  image: string
  author: string
}

// Fetch blog posts from API
async function getBlogPosts(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = typeof searchParams.page === 'string' ? searchParams.page : '1'
  const search = typeof searchParams.search === 'string' ? searchParams.search : ''
  const category = typeof searchParams.category === 'string' ? searchParams.category : ''
  
  const params = new URLSearchParams()
  if (page !== '1') params.set('page', page)
  if (search) params.set('search', search)
  if (category) params.set('category', category)
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/blog?${params.toString()}`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch blog posts')
    }
    
    const data = await response.json()
    return data.success ? { posts: data.data, pagination: data.pagination } : { posts: [], pagination: null }
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    // Return fallback blog posts
    return { 
      posts: [
        {
          id: '1',
          slug: 'ai-marketing-transformation',
          title: 'How AI is Transforming Marketing: A Practical Guide',
          excerpt: 'Discover how artificial intelligence is revolutionizing marketing strategies and learn practical ways to implement AI in your campaigns.',
          date: '2024-01-15',
          readTime: '8 min read',
          category: 'AI & Marketing',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop&crop=center',
          author: 'Edikan Udoibuot'
        },
        {
          id: '2',
          slug: 'growth-hacking-strategies',
          title: '10 Growth Hacking Strategies That Actually Work',
          excerpt: 'Learn proven growth hacking techniques that helped scale products from 100 to 10,000+ users in just months.',
          date: '2024-01-10',
          readTime: '12 min read',
          category: 'Growth Marketing',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop&crop=center',
          author: 'Edikan Udoibuot'
        },
        {
          id: '3',
          slug: 'email-marketing-mastery',
          title: 'Email Marketing Mastery: From 3K to 25K Subscribers',
          excerpt: 'The exact strategies and tactics I used to achieve 733% email list growth in just 3 months.',
          date: '2024-01-05',
          readTime: '15 min read',
          category: 'Email Marketing',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop&crop=center',
          author: 'Edikan Udoibuot'
        },
        {
          id: '4',
          slug: 'data-driven-marketing',
          title: 'Building a Data-Driven Marketing Strategy',
          excerpt: 'How to leverage analytics and performance data to optimize your marketing campaigns and improve ROI.',
          date: '2024-01-03',
          readTime: '10 min read',
          category: 'Analytics',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop&crop=center',
          author: 'Edikan Udoibuot'
        },
        {
          id: '5',
          slug: 'conversion-optimization',
          title: 'The Complete Guide to Conversion Rate Optimization',
          excerpt: 'Learn how to systematically improve your conversion rates using data-driven testing and optimization techniques.',
          date: '2024-01-01',
          readTime: '18 min read',
          category: 'Conversion Optimization',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop&crop=center',
          author: 'Edikan Udoibuot'
        },
        {
          id: '6',
          slug: 'social-media-growth',
          title: 'Scaling Social Media: 70K Followers in 6 Months',
          excerpt: 'The proven strategies and tactics I used to grow social media followings by 70,000+ engaged followers.',
          date: '2023-12-28',
          readTime: '14 min read',
          category: 'Social Media',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop&crop=center',
          author: 'Edikan Udoibuot'
        }
      ], 
      pagination: { page: 1, limit: 10, total: 6, pages: 1 } 
    }
  }
}

export const metadata: Metadata = {
  title: 'Blog - Edikan Udoibuot',
  description: 'Insights on marketing, AI, growth strategies, and digital innovation',
}

interface BlogPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = await searchParams
  const { posts, pagination } = await getBlogPosts(resolvedSearchParams)
  const currentPage = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="py-24 mt-16">
      <div className="container mx-auto px-6 lg:px-12 xl:px-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Blog & Insights
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Exploring marketing innovation, AI strategies, and growth insights from my experience scaling products and teams
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-12">
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search articles..."
                className="pl-10"
                defaultValue={typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : ''}
              />
            </div>
          </div>

          {/* Blog Posts Grid */}
          {posts.length > 0 ? (
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {posts.map((post: BlogPost) => (
                <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                        {post.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center text-sm text-muted-foreground mb-3 space-x-4">
                      <div className="flex items-center space-x-1">
                        <CalendarDays className="h-4 w-4" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        By {post.author}
                      </span>
                      <Link href={`/blog/${post.slug}`}>
                        <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-all">
                          Read More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or check back later for new content.
              </p>
              <Link href="/blog">
                <Button variant="outline">
                  Clear Search
                </Button>
              </Link>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-4">
              {currentPage > 1 && (
                <Link href={`/blog?page=${currentPage - 1}`}>
                  <Button variant="outline">
                    Previous
                  </Button>
                </Link>
              )}
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {pagination.pages}
                </span>
              </div>
              
              {currentPage < pagination.pages && (
                <Link href={`/blog?page=${currentPage + 1}`}>
                  <Button variant="outline">
                    Next
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
      
      <Footer />
    </div>
  )
}