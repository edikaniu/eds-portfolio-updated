"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Handshake,
  DollarSign,
  Target,
  Bot,
  MessageSquare,
  Settings,
  Lightbulb,
  Megaphone,
  FileText,
  Shield,
  TrendingUp,
  MapPin,
  UserPlus,
  Package,
  BarChart3,
  Activity,
  TestTube,
  PieChart,
  Zap,
  Heart,
  Calendar,
  Database,
} from "lucide-react"

// Icon mapping for skills based on name
const getSkillIcon = (skillName: string) => {
  const iconMap: { [key: string]: React.JSX.Element } = {
    'Cross-functional Team Leadership': <Users className="h-6 w-6" />,
    'Stakeholder Management': <Handshake className="h-6 w-6" />,
    'Budget Management': <DollarSign className="h-6 w-6" />,
    'Retention Strategy': <Target className="h-6 w-6" />,
    'Generative AI': <Bot className="h-6 w-6" />,
    'ChatGPT, Claude, etc': <MessageSquare className="h-6 w-6" />,
    'Marketing Automation': <Settings className="h-6 w-6" />,
    'Prompt Engineering': <Lightbulb className="h-6 w-6" />,
    'Brand Strategy': <Megaphone className="h-6 w-6" />,
    'Public Relations': <FileText className="h-6 w-6" />,
    'Content Strategy': <FileText className="h-6 w-6" />,
    'Crisis Communication': <Shield className="h-6 w-6" />,
    'Growth Marketing': <TrendingUp className="h-6 w-6" />,
    'GTM Strategy': <MapPin className="h-6 w-6" />,
    'Customer Acquisition': <UserPlus className="h-6 w-6" />,
    'Product Positioning': <Package className="h-6 w-6" />,
    'Marketing Analytics': <BarChart3 className="h-6 w-6" />,
    'Performance Tracking': <Activity className="h-6 w-6" />,
    'A/B Testing': <TestTube className="h-6 w-6" />,
    'Data Visualization': <PieChart className="h-6 w-6" />,
    'Integrated Marketing Campaigns': <Zap className="h-6 w-6" />,
    'Partnership Development': <Heart className="h-6 w-6" />,
    'Event Marketing': <Calendar className="h-6 w-6" />,
    'CRM': <Database className="h-6 w-6" />
  }
  
  return iconMap[skillName] || <Target className="h-6 w-6" />
}

interface Skill {
  name: string
  proficiency: number
}

interface SkillCategory {
  id: string
  title: string
  description: string
  color: string
  skills: Skill[]
  order: number
  isActive: boolean
}

interface Tool {
  id: string
  name: string
  description: string | null
  logoUrl: string | null
  category: string | null
  color: string | null
  order: number
  isActive: boolean
}

interface Stats {
  coreSkills: string
  professionalTools: string
  yearsExperience: string
}

export function SkillsSection() {
  const [visibleCategories, setVisibleCategories] = useState<number[]>([])
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [stats, setStats] = useState<Stats>({ coreSkills: '24+', professionalTools: '16+', yearsExperience: '7+' })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoading || skillCategories.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number.parseInt(entry.target.getAttribute("data-category") || "0")
            setVisibleCategories((prev) => [...new Set([...prev, index])])
          }
        })
      },
      { threshold: 0.2 },
    )

    const elements = document.querySelectorAll("[data-skill-category]")
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [isLoading])

  // Fetch skills, tools, and stats from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsRes, toolsRes, statsRes] = await Promise.all([
          fetch('/api/skills'),
          fetch('/api/tools'),
          fetch('/api/stats')
        ])

        if (skillsRes.ok) {
          const skillsData = await skillsRes.json()
          if (skillsData.success) {
            setSkillCategories(skillsData.data || [])
          }
        }

        if (toolsRes.ok) {
          const toolsData = await toolsRes.json()
          if (toolsData.success) {
            setTools(toolsData.data || [])
          }
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          if (statsData.success) {
            setStats({
              coreSkills: statsData.data.coreSkills || '24+',
              professionalTools: statsData.data.professionalTools || '16+',
              yearsExperience: statsData.data.yearsExperience || '7+'
            })
          }
        }
      } catch (error) {
        console.error('Error fetching skills data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-6 lg:px-12 xl:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Skills & Expertise</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Loading skills and expertise...
              </p>
            </div>
            <div className="grid lg:grid-cols-2 gap-8 mb-16">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-8 bg-background/50 border-border/50 animate-pulse">
                  <div className="h-6 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-6"></div>
                  <div className="space-y-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-4 bg-gray-300 rounded"></div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-card/30">
      <div className="container mx-auto px-6 lg:px-12 xl:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Skills & Expertise</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive toolkit for driving growth and delivering results
            </p>
          </div>

          {/* Skills Categories Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {skillCategories.map((category, categoryIndex) => (
              <Card
                key={`category-${category.id || categoryIndex}`}
                data-category={categoryIndex}
                data-skill-category
                className={`p-8 bg-background/50 border-border/50 hover:bg-background/70 transition-all duration-300 ${
                  visibleCategories.includes(categoryIndex) ? "animate-fade-in-up" : ""
                }`}
                style={{ animationDelay: `${categoryIndex * 0.2}s` }}
              >
                {/* Category Header */}
                <div className="mb-6">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 mb-4`} style={{ background: category.color }}>
                    <div className="text-white">{getSkillIcon(category.skills[0]?.name || '')}</div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{category.title}</h3>
                  <p className="text-muted-foreground">{category.description}</p>
                </div>

                {/* Skills List */}
                <div className="space-y-4">
                  {category.skills.map((skill, skillIndex) => (
                    <div
                      key={`${category.title}-${skill.name}-${skillIndex}`}
                      className="group cursor-pointer"
                      onMouseEnter={() => setHoveredSkill(skill.name)}
                      onMouseLeave={() => setHoveredSkill(null)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg text-white transition-transform group-hover:scale-110`}
                            style={{ background: category.color }}
                          >
                            {getSkillIcon(skill.name)}
                          </div>
                          <span className="font-semibold text-foreground">{skill.name}</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`transition-colors ${
                            hoveredSkill === skill.name ? "bg-primary text-primary-foreground" : ""
                          }`}
                        >
                          {skill.proficiency}%
                        </Badge>
                      </div>
                      <Progress
                        value={hoveredSkill === skill.name ? skill.proficiency : 0}
                        className="h-2 transition-all duration-1000"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Tools & Technologies */}
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Tools & Technologies</h3>
            <p className="text-lg text-muted-foreground">Professional tools I use to deliver exceptional results</p>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 mb-12">
            {tools.filter(tool => tool.isActive).sort((a, b) => a.order - b.order).map((tool, index) => (
              <Card
                key={tool.id}
                className={`p-4 bg-background/30 border-border/30 hover:bg-background/60 hover:border-primary/30 transition-all duration-300 group cursor-pointer ${
                  visibleCategories.length > 0 ? "animate-fade-in-up" : ""
                }`}
                style={{ animationDelay: `${1 + index * 0.1}s` }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-2 transition-transform group-hover:scale-110">
                    <img
                      src={tool.logoUrl || "/placeholder.svg"}
                      alt={`${tool.name} logo`}
                      className="w-10 h-10 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                    {tool.name}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {/* Skills Summary */}
          <div className="mt-16 text-center">
            <Card className="p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">{stats.coreSkills}</div>
                  <div className="text-muted-foreground">Core Skills</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent mb-2">{stats.professionalTools}</div>
                  <div className="text-muted-foreground">Professional Tools</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-500 mb-2">{stats.yearsExperience}</div>
                  <div className="text-muted-foreground">Years Experience</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
