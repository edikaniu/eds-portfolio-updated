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

// Fetch single case study
async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/case-studies/${slug}`, {
      next: { revalidate: 3600 } // Revalidate every hour
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error('Failed to fetch case study')
    }
    
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error('Error fetching case study:', error)
    return null
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