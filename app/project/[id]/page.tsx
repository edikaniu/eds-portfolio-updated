import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { 
  ArrowLeft, 
  Github, 
  ExternalLink, 
  Calendar,
  Code,
  Wrench,
  Workflow,
  Target,
  Share2,
  CheckCircle,
  Lightbulb,
  TrendingUp,
  Clock
} from 'lucide-react'
import { ShareButton } from '@/components/blog/share-button'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { NewsletterCTA } from '@/components/newsletter'

interface Project {
  id: string
  slug: string
  title: string
  description: string
  type: 'tool' | 'workflow' | 'campaign'
  technologies: string[]
  image: string
  githubUrl?: string
  liveUrl?: string
  category?: string
  // Enhanced fields for better project details
  features?: string[]
  results?: string[]
  challenge?: string
  solution?: string
  timeline?: string
  createdAt: string
  updatedAt: string
}

// Fallback project data
const fallbackProjects: Project[] = [
  {
    id: '1',
    slug: 'ai-marketing-automation-suite',
    title: 'AI Marketing Automation Suite',
    description: 'Comprehensive marketing automation platform leveraging AI for personalized campaigns, lead scoring, and customer journey optimization. Built to scale marketing efforts while maintaining personalization at every touchpoint.',
    type: 'workflow',
    technologies: ['Next.js', 'TypeScript', 'OpenAI API', 'HubSpot API', 'PostgreSQL', 'Redis', 'Stripe API'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center',
    githubUrl: 'https://github.com/example/ai-marketing-suite',
    liveUrl: 'https://ai-marketing-suite.demo.com',
    category: 'AI & Automation',
    features: [
      'AI-powered lead scoring and qualification',
      'Automated email sequence creation and optimization', 
      'Dynamic content personalization based on user behavior',
      'Multi-channel campaign orchestration',
      'Real-time performance analytics and reporting'
    ],
    results: [
      'Increased lead conversion rate by 300%',
      'Reduced manual marketing tasks by 80%',
      'Generated $500K+ in additional revenue',
      'Improved email engagement rates by 250%'
    ],
    challenge: 'Manual marketing processes were consuming 60+ hours per week, limiting scalability and personalization. Lead qualification was inconsistent, resulting in poor conversion rates.',
    solution: 'Built an AI-powered automation suite that handles lead scoring, personalized content creation, and multi-channel campaign management while maintaining human oversight for strategy.',
    timeline: '4 months development, 2 months optimization',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2', 
    slug: 'growth-analytics-dashboard',
    title: 'Growth Analytics Dashboard',
    description: 'Real-time analytics dashboard providing comprehensive insights into marketing performance, user behavior, and growth metrics. Features advanced visualization and predictive analytics for data-driven decision making.',
    type: 'tool',
    technologies: ['React', 'D3.js', 'Node.js', 'Google Analytics API', 'Chart.js', 'MongoDB', 'Express'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center',
    githubUrl: 'https://github.com/example/growth-dashboard',
    liveUrl: 'https://growth-dashboard.demo.com',
    category: 'Analytics',
    features: [
      'Real-time data visualization from multiple sources',
      'Predictive analytics for forecasting growth trends',
      'Custom KPI tracking and goal monitoring',
      'Automated anomaly detection and alerts',
      'Cross-platform attribution modeling'
    ],
    results: [
      'Reduced reporting time by 90%',
      'Identified $200K+ in optimization opportunities',
      'Improved decision-making speed by 5x',
      'Increased data accuracy to 99.8%'
    ],
    challenge: 'Marketing teams were spending 20+ hours weekly creating manual reports, with data scattered across multiple platforms and inconsistent metrics.',
    solution: 'Created a unified dashboard that aggregates data from all marketing channels, provides real-time insights, and enables quick decision-making with automated alerts.',
    timeline: '3 months development, 1 month integration',
    createdAt: '2023-12-15T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '3',
    slug: 'email-campaign-optimizer',
    title: 'Email Campaign Optimizer',
    description: 'AI-powered email optimization tool that analyzes subject lines, content, and timing to maximize open rates and click-through rates. Includes A/B testing automation and performance prediction.',
    type: 'tool',
    technologies: ['Python', 'Flask', 'TensorFlow', 'SendGrid API', 'React', 'SQLAlchemy', 'Celery'],
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop&crop=center',
    githubUrl: 'https://github.com/example/email-optimizer',
    liveUrl: 'https://email-optimizer.demo.com',
    category: 'Email Marketing',
    features: [
      'AI-powered subject line optimization',
      'Send time optimization based on recipient behavior',
      'Automated A/B testing with statistical significance',
      'Content personalization engine',
      'Deliverability monitoring and improvement'
    ],
    results: [
      'Improved open rates by 40% on average',
      'Increased click-through rates by 60%',
      'Reduced unsubscribe rates by 25%',
      'Generated 200% ROI improvement'
    ],
    challenge: 'Email campaigns had inconsistent performance with low engagement rates and high manual testing overhead.',
    solution: 'Developed an AI system that automatically optimizes email campaigns using machine learning models trained on engagement patterns and best practices.',
    timeline: '2 months development, 1 month training',
    createdAt: '2023-11-20T00:00:00Z',
    updatedAt: '2024-01-08T00:00:00Z'
  },
  {
    id: '4',
    slug: 'social-media-scheduler',
    title: 'Social Media Scheduler',
    description: 'Advanced social media scheduling and analytics platform with AI-powered content suggestions, optimal posting time prediction, and cross-platform management capabilities.',
    type: 'workflow', 
    technologies: ['Vue.js', 'Laravel', 'Redis', 'Twitter API', 'Instagram API', 'Facebook API', 'MySQL'],
    image: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&h=600&fit=crop&crop=center',
    githubUrl: 'https://github.com/example/social-scheduler',
    category: 'Social Media',
    features: [
      'Cross-platform content scheduling and publishing',
      'AI-powered optimal timing recommendations',
      'Content suggestion engine based on trending topics',
      'Automated hashtag research and optimization',
      'Team collaboration and approval workflows'
    ],
    results: [
      'Reduced content creation time by 70%',
      'Increased engagement rates by 150%',
      'Grew follower count by 300%',
      'Saved 25+ hours per week in manual posting'
    ],
    challenge: 'Managing multiple social media accounts was time-consuming and inconsistent, with poor timing and engagement.',
    solution: 'Built an intelligent scheduling system that optimizes posting times, suggests content, and automates the entire social media workflow.',
    timeline: '3 months development, 1 month optimization',
    createdAt: '2023-10-10T00:00:00Z',
    updatedAt: '2023-12-20T00:00:00Z'
  },
  {
    id: '5',
    slug: 'saas-growth-campaign',
    title: 'SaaS Growth Campaign',
    description: 'Multi-channel growth campaign that scaled a B2B SaaS from 100 to 10,000 users through strategic acquisition channels and conversion optimization.',
    type: 'campaign',
    technologies: ['Google Ads', 'Facebook Ads', 'LinkedIn Ads', 'HubSpot', 'Mixpanel', 'Intercom'],
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop&crop=center',
    category: 'B2B SaaS',
    features: [
      'Multi-channel paid advertising strategy',
      'Conversion funnel optimization across all touchpoints',
      'Lead nurturing automation workflows',
      'Customer onboarding experience design',
      'Retention and upselling campaign sequences'
    ],
    results: [
      'Scaled from 100 to 10,000+ users in 6 months',
      'Achieved 3.2x ROAS across all channels',
      'Reduced customer acquisition cost by 45%',
      'Increased trial-to-paid conversion by 180%'
    ],
    challenge: 'SaaS company had limited growth with high acquisition costs and poor conversion rates from trial to paid users.',
    solution: 'Developed comprehensive multi-channel strategy focusing on high-intent audiences, optimized conversion funnels, and retention campaigns.',
    timeline: '6 months campaign execution',
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z'
  },
  {
    id: '6',
    slug: 'content-automation-workflow',
    title: 'Content Automation Workflow',
    description: 'Automated content creation and distribution system that generates and publishes 100+ pieces monthly.',
    type: 'workflow',
    technologies: ['OpenAI API', 'Zapier', 'WordPress', 'Buffer', 'Canva API'],
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop&crop=center',
    category: 'Content Marketing',
    features: [
      'AI-powered content generation and ideation',
      'Automated social media distribution across platforms',
      'SEO optimization and keyword integration',
      'Visual content creation with brand consistency',
      'Performance tracking and optimization workflows'
    ],
    results: [
      'Generated 100+ content pieces per month automatically',
      'Increased content production efficiency by 500%',
      'Improved SEO rankings for 200+ keywords',
      'Saved 40+ hours weekly in manual content tasks'
    ],
    challenge: 'Manual content creation was time-consuming and inconsistent, limiting the ability to maintain regular publishing schedules across multiple platforms.',
    solution: 'Built comprehensive automation workflow using AI tools for content generation, automated distribution systems, and performance optimization.',
    timeline: '3 months development, 1 month optimization',
    createdAt: '2023-08-01T00:00:00Z',
    updatedAt: '2023-11-01T00:00:00Z'
  },
  {
    id: '7',
    slug: 'lead-scoring-engine',
    title: 'Lead Scoring Engine',
    description: 'Machine learning-powered lead scoring system that identifies high-value prospects automatically.',
    type: 'tool',
    technologies: ['Python', 'Scikit-learn', 'FastAPI', 'PostgreSQL', 'React'],
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop&crop=center',
    category: 'Sales Analytics',
    features: [
      'ML-powered predictive lead scoring algorithms',
      'Real-time prospect evaluation and ranking',
      'Integration with CRM systems and sales workflows',
      'Behavioral tracking and engagement analysis',
      'Automated lead qualification and routing'
    ],
    results: [
      'Improved lead conversion rates by 250%',
      'Reduced time-to-qualification by 60%',
      'Increased sales team efficiency by 180%',
      'Generated $300K+ in additional qualified pipeline'
    ],
    challenge: 'Sales team was spending too much time on unqualified leads, with inconsistent scoring criteria and poor conversion rates.',
    solution: 'Developed machine learning system that automatically scores leads based on behavior, demographics, and engagement patterns.',
    timeline: '4 months development, 2 months training',
    createdAt: '2023-07-01T00:00:00Z',
    updatedAt: '2023-11-01T00:00:00Z'
  },
  {
    id: '8',
    slug: 'ecommerce-retention-campaign',
    title: 'E-commerce Retention Campaign',
    description: 'Customer retention campaign that increased repeat purchase rate by 300% through personalized experiences.',
    type: 'campaign',
    technologies: ['Klaviyo', 'Shopify', 'Google Analytics', 'Facebook Pixel', 'Hotjar'],
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&crop=center',
    category: 'E-commerce',
    features: [
      'Personalized email retention sequences',
      'Behavioral trigger campaigns based on purchase history',
      'Win-back campaigns for inactive customers',
      'Loyalty program integration and optimization',
      'Cross-sell and upsell automation workflows'
    ],
    results: [
      'Increased repeat purchase rate by 300%',
      'Improved customer lifetime value by 180%',
      'Reduced churn rate by 45%',
      'Generated $200K+ in additional recurring revenue'
    ],
    challenge: 'E-commerce store had low customer retention with most customers making only one purchase, limiting long-term revenue growth.',
    solution: 'Implemented comprehensive retention strategy with personalized campaigns, behavioral triggers, and loyalty programs to increase repeat purchases.',
    timeline: '4 months campaign development and execution',
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2023-10-01T00:00:00Z'
  },
  {
    id: '9',
    slug: 'referral-program-system',
    title: 'Referral Program System',
    description: 'Complete referral program platform with tracking, rewards, and analytics for viral growth.',
    type: 'workflow',
    technologies: ['Next.js', 'Stripe API', 'Firebase', 'SendGrid', 'React'],
    image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=600&fit=crop&crop=center',
    category: 'Growth Marketing',
    features: [
      'Custom referral link generation and tracking',
      'Automated reward distribution and management',
      'Multi-tier referral program structures',
      'Real-time analytics and performance dashboards',
      'Integration with existing marketing stack'
    ],
    results: [
      'Generated 40% of new customers through referrals',
      'Achieved 2.5x viral coefficient improvement',
      'Reduced customer acquisition cost by 35%',
      'Increased user engagement by 150%'
    ],
    challenge: 'Company lacked systematic approach to referral marketing, missing opportunities for viral growth and organic customer acquisition.',
    solution: 'Built comprehensive referral system with tracking, automated rewards, and analytics to create sustainable viral growth loop.',
    timeline: '3 months development, 1 month optimization',
    createdAt: '2023-05-01T00:00:00Z',
    updatedAt: '2023-08-01T00:00:00Z'
  },
  {
    id: '10',
    slug: 'conversion-tracking-tool',
    title: 'Conversion Tracking Tool',
    description: 'Advanced conversion tracking and attribution tool for multi-channel marketing campaigns.',
    type: 'tool',
    technologies: ['JavaScript', 'Google Tag Manager', 'BigQuery', 'Data Studio', 'Node.js'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center',
    category: 'Analytics',
    features: [
      'Cross-platform conversion attribution modeling',
      'Real-time campaign performance tracking',
      'Custom event tracking and goal management',
      'Advanced funnel analysis and optimization',
      'Automated reporting and alert systems'
    ],
    results: [
      'Improved attribution accuracy by 90%',
      'Identified $150K+ in optimization opportunities',
      'Reduced data discrepancies by 85%',
      'Increased marketing ROI by 120%'
    ],
    challenge: 'Marketing team struggled with accurate conversion tracking across multiple channels, leading to poor budget allocation decisions.',
    solution: 'Developed comprehensive tracking system with advanced attribution modeling to provide accurate insights for optimization.',
    timeline: '2 months development, 1 month integration',
    createdAt: '2023-04-01T00:00:00Z',
    updatedAt: '2023-07-01T00:00:00Z'
  },
  {
    id: '11',
    slug: 'influencer-outreach-campaign',
    title: 'Influencer Outreach Campaign',
    description: 'Strategic influencer partnership campaign that generated 2M+ impressions and 50K+ new followers.',
    type: 'campaign',
    technologies: ['BuzzSumo', 'Pitchbox', 'Airtable', 'Instagram API', 'TikTok API'],
    image: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&h=600&fit=crop&crop=center',
    category: 'Influencer Marketing',
    features: [
      'Influencer discovery and vetting processes',
      'Automated outreach and relationship management',
      'Campaign performance tracking and analytics',
      'Content approval and brand consistency workflows',
      'ROI measurement and optimization strategies'
    ],
    results: [
      'Generated 2M+ impressions across campaigns',
      'Acquired 50K+ new social media followers',
      'Achieved 8x ROI on influencer partnerships',
      'Increased brand awareness by 300% in target demographics'
    ],
    challenge: 'Brand struggled with influencer discovery, relationship management, and measuring ROI from influencer partnerships.',
    solution: 'Built systematic approach to influencer marketing with tools for discovery, outreach, tracking, and performance measurement.',
    timeline: '5 months campaign planning and execution',
    createdAt: '2023-03-01T00:00:00Z',
    updatedAt: '2023-08-01T00:00:00Z'
  },
  {
    id: '12',
    slug: 'marketing-attribution-dashboard',
    title: 'Marketing Attribution Dashboard',
    description: 'Comprehensive attribution dashboard that tracks customer journey across all touchpoints.',
    type: 'tool',
    technologies: ['React', 'D3.js', 'Python', 'Google Analytics API', 'Facebook API'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center',
    category: 'Analytics',
    features: [
      'Multi-touch attribution modeling and analysis',
      'Customer journey visualization and mapping',
      'Real-time performance metrics and KPI tracking',
      'Cross-channel campaign comparison tools',
      'Predictive analytics for budget optimization'
    ],
    results: [
      'Improved marketing attribution accuracy by 150%',
      'Optimized budget allocation for 25% better ROI',
      'Reduced reporting time by 80%',
      'Identified top-performing customer journey paths'
    ],
    challenge: 'Marketing team lacked visibility into customer journey across touchpoints, making it difficult to optimize campaigns and allocate budget effectively.',
    solution: 'Created comprehensive dashboard with advanced attribution modeling to provide clear insights into customer journey and campaign performance.',
    timeline: '3 months development, 1 month integration',
    createdAt: '2023-02-01T00:00:00Z',
    updatedAt: '2023-05-01T00:00:00Z'
  },
  {
    id: '13',
    slug: 'ab-testing-framework',
    title: 'A/B Testing Framework',
    description: 'Complete A/B testing framework for running experiments on websites and mobile apps.',
    type: 'workflow',
    technologies: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Statistics'],
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop&crop=center',
    category: 'Conversion Optimization',
    features: [
      'Visual experiment builder with no-code interface',
      'Statistical significance testing and analysis',
      'Multi-variant testing capabilities',
      'Automated traffic allocation and optimization',
      'Integration with analytics and tracking systems'
    ],
    results: [
      'Increased conversion rates by average of 35%',
      'Reduced development time for tests by 70%',
      'Ran 50+ experiments with statistical confidence',
      'Generated $250K+ in additional revenue from optimizations'
    ],
    challenge: 'Development team spent significant time building custom A/B tests, and marketing lacked tools for systematic experimentation.',
    solution: 'Built comprehensive testing framework that enables rapid experiment creation, statistical analysis, and optimization workflows.',
    timeline: '4 months development, 1 month optimization',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-05-01T00:00:00Z'
  },
  {
    id: '14',
    slug: 'brand-awareness-campaign',
    title: 'Brand Awareness Campaign',
    description: 'Integrated brand awareness campaign that increased brand recognition by 400% in target market.',
    type: 'campaign',
    technologies: ['Google Ads', 'Facebook Ads', 'YouTube Ads', 'Brand24', 'Google Trends'],
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop&crop=center',
    category: 'Brand Marketing',
    features: [
      'Multi-channel brand awareness strategy',
      'Creative campaign development and testing',
      'Brand sentiment monitoring and analysis',
      'Competitive analysis and positioning',
      'Integrated content marketing approach'
    ],
    results: [
      'Increased brand recognition by 400% in target market',
      'Improved brand sentiment score by 250%',
      'Generated 5M+ impressions across all channels',
      'Achieved 3.5x increase in branded search volume'
    ],
    challenge: 'New brand in competitive market with low awareness and unclear positioning relative to established competitors.',
    solution: 'Developed comprehensive brand awareness strategy with integrated campaigns across paid, owned, and earned media channels.',
    timeline: '6 months campaign planning and execution',
    createdAt: '2022-12-01T00:00:00Z',
    updatedAt: '2023-06-01T00:00:00Z'
  }
]

// Fetch single project
async function getProject(id: string): Promise<Project | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/projects/${id}`, {
      next: { revalidate: 3600 } // Revalidate every hour
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        // Try fallback data
        const fallbackProject = fallbackProjects.find(project => project.slug === id || project.id === id)
        return fallbackProject || null
      }
      throw new Error('Failed to fetch project')
    }
    
    const data = await response.json()
    return data.success ? data.data : (fallbackProjects.find(project => project.slug === id || project.id === id) || null)
  } catch (error) {
    console.error('Error fetching project:', error)
    // Return fallback data
    const fallbackProject = fallbackProjects.find(project => project.slug === id || project.id === id)
    return fallbackProject || null
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const project = await getProject(id)
  
  if (!project) {
    return {
      title: 'Project Not Found',
      description: 'The requested project could not be found.'
    }
  }
  
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: [project.image],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
      images: [project.image],
    }
  }
}

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  const project = await getProject(id)
  
  if (!project) {
    notFound()
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="py-12 bg-gradient-to-b from-muted/30 to-background mt-16">
        <div className="container mx-auto px-6 lg:px-12 xl:px-16">
          <div className="max-w-6xl mx-auto">
            <Link href="/projects">
              <Button variant="ghost" className="mb-8 -ml-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Project Info */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant={project.type === 'tool' ? 'default' : project.type === 'workflow' ? 'secondary' : 'destructive'} className="flex items-center gap-1">
                    {project.type === 'tool' ? (
                      <>
                        <Wrench className="w-3 h-3" />
                        Tool
                      </>
                    ) : project.type === 'workflow' ? (
                      <>
                        <Workflow className="w-3 h-3" />
                        Workflow
                      </>
                    ) : (
                      <>
                        <Target className="w-3 h-3" />
                        Campaign
                      </>
                    )}
                  </Badge>
                  {project.category && (
                    <Badge variant="outline">
                      {project.category}
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  {project.title}
                </h1>
                
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  {project.description}
                </p>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 mb-8">
                  {project.liveUrl && (
                    <Link href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="lg" className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View Live Demo
                      </Button>
                    </Link>
                  )}
                  
                  {project.githubUrl && (
                    <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="lg" className="flex items-center gap-2">
                        <Github className="h-4 w-4" />
                        View Source
                      </Button>
                    </Link>
                  )}
                </div>
                
{/* Technologies moved to sidebar */}
              </div>
              
              {/* Project Image */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-xl shadow-2xl">
                  <img
                    src={project.image}
                    alt={project.title}
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
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Overview */}
                <Card className="p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Project Overview</h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </Card>

                {/* Key Features */}
                {project.features && project.features.length > 0 && (
                  <Card className="p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      Key Features
                    </h2>
                    <div className="grid gap-4">
                      {project.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <p className="text-muted-foreground leading-relaxed">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Challenge & Solution */}
                {(project.challenge || project.solution) && (
                  <div className="grid gap-8">
                    {project.challenge && (
                      <Card className="p-8">
                        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                          <Lightbulb className="h-6 w-6 text-orange-500" />
                          The Challenge
                        </h2>
                        <div className="prose prose-lg max-w-none">
                          <p className="text-muted-foreground leading-relaxed">
                            {project.challenge}
                          </p>
                        </div>
                      </Card>
                    )}

                    {project.solution && (
                      <Card className="p-8">
                        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                          <CheckCircle className="h-6 w-6 text-blue-500" />
                          The Solution
                        </h2>
                        <div className="prose prose-lg max-w-none">
                          <p className="text-muted-foreground leading-relaxed">
                            {project.solution}
                          </p>
                        </div>
                      </Card>
                    )}
                  </div>
                )}

                {/* Results & Impact */}
                {project.results && project.results.length > 0 && (
                  <Card className="p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                      <TrendingUp className="h-6 w-6 text-green-500" />
                      Results & Impact
                    </h2>
                    <div className="grid gap-4">
                      {project.results.map((result, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-green-50/50 border border-green-200/20">
                          <TrendingUp className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
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
                      <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Updated: {new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>

                    {project.timeline && (
                      <div className="flex items-start text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2 mt-0.5" />
                        <div>
                          <span className="font-medium">Timeline:</span>
                          <p className="mt-1">{project.timeline}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Technologies */}
                {project.technologies && project.technologies.length > 0 && (
                  <Card className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">Technologies Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="outline">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}
                
                {/* Links */}
                <Card className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Links</h3>
                  <div className="space-y-3">
                    {project.liveUrl && (
                      <Link href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full justify-start">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Live Demo
                        </Button>
                      </Link>
                    )}
                    
                    {project.githubUrl && (
                      <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full justify-start">
                          <Github className="h-4 w-4 mr-2" />
                          Source Code
                        </Button>
                      </Link>
                    )}
                    
                    <Link href="/contact">
                      <Button variant="outline" className="w-full justify-start">
                        Get in Touch
                      </Button>
                    </Link>
                  </div>
                </Card>

                {/* Newsletter Sidebar CTA */}
                <NewsletterCTA 
                  variant="sidebar"
                  title="Get Tool & Automation Ideas"
                  description="Weekly insights on marketing tools, automation workflows, and growth tactics."
                  showStats={true}
                  className="mt-6"
                />
              </div>
            </div>
            
            {/* Navigation */}
            <div className="mt-16 pt-8 border-t">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <Link href="/projects">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    All Projects
                  </Button>
                </Link>
                
                <Link href="/contact">
                  <Button>
                    Discuss Your Project
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