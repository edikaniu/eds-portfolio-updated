import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { 
  ArrowLeft, 
  Calendar,
  CheckCircle,
  TrendingUp,
  Target,
  Clock,
  Share2,
  ExternalLink
} from 'lucide-react'
import { ShareButton } from '@/components/blog/share-button'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

interface CaseStudy {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  fullDescription: string
  image: string
  metrics: {
    primary: string
    primaryLabel: string
    secondary: string
    secondaryLabel: string
  }
  results: string[]
  tools: string[]
  category: string
  color: string
  icon: string
  challenge: string
  solution: string
  timeline: Array<{
    phase: string
    description: string
    duration?: string
  }>
  createdAt: string
  updatedAt: string
}

// Comprehensive fallback case studies data - matching listings page
const fallbackCaseStudies: CaseStudy[] = [
  {
    id: '1',
    slug: 'ai-driven-content-strategy',
    title: 'AI-Driven Content Strategy',
    subtitle: 'Scaling organic traffic with AI-powered content',
    description: 'Implemented AI-powered content generation and optimization strategies that increased organic traffic by 200% while maintaining quality and brand consistency.',
    fullDescription: 'This comprehensive AI-driven content strategy transformation involved implementing advanced content generation tools, optimization algorithms, and performance tracking systems to scale content production while maintaining quality and brand voice consistency.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
    metrics: { 
      primary: '200%', 
      primaryLabel: 'Traffic Growth', 
      secondary: '4 months', 
      secondaryLabel: 'Timeline' 
    },
    results: [
      'Achieved 200% increase in organic search traffic within 4 months',
      'Generated 500+ high-quality articles using AI-assisted content creation',
      'Improved average time on page by 65% through better content relevance',
      'Increased content production efficiency by 300% while maintaining quality',
      'Generated $150K+ in additional revenue from improved organic visibility'
    ],
    tools: ['OpenAI GPT-4', 'Ahrefs', 'Semrush', 'Google Analytics', 'WordPress', 'Zapier'],
    category: 'AI & Automation',
    color: 'from-blue-500 to-purple-600',
    icon: '🤖',
    challenge: 'The company struggled with content production scalability, producing only 10-15 articles per month with inconsistent quality and poor search performance. Manual content creation was time-consuming and expensive.',
    solution: 'Implemented an AI-powered content workflow combining human expertise with AI tools for research, writing, and optimization. Created templates, guidelines, and quality checks to ensure consistency while scaling production.',
    timeline: [
      { phase: 'Strategy & Planning', description: 'Analyzed existing content gaps and developed AI integration strategy', duration: '2 weeks' },
      { phase: 'Tool Implementation', description: 'Set up AI tools, templates, and workflow automation systems', duration: '3 weeks' },
      { phase: 'Content Production', description: 'Scaled content creation using AI-assisted workflows', duration: '8 weeks' },
      { phase: 'Optimization & Analysis', description: 'Monitored performance and optimized based on data insights', duration: '4 weeks' }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    slug: 'email-marketing-transformation',
    title: 'Email Marketing Transformation',
    subtitle: '733% subscriber growth through strategic automation',
    description: 'Transformed email marketing strategy from basic newsletters to sophisticated automation workflows, achieving 733% subscriber growth and 5x engagement rates.',
    fullDescription: 'This email marketing transformation involved completely rebuilding the email strategy from basic broadcasting to sophisticated, behavioral-triggered automation workflows that nurture subscribers throughout their entire customer journey.',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
    metrics: { 
      primary: '733%', 
      primaryLabel: 'Subscriber Growth', 
      secondary: '3 months', 
      secondaryLabel: 'Timeline' 
    },
    results: [
      'Grew email list from 3,000 to 25,000+ subscribers (733% growth)',
      'Increased email engagement rates by 500% through segmentation',
      'Generated $200K+ additional revenue from email campaigns',
      'Reduced unsubscribe rate by 65% with value-first content approach',
      'Automated 80% of email workflows, improving efficiency dramatically'
    ],
    tools: ['Mailchimp', 'ConvertKit', 'Zapier', 'Google Analytics', 'Hotjar', 'Typeform'],
    category: 'Email Marketing',
    color: 'from-green-500 to-emerald-600',
    icon: '📧',
    challenge: 'The email program had low engagement, generic content, and minimal automation. Most emails were basic newsletters with poor open rates and high unsubscribe rates.',
    solution: 'Implemented advanced segmentation, behavioral triggers, personalized content workflows, and value-first email sequences. Created comprehensive automation flows for different customer journey stages.',
    timeline: [
      { phase: 'Audit & Strategy', description: 'Analyzed current performance and developed transformation strategy', duration: '1 week' },
      { phase: 'Segmentation Setup', description: 'Implemented advanced subscriber segmentation and tagging systems', duration: '2 weeks' },
      { phase: 'Automation Build', description: 'Created welcome sequences, nurture flows, and behavioral triggers', duration: '4 weeks' },
      { phase: 'Content & Testing', description: 'Developed value-first content and optimized through A/B testing', duration: '5 weeks' }
    ],
    createdAt: '2023-12-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '3',
    slug: 'social-media-growth-engine',
    title: 'Social Media Growth Engine',
    subtitle: '70K+ followers through strategic content & community',
    description: 'Built and executed a comprehensive social media strategy that generated 70,000+ new followers and 80% brand awareness growth across multiple platforms.',
    fullDescription: 'This social media growth initiative involved creating a multi-platform content strategy, community building programs, and engagement optimization tactics that resulted in massive follower growth and brand awareness improvement.',
    image: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&h=600&fit=crop',
    metrics: { 
      primary: '70K+', 
      primaryLabel: 'New Followers', 
      secondary: '6 months', 
      secondaryLabel: 'Timeline' 
    },
    results: [
      'Generated 70,000+ new followers across LinkedIn, Twitter, and Instagram',
      'Achieved 80% increase in brand awareness through consistent content',
      'Created viral content pieces with 1M+ combined reach',
      'Built engaged community of 15K+ active members',
      'Generated 500+ qualified leads directly from social media efforts'
    ],
    tools: ['Hootsuite', 'Buffer', 'Canva', 'Later', 'Sprout Social', 'Google Analytics'],
    category: 'Social Media',
    color: 'from-pink-500 to-rose-600',
    icon: '👥',
    challenge: 'The brand had minimal social media presence with inconsistent posting, low engagement, and no clear content strategy. Followers were stagnant and brand awareness was limited.',
    solution: 'Developed comprehensive multi-platform strategy with consistent branded content, community engagement initiatives, strategic hashtag use, and influencer partnerships to drive explosive growth.',
    timeline: [
      { phase: 'Platform Audit', description: 'Analyzed current social presence and competitive landscape', duration: '1 week' },
      { phase: 'Strategy Development', description: 'Created content calendar and platform-specific strategies', duration: '2 weeks' },
      { phase: 'Content Creation', description: 'Produced high-quality, engaging content across all platforms', duration: '16 weeks' },
      { phase: 'Community Building', description: 'Focused on engagement, partnerships, and community growth', duration: '8 weeks' }
    ],
    createdAt: '2023-11-01T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z'
  },
  {
    id: '4',
    slug: 'conversion-rate-optimization',
    title: 'Conversion Rate Optimization',
    subtitle: '5X ROAS through systematic testing & optimization',
    description: 'Implemented comprehensive CRO strategy using A/B testing, user research, and data analysis to achieve 5X return on ad spend and 300% conversion improvement.',
    fullDescription: 'This conversion rate optimization project involved systematic analysis of the entire customer journey, implementation of comprehensive testing protocols, and data-driven improvements that dramatically improved conversion rates and ROI.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    metrics: { 
      primary: '5X', 
      primaryLabel: 'ROAS', 
      secondary: '300%', 
      secondaryLabel: 'Conversion Increase' 
    },
    results: [
      'Improved return on ad spend (ROAS) from 1.2X to 6X',
      'Increased overall conversion rate by 300% across all channels',
      'Generated additional $500K+ in revenue without increasing ad spend',
      'Reduced customer acquisition cost (CAC) by 60% through optimization',
      'Improved user experience scores by 85% through systematic testing'
    ],
    tools: ['Google Optimize', 'Hotjar', 'VWO', 'Google Analytics', 'Mixpanel', 'Unbounce'],
    category: 'Conversion Optimization',
    color: 'from-orange-500 to-red-600',
    icon: '📈',
    challenge: 'The website had poor conversion rates, high bounce rates, and expensive customer acquisition costs. Users were not completing desired actions and ad spend ROI was very low.',
    solution: 'Implemented systematic CRO methodology including user research, heat mapping, A/B testing, and conversion funnel optimization to identify and fix conversion barriers throughout the customer journey.',
    timeline: [
      { phase: 'Analysis & Research', description: 'Conducted user research and identified conversion barriers', duration: '3 weeks' },
      { phase: 'Hypothesis Development', description: 'Created testing roadmap and prioritized optimization opportunities', duration: '1 week' },
      { phase: 'Testing & Implementation', description: 'Ran systematic A/B tests and implemented winning variations', duration: '8 weeks' },
      { phase: 'Scaling & Refinement', description: 'Scaled successful tests and continued optimization iterations', duration: '4 weeks' }
    ],
    createdAt: '2023-10-01T00:00:00Z',
    updatedAt: '2023-12-20T00:00:00Z'
  },
  {
    id: '5',
    slug: 'paid-advertising-scale-up',
    title: 'Paid Advertising Scale-Up',
    subtitle: 'From $10K to $100K monthly ad spend with 4X ROI',
    description: 'Scaled paid advertising campaigns across Google, Facebook, and LinkedIn from $10K to $100K monthly spend while maintaining 4X return on investment through advanced targeting and optimization.',
    fullDescription: 'This comprehensive paid advertising scale-up involved building advanced campaign structures, implementing sophisticated targeting strategies, and creating automated optimization systems to scale ad spend 10X while maintaining profitability.',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
    metrics: { 
      primary: '1000%', 
      primaryLabel: 'Spend Increase', 
      secondary: '4X', 
      secondaryLabel: 'ROI' 
    },
    results: [
      'Scaled monthly ad spend from $10K to $100K while maintaining 4X ROI',
      'Achieved 65% increase in cost-per-acquisition efficiency across all channels',
      'Generated $2.5M+ in additional revenue through scaled advertising efforts',
      'Improved audience targeting precision by 300% using advanced data segmentation',
      'Reduced campaign management time by 70% through automation implementation'
    ],
    tools: ['Google Ads', 'Facebook Ads Manager', 'LinkedIn Campaign Manager', 'Google Analytics', 'Triple Whale', 'Northbeam'],
    category: 'Paid Advertising',
    color: 'from-purple-500 to-indigo-600',
    icon: '🎯',
    challenge: 'The company needed to scale advertising spend rapidly to meet growth targets, but previous attempts resulted in decreased ROI and wasted budget due to poor targeting and campaign structure.',
    solution: 'Developed a systematic scaling approach including advanced audience segmentation, campaign structure optimization, automated bidding strategies, and comprehensive tracking systems to maintain profitability at scale.',
    timeline: [
      { phase: 'Campaign Audit & Strategy', description: 'Analyzed existing campaigns and developed scaling strategy', duration: '2 weeks' },
      { phase: 'Advanced Targeting Setup', description: 'Implemented sophisticated audience targeting and tracking systems', duration: '3 weeks' },
      { phase: 'Gradual Scaling Phase', description: 'Systematically increased spend while monitoring performance metrics', duration: '8 weeks' },
      { phase: 'Optimization & Automation', description: 'Automated campaign management and optimized for maximum efficiency', duration: '4 weeks' }
    ],
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2023-12-15T00:00:00Z'
  },
  {
    id: '6',
    slug: 'content-marketing-authority',
    title: 'Content Marketing Authority',
    subtitle: 'Built thought leadership with 500K+ monthly readers',
    description: 'Developed comprehensive content strategy that established brand as industry authority, generating 500K+ monthly readers and 1,200+ high-quality backlinks.',
    fullDescription: 'This content marketing authority building initiative involved creating a comprehensive content ecosystem including blog content, thought leadership pieces, industry research, and strategic partnerships to establish market dominance.',
    image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=600&fit=crop',
    metrics: { 
      primary: '500K+', 
      primaryLabel: 'Monthly Readers', 
      secondary: '1,200+', 
      secondaryLabel: 'Backlinks' 
    },
    results: [
      'Generated 500K+ monthly readers through consistent, high-quality content production',
      'Earned 1,200+ high-authority backlinks from industry publications and websites',
      'Achieved 85% increase in brand mention frequency across industry publications',
      'Generated 15K+ qualified leads directly from content marketing efforts',
      'Established CEO as recognized thought leader with 50+ speaking opportunities'
    ],
    tools: ['WordPress', 'Ahrefs', 'BuzzSumo', 'Google Analytics', 'Canva', 'Grammarly'],
    category: 'Content Marketing',
    color: 'from-teal-500 to-cyan-600',
    icon: '📝',
    challenge: 'The brand lacked industry recognition and thought leadership presence, resulting in poor organic visibility and difficulty establishing credibility with potential customers and partners.',
    solution: 'Created comprehensive content marketing strategy focusing on original research, expert insights, and strategic thought leadership to build authority and drive organic growth.',
    timeline: [
      { phase: 'Content Strategy Development', description: 'Researched industry gaps and developed content pillars strategy', duration: '3 weeks' },
      { phase: 'Content Production Ramp-Up', description: 'Established content creation workflows and began publishing schedule', duration: '4 weeks' },
      { phase: 'Authority Building Phase', description: 'Focused on high-impact content and industry relationship building', duration: '12 weeks' },
      { phase: 'Scaling & Optimization', description: 'Optimized content performance and scaled successful content types', duration: '8 weeks' }
    ],
    createdAt: '2023-08-01T00:00:00Z',
    updatedAt: '2023-12-10T00:00:00Z'
  },
  {
    id: '7',
    slug: 'growth-hacking-startup',
    title: 'Growth Hacking for Startup',
    subtitle: '0 to 50K users in 8 months with viral mechanics',
    description: 'Implemented viral growth strategies including referral programs, product-led growth, and community building to scale from 0 to 50,000 users in just 8 months.',
    fullDescription: 'This startup growth hacking initiative involved implementing multiple viral growth mechanisms, optimizing user onboarding, and creating community-driven growth loops to achieve rapid user acquisition.',
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop',
    metrics: { 
      primary: '50K+', 
      primaryLabel: 'Users Acquired', 
      secondary: '8 months', 
      secondaryLabel: 'Timeline' 
    },
    results: [
      'Acquired 50,000+ users in 8 months with minimal paid advertising spend',
      'Achieved 45% viral coefficient through referral program optimization',
      'Generated 80% of user growth through organic and viral channels',
      'Reduced customer acquisition cost by 85% compared to traditional methods',
      'Built active community of 15K+ engaged users driving word-of-mouth growth'
    ],
    tools: ['Mixpanel', 'Amplitude', 'ReferralCandy', 'Intercom', 'Hotjar', 'Zapier'],
    category: 'Growth Marketing',
    color: 'from-emerald-500 to-green-600',
    icon: '⚡',
    challenge: 'Early-stage startup with limited marketing budget needed to achieve rapid user growth to secure next funding round, but traditional marketing channels were too expensive.',
    solution: 'Implemented comprehensive growth hacking strategy focusing on viral mechanics, product-led growth, and community building to achieve sustainable, scalable growth.',
    timeline: [
      { phase: 'Growth Strategy Design', description: 'Analyzed user behavior and designed viral growth mechanisms', duration: '2 weeks' },
      { phase: 'MVP Growth Features', description: 'Built and launched referral system and onboarding optimization', duration: '4 weeks' },
      { phase: 'Community Building Phase', description: 'Established user community and content-driven growth loops', duration: '12 weeks' },
      { phase: 'Optimization & Scaling', description: 'Optimized growth funnels and scaled successful tactics', duration: '14 weeks' }
    ],
    createdAt: '2023-07-01T00:00:00Z',
    updatedAt: '2023-12-05T00:00:00Z'
  },
  {
    id: '8',
    slug: 'ecommerce-conversion-boost',
    title: 'E-commerce Conversion Boost',
    subtitle: '400% revenue increase through UX optimization',
    description: 'Optimized e-commerce user experience, checkout flow, and personalization features resulting in 400% revenue increase and 65% reduction in cart abandonment.',
    fullDescription: 'This e-commerce optimization project involved comprehensive UX analysis, checkout flow redesign, and personalization implementation to dramatically improve conversion rates and customer experience.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
    metrics: { 
      primary: '400%', 
      primaryLabel: 'Revenue Increase', 
      secondary: '65%', 
      secondaryLabel: 'Cart Recovery' 
    },
    results: [
      'Achieved 400% increase in overall e-commerce revenue within 6 months',
      'Reduced cart abandonment rate by 65% through checkout optimization',
      'Improved conversion rate by 280% across all product categories',
      'Increased average order value by 85% through personalization features',
      'Enhanced customer satisfaction scores by 90% through UX improvements'
    ],
    tools: ['Shopify Plus', 'Google Optimize', 'Hotjar', 'Klaviyo', 'Yotpo', 'Bold Apps'],
    category: 'E-commerce',
    color: 'from-yellow-500 to-orange-600',
    icon: '🛒',
    challenge: 'E-commerce site had poor conversion rates, high cart abandonment, and low customer satisfaction scores, resulting in significant revenue loss and poor customer experience.',
    solution: 'Implemented comprehensive UX optimization including checkout redesign, personalization features, and customer journey improvements to maximize conversion and customer satisfaction.',
    timeline: [
      { phase: 'UX Audit & Analysis', description: 'Comprehensive analysis of user behavior and conversion barriers', duration: '2 weeks' },
      { phase: 'Checkout Flow Redesign', description: 'Redesigned and optimized entire checkout process', duration: '4 weeks' },
      { phase: 'Personalization Implementation', description: 'Built and deployed personalization and recommendation features', duration: '6 weeks' },
      { phase: 'Testing & Optimization', description: 'A/B tested all changes and optimized based on performance', duration: '8 weeks' }
    ],
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2023-11-30T00:00:00Z'
  },
  {
    id: '9',
    slug: 'mobile-app-engagement',
    title: 'Mobile App Engagement',
    subtitle: '300% user retention through push notification strategy',
    description: 'Developed personalized push notification strategy and in-app engagement features that increased user retention by 300% and daily active users by 180%.',
    fullDescription: 'This mobile app engagement project focused on implementing advanced push notification strategies, in-app messaging, and user experience improvements to dramatically increase user retention and engagement.',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop',
    metrics: { 
      primary: '300%', 
      primaryLabel: 'Retention Increase', 
      secondary: '180%', 
      secondaryLabel: 'DAU Growth' 
    },
    results: [
      'Increased user retention by 300% through personalized engagement strategies',
      'Boosted daily active users by 180% within 4 months of implementation',
      'Improved push notification open rates by 250% through personalization',
      'Reduced user churn rate by 70% through proactive engagement campaigns',
      'Generated 45% increase in in-app purchases through targeted messaging'
    ],
    tools: ['Firebase', 'OneSignal', 'Amplitude', 'Braze', 'App Annie', 'Appsflyer'],
    category: 'Mobile Marketing',
    color: 'from-blue-500 to-purple-600',
    icon: '📱',
    challenge: 'Mobile app had poor user retention, low engagement rates, and high churn, with users typically abandoning the app within the first week of download.',
    solution: 'Developed comprehensive mobile engagement strategy including personalized push notifications, in-app messaging, and user journey optimization to keep users active and engaged.',
    timeline: [
      { phase: 'User Behavior Analysis', description: 'Analyzed user patterns and identified engagement opportunities', duration: '2 weeks' },
      { phase: 'Notification Strategy Design', description: 'Developed personalized push notification and in-app messaging strategy', duration: '3 weeks' },
      { phase: 'Implementation & Testing', description: 'Built and deployed engagement features with A/B testing', duration: '6 weeks' },
      { phase: 'Optimization & Scaling', description: 'Optimized campaigns based on performance data and scaled successful tactics', duration: '8 weeks' }
    ],
    createdAt: '2023-05-01T00:00:00Z',
    updatedAt: '2023-11-25T00:00:00Z'
  }
]

// Fetch single case study
async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/case-studies/${slug}`, {
      next: { revalidate: 3600 } // Revalidate every hour
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        // Try fallback data
        const fallbackCaseStudy = fallbackCaseStudies.find(cs => cs.slug === slug)
        return fallbackCaseStudy || null
      }
      throw new Error('Failed to fetch case study')
    }
    
    const data = await response.json()
    return data.success ? data.data : (fallbackCaseStudies.find(cs => cs.slug === slug) || null)
  } catch (error) {
    console.error('Error fetching case study:', error)
    // Return fallback data
    const fallbackCaseStudy = fallbackCaseStudies.find(cs => cs.slug === slug)
    return fallbackCaseStudy || null
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const caseStudy = await getCaseStudy(slug)
  
  if (!caseStudy) {
    return {
      title: 'Case Study Not Found',
      description: 'The requested case study could not be found.'
    }
  }
  
  return {
    title: `${caseStudy.title} - Case Study`,
    description: caseStudy.description,
    openGraph: {
      title: `${caseStudy.title} - Case Study`,
      description: caseStudy.description,
      images: [caseStudy.image],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${caseStudy.title} - Case Study`,
      description: caseStudy.description,
      images: [caseStudy.image],
    }
  }
}

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params
  const caseStudy = await getCaseStudy(slug)
  
  if (!caseStudy) {
    notFound()
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="py-12 bg-gradient-to-b from-muted/30 to-background mt-16">
        <div className="container mx-auto px-6 lg:px-12 xl:px-16">
          <div className="max-w-6xl mx-auto">
            <Link href="/#case-studies">
              <Button variant="ghost" className="mb-8 -ml-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Case Studies
              </Button>
            </Link>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Case Study Info */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <span className="text-lg">{caseStudy.icon}</span>
                    {caseStudy.category}
                  </Badge>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  {caseStudy.title}
                </h1>
                
                {caseStudy.subtitle && (
                  <h2 className="text-2xl text-muted-foreground mb-6">
                    {caseStudy.subtitle}
                  </h2>
                )}
                
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  {caseStudy.description}
                </p>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {caseStudy.metrics.primary}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {caseStudy.metrics.primaryLabel}
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {caseStudy.metrics.secondary}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {caseStudy.metrics.secondaryLabel}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Case Study Image */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-xl shadow-2xl">
                  <img
                    src={caseStudy.image}
                    alt={caseStudy.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
                
                {/* Share Button */}
                <div className="mt-6 flex justify-center">
                  <ShareButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Detailed Content */}
      <div className="py-16">
        <div className="container mx-auto px-6 lg:px-12 xl:px-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-12">
                {/* Overview */}
                <Card className="p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Overview</h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {caseStudy.fullDescription || caseStudy.description}
                    </p>
                  </div>
                </Card>

                {/* Challenge */}
                {caseStudy.challenge && (
                  <Card className="p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                      <Target className="h-6 w-6 text-orange-500" />
                      The Challenge
                    </h2>
                    <div className="prose prose-lg max-w-none">
                      <p className="text-muted-foreground leading-relaxed">
                        {caseStudy.challenge}
                      </p>
                    </div>
                  </Card>
                )}

                {/* Solution */}
                {caseStudy.solution && (
                  <Card className="p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      The Solution
                    </h2>
                    <div className="prose prose-lg max-w-none">
                      <p className="text-muted-foreground leading-relaxed">
                        {caseStudy.solution}
                      </p>
                    </div>
                  </Card>
                )}

                {/* Timeline */}
                {caseStudy.timeline && caseStudy.timeline.length > 0 && (
                  <Card className="p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                      <Clock className="h-6 w-6 text-blue-500" />
                      Project Timeline
                    </h2>
                    <div className="space-y-6">
                      {caseStudy.timeline.map((phase, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                              {index + 1}
                            </div>
                            {index < caseStudy.timeline.length - 1 && (
                              <div className="w-0.5 h-8 bg-muted-foreground/20 mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-8">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-foreground">{phase.phase}</h3>
                              {phase.duration && (
                                <Badge variant="outline" className="text-xs">
                                  {phase.duration}
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {phase.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Results */}
                {caseStudy.results && caseStudy.results.length > 0 && (
                  <Card className="p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                      <TrendingUp className="h-6 w-6 text-green-500" />
                      Key Results
                    </h2>
                    <div className="grid gap-4">
                      {caseStudy.results.map((result, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <p className="text-muted-foreground leading-relaxed">{result}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
              
              {/* Sidebar */}
              <div className="space-y-6">
                {/* Project Meta */}
                <Card className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Project Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Completed: {new Date(caseStudy.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Updated: {new Date(caseStudy.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card>

                {/* Tools Used */}
                {caseStudy.tools && caseStudy.tools.length > 0 && (
                  <Card className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">Tools & Technologies</h3>
                    <div className="flex flex-wrap gap-2">
                      {caseStudy.tools.map((tool) => (
                        <Badge key={tool} variant="outline">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Actions */}
                <Card className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Actions</h3>
                  <div className="space-y-3">
                    <Link href="/contact">
                      <Button className="w-full justify-start">
                        Discuss Similar Project
                      </Button>
                    </Link>
                    
                    <Link href="/#case-studies">
                      <Button variant="outline" className="w-full justify-start">
                        View All Case Studies
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="mt-16 pt-8 border-t">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <Link href="/#case-studies">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    All Case Studies
                  </Button>
                </Link>
                
                <Link href="/contact">
                  <Button>
                    Start Your Project
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