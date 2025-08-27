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
  Share2
} from 'lucide-react'
import { ShareButton } from '@/components/blog/share-button'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

interface Project {
  id: string
  slug: string
  title: string
  description: string
  type: 'tool' | 'workflow'
  technologies: string[]
  image: string
  githubUrl?: string
  liveUrl?: string
  category?: string
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
    createdAt: '2023-10-10T00:00:00Z',
    updatedAt: '2023-12-20T00:00:00Z'
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
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {project.type === 'tool' ? (
                      <>
                        <Wrench className="w-3 h-3" />
                        Tool
                      </>
                    ) : (
                      <>
                        <Workflow className="w-3 h-3" />
                        Workflow
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
                
                {/* Technologies */}
                {project.technologies.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Technologies Used
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="outline">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
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
              <div className="lg:col-span-2">
                <Card className="p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Project Details</h2>
                  
                  <div className="prose prose-lg max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {project.description}
                    </p>
                    
                    {/* Additional project content would go here */}
                    <div className="mt-8 p-6 bg-muted/50 rounded-lg">
                      <p className="text-muted-foreground text-center italic">
                        Detailed project documentation and screenshots would be displayed here.
                        This content can be managed through the admin portal.
                      </p>
                    </div>
                  </div>
                </Card>
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
                  </div>
                </Card>
                
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