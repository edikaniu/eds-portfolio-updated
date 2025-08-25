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

        if (caseStudiesRes.ok) {
          const caseStudiesData = await caseStudiesRes.json()
          if (caseStudiesData.success) {
            console.log('Case studies fetched:', caseStudiesData.data.length)
            setCaseStudies(caseStudiesData.data || [])
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
      } catch (error) {
        console.error('Error fetching data:', error)
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
                  <p className="text-muted-foreground mb-4 leading-relaxed">{study.description}</p>

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
