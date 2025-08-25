// Script to seed skills data from frontend into the database
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const skillsData = [
  {
    title: "Marketing Leadership",
    description: "Driving marketing vision and leading high-performance teams",
    color: "#3B82F6", // Blue
    order: 1,
    skills: [
      { name: "Cross-functional Team Leadership", proficiency: 85 },
      { name: "Stakeholder Management", proficiency: 90 },
      { name: "Budget Management", proficiency: 90 },
      { name: "Retention Strategy", proficiency: 88 }
    ]
  },
  {
    title: "AI-Driven Marketing Innovation",
    description: "Harnessing AI to transform marketing strategy and execution",
    color: "#8B5CF6", // Purple
    order: 2,
    skills: [
      { name: "Generative AI", proficiency: 75 },
      { name: "ChatGPT, Claude, etc", proficiency: 75 },
      { name: "Marketing Automation", proficiency: 80 },
      { name: "Prompt Engineering", proficiency: 50 }
    ]
  },
  {
    title: "Brand & Communications Strategy",
    description: "Shaping brand identity and managing public perception",
    color: "#EF4444", // Red
    order: 3,
    skills: [
      { name: "Brand Strategy", proficiency: 95 },
      { name: "Public Relations", proficiency: 85 },
      { name: "Content Strategy", proficiency: 90 },
      { name: "Crisis Communication", proficiency: 88 }
    ]
  },
  {
    title: "Growth & Revenue Strategy",
    description: "Driving acquisition, retention, and market expansion",
    color: "#10B981", // Green
    order: 4,
    skills: [
      { name: "Growth Marketing", proficiency: 92 },
      { name: "GTM Strategy", proficiency: 92 },
      { name: "Customer Acquisition", proficiency: 90 },
      { name: "Product Positioning", proficiency: 90 }
    ]
  },
  {
    title: "Data & Performance Optimization",
    description: "Leveraging analytics for strategic decision making",
    color: "#F59E0B", // Amber
    order: 5,
    skills: [
      { name: "Marketing Analytics", proficiency: 92 },
      { name: "Performance Tracking", proficiency: 90 },
      { name: "A/B Testing", proficiency: 88 },
      { name: "Data Visualization", proficiency: 88 }
    ]
  },
  {
    title: "Integrated Marketing & Partnerships",
    description: "Orchestrating multi-channel campaigns and strategic collaborations",
    color: "#EC4899", // Pink
    order: 6,
    skills: [
      { name: "Integrated Marketing Campaigns", proficiency: 92 },
      { name: "Partnership Development", proficiency: 90 },
      { name: "Event Marketing", proficiency: 86 },
      { name: "CRM", proficiency: 86 }
    ]
  }
]

async function seedSkills() {
  try {
    console.log('Starting to seed skills data...')
    
    for (const categoryData of skillsData) {
      const { skills, ...categoryInfo } = categoryData
      
      const skillCategory = await prisma.skillCategory.create({
        data: {
          ...categoryInfo,
          skills: JSON.stringify(skills),
          isActive: true
        }
      })
      
      console.log(`Created skill category: ${categoryInfo.title}`)
    }
    
    console.log('Skills data seeded successfully!')
  } catch (error) {
    console.error('Error seeding skills:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedSkills()