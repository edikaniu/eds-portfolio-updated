import { prisma } from '../lib/prisma'
import { generateSlug } from '../lib/slug-utils'

const projects = [
  {
    id: "ai-content-automation",
    title: "AI Content Automation Workflow",
    description: "Automated content creation pipeline using ChatGPT and Claude for blog posts, social media, and email campaigns.",
    type: "workflow",
    technologies: ["ChatGPT", "Claude", "HubSpot", "Zapier"],
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop&crop=center",
    status: "Live",
  },
  {
    id: "lead-scoring-system",
    title: "HubSpot Lead Scoring System",
    description: "Custom lead scoring algorithm that reduced unqualified leads by 40% and improved sales efficiency.",
    type: "tool",
    technologies: ["HubSpot", "JavaScript", "API Integration"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop&crop=center",
    status: "Live",
  },
  {
    id: "email-growth-funnel",
    title: "Email Growth Funnel",
    description: "Multi-stage email automation that achieved 733% subscriber growth in 3 months.",
    type: "workflow",
    technologies: ["Email Marketing", "Lead Magnets", "Automation"],
    image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400&h=250&fit=crop&crop=center",
    status: "Completed",
  },
  {
    id: "seo-keyword-tool",
    title: "AI-Powered SEO Keyword Tool",
    description: "Custom tool for automated keyword research and content optimization using AI.",
    type: "tool",
    technologies: ["Python", "OpenAI API", "SEO Tools"],
    image: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=400&h=250&fit=crop&crop=center",
    status: "Live",
  },
  {
    id: "social-media-automation",
    title: "Social Media Automation Suite",
    description: "Comprehensive social media management workflow that grew followers by 70,000 in 6 months.",
    type: "workflow",
    technologies: ["Buffer", "Canva API", "Analytics"],
    image: "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=250&fit=crop&crop=center",
    status: "Live",
  },
  {
    id: "conversion-tracker",
    title: "Multi-Channel Conversion Tracker",
    description: "Advanced analytics tool for tracking conversions across multiple marketing channels.",
    type: "tool",
    technologies: ["Google Analytics", "Facebook Pixel", "Custom Dashboard"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&crop=center",
    status: "Live",
  },
  {
    id: "chatbot-funnel",
    title: "Chatbot Lead Generation Funnel",
    description: "Automated chatbot system that generated over 4,500 qualified leads in three months.",
    type: "workflow",
    technologies: ["Chatbot", "Lead Generation", "CRM Integration"],
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=250&fit=crop&crop=center",
    status: "Completed",
  },
  {
    id: "roi-calculator",
    title: "Marketing ROI Calculator",
    description: "Custom tool for calculating and tracking marketing ROI across multiple campaigns and channels.",
    type: "tool",
    technologies: ["Excel/Sheets", "Data Visualization", "Analytics"],
    image: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=400&h=250&fit=crop&crop=center",
    status: "Live",
  },
  {
    id: "brand-monitoring-tool",
    title: "Brand Monitoring & Sentiment Tool",
    description: "Real-time brand monitoring system that tracks mentions and sentiment across social platforms.",
    type: "tool",
    technologies: ["Social APIs", "Sentiment Analysis", "Dashboard"],
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop&crop=center",
    status: "Live",
  },
  {
    id: "content-calendar-automation",
    title: "Content Calendar Automation",
    description: "Automated content planning and scheduling system for multi-platform social media management.",
    type: "workflow",
    technologies: ["Content Planning", "Scheduling", "Multi-platform"],
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=250&fit=crop&crop=center",
    status: "Live",
  },
  {
    id: "competitor-analysis-tool",
    title: "Competitor Analysis Dashboard",
    description: "Comprehensive competitor tracking tool that monitors pricing, content, and marketing strategies.",
    type: "tool",
    technologies: ["Web Scraping", "Analytics", "Competitive Intelligence"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop&crop=center",
    status: "In Development",
  },
  {
    id: "influencer-outreach-system",
    title: "Influencer Outreach Automation",
    description: "Streamlined influencer discovery and outreach workflow that improved partnership success rates.",
    type: "workflow",
    technologies: ["Influencer Discovery", "Email Automation", "CRM"],
    image: "https://images.unsplash.com/photo-1573167243872-43c6433b9d40?w=400&h=250&fit=crop&crop=center",
    status: "Live",
  },
  {
    id: "performance-reporting-tool",
    title: "Automated Performance Reporting",
    description: "Custom reporting tool that consolidates data from multiple marketing platforms into unified dashboards.",
    type: "tool",
    technologies: ["API Integration", "Data Visualization", "Reporting"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop&crop=center",
    status: "Live",
  },
  {
    id: "customer-journey-mapper",
    title: "Customer Journey Mapping Tool",
    description: "Visual customer journey mapping system that identifies optimization opportunities across touchpoints.",
    type: "tool",
    technologies: ["Journey Mapping", "Analytics", "UX Tools"],
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop&crop=center",
    status: "Completed",
  },
  {
    id: "ab-testing-framework",
    title: "A/B Testing Framework",
    description: "Comprehensive testing framework that streamlined experiment design and statistical analysis.",
    type: "workflow",
    technologies: ["A/B Testing", "Statistical Analysis", "Experiment Design"],
    image: "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=400&h=250&fit=crop&crop=center",
    status: "Live",
  },
  {
    id: "marketing-attribution-model",
    title: "Multi-Touch Attribution Model",
    description: "Advanced attribution modeling system that accurately tracks customer touchpoints and conversions.",
    type: "tool",
    technologies: ["Attribution Modeling", "Data Science", "Analytics"],
    image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=250&fit=crop&crop=center",
    status: "Live",
  },
]

async function seedProjects() {
  try {
    console.log('🌱 Starting project seeding...')

    // Clear existing projects
    await prisma.project.deleteMany({})
    console.log('🗑️  Cleared existing projects')

    // Insert projects
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i]
      
      const slug = generateSlug(project.title)
      await prisma.project.create({
        data: {
          title: project.title,
          slug,
          description: project.description,
          image: project.image,
          technologies: JSON.stringify(project.technologies),
          githubUrl: null, // These weren't in the original data
          liveUrl: null,   // These weren't in the original data
          category: project.type,
          order: i,
          isActive: project.status === 'Live' || project.status === 'Completed'
        }
      })
      
      console.log(`✅ Created project: ${project.title}`)
    }

    console.log(`🎉 Successfully seeded ${projects.length} projects!`)
  } catch (error) {
    console.error('❌ Error seeding projects:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedProjects()
}

export { seedProjects }