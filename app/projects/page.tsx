import { Metadata } from 'next'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Wrench, 
  Workflow, 
  ArrowRight, 
  Github,
  ExternalLink,
  Filter,
  Target
} from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

// Configure ISR (Incremental Static Regeneration)  
export const revalidate = 300 // Revalidate every 5 minutes

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
  status: string
}

// Fetch projects from API
async function getProjects(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = typeof searchParams.page === 'string' ? searchParams.page : '1'
  const category = typeof searchParams.category === 'string' ? searchParams.category : ''
  
  const params = new URLSearchParams()
  if (page !== '1') params.set('page', page)
  if (category) params.set('category', category)
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/projects?${params.toString()}`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch projects')
    }
    
    const data = await response.json()
    return data.success ? { projects: data.data, pagination: data.pagination } : { projects: [], pagination: null }
  } catch (error) {
    console.error('Error fetching projects:', error)
    // Return fallback projects with pagination
    const allProjects = [
      {
        id: '1',
        slug: 'ai-marketing-automation-suite',
        title: 'AI Marketing Automation Suite',
        description: 'Comprehensive marketing automation platform leveraging AI for personalized campaigns and lead nurturing.',
        type: 'workflow',
        technologies: ['Next.js', 'TypeScript', 'OpenAI API', 'HubSpot API', 'PostgreSQL'],
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&crop=center',
        status: 'Live',
        githubUrl: 'https://github.com/example/ai-marketing-suite',
        liveUrl: 'https://ai-marketing-suite.demo.com'
      },
      {
        id: '2',
        slug: 'growth-analytics-dashboard',
        title: 'Growth Analytics Dashboard',
        description: 'Real-time dashboard for tracking marketing performance across multiple channels and campaigns.',
        type: 'tool',
        technologies: ['React', 'D3.js', 'Node.js', 'Google Analytics API', 'Chart.js'],
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop&crop=center',
        status: 'Live',
        githubUrl: 'https://github.com/example/growth-dashboard',
        liveUrl: 'https://growth-dashboard.demo.com'
      },
      {
        id: '3',
        slug: 'email-campaign-optimizer',
        title: 'Email Campaign Optimizer',
        description: 'AI-powered email optimization tool that improves open rates and click-through rates.',
        type: 'tool',
        technologies: ['Python', 'Flask', 'TensorFlow', 'SendGrid API', 'React'],
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop&crop=center',
        status: 'Live',
        githubUrl: 'https://github.com/example/email-optimizer',
        liveUrl: 'https://email-optimizer.demo.com'
      },
      {
        id: '4',
        slug: 'social-media-scheduler',
        title: 'Social Media Scheduler',
        description: 'Advanced social media scheduling and analytics platform with AI-powered content suggestions.',
        type: 'workflow',
        technologies: ['Vue.js', 'Laravel', 'Redis', 'Twitter API', 'Instagram API'],
        image: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=400&h=250&fit=crop&crop=center',
        status: 'In Development',
        githubUrl: 'https://github.com/example/social-scheduler'
      },
      {
        id: '5',
        slug: 'saas-growth-campaign',
        title: 'SaaS Growth Campaign',
        description: 'Multi-channel growth campaign that scaled a B2B SaaS from 100 to 10,000 users through strategic acquisition.',
        type: 'campaign',
        technologies: ['Google Ads', 'Facebook Ads', 'LinkedIn Ads', 'HubSpot', 'Mixpanel', 'Intercom'],
        image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=250&fit=crop&crop=center',
        status: 'Completed',
        category: 'B2B SaaS'
      },
      {
        id: '6',
        slug: 'content-automation-workflow',
        title: 'Content Automation Workflow',
        description: 'Automated content creation and distribution system that generates and publishes 100+ pieces monthly.',
        type: 'workflow',
        technologies: ['OpenAI API', 'Zapier', 'WordPress', 'Buffer', 'Canva API'],
        image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=250&fit=crop&crop=center',
        status: 'Live',
        githubUrl: 'https://github.com/example/content-automation',
        liveUrl: 'https://content-automation.demo.com'
      },
      {
        id: '7',
        slug: 'lead-scoring-engine',
        title: 'Lead Scoring Engine',
        description: 'Machine learning-powered lead scoring system that identifies high-value prospects automatically.',
        type: 'tool',
        technologies: ['Python', 'Scikit-learn', 'FastAPI', 'PostgreSQL', 'React'],
        image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop&crop=center',
        status: 'Live',
        githubUrl: 'https://github.com/example/lead-scoring',
        liveUrl: 'https://lead-scoring.demo.com'
      },
      {
        id: '8',
        slug: 'ecommerce-retention-campaign',
        title: 'E-commerce Retention Campaign',
        description: 'Customer retention campaign that increased repeat purchase rate by 300% through personalized experiences.',
        type: 'campaign',
        technologies: ['Klaviyo', 'Shopify', 'Google Analytics', 'Facebook Pixel', 'Hotjar'],
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop&crop=center',
        status: 'Completed',
        category: 'E-commerce'
      },
      {
        id: '9',
        slug: 'referral-program-system',
        title: 'Referral Program System',
        description: 'Complete referral program platform with tracking, rewards, and analytics for viral growth.',
        type: 'workflow',
        technologies: ['Next.js', 'Stripe API', 'Firebase', 'SendGrid', 'React'],
        image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=250&fit=crop&crop=center',
        status: 'Live',
        githubUrl: 'https://github.com/example/referral-system',
        liveUrl: 'https://referral-system.demo.com'
      },
      {
        id: '10',
        slug: 'conversion-tracking-tool',
        title: 'Conversion Tracking Tool',
        description: 'Advanced conversion tracking and attribution tool for multi-channel marketing campaigns.',
        type: 'tool',
        technologies: ['JavaScript', 'Google Tag Manager', 'BigQuery', 'Data Studio', 'Node.js'],
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&crop=center',
        status: 'Live',
        githubUrl: 'https://github.com/example/conversion-tracking',
        liveUrl: 'https://conversion-tracking.demo.com'
      },
      {
        id: '11',
        slug: 'influencer-outreach-campaign',
        title: 'Influencer Outreach Campaign',
        description: 'Strategic influencer partnership campaign that generated 2M+ impressions and 50K+ new followers.',
        type: 'campaign',
        technologies: ['BuzzSumo', 'Pitchbox', 'Airtable', 'Instagram API', 'TikTok API'],
        image: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=400&h=250&fit=crop&crop=center',
        status: 'Completed',
        category: 'Influencer Marketing'
      },
      {
        id: '12',
        slug: 'marketing-attribution-dashboard',
        title: 'Marketing Attribution Dashboard',
        description: 'Comprehensive attribution dashboard that tracks customer journey across all touchpoints.',
        type: 'tool',
        technologies: ['React', 'D3.js', 'Python', 'Google Analytics API', 'Facebook API'],
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop&crop=center',
        status: 'Live',
        githubUrl: 'https://github.com/example/attribution-dashboard',
        liveUrl: 'https://attribution-dashboard.demo.com'
      },
      {
        id: '13',
        slug: 'ab-testing-framework',
        title: 'A/B Testing Framework',
        description: 'Complete A/B testing framework for running experiments on websites and mobile apps.',
        type: 'workflow',
        technologies: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Statistics'],
        image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=250&fit=crop&crop=center',
        status: 'Live',
        githubUrl: 'https://github.com/example/ab-testing',
        liveUrl: 'https://ab-testing.demo.com'
      },
      {
        id: '14',
        slug: 'brand-awareness-campaign',
        title: 'Brand Awareness Campaign',
        description: 'Integrated brand awareness campaign that increased brand recognition by 400% in target market.',
        type: 'campaign',
        technologies: ['Google Ads', 'Facebook Ads', 'YouTube Ads', 'Brand24', 'Google Trends'],
        image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=250&fit=crop&crop=center',
        status: 'Completed',
        category: 'Brand Marketing'
      }
    ]

    // Filter projects by category if specified
    let filteredProjects = allProjects
    if (category && category !== 'all') {
      filteredProjects = allProjects.filter(project => project.type === category)
    }

    // Implement pagination (9 projects per page)
    const limit = 9
    const currentPage = parseInt(page) || 1
    const offset = (currentPage - 1) * limit
    const paginatedProjects = filteredProjects.slice(offset, offset + limit)
    const totalPages = Math.ceil(filteredProjects.length / limit)

    return { 
      projects: paginatedProjects, 
      pagination: { 
        page: currentPage, 
        limit: limit, 
        total: filteredProjects.length, 
        pages: totalPages 
      } 
    }
  }
}

export const metadata: Metadata = {
  title: 'Projects - Edikan Udoibuot',
  description: 'Explore the workflows and tools I\'ve built to drive growth and optimize marketing performance',
}

interface ProjectsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const resolvedSearchParams = await searchParams
  const { projects, pagination } = await getProjects(resolvedSearchParams)
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
              Projects & Tools
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore the workflows and tools I've built to drive growth and optimize marketing performance
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link href="/projects">
              <Button
                variant={!resolvedSearchParams.category ? "default" : "outline"}
                className="px-6"
              >
                All Projects
              </Button>
            </Link>
            <Link href="/projects?category=tool">
              <Button
                variant={resolvedSearchParams.category === 'tool' ? "default" : "outline"}
                className="px-6"
              >
                <Wrench className="w-4 h-4 mr-2" />
                Tools
              </Button>
            </Link>
            <Link href="/projects?category=workflow">
              <Button
                variant={resolvedSearchParams.category === 'workflow' ? "default" : "outline"}
                className="px-6"
              >
                <Workflow className="w-4 h-4 mr-2" />
                Workflows
              </Button>
            </Link>
            <Link href="/projects?category=campaign">
              <Button
                variant={resolvedSearchParams.category === 'campaign' ? "default" : "outline"}
                className="px-6"
              >
                <Target className="w-4 h-4 mr-2" />
                Campaigns
              </Button>
            </Link>
          </div>

          {/* Projects Grid */}
          {projects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {projects.map((project: Project) => (
                <Card key={project.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant={project.type === "tool" ? "default" : project.type === "workflow" ? "secondary" : "destructive"}>
                        {project.type === "tool" ? (
                          <>
                            <Wrench className="w-3 h-3 mr-1" /> Tool
                          </>
                        ) : project.type === "workflow" ? (
                          <>
                            <Workflow className="w-3 h-3 mr-1" /> Workflow
                          </>
                        ) : (
                          <>
                            <Target className="w-3 h-3 mr-1" /> Campaign
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-grow line-clamp-3">
                      {project.description}
                    </p>
                    
                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.technologies.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex space-x-2">
                        {project.githubUrl && (
                          <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Github className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        {project.liveUrl && (
                          <Link href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                      
                      <Link href={`/project/${project.slug}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="group-hover:translate-x-1 transition-all text-primary hover:text-primary/80"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4 ml-1" />
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
                <Wrench className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-4">
                Check back later for new projects and tools.
              </p>
              <Link href="/contact">
                <Button>
                  Discuss Your Project
                </Button>
              </Link>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-4">
              {currentPage > 1 && (
                <Link href={`/projects?page=${currentPage - 1}${resolvedSearchParams.category ? `&category=${resolvedSearchParams.category}` : ''}`}>
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
                <Link href={`/projects?page=${currentPage + 1}${resolvedSearchParams.category ? `&category=${resolvedSearchParams.category}` : ''}`}>
                  <Button variant="outline">
                    Next
                  </Button>
                </Link>
              )}
            </div>
          )}
          
          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Need a Custom Solution?
              </h2>
              <p className="text-muted-foreground mb-6">
                I specialize in building custom marketing tools and workflows tailored to your specific needs.
              </p>
              <Link href="/contact">
                <Button size="lg">
                  Let's Discuss Your Project
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