"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SkillsGridSkeleton, ToolsGridSkeleton } from "@/components/ui/loading-skeleton"
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

        let skillsLoaded = false
        let toolsLoaded = false

        if (skillsRes.ok) {
          const skillsData = await skillsRes.json()
          if (skillsData.success && skillsData.data && skillsData.data.length > 0) {
            setSkillCategories(skillsData.data)
            skillsLoaded = true
          }
        }

        if (toolsRes.ok) {
          const toolsData = await toolsRes.json()
          if (toolsData.success && toolsData.data && toolsData.data.length > 0) {
            setTools(toolsData.data)
            toolsLoaded = true
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

        // Load fallback data if APIs failed or returned empty data
        if (!skillsLoaded) {
          setSkillCategories([
            {
              id: '1',
              title: 'Strategic Leadership',
              description: 'Leading cross-functional teams and driving organizational growth',
              color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              skills: [
                { name: 'Cross-functional Team Leadership', proficiency: 95 },
                { name: 'Stakeholder Management', proficiency: 92 },
                { name: 'Budget Management', proficiency: 88 },
                { name: 'Retention Strategy', proficiency: 90 }
              ],
              order: 1,
              isActive: true
            },
            {
              id: '2',
              title: 'AI & Marketing Automation',
              description: 'Leveraging AI and automation for enhanced marketing performance',
              color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              skills: [
                { name: 'Generative AI', proficiency: 94 },
                { name: 'ChatGPT, Claude, etc', proficiency: 96 },
                { name: 'Marketing Automation', proficiency: 91 },
                { name: 'Prompt Engineering', proficiency: 93 }
              ],
              order: 2,
              isActive: true
            },
            {
              id: '3',
              title: 'Brand & Communications',
              description: 'Strategic brand positioning and integrated communications',
              color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              skills: [
                { name: 'Brand Strategy', proficiency: 89 },
                { name: 'Public Relations', proficiency: 87 },
                { name: 'Content Strategy', proficiency: 92 },
                { name: 'Crisis Communication', proficiency: 85 }
              ],
              order: 3,
              isActive: true
            },
            {
              id: '4',
              title: 'Growth Marketing',
              description: 'Data-driven growth strategies and customer acquisition',
              color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              skills: [
                { name: 'Growth Marketing', proficiency: 94 },
                { name: 'GTM Strategy', proficiency: 91 },
                { name: 'Customer Acquisition', proficiency: 93 },
                { name: 'Product Positioning', proficiency: 88 }
              ],
              order: 4,
              isActive: true
            },
            {
              id: '5',
              title: 'Analytics & Performance',
              description: 'Data analysis, performance tracking, and optimization',
              color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              skills: [
                { name: 'Marketing Analytics', proficiency: 90 },
                { name: 'Performance Tracking', proficiency: 92 },
                { name: 'A/B Testing', proficiency: 89 },
                { name: 'Data Visualization', proficiency: 86 }
              ],
              order: 5,
              isActive: true
            },
            {
              id: '6',
              title: 'Campaign Management',
              description: 'End-to-end campaign planning, execution and optimization',
              color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              skills: [
                { name: 'Integrated Marketing Campaigns', proficiency: 94 },
                { name: 'Partnership Development', proficiency: 87 },
                { name: 'Event Marketing', proficiency: 85 },
                { name: 'CRM', proficiency: 88 }
              ],
              order: 6,
              isActive: true
            }
          ])
        }

        if (!toolsLoaded) {
          setTools([
            { id: '1', name: 'HubSpot', description: 'CRM and Marketing Automation', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/hubspot.svg', category: 'Marketing', color: '#ff7a59', order: 1, isActive: true },
            { id: '2', name: 'Google Analytics', description: 'Web Analytics', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googleanalytics.svg', category: 'Analytics', color: '#e37400', order: 2, isActive: true },
            { id: '3', name: 'Meta Ads', description: 'Social Media Advertising', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/meta.svg', category: 'Advertising', color: '#0866ff', order: 3, isActive: true },
            { id: '4', name: 'LinkedIn Ads', description: 'Professional Network Advertising', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg', category: 'Advertising', color: '#0a66c2', order: 4, isActive: true },
            { id: '5', name: 'Google Ads', description: 'Search and Display Advertising', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googleads.svg', category: 'Advertising', color: '#4285f4', order: 5, isActive: true },
            { id: '6', name: 'Mailchimp', description: 'Email Marketing Platform', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mailchimp.svg', category: 'Email Marketing', color: '#ffe01b', order: 6, isActive: true },
            { id: '7', name: 'Salesforce', description: 'Customer Relationship Management', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/salesforce.svg', category: 'CRM', color: '#00a1e0', order: 7, isActive: true },
            { id: '8', name: 'Canva', description: 'Graphic Design Platform', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/canva.svg', category: 'Design', color: '#00c4cc', order: 8, isActive: true },
            { id: '9', name: 'Figma', description: 'Design and Prototyping', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/figma.svg', category: 'Design', color: '#f24e1e', order: 9, isActive: true },
            { id: '10', name: 'Slack', description: 'Team Communication', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/slack.svg', category: 'Communication', color: '#4a154b', order: 10, isActive: true },
            { id: '11', name: 'Zapier', description: 'Workflow Automation', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/zapier.svg', category: 'Automation', color: '#ff4a00', order: 11, isActive: true },
            { id: '12', name: 'WordPress', description: 'Content Management System', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/wordpress.svg', category: 'CMS', color: '#21759b', order: 12, isActive: true },
            { id: '13', name: 'Hotjar', description: 'User Behavior Analytics', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/hotjar.svg', category: 'Analytics', color: '#fd3a5c', order: 13, isActive: true },
            { id: '14', name: 'Typeform', description: 'Online Form Builder', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/typeform.svg', category: 'Forms', color: '#262627', order: 14, isActive: true },
            { id: '15', name: 'Buffer', description: 'Social Media Management', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/buffer.svg', category: 'Social Media', color: '#168eea', order: 15, isActive: true },
            { id: '16', name: 'Airtable', description: 'Cloud Collaboration Platform', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/airtable.svg', category: 'Productivity', color: '#18bfff', order: 16, isActive: true }
          ])
        }
      } catch (error) {
        console.error('Error fetching skills data:', error)
        // Load comprehensive fallback data
        setSkillCategories([
          {
            id: '1',
            title: 'Strategic Leadership',
            description: 'Leading cross-functional teams and driving organizational growth',
            color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            skills: [
              { name: 'Cross-functional Team Leadership', proficiency: 95 },
              { name: 'Stakeholder Management', proficiency: 92 },
              { name: 'Budget Management', proficiency: 88 },
              { name: 'Retention Strategy', proficiency: 90 }
            ],
            order: 1,
            isActive: true
          },
          {
            id: '2',
            title: 'AI & Marketing Automation',
            description: 'Leveraging AI and automation for enhanced marketing performance',
            color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            skills: [
              { name: 'Generative AI', proficiency: 94 },
              { name: 'ChatGPT, Claude, etc', proficiency: 96 },
              { name: 'Marketing Automation', proficiency: 91 },
              { name: 'Prompt Engineering', proficiency: 93 }
            ],
            order: 2,
            isActive: true
          },
          {
            id: '3',
            title: 'Brand & Communications',
            description: 'Strategic brand positioning and integrated communications',
            color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            skills: [
              { name: 'Brand Strategy', proficiency: 89 },
              { name: 'Public Relations', proficiency: 87 },
              { name: 'Content Strategy', proficiency: 92 },
              { name: 'Crisis Communication', proficiency: 85 }
            ],
            order: 3,
            isActive: true
          },
          {
            id: '4',
            title: 'Growth Marketing',
            description: 'Data-driven growth strategies and customer acquisition',
            color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            skills: [
              { name: 'Growth Marketing', proficiency: 94 },
              { name: 'GTM Strategy', proficiency: 91 },
              { name: 'Customer Acquisition', proficiency: 93 },
              { name: 'Product Positioning', proficiency: 88 }
            ],
            order: 4,
            isActive: true
          },
          {
            id: '5',
            title: 'Analytics & Performance',
            description: 'Data analysis, performance tracking, and optimization',
            color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            skills: [
              { name: 'Marketing Analytics', proficiency: 90 },
              { name: 'Performance Tracking', proficiency: 92 },
              { name: 'A/B Testing', proficiency: 89 },
              { name: 'Data Visualization', proficiency: 86 }
            ],
            order: 5,
            isActive: true
          },
          {
            id: '6',
            title: 'Campaign Management',
            description: 'End-to-end campaign planning, execution and optimization',
            color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            skills: [
              { name: 'Integrated Marketing Campaigns', proficiency: 94 },
              { name: 'Partnership Development', proficiency: 87 },
              { name: 'Event Marketing', proficiency: 85 },
              { name: 'CRM', proficiency: 88 }
            ],
            order: 6,
            isActive: true
          }
        ])
        setTools([
          { id: '1', name: 'HubSpot', description: 'CRM and Marketing Automation', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/hubspot.svg', category: 'Marketing', color: '#ff7a59', order: 1, isActive: true },
          { id: '2', name: 'Google Analytics', description: 'Web Analytics', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googleanalytics.svg', category: 'Analytics', color: '#e37400', order: 2, isActive: true },
          { id: '3', name: 'Meta Ads', description: 'Social Media Advertising', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/meta.svg', category: 'Advertising', color: '#0866ff', order: 3, isActive: true },
          { id: '4', name: 'LinkedIn Ads', description: 'Professional Network Advertising', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg', category: 'Advertising', color: '#0a66c2', order: 4, isActive: true },
          { id: '5', name: 'Google Ads', description: 'Search and Display Advertising', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googleads.svg', category: 'Advertising', color: '#4285f4', order: 5, isActive: true },
          { id: '6', name: 'Mailchimp', description: 'Email Marketing Platform', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mailchimp.svg', category: 'Email Marketing', color: '#ffe01b', order: 6, isActive: true },
          { id: '7', name: 'Salesforce', description: 'Customer Relationship Management', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/salesforce.svg', category: 'CRM', color: '#00a1e0', order: 7, isActive: true },
          { id: '8', name: 'Canva', description: 'Graphic Design Platform', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/canva.svg', category: 'Design', color: '#00c4cc', order: 8, isActive: true },
          { id: '9', name: 'Figma', description: 'Design and Prototyping', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/figma.svg', category: 'Design', color: '#f24e1e', order: 9, isActive: true },
          { id: '10', name: 'Slack', description: 'Team Communication', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/slack.svg', category: 'Communication', color: '#4a154b', order: 10, isActive: true },
          { id: '11', name: 'Zapier', description: 'Workflow Automation', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/zapier.svg', category: 'Automation', color: '#ff4a00', order: 11, isActive: true },
          { id: '12', name: 'WordPress', description: 'Content Management System', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/wordpress.svg', category: 'CMS', color: '#21759b', order: 12, isActive: true },
          { id: '13', name: 'Hotjar', description: 'User Behavior Analytics', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/hotjar.svg', category: 'Analytics', color: '#fd3a5c', order: 13, isActive: true },
          { id: '14', name: 'Typeform', description: 'Online Form Builder', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/typeform.svg', category: 'Forms', color: '#262627', order: 14, isActive: true },
          { id: '15', name: 'Buffer', description: 'Social Media Management', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/buffer.svg', category: 'Social Media', color: '#168eea', order: 15, isActive: true },
          { id: '16', name: 'Airtable', description: 'Cloud Collaboration Platform', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/airtable.svg', category: 'Productivity', color: '#18bfff', order: 16, isActive: true }
        ])
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
            <SkillsGridSkeleton />
            
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-foreground mb-8 text-center">Professional Tools & Technologies</h3>
              <ToolsGridSkeleton />
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
                    <div 
                      className="w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300 group-hover:shadow-md"
                      style={{ 
                        backgroundColor: tool.color || '#64748b'
                      }}
                    >
                      <img
                        src={tool.logoUrl || "/placeholder.svg"}
                        alt={`${tool.name} logo`}
                        className="w-6 h-6 object-contain brightness-0 invert transition-all duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                    </div>
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
