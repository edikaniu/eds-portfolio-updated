"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown, ChevronUp, TrendingUp, Bot, Target, Users, Lightbulb, BarChart } from "lucide-react"

interface AboutData {
  title: string
  description: string
  shortBio: string
  fullBio: string
  stats?: {
    usersScaled: string
    growth: string
    budgetScaled: string
    roas: string
  }
}

const coreCompetencies = [
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Growth Marketing",
    description: "Scaling products from hundreds to thousands of users through data-driven strategies",
  },
  {
    icon: <Bot className="h-6 w-6" />,
    title: "AI Implementation",
    description: "Leveraging AI tools to boost productivity and optimize marketing workflows",
  },
  {
    icon: <Target className="h-6 w-6" />,
    title: "Product Strategy",
    description: "Go-to-market planning, positioning, and user research for product success",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Team Leadership",
    description: "Cross-functional collaboration and team management for growth initiatives",
  },
  {
    icon: <Lightbulb className="h-6 w-6" />,
    title: "Campaign Innovation",
    description: "Creative campaign development and optimization for maximum engagement",
  },
  {
    icon: <BarChart className="h-6 w-6" />,
    title: "Performance Analytics",
    description: "Data analysis and insights to drive strategic marketing decisions",
  },
]

const defaultAboutData: AboutData = {
  title: "About Me",
  description: "Get to know the person behind the growth",
  shortBio: "Growth-focused marketing professional with 7+ years of experience scaling products from hundreds to thousands of users. Specialized in AI-driven marketing strategies, cross-functional leadership, and data-driven growth optimization.",
  fullBio: "Growth-focused marketing professional with 7+ years of experience scaling products from hundreds to thousands of users. Specialized in AI-driven marketing strategies, cross-functional leadership, and data-driven growth optimization.\n\nThroughout my career, I've successfully led marketing initiatives that have driven substantial user growth and revenue increases. My expertise spans across product marketing, growth hacking, AI implementation, and team leadership.\n\nI'm passionate about leveraging cutting-edge AI technologies to optimize marketing workflows, enhance productivity, and deliver measurable results. My approach combines analytical thinking with creative problem-solving to identify growth opportunities and execute strategies that scale.\n\nCurrently serving as Marketing Manager at Suretree Systems, where I've implemented AI initiatives that boosted team productivity by 20% and led campaigns that scaled our user base from 100 to over 10,000 users in just 2 months.",
  stats: {
    usersScaled: "200k+",
    growth: "733%",
    budgetScaled: "$500k+",
    roas: "5x"
  }
}

export function AboutSection() {
  const [aboutData, setAboutData] = useState<AboutData>(defaultAboutData)
  const [isExpanded, setIsExpanded] = useState(false)
  const [yearsCount, setYearsCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    loadAboutData()
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          // Animate years counter
          let start = 0
          const end = 7
          const duration = 2000
          const increment = end / (duration / 16)

          const timer = setInterval(() => {
            start += increment
            if (start >= end) {
              setYearsCount(end)
              clearInterval(timer)
            } else {
              setYearsCount(Math.floor(start))
            }
          }, 16)

          return () => clearInterval(timer)
        }
      },
      { threshold: 0.3 },
    )

    const element = document.getElementById("about-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const loadAboutData = async () => {
    try {
      const response = await fetch('/api/frontend-content?section=about')
      const data = await response.json()
      
      if (data.success && data.data.about?.content) {
        setAboutData(prevData => ({ ...prevData, ...data.data.about.content }))
      }
    } catch (error) {
      console.error('Error loading about data:', error)
      // Continue with default data
    }
  }


  return (
    <section id="about-section" className="py-20 bg-card/30">
      <div className="container mx-auto px-6 lg:px-12 xl:px-16">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className={`text-center mb-12 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{aboutData.title}</h2>
            <p className="text-xl text-muted-foreground">{aboutData.description}</p>
          </div>

          {/* Main Content - Centered Text Layout */}
          <div className="mb-16">
            <div
              className={`text-center space-y-6 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.2s" }}
            >
              <div className="space-y-4">
                <div className="text-lg leading-relaxed text-foreground max-w-3xl mx-auto">
                  {isExpanded ? (
                    <div className="space-y-4 text-left">
                      {aboutData.fullBio.split("\n\n").map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  ) : (
                    <p>{aboutData.shortBio}</p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-primary hover:text-primary/80 p-0 h-auto font-semibold"
                >
                  {isExpanded ? (
                    <>
                      Read Less <ChevronUp className="ml-1 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Read More <ChevronDown className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="flex justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{aboutData.stats?.usersScaled || "200k+"}</div>
                  <div className="text-sm text-muted-foreground">Users Scaled</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-1">{aboutData.stats?.growth || "733%"}</div>
                  <div className="text-sm text-muted-foreground">Subscribers Growth</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{aboutData.stats?.budgetScaled || "$500k+"}</div>
                  <div className="text-sm text-muted-foreground">Budget Scaled</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-1">{aboutData.stats?.roas || "5x"}</div>
                  <div className="text-sm text-muted-foreground">ROAS</div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Competencies - 6 items, 2 per row on desktop */}
          <div className={`${isVisible ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "0.4s" }}>
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">Core Competencies</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {coreCompetencies.map((competency, index) => (
                <Card
                  key={index}
                  className="p-6 bg-background/30 border-border/30 hover:bg-background/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-primary mt-1 flex-shrink-0">{competency.icon}</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">{competency.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{competency.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
