import { prisma } from '../lib/prisma'

const projects = [
  {
    slug: "ai-content-automation-workflow",
    title: "AI Content Automation Workflow",
    description: "Developed AI-powered content automation workflow that reduced manual content creation effort by 80% while maintaining quality and brand consistency. Integrated workflow using ChatGPT, Claude APIs, HubSpot, and Zapier to achieve 300% increase in content output and 20% boost in team productivity.",
    category: "AI Automation",
    technologies: JSON.stringify([
      "ChatGPT",
      "Claude AI", 
      "HubSpot",
      "Zapier",
      "API Integration",
      "Content Management"
    ]),
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop&crop=center",
    githubUrl: null,
    liveUrl: null
  },
  {
    slug: "hubspot-lead-scoring-system", 
    title: "HubSpot Lead Scoring System",
    description: "Custom lead scoring algorithm that reduced unqualified leads by 40% and improved sales efficiency. Implemented advanced scoring criteria based on behavioral data, demographics, and engagement patterns to prioritize high-value prospects.",
    category: "Sales Automation", 
    technologies: JSON.stringify([
      "HubSpot",
      "JavaScript",
      "API Integration",
      "Lead Management",
      "CRM Automation"
    ]),
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&crop=center",
    githubUrl: null,
    liveUrl: null
  },
  {
    slug: "email-growth-funnel",
    title: "Email Growth Funnel",
    description: "Multi-stage email automation that achieved 733% subscriber growth in 3 months. Implemented segmented campaigns, lead magnets, and automated nurture sequences resulting in 45% open rates and 35% conversion rates.",
    category: "Email Marketing",
    technologies: JSON.stringify([
      "Email Marketing",
      "ConvertKit",
      "Lead Magnets", 
      "Automation",
      "Segmentation",
      "Analytics"
    ]),
    image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=600&h=400&fit=crop&crop=center",
    githubUrl: null,
    liveUrl: null
  },
  {
    slug: "ai-powered-seo-keyword-tool",
    title: "AI-Powered SEO Keyword Tool", 
    description: "Custom tool for automated keyword research and content optimization using AI. Integrated OpenAI APIs to analyze search intent, competition, and content gaps, resulting in 150% improvement in organic traffic.",
    category: "SEO Tools",
    technologies: JSON.stringify([
      "Python",
      "OpenAI API",
      "SEO Tools",
      "Data Analysis",
      "Content Optimization"
    ]),
    image: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=600&h=400&fit=crop&crop=center",
    githubUrl: null,
    liveUrl: null
  },
  {
    slug: "social-media-automation-suite",
    title: "Social Media Automation Suite",
    description: "Comprehensive social media management workflow that grew followers by 70,000 in 6 months. Automated content scheduling, engagement tracking, and performance analysis across multiple platforms.",
    category: "Social Media",
    technologies: JSON.stringify([
      "Buffer",
      "Canva API", 
      "Analytics",
      "Content Automation",
      "Multi-platform"
    ]),
    image: "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=600&h=400&fit=crop&crop=center",
    githubUrl: null,
    liveUrl: null
  }
]

async function updateProjects() {
  console.log('🔄 Starting projects update...')
  
  try {
    // Clear existing projects
    await prisma.project.deleteMany()
    console.log('🗑️ Cleared existing projects')
    
    for (const project of projects) {
      await prisma.project.create({
        data: project
      })
      console.log(`✅ Created project: ${project.title}`)
    }
    
    console.log('🎉 Successfully updated projects!')
  } catch (error) {
    console.error('❌ Error updating projects:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateProjects()