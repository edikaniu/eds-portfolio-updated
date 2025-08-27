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