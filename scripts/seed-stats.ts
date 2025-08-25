// Script to seed statistics data from frontend into the database
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const statsData = [
  {
    key: 'core_skills_stat',
    value: '24+',
    description: 'Professional marketing and technical skills across multiple disciplines',
    metadata: {
      label: 'Core Skills',
      icon: 'Award',
      color: '#3B82F6',
      order: 1
    }
  },
  {
    key: 'professional_tools_stat',
    value: '16+',
    description: 'Professional tools and technologies used for marketing and growth',
    metadata: {
      label: 'Professional Tools',
      icon: 'Wrench',
      color: '#10B981',
      order: 2
    }
  },
  {
    key: 'years_experience_stat',
    value: '7+',
    description: 'Years of experience in marketing, growth, and product development',
    metadata: {
      label: 'Years Experience',
      icon: 'Calendar',
      color: '#F59E0B',
      order: 3
    }
  },
  {
    key: 'users_scaled_stat',
    value: '200k+',
    description: 'Total users scaled across various products and campaigns',
    metadata: {
      label: 'Users Scaled',
      icon: 'Users',
      color: '#8B5CF6',
      order: 4
    }
  },
  {
    key: 'subscribers_growth_stat',
    value: '733%',
    description: 'Maximum email subscriber growth achieved in campaigns',
    metadata: {
      label: 'Subscribers Growth',
      icon: 'TrendingUp',
      color: '#EF4444',
      order: 5
    }
  },
  {
    key: 'budget_scaled_stat',
    value: '$500k+',
    description: 'Total marketing budget managed and scaled effectively',
    metadata: {
      label: 'Budget Scaled',
      icon: 'DollarSign',
      color: '#06B6D4',
      order: 6
    }
  },
  {
    key: 'roas_stat',
    value: '5x',
    description: 'Return on advertising spend achieved in campaigns',
    metadata: {
      label: 'ROAS',
      icon: 'Target',
      color: '#EC4899',
      order: 7
    }
  }
]

async function seedStats() {
  try {
    console.log('Starting to seed statistics data...')
    
    for (const statData of statsData) {
      const { key, value, description, metadata } = statData
      
      const existingStat = await prisma.siteSetting.findUnique({
        where: { settingKey: key }
      })

      if (existingStat) {
        // Update existing stat
        await prisma.siteSetting.update({
          where: { settingKey: key },
          data: {
            settingValue: value,
            description
          }
        })
        console.log(`Updated statistic: ${key}`)
      } else {
        // Create new stat
        await prisma.siteSetting.create({
          data: {
            settingKey: key,
            settingValue: value,
            description
          }
        })
        console.log(`Created statistic: ${key}`)
      }
    }
    
    console.log('Statistics data seeded successfully!')
  } catch (error) {
    console.error('Error seeding statistics:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedStats()