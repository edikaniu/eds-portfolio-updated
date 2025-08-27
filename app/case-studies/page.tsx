import { Metadata } from 'next'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, Target, Bot, TrendingUp, Mail, Users } from 'lucide-react'

// Icon mapping
const iconMap: { [key: string]: React.ReactElement } = {
  Bot: <Bot className="h-6 w-6" />,
  TrendingUp: <TrendingUp className="h-6 w-6" />,
  Mail: <Mail className="h-6 w-6" />,
  Users: <Users className="h-6 w-6" />,
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
async function getCaseStudies() {
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
    // Fallback data
    return [
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
      }
    ]
  }
}

export const metadata: Metadata = {
  title: 'Case Studies - Edikan Udoibuot',
  description: 'Real results from strategic marketing campaigns and growth initiatives that delivered measurable impact',
}

export default async function CaseStudiesPage() {
  const caseStudies = await getCaseStudies()

  return (
    <div className="min-h-screen bg-background py-24">
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

          {/* Case Studies Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
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
  )
}