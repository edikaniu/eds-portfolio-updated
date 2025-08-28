import { Metadata } from 'next'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, Target, Bot, TrendingUp, Mail, Users, Filter, Zap, Smartphone, BarChart3, DollarSign, Video, Globe } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { CategoryFilter } from '@/components/case-studies/category-filter'

// Icon mapping
const iconMap: { [key: string]: React.ReactElement } = {
  Bot: <Bot className="h-6 w-6" />,
  TrendingUp: <TrendingUp className="h-6 w-6" />,
  Mail: <Mail className="h-6 w-6" />,
  Users: <Users className="h-6 w-6" />,
  Zap: <Zap className="h-6 w-6" />,
  Smartphone: <Smartphone className="h-6 w-6" />,
  BarChart3: <BarChart3 className="h-6 w-6" />,
  DollarSign: <DollarSign className="h-6 w-6" />,
  Video: <Video className="h-6 w-6" />,
  Globe: <Globe className="h-6 w-6" />,
  Target: <Target className="h-6 w-6" />,
}

interface CaseStudy {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  image: string
  metrics: {
    primary: string
    primaryLabel: string
    secondary: string
    secondaryLabel: string
  }
  category: string
  color: string
  icon: string
  order: number
}

// Fetch case studies from API
async function getCaseStudies(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = typeof searchParams.page === 'string' ? searchParams.page : '1'
  const category = typeof searchParams.category === 'string' ? searchParams.category : ''
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/case-studies`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch case studies')
    }
    
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error('Error fetching case studies:', error)
    // Comprehensive fallback data - 14 case studies
    const allCaseStudies = [
      {
        id: '1',
        slug: 'ai-driven-content-strategy',
        title: 'AI-Driven Content Strategy',
        subtitle: 'Scaling organic traffic with AI-powered content',
        description: 'Implemented AI-powered content generation and optimization strategies that increased organic traffic by 200% while maintaining quality and brand consistency.',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
        metrics: { primary: '200%', primaryLabel: 'Traffic Growth', secondary: '4 months', secondaryLabel: 'Timeline' },
        category: 'AI & Automation',
        color: 'from-blue-500 to-purple-600',
        icon: 'Bot',
        order: 1
      },
      {
        id: '2',
        slug: 'email-marketing-transformation',
        title: 'Email Marketing Transformation',
        subtitle: '733% subscriber growth through strategic automation',
        description: 'Transformed email marketing strategy from basic newsletters to sophisticated automation workflows, achieving 733% subscriber growth and 5x engagement rates.',
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
        metrics: { primary: '733%', primaryLabel: 'Subscriber Growth', secondary: '3 months', secondaryLabel: 'Timeline' },
        category: 'Email Marketing',
        color: 'from-green-500 to-emerald-600',
        icon: 'Mail',
        order: 2
      },
      {
        id: '3',
        slug: 'social-media-growth-engine',
        title: 'Social Media Growth Engine',
        subtitle: '70K+ followers through strategic content & community',
        description: 'Built and executed a comprehensive social media strategy that generated 70,000+ new followers and 80% brand awareness growth across multiple platforms.',
        image: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&h=600&fit=crop',
        metrics: { primary: '70K+', primaryLabel: 'New Followers', secondary: '6 months', secondaryLabel: 'Timeline' },
        category: 'Social Media',
        color: 'from-pink-500 to-rose-600',
        icon: 'Users',
        order: 3
      },
      {
        id: '4',
        slug: 'conversion-rate-optimization',
        title: 'Conversion Rate Optimization',
        subtitle: '5X ROAS through systematic testing & optimization',
        description: 'Implemented comprehensive CRO strategy using A/B testing, user research, and data analysis to achieve 5X return on ad spend and 300% conversion improvement.',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
        metrics: { primary: '5X', primaryLabel: 'ROAS', secondary: '300%', secondaryLabel: 'Conversion Increase' },
        category: 'Conversion Optimization',
        color: 'from-orange-500 to-red-600',
        icon: 'TrendingUp',
        order: 4
      },
      {
        id: '5',
        slug: 'paid-advertising-scale-up',
        title: 'Paid Advertising Scale-Up',
        subtitle: 'From $10K to $100K monthly ad spend with 4X ROI',
        description: 'Scaled paid advertising campaigns across Google, Facebook, and LinkedIn from $10K to $100K monthly spend while maintaining 4X return on investment through advanced targeting and optimization.',
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
        metrics: { primary: '1000%', primaryLabel: 'Spend Increase', secondary: '4X', secondaryLabel: 'ROI' },
        category: 'Paid Advertising',
        color: 'from-purple-500 to-indigo-600',
        icon: 'Target',
        order: 5
      },
      {
        id: '6',
        slug: 'content-marketing-authority',
        title: 'Content Marketing Authority',
        subtitle: 'Built thought leadership with 500K+ monthly readers',
        description: 'Developed comprehensive content strategy that established brand as industry authority, generating 500K+ monthly readers and 1,200+ high-quality backlinks.',
        image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=600&fit=crop',
        metrics: { primary: '500K+', primaryLabel: 'Monthly Readers', secondary: '1,200+', secondaryLabel: 'Backlinks' },
        category: 'Content Marketing',
        color: 'from-teal-500 to-cyan-600',
        icon: 'BarChart3',
        order: 6
      },
      {
        id: '7',
        slug: 'growth-hacking-startup',
        title: 'Growth Hacking for Startup',
        subtitle: '0 to 50K users in 8 months with viral mechanics',
        description: 'Implemented viral growth strategies including referral programs, product-led growth, and community building to scale from 0 to 50,000 users in just 8 months.',
        image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop',
        metrics: { primary: '50K+', primaryLabel: 'Users Acquired', secondary: '8 months', secondaryLabel: 'Timeline' },
        category: 'Growth Marketing',
        color: 'from-emerald-500 to-green-600',
        icon: 'Zap',
        order: 7
      },
      {
        id: '8',
        slug: 'ecommerce-conversion-boost',
        title: 'E-commerce Conversion Boost',
        subtitle: '400% revenue increase through UX optimization',
        description: 'Optimized e-commerce user experience, checkout flow, and personalization features resulting in 400% revenue increase and 65% reduction in cart abandonment.',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
        metrics: { primary: '400%', primaryLabel: 'Revenue Increase', secondary: '65%', secondaryLabel: 'Cart Recovery' },
        category: 'E-commerce',
        color: 'from-yellow-500 to-orange-600',
        icon: 'DollarSign',
        order: 8
      },
      {
        id: '9',
        slug: 'mobile-app-engagement',
        title: 'Mobile App Engagement',
        subtitle: '300% user retention through push notification strategy',
        description: 'Developed personalized push notification strategy and in-app engagement features that increased user retention by 300% and daily active users by 180%.',
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop',
        metrics: { primary: '300%', primaryLabel: 'Retention Increase', secondary: '180%', secondaryLabel: 'DAU Growth' },
        category: 'Mobile Marketing',
        color: 'from-blue-500 to-purple-600',
        icon: 'Smartphone',
        order: 9
      },
      {
        id: '10',
        slug: 'video-marketing-viral',
        title: 'Video Marketing Viral Campaign',
        subtitle: '2M+ views and 15K leads from single video series',
        description: 'Created viral video marketing campaign that generated 2M+ views, 15K qualified leads, and established brand as industry thought leader across social platforms.',
        image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop',
        metrics: { primary: '2M+', primaryLabel: 'Video Views', secondary: '15K', secondaryLabel: 'Qualified Leads' },
        category: 'Video Marketing',
        color: 'from-red-500 to-pink-600',
        icon: 'Video',
        order: 10
      },
      {
        id: '11',
        slug: 'brand-positioning-refresh',
        title: 'Brand Positioning Refresh',
        subtitle: '250% brand awareness through strategic repositioning',
        description: 'Led complete brand repositioning initiative including messaging, visual identity, and market positioning that increased brand awareness by 250% and market share by 40%.',
        image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop',
        metrics: { primary: '250%', primaryLabel: 'Brand Awareness', secondary: '40%', secondaryLabel: 'Market Share' },
        category: 'Brand Strategy',
        color: 'from-indigo-500 to-blue-600',
        icon: 'Globe',
        order: 11
      },
      {
        id: '12',
        slug: 'data-analytics-insights',
        title: 'Data Analytics & Insights',
        subtitle: '500% improvement in campaign performance through analytics',
        description: 'Built comprehensive analytics infrastructure and reporting dashboards that improved campaign performance by 500% through data-driven decision making and real-time optimization.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
        metrics: { primary: '500%', primaryLabel: 'Performance Improvement', secondary: '20+', secondaryLabel: 'KPIs Tracked' },
        category: 'Analytics',
        color: 'from-cyan-500 to-teal-600',
        icon: 'BarChart3',
        order: 12
      },
      {
        id: '13',
        slug: 'b2b-lead-generation',
        title: 'B2B Lead Generation Engine',
        subtitle: '800% increase in qualified leads through multi-channel approach',
        description: 'Developed integrated B2B lead generation system combining content marketing, LinkedIn outreach, and marketing automation resulting in 800% increase in qualified leads.',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
        metrics: { primary: '800%', primaryLabel: 'Lead Increase', secondary: '45%', secondaryLabel: 'Conversion Rate' },
        category: 'Growth Marketing',
        color: 'from-violet-500 to-purple-600',
        icon: 'Target',
        order: 13
      },
      {
        id: '14',
        slug: 'customer-lifecycle-optimization',
        title: 'Customer Lifecycle Optimization',
        subtitle: '600% increase in customer lifetime value',
        description: 'Optimized entire customer lifecycle from acquisition to retention, implementing personalized journeys and loyalty programs that increased CLV by 600% and reduced churn by 70%.',
        image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop',
        metrics: { primary: '600%', primaryLabel: 'CLV Increase', secondary: '70%', secondaryLabel: 'Churn Reduction' },
        category: 'Growth Marketing',
        color: 'from-rose-500 to-pink-600',
        icon: 'Users',
        order: 14
      }
    ]
    
    // Filter by category if specified
    let filteredCaseStudies = allCaseStudies
    if (category) {
      filteredCaseStudies = allCaseStudies.filter(study => study.category === category)
    }
    
    // Implement pagination with 6 case studies per page
    const currentPageNum = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1
    const limit = 6
    const startIndex = (currentPageNum - 1) * limit
    const endIndex = startIndex + limit
    const paginatedCaseStudies = filteredCaseStudies.slice(startIndex, endIndex)
    const totalPages = Math.ceil(filteredCaseStudies.length / limit)
    
    return {
      caseStudies: paginatedCaseStudies,
      pagination: {
        page: currentPageNum,
        limit: limit,
        total: filteredCaseStudies.length,
        pages: totalPages
      }
    }
  }
}

export const metadata: Metadata = {
  title: 'Case Studies - Edikan Udoibuot',
  description: 'Real results from strategic marketing campaigns and growth initiatives that delivered measurable impact',
}

interface CaseStudiesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CaseStudiesPage({ searchParams }: CaseStudiesPageProps) {
  const resolvedSearchParams = await searchParams
  const { caseStudies, pagination } = await getCaseStudies(resolvedSearchParams)
  const currentPage = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="py-24 mt-16">
      <div className="container mx-auto px-6 lg:px-12 xl:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Case Studies
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real results from strategic marketing campaigns and growth initiatives that delivered measurable impact
            </p>
          </div>

          {/* Filter Section */}
          <div className="mb-12">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
                  <CategoryFilter currentCategory={typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : ''} />
                </div>
                
                {/* Clear Filters */}
                {resolvedSearchParams.category && (
                  <Link href="/case-studies">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      Clear Filters
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Case Studies Grid - 2 per row, 6 per page */}
          {caseStudies.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {caseStudies.map((study: CaseStudy) => (
              <Card
                key={study.id}
                className="group relative overflow-hidden bg-card/50 border-border/50 hover:bg-card/80 transition-all duration-500 cursor-pointer"
              >
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={study.image}
                    alt={study.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className={`bg-gradient-to-r ${study.color} text-white border-0`}>
                      {study.category}
                    </Badge>
                  </div>

                  {/* Primary Metric Overlay */}
                  <div className="absolute bottom-4 right-4 text-right">
                    <div className="text-3xl font-bold text-white">{study.metrics.primary}</div>
                    <div className="text-sm text-white/80">{study.metrics.primaryLabel}</div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${study.color} text-white flex-shrink-0`}>
                      {iconMap[study.icon] || iconMap['Bot']}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1">{study.title}</h3>
                      <p className="text-primary font-medium">{study.subtitle}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground mb-4 leading-relaxed">{study.description}</p>

                  {/* Metrics Row */}
                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">{study.metrics.primary}</span>
                      <span className="text-muted-foreground">{study.metrics.primaryLabel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-accent" />
                      <span className="font-semibold text-foreground">{study.metrics.secondary}</span>
                      <span className="text-muted-foreground">{study.metrics.secondaryLabel}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link href={`/case-study/${study.slug}`}>
                    <Button
                      className={`w-full bg-gradient-to-r ${study.color} hover:opacity-90 text-white border-0 transition-all duration-300`}
                    >
                      View Case Study
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No case studies found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filter or check back later for new case studies.
              </p>
              <Link href="/case-studies">
                <Button variant="outline">
                  View All Case Studies
                </Button>
              </Link>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-4 mb-16">
              {currentPage > 1 && (
                <Link href={`/case-studies?${resolvedSearchParams.category ? `category=${resolvedSearchParams.category}&` : ''}page=${currentPage - 1}`}>
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
                <Link href={`/case-studies?${resolvedSearchParams.category ? `category=${resolvedSearchParams.category}&` : ''}page=${currentPage + 1}`}>
                  <Button variant="outline">
                    Next
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Stats Summary */}
          <div className="mt-16">
            <Card className="p-8 bg-gradient-to-r from-primary/10 via-accent/10 to-green-500/10 border-primary/20">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">Combined Impact</h3>
                <p className="text-muted-foreground">Measurable results across all growth initiatives</p>
              </div>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">200k+</div>
                  <div className="text-sm text-muted-foreground">Users Scaled</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2">733%</div>
                  <div className="text-sm text-muted-foreground">Subscribers Growth</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500 mb-2">$500k+</div>
                  <div className="text-sm text-muted-foreground">Budget Scaled</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500 mb-2">5x</div>
                  <div className="text-sm text-muted-foreground">ROAS</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      </div>
      
      <Footer />
    </div>
  )
}