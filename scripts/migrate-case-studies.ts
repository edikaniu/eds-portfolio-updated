import { prisma } from '../lib/prisma'
import { caseStudies } from '../data/case-studies'

const hardcodedCaseStudiesToMigrate = [
  {
    id: "fintech-user-acquisition",
    title: "Scaling User Acquisition for Fintech Startup",
    subtitle: "10,000% User Growth in 2 Months",
    description: "A fintech startup needed to scale from 100 to 10,000+ users while maintaining product-market fit and optimizing customer acquisition costs.",
    fullDescription: "This comprehensive growth campaign was designed to rapidly scale Suretree Systems' user base through a multi-channel approach. The strategy combined data-driven PPC campaigns, sophisticated email automation sequences, and targeted social media marketing to create a powerful user acquisition engine. The campaign focused on identifying high-value user segments, optimizing conversion funnels, and implementing retention strategies to ensure sustainable growth.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    metrics: {
      primary: "10,000%",
      primaryLabel: "User Growth",
      secondary: "2 months",
      secondaryLabel: "Achievement Timeline"
    },
    results: [
      "Achieved 10,000% user growth (100 to 10,000+ users) in 2 months",
      "Reduced customer acquisition cost by 25% through optimized targeting",
      "Improved conversion rate by 30% with data-driven UX improvements",
      "Increased user retention by 40% through enhanced onboarding",
      "Generated 300% increase in monthly recurring revenue",
      "Built automated nurture sequences converting 35% of leads"
    ],
    tools: ["Google Ads", "Meta Ads", "HubSpot", "A/B Testing", "Analytics", "Email Automation"],
    category: "Growth Marketing",
    color: "from-blue-500 to-blue-700",
    icon: "TrendingUp",
    challenge: "Suretree Systems had a solid product but struggled with user acquisition, having only 100 active users despite being in the market for 6 months. The challenge was to rapidly scale the user base while maintaining product-market fit and optimizing customer acquisition costs.",
    solution: "Developed an integrated growth strategy combining paid advertising, content marketing, email automation, and social proof to create multiple touchpoints and conversion opportunities across the entire customer journey.",
    timeline: [
      {
        phase: "Market Research & Strategy",
        duration: "1 week",
        description: "Analyzed target audience, competitive landscape, and growth opportunities"
      },
      {
        phase: "Campaign Setup & Launch",
        duration: "2 weeks",
        description: "Created ad campaigns, landing pages, and tracking systems across multiple channels"
      },
      {
        phase: "Rapid Testing & Optimization",
        duration: "1 month",
        description: "Launched campaigns and continuously optimized based on performance data"
      },
      {
        phase: "Scale & Expand",
        duration: "3 weeks",
        description: "Scaled successful campaigns and expanded to new channels and audiences"
      }
    ],
    order: 5,
    isActive: true
  },
  {
    id: "email-marketing-growth",
    title: "Email Marketing Transformation",
    subtitle: "733% Email List Growth",
    description: "A B2B SaaS company struggled with low email engagement and needed to dramatically increase their subscriber base and revenue from email marketing.",
    fullDescription: "This email marketing transformation project focused on building a highly engaged subscriber base through strategic lead magnets, optimized opt-in forms, and compelling content offers. The campaign utilized advanced segmentation, personalization, and automation to not only grow the list but also maintain high engagement rates and drive significant revenue growth through email marketing.",
    image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=600&h=400&fit=crop",
    metrics: {
      primary: "733%",
      primaryLabel: "Email Growth",
      secondary: "3 months",
      secondaryLabel: "Campaign Duration"
    },
    results: [
      "Achieved 733% email list growth (3,000 to 25,000 subscribers) in 3 months",
      "Increased email open rates from 18% to 35%",
      "Improved click-through rates by 150%",
      "Generated $2.2M in revenue attributable to email campaigns",
      "Built 12 automated nurture sequences with 35% conversion rate",
      "Reduced unsubscribe rate to 0.5% through better segmentation"
    ],
    tools: ["Mailchimp", "ConvertKit", "Lead Magnets", "Automation", "Canva", "Analytics"],
    category: "Email Marketing",
    color: "from-green-500 to-emerald-600",
    icon: "Mail",
    challenge: "The existing email list of 3,000 subscribers had low engagement rates and minimal revenue contribution, with most subscribers being inactive or unengaged. The company needed to dramatically increase both list size and engagement.",
    solution: "Implemented a comprehensive email marketing strategy with targeted lead magnets, segmented campaigns, and automated sequences designed to attract, engage, and convert subscribers while maintaining high deliverability and engagement rates.",
    timeline: [
      {
        phase: "List Audit & Strategy",
        duration: "1 week",
        description: "Analyzed existing list quality and developed comprehensive growth strategy"
      },
      {
        phase: "Lead Magnet Creation",
        duration: "2 weeks",
        description: "Created high-value lead magnets and optimized opt-in forms"
      },
      {
        phase: "Campaign Launch",
        duration: "1 week",
        description: "Launched growth campaigns across multiple channels and platforms"
      },
      {
        phase: "Automation & Optimization",
        duration: "10 weeks",
        description: "Built automated email sequences and continuously optimized performance"
      }
    ],
    order: 6,
    isActive: true
  },
  {
    id: "ai-content-automation",
    title: "AI-Powered Content & Productivity Boost",
    subtitle: "20% Team Productivity Increase",
    description: "Marketing teams needed to scale content production while maintaining quality and consistency across multiple channels and campaigns.",
    fullDescription: "This comprehensive AI automation initiative involved implementing AI-driven solutions across all marketing operations for multiple clients. By leveraging advanced AI tools and automation platforms, we revolutionized how marketing teams approached content creation, campaign management, and performance optimization. The initiative focused on identifying repetitive tasks, implementing intelligent automation, and creating AI-enhanced workflows that significantly boosted team productivity while maintaining high-quality output standards.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
    metrics: {
      primary: "20%",
      primaryLabel: "Productivity Increase",
      secondary: "4 months",
      secondaryLabel: "Implementation Period"
    },
    results: [
      "Increased team productivity by 20% through AI automation",
      "Reduced content creation time by 60%",
      "Improved content quality scores by 35%",
      "Generated 200% more content with same team size",
      "Automated 80% of repetitive marketing tasks",
      "Enhanced workflow efficiency across all marketing channels"
    ],
    tools: ["ChatGPT", "Claude", "Jasper", "Content Calendar", "Automation", "Analytics"],
    category: "AI & Automation",
    color: "from-purple-500 to-purple-700",
    icon: "Bot",
    challenge: "Marketing teams were spending 70% of their time on repetitive tasks like data entry, report generation, and basic content formatting, leaving little time for strategic initiatives and creative work that drives real business growth.",
    solution: "Implemented a comprehensive AI automation stack that included intelligent content generation, automated reporting, smart workflow optimization, and AI-enhanced processes across all marketing channels and operations.",
    timeline: [
      {
        phase: "Discovery & Analysis",
        duration: "2 weeks",
        description: "Analyzed existing workflows and identified automation opportunities"
      },
      {
        phase: "Tool Selection & Setup",
        duration: "1 month",
        description: "Evaluated and implemented AI tools and automation platforms"
      },
      {
        phase: "Workflow Development",
        duration: "2 months",
        description: "Created automated workflows and AI-enhanced processes"
      },
      {
        phase: "Training & Optimization",
        duration: "1 month",
        description: "Trained teams and fine-tuned automations for maximum efficiency"
      }
    ],
    order: 7,
    isActive: true
  },
  {
    id: "ecommerce-conversion-optimization",
    title: "E-commerce Conversion Rate Optimization",
    subtitle: "55% Conversion Increase",
    description: "An e-commerce platform experienced high traffic but low conversion rates, indicating significant optimization opportunities in the user journey.",
    fullDescription: "This comprehensive conversion rate optimization project involved a systematic analysis of the entire e-commerce funnel, from product discovery to checkout completion. Through advanced analytics, user behavior tracking, and extensive A/B testing, we identified key friction points and implemented strategic improvements that dramatically increased conversion rates across all product categories and customer segments.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
    metrics: {
      primary: "55%",
      primaryLabel: "Conversion Increase",
      secondary: "6 months",
      secondaryLabel: "Optimization Period"
    },
    results: [
      "Increased overall conversion rate by 55% across all product categories",
      "Reduced cart abandonment rate by 45% through UX improvements",
      "Improved mobile conversion rate by 65% with responsive optimizations",
      "Generated additional $1.8M in revenue without increasing traffic",
      "Enhanced product page engagement by 40%",
      "Streamlined checkout process reducing steps by 30%"
    ],
    tools: ["Google Optimize", "Hotjar", "Google Analytics", "A/B Testing", "Heatmaps", "User Testing"],
    category: "E-commerce",
    color: "from-orange-500 to-orange-700",
    icon: "ShoppingCart",
    challenge: "Despite attracting significant traffic, the e-commerce platform was converting only 1.2% of visitors to customers, well below the industry average. Cart abandonment rates were extremely high at 78%, and mobile performance was particularly poor.",
    solution: "Implemented a data-driven CRO strategy focusing on user experience optimization, mobile responsiveness, trust signals, and checkout flow improvements. Used extensive testing and analytics to validate each optimization.",
    timeline: [
      {
        phase: "Analytics & Research",
        duration: "3 weeks",
        description: "Conducted comprehensive analysis of user behavior and conversion funnels"
      },
      {
        phase: "Hypothesis Development",
        duration: "1 week",
        description: "Identified key optimization opportunities and prioritized testing roadmap"
      },
      {
        phase: "Testing & Implementation",
        duration: "4 months",
        description: "Executed systematic A/B tests and implemented winning variations"
      },
      {
        phase: "Monitoring & Refinement",
        duration: "1 month",
        description: "Monitored performance and made final optimizations"
      }
    ],
    order: 8,
    isActive: true
  },
  {
    id: "social-media-growth",
    title: "Social Media Growth & Engagement",
    subtitle: "70,000+ Followers in 6 Months",
    description: "A tech brand needed to build awareness and engagement across social platforms to support product launches and community building.",
    fullDescription: "This comprehensive social media growth strategy focused on building an authentic, engaged community across multiple platforms. Through strategic content creation, influencer partnerships, community management, and data-driven optimization, we transformed the brand's social presence from minimal to massive, creating a loyal following that actively engages with and promotes the brand.",
    image: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=600&h=400&fit=crop",
    metrics: {
      primary: "70K+",
      primaryLabel: "New Followers",
      secondary: "6 months",
      secondaryLabel: "Growth Period"
    },
    results: [
      "Grew social media following by 70,000+ followers across all platforms",
      "Increased engagement rate from 2.1% to 8.5%",
      "Generated 4,500+ qualified leads through social campaigns",
      "Achieved 300% increase in brand mention volume",
      "Created 15+ viral content pieces with 100K+ reach each",
      "Built active community with 95% positive sentiment"
    ],
    tools: ["Buffer", "Hootsuite", "Canva", "Analytics", "Creator Studio", "Social Listening"],
    category: "Social Media",
    color: "from-pink-500 to-pink-700",
    icon: "Users",
    challenge: "The brand had minimal social media presence with only 2,000 followers and extremely low engagement rates. Content was inconsistent, and there was no clear social media strategy or community management approach.",
    solution: "Developed a comprehensive social media strategy including content pillars, posting schedules, community guidelines, influencer partnerships, and engagement tactics designed to build authentic relationships and drive meaningful growth.",
    timeline: [
      {
        phase: "Strategy & Planning",
        duration: "2 weeks",
        description: "Developed comprehensive social media strategy and content calendar"
      },
      {
        phase: "Content Creation Setup",
        duration: "1 month",
        description: "Created content templates, brand guidelines, and production workflows"
      },
      {
        phase: "Growth Execution",
        duration: "4 months",
        description: "Executed content strategy and community building initiatives"
      },
      {
        phase: "Optimization & Scale",
        duration: "1 month",
        description: "Optimized top-performing content and scaled successful campaigns"
      }
    ],
    order: 9,
    isActive: true
  },
  {
    id: "brand-awareness-campaign",
    title: "Multi-Channel Brand Awareness Campaign",
    subtitle: "85% Brand Recognition Growth",
    description: "A B2B software company needed to increase brand recognition and generate qualified leads in a competitive market segment.",
    fullDescription: "This integrated brand awareness campaign leveraged multiple touchpoints to establish market presence and drive lead generation. Through strategic PR, content marketing, thought leadership, event marketing, and digital advertising, we created a cohesive brand narrative that resonated with target audiences and established the company as a trusted industry leader.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
    metrics: {
      primary: "85%",
      primaryLabel: "Brand Awareness",
      secondary: "8 months",
      secondaryLabel: "Campaign Period"
    },
    results: [
      "Increased brand awareness by 85% in target market segments",
      "Generated 2,800+ qualified leads through integrated campaigns",
      "Achieved 250% increase in organic search traffic",
      "Improved brand sentiment score by 60%",
      "Secured 45+ media mentions and thought leadership features",
      "Established presence at 12 major industry events"
    ],
    tools: ["LinkedIn Ads", "Content Marketing", "SEO", "PR", "Event Marketing", "Brand Monitoring"],
    category: "Brand Marketing",
    color: "from-indigo-500 to-indigo-700",
    icon: "Megaphone",
    challenge: "The B2B software company was virtually unknown in their target market despite having a superior product. They needed to build credibility, establish thought leadership, and generate qualified leads in a crowded, competitive space.",
    solution: "Created an integrated brand awareness strategy combining thought leadership content, strategic PR, industry event participation, and targeted digital advertising to build credibility and establish market presence.",
    timeline: [
      {
        phase: "Brand Positioning",
        duration: "1 month",
        description: "Developed brand messaging, positioning, and competitive differentiation strategy"
      },
      {
        phase: "Content & PR Strategy",
        duration: "1 month",
        description: "Created content strategy and established media relationships"
      },
      {
        phase: "Campaign Execution",
        duration: "5 months",
        description: "Executed integrated campaigns across all channels"
      },
      {
        phase: "Optimization & Scale",
        duration: "1 month",
        description: "Optimized performance and prepared for continued growth"
      }
    ],
    order: 10,
    isActive: true
  }
]

async function migrateCaseStudies() {
  try {
    console.log('Starting case studies migration...')

    for (const caseStudy of hardcodedCaseStudiesToMigrate) {
      // Check if case study already exists
      const existing = await prisma.caseStudy.findUnique({
        where: { id: caseStudy.id }
      })

      if (existing) {
        console.log(`Case study "${caseStudy.title}" already exists. Skipping...`)
        continue
      }

      // Create new case study
      const newCaseStudy = await prisma.caseStudy.create({
        data: {
          id: caseStudy.id,
          title: caseStudy.title,
          subtitle: caseStudy.subtitle,
          description: caseStudy.description,
          fullDescription: caseStudy.fullDescription,
          image: caseStudy.image,
          metrics: JSON.stringify(caseStudy.metrics),
          results: JSON.stringify(caseStudy.results),
          tools: JSON.stringify(caseStudy.tools),
          category: caseStudy.category,
          color: caseStudy.color,
          icon: caseStudy.icon,
          challenge: caseStudy.challenge,
          solution: caseStudy.solution,
          timeline: JSON.stringify(caseStudy.timeline),
          order: caseStudy.order,
          isActive: caseStudy.isActive
        }
      })

      console.log(`✅ Created case study: "${newCaseStudy.title}" (ID: ${newCaseStudy.id})`)
    }

    // Verify total count
    const totalCaseStudies = await prisma.caseStudy.count()
    console.log(`\nMigration completed! Total case studies in database: ${totalCaseStudies}`)

    // List all case studies
    const allCaseStudies = await prisma.caseStudy.findMany({
      orderBy: { order: 'asc' },
      select: { id: true, title: true, order: true, isActive: true }
    })

    console.log('\nAll case studies in database:')
    allCaseStudies.forEach((study, index) => {
      console.log(`${index + 1}. ${study.title} (ID: ${study.id}, Order: ${study.order}, Active: ${study.isActive})`)
    })

  } catch (error) {
    console.error('Error during migration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateCaseStudies()