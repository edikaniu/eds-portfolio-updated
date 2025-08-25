import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Target, Users } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { prisma } from "@/lib/prisma"
import { generateCaseStudyMetadata } from "@/lib/meta-tags"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  
  const dbStudy = await prisma.caseStudy.findUnique({
    where: { slug: slug },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      client: true,
      industry: true,
      tags: true,
      createdAt: true,
      updatedAt: true,
    }
  })

  if (!dbStudy) {
    return {
      title: 'Case Study Not Found',
      description: 'The requested case study could not be found.',
    }
  }

  // Parse tags
  let tags: string[] = []
  try {
    tags = JSON.parse(dbStudy.tags || '[]')
    if (!Array.isArray(tags)) tags = []
  } catch {
    tags = []
  }

  return generateCaseStudyMetadata({
    ...dbStudy,
    client: dbStudy.client || 'Client',
    industry: dbStudy.industry || 'Business',
    tags,
  })
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // Get case study from database
  const dbStudy = await prisma.caseStudy.findUnique({
    where: { slug: slug }
  })

  if (!dbStudy) {
    notFound()
  }

  // Parse JSON fields with error handling
  let metrics: any = { primary: "High", primaryLabel: "Impact", secondary: "Success", secondaryLabel: "Rate" }
  let results: string[] = []
  let tools: string[] = []
  let timeline: any[] = []
  
  try {
    const parsed = JSON.parse(dbStudy.metrics || '{}')
    if (parsed.primary && parsed.primaryLabel) {
      metrics = parsed
    }
  } catch (e) {
    console.error('Error parsing metrics:', e)
  }
  
  try {
    results = JSON.parse(dbStudy.results || '[]')
    if (!Array.isArray(results)) results = []
  } catch (e) {
    console.error('Error parsing results:', e)
    results = []
  }
  
  try {
    if (dbStudy.tools) {
      if (typeof dbStudy.tools === 'string') {
        try {
          tools = JSON.parse(dbStudy.tools)
        } catch {
          tools = dbStudy.tools.split(',').map(tool => tool.trim())
        }
      }
    }
  } catch (e) {
    console.error('Error parsing tools:', e)
    tools = []
  }

  try {
    if (dbStudy.timeline) {
      timeline = JSON.parse(dbStudy.timeline)
      if (!Array.isArray(timeline)) timeline = []
    }
  } catch (e) {
    console.error('Error parsing timeline:', e)
    timeline = []
  }

  // Map database study to match original structure
  const study = {
    id: dbStudy.slug,
    title: dbStudy.title,
    subtitle: dbStudy.subtitle,
    description: dbStudy.description,
    fullDescription: dbStudy.fullDescription,
    category: dbStudy.category,
    color: dbStudy.color || "from-primary to-primary/80",
    icon: dbStudy.icon,
    challenge: dbStudy.challenge,
    solution: dbStudy.solution,
    image: dbStudy.image,
    metrics,
    results,
    tools,
    timeline
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <div className="container mx-auto px-6 lg:px-12 xl:px-16 py-12">
          <div className="max-w-4xl mx-auto">
            <Link href="/case-studies">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Case Studies
              </Button>
            </Link>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${study.color} text-white flex-shrink-0`}>
                {study.icon && <div className="w-6 h-6" />}
              </div>
              <div className="min-w-0 flex-1">
                <Badge className={`bg-gradient-to-r ${study.color} text-white border-0 mb-3`}>
                  {study.category}
                </Badge>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 break-words">
                  {study.title}
                </h1>
                <p className="text-lg sm:text-xl text-primary font-medium break-words">{study.subtitle}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-12">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
                <Target className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-bold text-foreground break-words">{study.metrics.primary}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground break-words">{study.metrics.primaryLabel}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
                <Calendar className="h-5 w-5 text-accent flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-bold text-foreground break-words">{study.metrics.secondary}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground break-words">{study.metrics.secondaryLabel}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50 sm:col-span-2 md:col-span-1">
                <Users className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">High</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Impact Level</div>
                </div>
              </div>
            </div>
            
            <div className="mb-12">
              <img
                src={study.image || "/placeholder.svg"}
                alt={study.title}
                className="w-full h-64 md:h-80 object-cover rounded-xl border border-border/50"
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-foreground mb-4">Project Overview</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{study.fullDescription}</p>

                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="font-semibold text-foreground mb-3">The Challenge</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{study.challenge}</p>
                  </Card>
                  <Card className="p-6">
                    <h3 className="font-semibold text-foreground mb-3">The Solution</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{study.solution}</p>
                  </Card>
                </div>
              </div>

              <div>
                <Card className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Tools & Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {study.tools.map((tool) => (
                      <Badge key={tool} variant="outline" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">Key Results & Impact</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {study.results.map((result, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <p className="text-muted-foreground text-sm leading-relaxed">{result}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {study.timeline.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Project Timeline</h2>
                <div className="space-y-4">
                  {study.timeline.map((phase, index) => (
                    <Card key={index} className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">{index + 1}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-foreground">{phase.phase}</h3>
                            <Badge variant="outline" className="text-xs">
                              {phase.duration}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm">{phase.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Card className="p-8 text-center bg-gradient-to-r from-primary/10 via-accent/10 to-green-500/10 border-primary/20">
              <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Achieve Similar Results?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Let's discuss how I can help implement similar strategies for your business and drive measurable growth.
              </p>
              <Link href="/#contact">
                <Button size="lg" className={`bg-gradient-to-r ${study.color} hover:opacity-90 text-white`}>
                  Get In Touch
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}