"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Calendar, Target, Bot, TrendingUp, Mail, Search, Users, DollarSign, BarChart3, Zap, Globe, Smartphone, ShoppingCart, Heart, Megaphone, PieChart } from "lucide-react"
import Link from "next/link"

// Icon mapping for case studies
const iconMap: { [key: string]: React.ReactElement } = {
  Bot: <Bot className="h-6 w-6" />,
  TrendingUp: <TrendingUp className="h-6 w-6" />,
  Mail: <Mail className="h-6 w-6" />,
  Search: <Search className="h-6 w-6" />,
  Users: <Users className="h-6 w-6" />,
  DollarSign: <DollarSign className="h-6 w-6" />,
  BarChart3: <BarChart3 className="h-6 w-6" />,
  Zap: <Zap className="h-6 w-6" />,
  Globe: <Globe className="h-6 w-6" />,
  Smartphone: <Smartphone className="h-6 w-6" />,
  ShoppingCart: <ShoppingCart className="h-6 w-6" />,
  Heart: <Heart className="h-6 w-6" />,
  Megaphone: <Megaphone className="h-6 w-6" />,
  PieChart: <PieChart className="h-6 w-6" />,
}

interface CaseStudy {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  fullDescription: string
  image: string | null
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
  icon: string | null
  challenge: string
  solution: string
  timeline: Array<{
    phase: string
    duration: string
    description: string
  }>
  order: number
}

interface CaseStudiesStats {
  usersScaled: string
  subscribersGrowth: string
  budgetScaled: string
  roas: string
}

export function CaseStudiesSection() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [visibleCards, setVisibleCards] = useState<string[]>([])
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [stats, setStats] = useState<CaseStudiesStats>({
    usersScaled: '200k+',
    subscribersGrowth: '733%',
    budgetScaled: '$500k+',
    roas: '5x'
  })
  const [loading, setLoading] = useState(true)

  // Fetch case studies and stats from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [caseStudiesRes, statsRes] = await Promise.all([
          fetch('/api/case-studies'),
          fetch('/api/case-studies-stats')
        ])

        let caseStudiesLoaded = false

        if (caseStudiesRes.ok) {
          const caseStudiesData = await caseStudiesRes.json()
          if (caseStudiesData.success && caseStudiesData.data && caseStudiesData.data.length > 0) {
            console.log('Case studies fetched:', caseStudiesData.data.length)
            setCaseStudies(caseStudiesData.data)
            caseStudiesLoaded = true
          } else {
            console.error('Case studies API returned error:', caseStudiesData)
          }
        } else {
          console.error('Case studies API request failed:', caseStudiesRes.status)
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          if (statsData.success) {
            setStats(statsData.data)
          }
        }

        // Load fallback case studies if API failed or returned empty data
        if (!caseStudiesLoaded) {
          setCaseStudies([
            {
              id: '1',
              slug: 'ai-driven-content-strategy',
              title: 'AI-Driven Content Strategy',
              subtitle: 'Scaling organic traffic with AI-powered content',
              description: 'Implemented AI-powered content generation and optimization strategies that increased organic traffic by 200% while maintaining quality and brand consistency.',
              fullDescription: 'A comprehensive AI-driven content strategy that leveraged machine learning algorithms to optimize content creation, distribution, and performance tracking.',
              image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
              metrics: { primary: '200%', primaryLabel: 'Traffic Growth', secondary: '4 months', secondaryLabel: 'Timeline' },
              results: [
                'Increased organic traffic by 200% in 4 months',
                'Improved content engagement rate by 150%',
                'Generated 3,000+ high-quality content pieces',
                'Achieved 85% content automation efficiency'
              ],
              tools: ['ChatGPT', 'Claude AI', 'Google Analytics', 'SEMrush', 'Ahrefs'],
              category: 'AI & Automation',
              color: 'from-blue-500 to-purple-600',
              icon: 'Bot',
              challenge: 'Manual content creation was time-consuming and inconsistent',
              solution: 'Implemented AI-powered content generation and optimization workflows',
              timeline: [
                { phase: 'Research & Strategy', duration: '2 weeks', description: 'Analyzed content gaps and defined AI implementation strategy' },
                { phase: 'AI Implementation', duration: '4 weeks', description: 'Set up AI tools and created content generation workflows' },
                { phase: 'Content Production', duration: '12 weeks', description: 'Generated and optimized content using AI-powered processes' },
                { phase: 'Performance Analysis', duration: '2 weeks', description: 'Analyzed results and refined strategy for maximum impact' }
              ],
              order: 1
            },
            {
              id: '2',
              slug: 'email-marketing-transformation',
              title: 'Email Marketing Transformation',
              subtitle: '733% subscriber growth through strategic automation',
              description: 'Transformed email marketing strategy from basic newsletters to sophisticated automation workflows, achieving 733% subscriber growth and 5x engagement rates.',
              fullDescription: 'A complete overhaul of email marketing operations using advanced segmentation, automation, and personalization strategies.',
              image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
              metrics: { primary: '733%', primaryLabel: 'Subscriber Growth', secondary: '3 months', secondaryLabel: 'Timeline' },
              results: [
                'Achieved 733% growth in email subscribers (3K to 25K)',
                'Increased email engagement rates by 5x',
                'Generated $200K+ revenue from email campaigns',
                'Reduced unsubscribe rates by 60%'
              ],
              tools: ['HubSpot', 'Mailchimp', 'Klaviyo', 'Google Analytics', 'Zapier'],
              category: 'Email Marketing',
              color: 'from-green-500 to-emerald-600',
              icon: 'Mail',
              challenge: 'Low email engagement and limited subscriber growth',
              solution: 'Implemented advanced segmentation and automation workflows',
              timeline: [
                { phase: 'Audit & Analysis', duration: '1 week', description: 'Analyzed current email performance and identified opportunities' },
                { phase: 'Strategy Development', duration: '2 weeks', description: 'Created comprehensive email marketing strategy and workflows' },
                { phase: 'Implementation', duration: '6 weeks', description: 'Set up automation, segmentation, and personalization systems' },
                { phase: 'Optimization', duration: '4 weeks', description: 'Continuously tested and refined campaigns for maximum performance' }
              ],
              order: 2
            },
            {
              id: '3',
              slug: 'social-media-growth-engine',
              title: 'Social Media Growth Engine',
              subtitle: '70K+ followers through strategic content & community',
              description: 'Built and executed a comprehensive social media strategy that generated 70,000+ new followers and 80% brand awareness growth across multiple platforms.',
              fullDescription: 'A multi-platform social media growth strategy focused on community building, content optimization, and strategic engagement.',
              image: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&h=600&fit=crop',
              metrics: { primary: '70K+', primaryLabel: 'New Followers', secondary: '6 months', secondaryLabel: 'Timeline' },
              results: [
                'Generated 70,000+ new followers across platforms',
                'Increased brand awareness by 80%',
                'Achieved 60% engagement growth',
                'Built active community of 50,000+ members'
              ],
              tools: ['Buffer', 'Hootsuite', 'Canva', 'Google Analytics', 'Facebook Insights'],
              category: 'Social Media',
              color: 'from-pink-500 to-rose-600',
              icon: 'Users',
              challenge: 'Limited social media presence and low engagement rates',
              solution: 'Developed content strategy focused on community building and engagement',
              timeline: [
                { phase: 'Platform Analysis', duration: '2 weeks', description: 'Analyzed platform performance and competitor strategies' },
                { phase: 'Content Strategy', duration: '3 weeks', description: 'Created comprehensive content calendar and posting strategy' },
                { phase: 'Community Building', duration: '16 weeks', description: 'Executed growth strategy with consistent content and engagement' },
                { phase: 'Performance Optimization', duration: '4 weeks', description: 'Analyzed results and optimized strategy for sustained growth' }
              ],
              order: 3
            },
            {
              id: '4',
              slug: 'conversion-rate-optimization',
              title: 'Conversion Rate Optimization',
              subtitle: '5X ROAS through systematic testing & optimization',
              description: 'Implemented comprehensive CRO strategy using A/B testing, user research, and data analysis to achieve 5X return on ad spend and 300% conversion improvement.',
              fullDescription: 'A data-driven conversion rate optimization program that systematically improved every aspect of the customer journey.',
              image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
              metrics: { primary: '5X', primaryLabel: 'ROAS', secondary: '300%', secondaryLabel: 'Conversion Increase' },
              results: [
                'Achieved 5X return on ad spend (ROAS)',
                'Increased conversion rates by 300%',
                'Generated $500K+ additional revenue',
                'Reduced customer acquisition cost by 40%'
              ],
              tools: ['Google Optimize', 'Hotjar', 'Google Analytics', 'Unbounce', 'Crazy Egg'],
              category: 'Conversion Optimization',
              color: 'from-orange-500 to-red-600',
              icon: 'TrendingUp',
              challenge: 'Low conversion rates and high customer acquisition costs',
              solution: 'Systematic A/B testing and user experience optimization',
              timeline: [
                { phase: 'Baseline Analysis', duration: '2 weeks', description: 'Analyzed current conversion funnel and identified bottlenecks' },
                { phase: 'Test Planning', duration: '1 week', description: 'Designed comprehensive testing strategy and hypotheses' },
                { phase: 'Testing & Optimization', duration: '12 weeks', description: 'Executed continuous A/B tests and optimizations' },
                { phase: 'Results Analysis', duration: '1 week', description: 'Analyzed final results and documented best practices' }
              ],
              order: 4
            }
          ])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        // Load fallback case studies if there's an error
        setCaseStudies([
          {
            id: '1',
            slug: 'ai-driven-content-strategy',
            title: 'AI-Driven Content Strategy',
            subtitle: 'Scaling organic traffic with AI-powered content',
            description: 'Implemented AI-powered content generation and optimization strategies that increased organic traffic by 200% while maintaining quality and brand consistency.',
            fullDescription: 'A comprehensive AI-driven content strategy that leveraged machine learning algorithms to optimize content creation, distribution, and performance tracking.',
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
            metrics: { primary: '200%', primaryLabel: 'Traffic Growth', secondary: '4 months', secondaryLabel: 'Timeline' },
            results: [
              'Increased organic traffic by 200% in 4 months',
              'Improved content engagement rate by 150%',
              'Generated 3,000+ high-quality content pieces',
              'Achieved 85% content automation efficiency'
            ],
            tools: ['ChatGPT', 'Claude AI', 'Google Analytics', 'SEMrush', 'Ahrefs'],
            category: 'AI & Automation',
            color: 'from-blue-500 to-purple-600',
            icon: 'Bot',
            challenge: 'Manual content creation was time-consuming and inconsistent',
            solution: 'Implemented AI-powered content generation and optimization workflows',
            timeline: [
              { phase: 'Research & Strategy', duration: '2 weeks', description: 'Analyzed content gaps and defined AI implementation strategy' },
              { phase: 'AI Implementation', duration: '4 weeks', description: 'Set up AI tools and created content generation workflows' },
              { phase: 'Content Production', duration: '12 weeks', description: 'Generated and optimized content using AI-powered processes' },
              { phase: 'Performance Analysis', duration: '2 weeks', description: 'Analyzed results and refined strategy for maximum impact' }
            ],
            order: 1
          },
          {
            id: '2',
            slug: 'email-marketing-transformation',
            title: 'Email Marketing Transformation',
            subtitle: '733% subscriber growth through strategic automation',
            description: 'Transformed email marketing strategy from basic newsletters to sophisticated automation workflows, achieving 733% subscriber growth and 5x engagement rates.',
            fullDescription: 'A complete overhaul of email marketing operations using advanced segmentation, automation, and personalization strategies.',
            image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
            metrics: { primary: '733%', primaryLabel: 'Subscriber Growth', secondary: '3 months', secondaryLabel: 'Timeline' },
            results: [
              'Achieved 733% growth in email subscribers (3K to 25K)',
              'Increased email engagement rates by 5x',
              'Generated $200K+ revenue from email campaigns',
              'Reduced unsubscribe rates by 60%'
            ],
            tools: ['HubSpot', 'Mailchimp', 'Klaviyo', 'Google Analytics', 'Zapier'],
            category: 'Email Marketing',
            color: 'from-green-500 to-emerald-600',
            icon: 'Mail',
            challenge: 'Low email engagement and limited subscriber growth',
            solution: 'Implemented advanced segmentation and automation workflows',
            timeline: [
              { phase: 'Audit & Analysis', duration: '1 week', description: 'Analyzed current email performance and identified opportunities' },
              { phase: 'Strategy Development', duration: '2 weeks', description: 'Created comprehensive email marketing strategy and workflows' },
              { phase: 'Implementation', duration: '6 weeks', description: 'Set up automation, segmentation, and personalization systems' },
              { phase: 'Optimization', duration: '4 weeks', description: 'Continuously tested and refined campaigns for maximum performance' }
            ],
            order: 2
          },
          {
            id: '3',
            slug: 'social-media-growth-engine',
            title: 'Social Media Growth Engine',
            subtitle: '70K+ followers through strategic content & community',
            description: 'Built and executed a comprehensive social media strategy that generated 70,000+ new followers and 80% brand awareness growth across multiple platforms.',
            fullDescription: 'A multi-platform social media growth strategy focused on community building, content optimization, and strategic engagement.',
            image: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&h=600&fit=crop',
            metrics: { primary: '70K+', primaryLabel: 'New Followers', secondary: '6 months', secondaryLabel: 'Timeline' },
            results: [
              'Generated 70,000+ new followers across platforms',
              'Increased brand awareness by 80%',
              'Achieved 60% engagement growth',
              'Built active community of 50,000+ members'
            ],
            tools: ['Buffer', 'Hootsuite', 'Canva', 'Google Analytics', 'Facebook Insights'],
            category: 'Social Media',
            color: 'from-pink-500 to-rose-600',
            icon: 'Users',
            challenge: 'Limited social media presence and low engagement rates',
            solution: 'Developed content strategy focused on community building and engagement',
            timeline: [
              { phase: 'Platform Analysis', duration: '2 weeks', description: 'Analyzed platform performance and competitor strategies' },
              { phase: 'Content Strategy', duration: '3 weeks', description: 'Created comprehensive content calendar and posting strategy' },
              { phase: 'Community Building', duration: '16 weeks', description: 'Executed growth strategy with consistent content and engagement' },
              { phase: 'Performance Optimization', duration: '4 weeks', description: 'Analyzed results and optimized strategy for sustained growth' }
            ],
            order: 3
          },
          {
            id: '4',
            slug: 'conversion-rate-optimization',
            title: 'Conversion Rate Optimization',
            subtitle: '5X ROAS through systematic testing & optimization',
            description: 'Implemented comprehensive CRO strategy using A/B testing, user research, and data analysis to achieve 5X return on ad spend and 300% conversion improvement.',
            fullDescription: 'A data-driven conversion rate optimization program that systematically improved every aspect of the customer journey.',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
            metrics: { primary: '5X', primaryLabel: 'ROAS', secondary: '300%', secondaryLabel: 'Conversion Increase' },
            results: [
              'Achieved 5X return on ad spend (ROAS)',
              'Increased conversion rates by 300%',
              'Generated $500K+ additional revenue',
              'Reduced customer acquisition cost by 40%'
            ],
            tools: ['Google Optimize', 'Hotjar', 'Google Analytics', 'Unbounce', 'Crazy Egg'],
            category: 'Conversion Optimization',
            color: 'from-orange-500 to-red-600',
            icon: 'TrendingUp',
            challenge: 'Low conversion rates and high customer acquisition costs',
            solution: 'Systematic A/B testing and user experience optimization',
            timeline: [
              { phase: 'Baseline Analysis', duration: '2 weeks', description: 'Analyzed current conversion funnel and identified bottlenecks' },
              { phase: 'Test Planning', duration: '1 week', description: 'Designed comprehensive testing strategy and hypotheses' },
              { phase: 'Testing & Optimization', duration: '12 weeks', description: 'Executed continuous A/B tests and optimizations' },
              { phase: 'Results Analysis', duration: '1 week', description: 'Analyzed final results and documented best practices' }
            ],
            order: 4
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (loading || caseStudies.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-case-study") || ""
            setVisibleCards((prev) => {
              if (!prev.includes(id)) {
                return [...prev, id]
              }
              return prev
            })
          }
        })
      },
      { threshold: 0.2 },
    )

    const elements = document.querySelectorAll("[data-case-study]")
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [loading, caseStudies.length])

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6 lg:px-12 xl:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Case Studies</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real results from strategic marketing campaigns and growth initiatives that delivered measurable impact
            </p>
          </div>

          {/* Case Studies Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 10 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="h-64 bg-muted"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-5/6"></div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              caseStudies.slice(0, 4).map((study, index) => (
                <Card
                  key={study.id}
                  data-case-study={study.id}
                  className={`group relative overflow-hidden bg-card/50 border-border/50 hover:bg-card/80 transition-all duration-500 cursor-pointer ${
                    visibleCards.includes(study.id) ? "animate-fade-in-up" : "opacity-0"
                  }`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                  onMouseEnter={() => setHoveredCard(study.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Image Section */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={study.image || "/placeholder.svg"}
                      alt={study.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className={`bg-gradient-to-r ${study.color} text-white border-0`}>{study.category}</Badge>
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
                      {study.icon && iconMap[study.icon] ? iconMap[study.icon] : iconMap['Bot']}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1">{study.title}</h3>
                      <p className="text-primary font-medium">{study.subtitle}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div 
                    className="text-muted-foreground mb-4 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: study.description }}
                  />

                  {/* Metrics Row */}
                  <div className="flex items-center gap-6 mb-4">
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

                  {/* Expandable Results */}
                  <div
                    className={`transition-all duration-500 overflow-hidden ${
                      hoveredCard === study.id ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="border-t border-border/50 pt-4 mb-4">
                      <h4 className="font-semibold text-foreground mb-3">Key Results:</h4>
                      <ul className="space-y-2">
                        {study.results.map((result, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            {result}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tools Used */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-foreground mb-2">Tools Used:</h4>
                      <div className="flex flex-wrap gap-2">
                        {study.tools.map((tool) => (
                          <Badge key={tool} variant="outline" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link href={`/case-study/${study.slug}`}>
                    <Button
                      className={`w-full bg-gradient-to-r ${study.color} hover:opacity-90 text-white border-0 transition-all duration-300 ${
                        hoveredCard === study.id ? "translate-y-0 opacity-100" : "translate-y-2 opacity-70"
                      }`}
                    >
                      View Case Study
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
              ))
            )}
          </div>

          {/* View All Case Studies button */}
          <div className="text-center mt-12">
            <Link href="/case-studies">
              <Button
                size="lg"
                variant="outline"
                className="hover:bg-primary hover:text-primary-foreground bg-transparent"
              >
                View All Case Studies
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Results Summary */}
          <div className="mt-16">
            <Card className="p-8 bg-gradient-to-r from-primary/10 via-accent/10 to-green-500/10 border-primary/20">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">Combined Impact</h3>
                <p className="text-muted-foreground">Measurable results across all growth initiatives</p>
              </div>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{stats.usersScaled}</div>
                  <div className="text-sm text-muted-foreground">Users Scaled</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2">{stats.subscribersGrowth}</div>
                  <div className="text-sm text-muted-foreground">Subscribers Growth</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500 mb-2">{stats.budgetScaled}</div>
                  <div className="text-sm text-muted-foreground">Budget Scaled</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500 mb-2">{stats.roas}</div>
                  <div className="text-sm text-muted-foreground">ROAS</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
