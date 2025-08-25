import { prisma } from '../lib/prisma'

async function cleanupCaseStudies() {
  console.log('🔄 Starting case studies cleanup...')
  
  try {
    // Delete all existing case studies to start fresh
    await prisma.caseStudy.deleteMany()
    console.log('🗑️ Cleared all existing case studies')
    
    // Keep only the main case studies that are properly formatted
    const caseStudies = [
      {
        slug: "email-list-growth",
        title: "Email List Explosion",
        subtitle: "733% Email Subscriber Growth",
        description: "Comprehensive email marketing strategy that achieved 733% subscriber growth in 3 months, from 3,000 to 25,000 highly engaged subscribers.",
        fullDescription: "This groundbreaking email marketing transformation project revolutionized how we approach email list building and engagement. Through a data-driven growth strategy focusing on engagement, personalization, and strategic content delivery, we achieved unprecedented growth rates while maintaining high engagement metrics.",
        category: "Email Marketing",
        color: "from-blue-500 to-purple-600",
        icon: "Mail",
        challenge: "Initial 3,000 subscriber list with low engagement. Open rates below 18%. Minimal revenue contribution from email marketing. Struggled with organic list growth and subscriber retention.",
        solution: "Comprehensive email marketing strategy including targeted lead magnets, segmented campaigns, automated email sequences, and optimized opt-in forms. Implemented data-driven personalization and strategic content delivery.",
        metrics: JSON.stringify({
          primary: "733%",
          primaryLabel: "Subscriber Growth", 
          secondary: "45%",
          secondaryLabel: "Open Rate"
        }),
        results: JSON.stringify([
          "Grew from 3,000 to 25,000 subscribers in 3 months",
          "45% email open rate (vs 21% industry average)",
          "300% increase in email revenue",
          "35% conversion rate on automated nurture sequences",
          "0.8% unsubscribe rate",
          "Created 12 high-converting lead magnets"
        ]),
        tools: JSON.stringify([
          "Mailchimp",
          "ConvertKit", 
          "Leadpages",
          "Zapier",
          "Canva",
          "Analytics"
        ]),
        timeline: JSON.stringify([
          {
            phase: "List Audit & Strategy",
            duration: "1 week",
            description: "Analyzed existing subscriber data and developed comprehensive growth strategy"
          },
          {
            phase: "Lead Magnet Creation",
            duration: "2 weeks", 
            description: "Created 12 high-converting lead magnets across different audience segments"
          },
          {
            phase: "Campaign Launch",
            duration: "1 week",
            description: "Launched targeted campaigns and implemented automation workflows"
          },
          {
            phase: "Automation & Optimization",
            duration: "10 weeks",
            description: "Continuously optimized campaigns and refined automation sequences"
          }
        ]),
        image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=600&h=400&fit=crop&crop=center"
      },
      {
        slug: "ai-powered-marketing-transformation",
        title: "AI-Powered Marketing Transformation", 
        subtitle: "Revolutionizing Marketing Workflows with AI",
        description: "Implemented comprehensive AI automation across marketing operations, resulting in significant productivity gains and workflow optimization.",
        fullDescription: "This groundbreaking AI transformation project revolutionized how marketing teams approach their daily operations across multiple channels and touchpoints. By integrating advanced AI tools and automation workflows, we achieved unprecedented efficiency while maintaining quality and brand consistency.",
        category: "AI & Marketing",
        color: "from-purple-500 to-pink-600",
        icon: "Bot",
        challenge: "Manual marketing processes consuming excessive time and resources. Inconsistent content quality across channels. Limited scalability of marketing operations. Team burnout from repetitive tasks.",
        solution: "Comprehensive AI integration strategy including automated content generation, intelligent campaign optimization, predictive analytics, and workflow automation. Implemented AI-driven personalization and performance optimization.",
        metrics: JSON.stringify({
          primary: "80%",
          primaryLabel: "Time Reduction",
          secondary: "300%",
          secondaryLabel: "Content Output"
        }),
        results: JSON.stringify([
          "80% reduction in manual marketing tasks",
          "300% increase in content production",
          "45% improvement in campaign performance",
          "60% faster campaign launch times",
          "25% increase in lead quality",
          "Eliminated 15+ hours of weekly manual work"
        ]),
        tools: JSON.stringify([
          "ChatGPT",
          "Claude AI",
          "HubSpot",
          "Zapier",
          "Make.com",
          "Analytics"
        ]),
        timeline: JSON.stringify([
          {
            phase: "AI Strategy & Planning",
            duration: "2 weeks",
            description: "Developed comprehensive AI integration strategy and identified automation opportunities"
          },
          {
            phase: "Tool Integration",
            duration: "3 weeks",
            description: "Implemented AI tools and connected systems through automation workflows"
          },
          {
            phase: "Testing & Optimization",
            duration: "4 weeks",
            description: "Tested AI workflows and optimized for performance and quality"
          },
          {
            phase: "Scale & Monitor",
            duration: "Ongoing",
            description: "Scaled successful implementations and continuously monitor performance"
          }
        ]),
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop&crop=center"
      }
    ]
    
    for (const caseStudy of caseStudies) {
      await prisma.caseStudy.create({
        data: caseStudy
      })
      console.log(`✅ Created case study: ${caseStudy.title}`)
    }
    
    console.log('🎉 Successfully cleaned up case studies!')
  } catch (error) {
    console.error('❌ Error cleaning up case studies:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupCaseStudies()