// Script to seed experience data from frontend into the database
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const experienceData = [
  {
    title: "Marketing Manager",
    company: "Suretree Systems",
    period: "Aug 2023 - Present",
    type: "work",
    category: "professional",
    achievements: [
      "Implemented AI-powered initiatives boosting team productivity by 20%",
      "Increased organic traffic by 200% in 4 months through AI-enhanced content strategies",
      "Reduced unqualified leads by 40% using HubSpot-based lead scoring system",
      "Increased conversion rates by 30% through performance tracking and optimization"
    ],
    metrics: "20% Productivity Boost",
    icon: "zap",
    color: "#3B82F6",
    order: 1
  },
  {
    title: "Head, Integrated Communications",
    company: "Household of David",
    period: "Sep 2023 - Present",
    type: "work",
    category: "professional",
    achievements: [
      "Delivered 80% brand awareness growth via PR and content strategy during organizational pivot",
      "Led team of 60+ volunteers creating multimedia content aligned with brand mission",
      "Grew social audience by 70,000+ followers in 6 months through engagement optimization"
    ],
    metrics: "80% Brand Growth",
    icon: "trending-up",
    color: "#8B5CF6",
    order: 2
  },
  {
    title: "Product Marketing Lead",
    company: "Suretree Systems",
    period: "Nov 2022 - Jul 2023",
    type: "work",
    category: "professional",
    achievements: [
      "Planned and executed multi-channel campaigns across Meta, LinkedIn, Twitter, Google",
      "Achieved aggressive demand generation targets through data-driven strategies",
      "Developed product messaging and positioning for key features",
      "Coordinated with product and engineering teams for seamless marketing execution"
    ],
    metrics: "Multi-Channel Growth",
    icon: "target",
    color: "#10B981",
    order: 3
  },
  {
    title: "Head, Social Media & Communications",
    company: "Household of David",
    period: "Sep 2022 - Aug 2023",
    type: "work",
    category: "professional",
    achievements: [
      "Achieved 60% engagement growth and expanded followership by 75%",
      "Added 50,000+ new followers across digital channels in one year",
      "Led team producing high-quality weekly newsletters and multimedia content",
      "Monitored trends and audience behavior to optimize campaign execution"
    ],
    metrics: "50K+ Followers",
    icon: "trending-up",
    color: "#3B82F6",
    order: 4
  },
  {
    title: "Senior Campaign Manager",
    company: "Suretree Systems",
    period: "Jul 2022 - Nov 2022",
    type: "work",
    category: "professional",
    achievements: [
      "Achieved 733% growth in email subscribers (3,000 to 25,000 in 3 months)",
      "Scaled product users from 100 to 10,000+ in 2 months via integrated strategy",
      "Increased platform registrations from 150 to 3,000+ in one month",
      "Managed campaign budgets while reducing customer acquisition costs (CAC)"
    ],
    metrics: "733% Email Growth",
    icon: "zap",
    color: "#F59E0B",
    order: 5
  },
  {
    title: "Growth Marketing Lead",
    company: "Sogital Digital Agency",
    period: "Jun 2020 - Jan 2022",
    type: "work",
    category: "professional",
    achievements: [
      "Designed chatbot-driven funnel generating 4,500+ qualified leads in 3 months",
      "Delivered 5X ROAS for three clients through full-funnel growth tactics",
      "Used marketing analytics to build culture of data-driven experimentation",
      "Provided strategic marketing consulting to B2B and B2C clients"
    ],
    metrics: "5X ROAS",
    icon: "target",
    color: "#8B5CF6",
    order: 6
  },
  {
    title: "Digital Strategist & Content Manager",
    company: "Household of David",
    period: "Jun 2020 - Jan 2022",
    type: "work",
    category: "professional",
    achievements: [
      "Led digital campaigns for 3 major conferences generating 5,000+ leads each",
      "Achieved 68%+ physical attendance, 20,000+ online attendees per event",
      "Generated post-event reach exceeding 500,000 across digital channels",
      "Developed brand communications and content strategies for audience engagement"
    ],
    metrics: "500K+ Reach",
    icon: "trending-up",
    color: "#06B6D4",
    order: 7
  },
  {
    title: "Senior Digital Marketing Executive",
    company: "Polo Limited",
    period: "Oct 2019 - Jan 2020",
    type: "work",
    category: "professional",
    achievements: [
      "Managed luxury brand campaigns for Rolex, Gucci, Cartier, and Swarovski",
      "Generated and qualified 600+ luxury leads in 7 months (5X growth)",
      "Achieved 100X ROAS through targeted digital marketing activities",
      "Improved email open rates by 40% and click-through rates by 30%"
    ],
    metrics: "100X ROAS",
    icon: "zap",
    color: "#F59E0B",
    order: 8
  },
  {
    title: "Digital Marketing Strategist",
    company: "TOY Media Agency",
    period: "Jun 2018 - Aug 2019",
    type: "work",
    category: "professional",
    achievements: [
      "Served as strategic advisor aligning digital marketing with business goals",
      "Developed tailored campaign strategies for multiple clients",
      "Ensured alignment with audience segments and performance objectives",
      "Maximized ROI and brand impact through strategic planning"
    ],
    metrics: "Strategic Growth",
    icon: "target",
    color: "#10B981",
    order: 9
  },
  {
    title: "Masters in Sales & Marketing",
    company: "Rome Business School",
    period: "2024 - 2026",
    type: "education",
    category: "academic",
    achievements: [
      "Advanced coursework in strategic marketing and sales management",
      "Focus on digital transformation and AI in marketing",
      "International business perspective and global market analysis"
    ],
    metrics: "In Progress",
    icon: "graduation-cap",
    color: "#3B82F6",
    order: 10
  },
  {
    title: "Product Marketing Diploma",
    company: "AltSchool Africa",
    period: "2024",
    type: "education",
    category: "academic",
    achievements: [
      "Specialized in product positioning and go-to-market strategies",
      "Completed advanced coursework in user research and market analysis",
      "Developed expertise in product-led growth methodologies"
    ],
    metrics: "Product Marketing",
    icon: "graduation-cap",
    color: "#10B981",
    order: 11
  },
  {
    title: "Blockchain Revolution Certificate",
    company: "INSEAD",
    period: "2022",
    type: "certification",
    category: "academic",
    achievements: [
      "Comprehensive study of blockchain technology and its business applications",
      "Understanding of cryptocurrency, smart contracts, and decentralized systems",
      "Strategic insights into blockchain's impact on various industries"
    ],
    metrics: "Blockchain Expertise",
    icon: "graduation-cap",
    color: "#8B5CF6",
    order: 12
  }
]

async function seedExperience() {
  try {
    console.log('Starting to seed experience data...')
    
    for (const expData of experienceData) {
      const existingExperience = await prisma.experienceEntry.findFirst({
        where: { 
          title: expData.title,
          company: expData.company
        }
      })

      if (existingExperience) {
        // Update existing experience
        await prisma.experienceEntry.update({
          where: { id: existingExperience.id },
          data: {
            title: expData.title,
            company: expData.company,
            period: expData.period,
            type: expData.type,
            category: expData.category,
            achievements: JSON.stringify(expData.achievements),
            metrics: expData.metrics,
            icon: expData.icon,
            color: expData.color,
            order: expData.order,
            isActive: true
          }
        })
        console.log(`Updated experience: ${expData.title} at ${expData.company}`)
      } else {
        // Create new experience
        await prisma.experienceEntry.create({
          data: {
            title: expData.title,
            company: expData.company,
            period: expData.period,
            type: expData.type,
            category: expData.category,
            achievements: JSON.stringify(expData.achievements),
            metrics: expData.metrics,
            icon: expData.icon,
            color: expData.color,
            order: expData.order,
            isActive: true
          }
        })
        console.log(`Created experience: ${expData.title} at ${expData.company}`)
      }
    }
    
    console.log('Experience data seeded successfully!')
  } catch (error) {
    console.error('Error seeding experience:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedExperience()