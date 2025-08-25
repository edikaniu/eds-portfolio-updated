// Script to seed tools data from frontend into the database
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const toolsData = [
  {
    name: "Google Analytics",
    description: "Web analytics platform for tracking website performance",
    logoUrl: "https://www.google.com/analytics/analytics-images/analytics-logo.svg",
    category: "Analytics",
    color: "#FF6F00",
    order: 1
  },
  {
    name: "HubSpot",
    description: "CRM and marketing automation platform",
    logoUrl: "https://cdn2.hubspot.net/hubfs/53/hubspot_logo_333_orange.svg",
    category: "CRM",
    color: "#FF7A59",
    order: 2
  },
  {
    name: "Meta Ads",
    description: "Facebook advertising platform",
    logoUrl: "https://static.xx.fbcdn.net/rsrc.php/v3/y5/r/TJp_l2dLokM.png",
    category: "Advertising",
    color: "#1877F2",
    order: 3
  },
  {
    name: "Google Ads",
    description: "Google's advertising platform",
    logoUrl: "https://lh3.googleusercontent.com/xW-fOpsRx5VDow9_8BZTp4e8V4-8xbAA5E4uU5xMwVG3IuGRvfQRUE7F5_fD6_LJcA",
    category: "Advertising",
    color: "#4285F4",
    order: 4
  },
  {
    name: "Mailchimp",
    description: "Email marketing platform",
    logoUrl: "https://logoeps.com/wp-content/uploads/2013/12/mailchimp-vector-logo.png",
    category: "Email Marketing",
    color: "#FFE01B",
    order: 5
  },
  {
    name: "Zapier",
    description: "Automation platform connecting apps",
    logoUrl: "https://cdn.zapier.com/zapier/images/logos/zapier-logomark.png",
    category: "Automation",
    color: "#FF4A00",
    order: 6
  },
  {
    name: "Figma",
    description: "Design and prototyping tool",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg",
    category: "Design",
    color: "#F24E1E",
    order: 7
  },
  {
    name: "Notion",
    description: "All-in-one workspace for notes and collaboration",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/notion/notion-original.svg",
    category: "Productivity",
    color: "#000000",
    order: 8
  },
  {
    name: "Slack",
    description: "Team communication platform",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/slack/slack-original.svg",
    category: "Communication",
    color: "#4A154B",
    order: 9
  },
  {
    name: "Jira",
    description: "Project management and issue tracking",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jira/jira-original.svg",
    category: "Project Management",
    color: "#0052CC",
    order: 10
  },
  {
    name: "Hotjar",
    description: "User behavior analytics and feedback tool",
    logoUrl: "https://static.hotjar.com/static/gfx/hotjar-logo.svg",
    category: "Analytics",
    color: "#FF3C00",
    order: 11
  },
  {
    name: "Mixpanel",
    description: "Product analytics platform",
    logoUrl: "https://mixpanel.com/static/images/mixpanel-logo.svg",
    category: "Analytics",
    color: "#7856FF",
    order: 12
  },
  {
    name: "Ahrefs",
    description: "SEO and backlink analysis tool",
    logoUrl: "https://static.ahrefs.com/favicon-192x192.png",
    category: "SEO",
    color: "#FF7A00",
    order: 13
  },
  {
    name: "SEMrush",
    description: "Digital marketing and SEO platform",
    logoUrl: "https://www.semrush.com/img/favicons/favicon-192x192.png",
    category: "SEO",
    color: "#FF642D",
    order: 14
  },
  {
    name: "Canva",
    description: "Graphic design platform",
    logoUrl: "https://www.canva.com/favicon.ico",
    category: "Design",
    color: "#00C4CC",
    order: 15
  },
  {
    name: "Buffer",
    description: "Social media management platform",
    logoUrl: "https://buffer.com/static/icons/favicon-192x192.png",
    category: "Social Media",
    color: "#168EEA",
    order: 16
  }
]

async function seedTools() {
  try {
    console.log('Starting to seed tools data...')
    
    for (const toolData of toolsData) {
      const tool = await prisma.tool.create({
        data: {
          ...toolData,
          isActive: true
        }
      })
      
      console.log(`Created tool: ${toolData.name}`)
    }
    
    console.log('Tools data seeded successfully!')
  } catch (error) {
    console.error('Error seeding tools:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedTools()