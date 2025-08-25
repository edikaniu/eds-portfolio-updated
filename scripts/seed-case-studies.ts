import { PrismaClient } from '@prisma/client'
import { generateSlug } from '../lib/slug-utils'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding case studies...')
  
  const caseStudiesData = [
    {
      title: "AI-Powered Marketing Transformation",
      subtitle: "Revolutionizing Marketing Workflows with AI",
      description: "Implemented comprehensive AI automation across marketing operations, resulting in significant productivity gains and workflow optimization.",
      fullDescription: "This groundbreaking AI transformation project revolutionized how marketing teams approach their daily operations across multiple client organizations. By implementing a comprehensive suite of AI tools and automation platforms, we fundamentally changed how marketing professionals create content, analyze data, and execute campaigns. The initiative involved identifying repetitive tasks that consumed valuable time, implementing intelligent automation solutions, and training teams to leverage AI effectively while maintaining quality and brand consistency.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
      metrics: JSON.stringify({
        primary: "20%",
        primaryLabel: "Productivity Increase",
        secondary: "6 months",
        secondaryLabel: "Implementation Timeline"
      }),
      results: JSON.stringify([
        "Automated 80% of repetitive marketing tasks across all client teams",
        "Reduced campaign setup time by 60% through intelligent automation",
        "Improved content quality scores by 35% with AI-enhanced workflows",
        "Enhanced team collaboration efficiency by 45%",
        "Generated 200% more content with same team size",
        "Decreased time-to-market for campaigns by 50%"
      ]),
      tools: JSON.stringify(["ChatGPT", "Claude", "Zapier", "HubSpot", "Automation Platforms", "Analytics"]),
      category: "AI & Automation",
      color: "from-accent to-purple-600",
      icon: "Bot",
      challenge: "Marketing teams across multiple organizations were spending 70% of their time on repetitive, manual tasks like data entry, report generation, and basic content formatting. This left minimal time for strategic thinking, creative work, and high-impact initiatives that drive real business growth.",
      solution: "Developed and implemented a comprehensive AI automation framework that included intelligent content generation, automated reporting systems, smart workflow optimization, and AI-enhanced processes across all marketing channels. The solution focused on maintaining quality while dramatically improving efficiency.",
      timeline: JSON.stringify([
        {
          phase: "Assessment & Strategy",
          duration: "2 weeks",
          description: "Analyzed existing workflows and identified high-impact automation opportunities"
        },
        {
          phase: "Tool Implementation",
          duration: "1 month",
          description: "Selected and implemented AI tools and automation platforms"
        },
        {
          phase: "Workflow Development",
          duration: "2 months",
          description: "Created automated workflows and AI-enhanced processes"
        },
        {
          phase: "Training & Optimization",
          duration: "2.5 months",
          description: "Trained teams and continuously optimized automations for maximum efficiency"
        }
      ]),
      order: 1
    },
    {
      title: "10,000+ User Growth Campaign",
      subtitle: "Explosive User Acquisition Strategy",
      description: "Executed a comprehensive growth campaign that scaled user base from 100 to over 10,000 users through strategic PPC, email automation, and social media marketing.",
      fullDescription: "This explosive user growth campaign was designed to rapidly scale a fintech startup's user base through a sophisticated multi-channel approach. The strategy combined data-driven PPC campaigns, advanced email automation sequences, and targeted social media marketing to create a powerful user acquisition engine. The campaign focused on identifying high-value user segments, optimizing conversion funnels at every stage, and implementing retention strategies to ensure sustainable, long-term growth rather than just short-term spikes.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
      metrics: JSON.stringify({
        primary: "100x",
        primaryLabel: "User Growth",
        secondary: "2 months",
        secondaryLabel: "Achievement Timeline"
      }),
      results: JSON.stringify([
        "Scaled from 100 to 10,000+ active users in just 2 months",
        "Achieved 25% month-over-month growth rate consistently",
        "Reduced customer acquisition cost by 40% through optimization",
        "Increased user retention rate to 85% with enhanced onboarding",
        "Generated 300% increase in monthly recurring revenue",
        "Built automated nurture sequences converting 35% of leads"
      ]),
      tools: JSON.stringify(["Google Ads", "Meta Ads", "Mailchimp", "Analytics", "A/B Testing", "Automation"]),
      category: "Growth Marketing",
      color: "from-primary to-blue-600",
      icon: "TrendingUp",
      challenge: "The fintech startup had a solid product with strong product-market fit but struggled with user acquisition, having only 100 active users despite being in the market for 6 months. They needed rapid, sustainable growth while maintaining quality users and optimizing acquisition costs.",
      solution: "Developed an integrated growth strategy combining paid advertising across multiple channels, content marketing, email automation, and social proof to create multiple touchpoints and conversion opportunities throughout the entire customer journey.",
      timeline: JSON.stringify([
        {
          phase: "Market Research & Strategy",
          duration: "1 week",
          description: "Analyzed target audience, competitive landscape, and identified growth opportunities"
        },
        {
          phase: "Campaign Setup & Launch",
          duration: "2 weeks",
          description: "Created ad campaigns, landing pages, and comprehensive tracking systems"
        },
        {
          phase: "Rapid Testing & Optimization",
          duration: "1 month",
          description: "Launched campaigns and continuously optimized based on real-time performance data"
        },
        {
          phase: "Scale & Expand",
          duration: "3 weeks",
          description: "Scaled successful campaigns and expanded to new channels and audiences"
        }
      ]),
      order: 2
    },
    {
      title: "Email List Explosion",
      subtitle: "733% Email Subscriber Growth",
      description: "Developed and executed a strategic email marketing campaign that grew the subscriber base from 3,000 to 25,000 subscribers in just 3 months.",
      fullDescription: "This comprehensive email marketing transformation focused on building a highly engaged subscriber base through strategic lead magnets, optimized opt-in forms, and compelling content offers. The campaign utilized advanced segmentation, personalization, and automation to not only grow the list exponentially but also maintain high engagement rates and drive significant revenue growth through email marketing. The strategy included creating value-driven content, implementing sophisticated automation sequences, and optimizing every aspect of the email experience.",
      image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=600&h=400&fit=crop",
      metrics: JSON.stringify({
        primary: "733%",
        primaryLabel: "Email Growth",
        secondary: "3 months",
        secondaryLabel: "Campaign Duration"
      }),
      results: JSON.stringify([
        "Grew from 3,000 to 25,000 subscribers in 3 months (733% growth)",
        "Achieved 45% email open rate (industry average: 21%)",
        "Generated 300% increase in email revenue",
        "Built automated nurture sequences with 35% conversion rate",
        "Reduced unsubscribe rate to 0.8% through better targeting",
        "Created 12 high-converting lead magnets"
      ]),
      tools: JSON.stringify(["Mailchimp", "ConvertKit", "Leadpages", "Zapier", "Canva", "Analytics"]),
      category: "Email Marketing",
      color: "from-green-500 to-emerald-600",
      icon: "Mail",
      challenge: "The existing email list of 3,000 subscribers had very low engagement rates with minimal revenue contribution. Most subscribers were inactive, open rates were below 18%, and the company was struggling to grow their list organically while maintaining quality subscribers.",
      solution: "Implemented a comprehensive email marketing strategy with targeted lead magnets, segmented campaigns, automated sequences, and optimized opt-in forms designed to attract, engage, and convert subscribers while maintaining high deliverability and engagement rates.",
      timeline: JSON.stringify([
        {
          phase: "List Audit & Strategy",
          duration: "1 week",
          description: "Analyzed existing list quality and developed comprehensive growth strategy"
        },
        {
          phase: "Lead Magnet Creation",
          duration: "2 weeks",
          description: "Created high-value lead magnets and optimized opt-in forms across all touchpoints"
        },
        {
          phase: "Campaign Launch",
          duration: "1 week",
          description: "Launched growth campaigns across multiple channels and platforms"
        },
        {
          phase: "Automation & Optimization",
          duration: "10 weeks",
          description: "Built automated email sequences and continuously optimized for maximum performance"
        }
      ]),
      order: 3
    },
    {
      title: "Organic Traffic Surge",
      subtitle: "200% Organic Growth Strategy",
      description: "Implemented AI-enhanced content distribution strategy that resulted in a 200% increase in organic traffic within 4 months.",
      fullDescription: "This comprehensive organic growth strategy leveraged AI-enhanced content creation and distribution to dramatically increase organic search traffic and engagement. The campaign focused on creating high-quality, SEO-optimized content that resonated with target audiences while utilizing AI tools to scale content production without sacrificing quality. The strategy included keyword research, content optimization, technical SEO improvements, and strategic content distribution across multiple channels.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
      metrics: JSON.stringify({
        primary: "200%",
        primaryLabel: "Traffic Increase",
        secondary: "4 months",
        secondaryLabel: "Growth Period"
      }),
      results: JSON.stringify([
        "Doubled organic search traffic within 4 months",
        "Improved average page ranking by 15 positions across target keywords",
        "Increased content engagement by 180% through better optimization",
        "Generated 150% more qualified leads from organic channels",
        "Enhanced domain authority by 25 points",
        "Created 85+ pieces of high-performing content"
      ]),
      tools: JSON.stringify(["Google Analytics", "SEMrush", "Ahrefs", "ChatGPT", "Content Calendar", "Search Console"]),
      category: "SEO & Content",
      color: "from-orange-500 to-red-500",
      icon: "Search",
      challenge: "The website had minimal organic visibility with low search rankings and limited content strategy. Organic traffic was stagnant, and the company was heavily dependent on paid advertising for lead generation, resulting in high customer acquisition costs.",
      solution: "Developed a comprehensive SEO and content strategy that combined AI-enhanced content creation with technical optimization, strategic keyword targeting, and systematic content distribution to build sustainable organic growth.",
      timeline: JSON.stringify([
        {
          phase: "SEO Audit & Strategy",
          duration: "2 weeks",
          description: "Conducted comprehensive SEO audit and developed content strategy"
        },
        {
          phase: "Content Creation & Optimization",
          duration: "2 months",
          description: "Created AI-enhanced content and optimized existing pages for search"
        },
        {
          phase: "Technical SEO Implementation",
          duration: "3 weeks",
          description: "Implemented technical SEO improvements and site optimizations"
        },
        {
          phase: "Distribution & Monitoring",
          duration: "1 month",
          description: "Distributed content across channels and monitored performance metrics"
        }
      ]),
      order: 4
    }
  ]

  // Clear existing case studies
  await prisma.caseStudy.deleteMany()
  
  // Insert new case studies
  for (const caseStudy of caseStudiesData) {
    const slug = generateSlug(caseStudy.title)
    await prisma.caseStudy.create({
      data: {
        ...caseStudy,
        slug
      }
    })
  }

  console.log(`✅ Seeded ${caseStudiesData.length} case studies successfully!`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding case studies:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })