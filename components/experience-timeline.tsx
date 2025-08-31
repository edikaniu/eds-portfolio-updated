"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, Zap, Target, GraduationCap } from "lucide-react"
import { ExperienceTimelineSkeleton } from "@/components/ui/loading-skeleton"

interface ExperienceEntry {
  id: string
  title: string
  company: string
  period: string
  type: string
  category: string
  achievements: string[]
  metrics: string | null
  icon: string | null
  color: string | null
  order: number
}

// Icon mapping for experience icons
const getExperienceIcon = (iconName: string | null) => {
  const iconMap: { [key: string]: React.JSX.Element } = {
    'zap': <Zap className="h-4 w-4" />,
    'trending-up': <TrendingUp className="h-4 w-4" />,
    'target': <Target className="h-4 w-4" />,
    'graduation-cap': <GraduationCap className="h-4 w-4" />,
    'calendar': <Calendar className="h-4 w-4" />
  }
  
  return iconMap[iconName || 'calendar'] || <Calendar className="h-4 w-4" />
}

const fallbackExperiences = [
  {
    id: "suretree-marketing-manager",
    title: "Marketing Manager",
    company: "Suretree Systems",
    period: "Aug 2023 - Present",
    type: "Full-time",
    category: "work",
    achievements: [
      "Implemented AI-powered initiatives boosting team productivity by 20%",
      "Increased organic traffic by 200% in 4 months through AI-enhanced content strategies",
      "Reduced unqualified leads by 40% using HubSpot-based lead scoring system",
      "Increased conversion rates by 30% through performance tracking and optimization",
    ],
    metrics: "20% Productivity Boost",
    icon: "zap",
    color: "from-primary to-blue-600",
    order: 1
  },
  {
    id: "household-david-communications",
    title: "Head, Integrated Communications",
    company: "Household of David",
    period: "Sep 2023 - Present",
    type: "Leadership",
    category: "work",
    achievements: [
      "Delivered 80% brand awareness growth via PR and content strategy during organizational pivot",
      "Led team of 60+ volunteers creating multimedia content aligned with brand mission",
      "Grew social audience by 70,000+ followers in 6 months through engagement optimization",
    ],
    metrics: "80% Brand Growth",
    icon: "trending-up",
    color: "from-accent to-purple-600",
    order: 2
  },
  {
    id: "freelance-marketing-strategist",
    title: "Product Marketing Lead",
    company: "Suretree Systems",
    period: "Nov 2022 - Jul 2023",
    type: "Full-time",
    category: "work",
    achievements: [
      "Planned and executed multi-channel campaigns across Meta, LinkedIn, Twitter, Google",
      "Achieved aggressive demand generation targets through data-driven strategies",
      "Developed product messaging and positioning for key features",
      "Coordinated with product and engineering teams for seamless marketing execution",
    ],
    metrics: "Multi-Channel Growth",
    icon: "target",
    color: "from-green-500 to-emerald-600",
    order: 3
  },
  {
    id: "miva-copywriter",
    title: "Head, Social Media & Communications",
    company: "Household of David",
    period: "Sep 2022 - Aug 2023",
    type: "Leadership",
    category: "work",
    achievements: [
      "Achieved 60% engagement growth and expanded followership by 75%",
      "Added 50,000+ new followers across digital channels in one year",
      "Led team producing high-quality weekly newsletters and multimedia content",
      "Monitored trends and audience behavior to optimize campaign execution",
    ],
    metrics: "50K+ Followers",
    icon: "trending-up",
    color: "from-blue-500 to-indigo-600",
    order: 4
  },
  {
    id: "unilag-bsc",
    title: "Senior Campaign Manager",
    company: "Suretree Systems",
    period: "Jul 2022 - Nov 2022",
    type: "Full-time",
    category: "work",
    achievements: [
      "Achieved 733% growth in email subscribers (3,000 to 25,000 in 3 months)",
      "Scaled product users from 100 to 10,000+ in 2 months via integrated strategy",
      "Increased platform registrations from 150 to 3,000+ in one month",
      "Managed campaign budgets while reducing customer acquisition costs (CAC)",
    ],
    metrics: "733% Email Growth",
    icon: "zap",
    color: "from-orange-500 to-red-500",
    order: 5
  },
  {
    id: "unilag-msc",
    title: "Growth Marketing Lead",
    company: "Sogital Digital Agency",
    period: "Jun 2020 - Jan 2022",
    type: "Full-time",
    category: "work",
    achievements: [
      "Designed chatbot-driven funnel generating 4,500+ qualified leads in 3 months",
      "Delivered 5X ROAS for three clients through full-funnel growth tactics",
      "Used marketing analytics to build culture of data-driven experimentation",
      "Provided strategic marketing consulting to B2B and B2C clients",
    ],
    metrics: "5X ROAS",
    icon: "target",
    color: "from-purple-500 to-pink-600",
    order: 6
  },
  {
    id: "digital-strategist",
    title: "Digital Strategist & Content Manager",
    company: "Household of David",
    period: "Jun 2020 - Jan 2022",
    type: "Full-time",
    category: "work",
    achievements: [
      "Led digital campaigns for 3 major conferences generating 5,000+ leads each",
      "Achieved 68%+ physical attendance, 20,000+ online attendees per event",
      "Generated post-event reach exceeding 500,000 across digital channels",
      "Developed brand communications and content strategies for audience engagement",
    ],
    metrics: "500K+ Reach",
    icon: "trending-up",
    color: "from-cyan-500 to-blue-600",
    order: 7
  },
  {
    id: "senior-digital-executive",
    title: "Senior Digital Marketing Executive",
    company: "Polo Limited",
    period: "Oct 2019 - Jan 2020",
    type: "Full-time",
    category: "work",
    achievements: [
      "Managed luxury brand campaigns for Rolex, Gucci, Cartier, and Swarovski",
      "Generated and qualified 600+ luxury leads in 7 months (5X growth)",
      "Achieved 100X ROAS through targeted digital marketing activities",
      "Improved email open rates by 40% and click-through rates by 30%",
    ],
    metrics: "100X ROAS",
    icon: "zap",
    color: "from-yellow-500 to-orange-600",
    order: 8
  },
  {
    id: "digital-marketing-strategist",
    title: "Digital Marketing Strategist",
    company: "TOY Media Agency",
    period: "Jun 2018 - Aug 2019",
    type: "Full-time",
    category: "work",
    achievements: [
      "Served as strategic advisor aligning digital marketing with business goals",
      "Developed tailored campaign strategies for multiple clients",
      "Ensured alignment with audience segments and performance objectives",
      "Maximized ROI and brand impact through strategic planning",
    ],
    metrics: "Strategic Growth",
    icon: "target",
    color: "from-teal-500 to-green-600",
    order: 9
  },
  {
    id: "masters-sales-marketing",
    title: "Masters in Sales & Marketing",
    company: "Rome Business School",
    period: "2024 - 2026",
    type: "Master's Degree",
    category: "education",
    achievements: [
      "Advanced coursework in strategic marketing and sales management",
      "Focus on digital transformation and AI in marketing",
      "International business perspective and global market analysis",
    ],
    metrics: "In Progress",
    icon: "graduation-cap",
    color: "from-primary to-blue-600",
    order: 10
  },
  {
    id: "product-marketing-diploma",
    title: "Product Marketing Diploma",
    company: "AltSchool Africa",
    period: "2024",
    type: "Certification",
    category: "education",
    achievements: [
      "Specialized in product positioning and go-to-market strategies",
      "Completed advanced coursework in user research and market analysis",
      "Developed expertise in product-led growth methodologies",
    ],
    metrics: "Product Marketing",
    icon: "graduation-cap",
    color: "from-green-500 to-emerald-600",
    order: 11
  },
  {
    id: "blockchain-certificate",
    title: "Blockchain Revolution Certificate",
    company: "INSEAD",
    period: "2022",
    type: "Certification",
    category: "education",
    achievements: [
      "Gained expertise in blockchain technology and business applications",
      "Studied cryptocurrency markets and decentralized finance (DeFi)",
      "Completed capstone project on blockchain in marketing",
    ],
    metrics: "Blockchain Expert",
    icon: "graduation-cap",
    color: "from-blue-500 to-indigo-600",
    order: 12
  },
  {
    id: "engineering-degree",
    title: "B.Eng Mechanical Engineering",
    company: "University of Nigeria",
    period: "2012 - 2016",
    type: "Bachelor's Degree",
    category: "education",
    achievements: [
      "Strong foundation in analytical thinking and problem-solving",
      "Developed project management and technical skills",
      "Graduated with focus on systems optimization",
    ],
    metrics: "Engineering Foundation",
    icon: "graduation-cap",
    color: "from-gray-500 to-slate-600",
    order: 13
  },
]

export function ExperienceTimeline() {
  const [visibleItems, setVisibleItems] = useState<string[]>([])
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch experience data from API
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const response = await fetch('/api/experience')
        const data = await response.json()
        
        if (data.success && data.data && data.data.length > 0) {
          setExperiences(data.data)
        } else {
          // Load fallback experience data
          setExperiences(fallbackExperiences)
        }
      } catch (error) {
        console.error('Error fetching experience data:', error)
        // Load fallback experience data
        setExperiences(fallbackExperiences)
      } finally {
        setIsLoading(false)
      }
    }

    fetchExperiences()
  }, [])

  useEffect(() => {
    if (isLoading || experiences.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-id") || ""
            setVisibleItems((prev) => {
              if (!prev.includes(id)) {
                return [...prev, id]
              }
              return prev
            })
          }
        })
      },
      { threshold: 0.3 },
    )

    const elements = document.querySelectorAll("[data-timeline-item]")
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [isLoading, experiences.length])

  if (isLoading) {
    return (
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 lg:px-12 xl:px-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Professional Journey</h2>
              <p className="text-xl text-muted-foreground">Loading professional experience...</p>
            </div>
            <ExperienceTimelineSkeleton />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6 lg:px-12 xl:px-16">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Professional Journey</h2>
            <p className="text-xl text-muted-foreground">7+ years of driving growth and innovation</p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-green-500 transform md:-translate-x-0.5" />

            {/* Timeline Items */}
            <div className="space-y-8">
              {experiences.map((exp, index) => (
                <div
                  key={exp.id}
                  data-id={exp.id}
                  data-timeline-item
                  className={`relative flex items-center ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} ${
                    visibleItems.includes(exp.id) ? "animate-fade-in-up" : "opacity-0"
                  }`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="absolute left-6 md:left-1/2 w-3 h-3 transform md:-translate-x-1.5 z-10">
                    <div className={`w-full h-full rounded-full bg-gradient-to-r ${exp.color} shadow-lg`} />
                  </div>

                  {/* Content Card */}
                  <div className={`w-full md:w-5/12 ml-12 md:ml-0 ${index % 2 === 0 ? "md:mr-8" : "md:ml-8"}`}>
                    <Card className="p-4 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card transition-colors">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg text-white`} style={{ background: exp.color || '#3B82F6' }}>{getExperienceIcon(exp.icon)}</div>
                          <div>
                            <h3 className="text-lg font-bold text-foreground">{exp.title}</h3>
                            <p className="text-primary font-semibold text-sm">{exp.company}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-accent/20 text-accent text-xs">
                          <span dangerouslySetInnerHTML={{ __html: exp.metrics || '' }} />
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {exp.period}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {exp.type}
                        </Badge>
                      </div>

                      {/* Achievements */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-2 text-sm">
                          {exp.category === "education" ? "Key Learning:" : "Key Achievements:"}
                        </h4>
                        <ul className="space-y-1">
                          {exp.achievements.map((achievement, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
