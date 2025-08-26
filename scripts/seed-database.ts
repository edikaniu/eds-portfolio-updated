#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  console.log('🧹 Clearing existing data...')
  await prisma.project.deleteMany()
  await prisma.caseStudy.deleteMany()
  await prisma.experienceEntry.deleteMany()
  await prisma.skillCategory.deleteMany()
  await prisma.tool.deleteMany()
  await prisma.contentSection.deleteMany()

  // Seed Hero Section Content
  console.log('👤 Seeding hero content...')
  await prisma.contentSection.create({
    data: {
      sectionName: 'hero',
      content: JSON.stringify({
        name: "Edikan Udoibuot",
        roles: [
          "Marketing & Growth Leader",
          "AI-Powered Marketing Strategist",
          "Product Growth Expert",
          "Vibe Marketing Practitioner",
          "Full-stack Marketer",
        ],
        tagline: "7+ years scaling products from hundreds to thousands of users through data-driven growth strategies and AI-powered marketing",
        profileImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ed%27s%20Passport.png-x6NE3irYLKlWGZnSaeBC1W5rrT8PmW.jpeg",
        email: "edikanudoibuot@gmail.com",
        linkedin: "https://www.linkedin.com/in/edikanudoibuot/",
        twitter: "https://x.com/edikanudoibuot"
      }),
      isActive: true,
    }
  })

  // Seed Case Studies
  console.log('📊 Seeding case studies...')
  const caseStudies = [
    {
      title: "AI-Driven Content Strategy",
      slug: "ai-driven-content-strategy",
      subtitle: "Scaling organic traffic with AI-powered content",
      description: "Implemented AI-powered content generation and optimization strategies that increased organic traffic by 200% while maintaining quality and brand consistency.",
      fullDescription: "This comprehensive AI-driven content strategy involved implementing automated content generation workflows, AI-powered SEO optimization, and smart content personalization. The approach combined human creativity with AI efficiency to scale content production without sacrificing quality.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
      metrics: JSON.stringify({
        primary: "200%",
        primaryLabel: "Traffic Growth",
        secondary: "4 months",
        secondaryLabel: "Timeline"
      }),
      results: JSON.stringify([
        "Implemented AI-powered content workflows reducing creation time by 60%",
        "Achieved 200% organic traffic growth in 4 months",
        "Maintained 95% content quality score while scaling production",
        "Generated 300+ high-quality blog posts and landing pages"
      ]),
      tools: JSON.stringify([
        "ChatGPT", "Claude AI", "Jasper", "SEMrush", "Ahrefs", "Google Analytics"
      ]),
      category: "AI & Automation",
      color: "from-blue-500 to-purple-600",
      challenge: "The company needed to scale content production to compete in a crowded market while maintaining quality and brand voice consistency.",
      solution: "Developed an AI-assisted content workflow combining automated generation with human oversight, ensuring scalability without compromising quality.",
      timeline: JSON.stringify([
        {
          phase: "Research & Strategy",
          duration: "2 weeks",
          description: "Analyzed content gaps and developed AI integration strategy"
        },
        {
          phase: "Implementation",
          duration: "6 weeks",
          description: "Built AI workflows and trained team on new processes"
        },
        {
          phase: "Optimization",
          duration: "8 weeks",
          description: "Refined processes and measured performance improvements"
        }
      ]),
      icon: "Bot",
      order: 1,
      isActive: true
    },
    {
      title: "Email Marketing Transformation",
      slug: "email-marketing-transformation",
      subtitle: "733% subscriber growth through strategic automation",
      description: "Transformed email marketing strategy from basic newsletters to sophisticated automation workflows, achieving 733% subscriber growth and 5x engagement rates.",
      fullDescription: "A complete overhaul of the email marketing approach, implementing advanced segmentation, personalization, and automated workflows that dramatically improved subscriber acquisition and engagement.",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop",
      metrics: JSON.stringify({
        primary: "733%",
        primaryLabel: "Subscriber Growth",
        secondary: "3 months",
        secondaryLabel: "Timeline"
      }),
      results: JSON.stringify([
        "Grew email list from 3,000 to 25,000 subscribers in 3 months",
        "Achieved 45% open rates vs industry average of 18%",
        "Generated $200K+ in attributed revenue",
        "Reduced unsubscribe rate by 60% through better targeting"
      ]),
      tools: JSON.stringify([
        "HubSpot", "Mailchimp", "ConvertKit", "Zapier", "Google Analytics"
      ]),
      category: "Email Marketing",
      color: "from-green-500 to-emerald-600",
      challenge: "Low email engagement rates and slow subscriber growth were limiting the company's direct marketing capabilities.",
      solution: "Implemented sophisticated email automation workflows with advanced segmentation and personalization strategies.",
      timeline: JSON.stringify([
        {
          phase: "Audit & Strategy",
          duration: "1 week",
          description: "Analyzed existing email performance and developed new strategy"
        },
        {
          phase: "Automation Setup",
          duration: "3 weeks",
          description: "Built complex automation workflows and segmentation"
        },
        {
          phase: "Launch & Optimize",
          duration: "8 weeks",
          description: "Deployed campaigns and continuously optimized performance"
        }
      ]),
      icon: "Mail",
      order: 2,
      isActive: true
    },
    {
      title: "Social Media Growth Engine",
      slug: "social-media-growth-engine",
      subtitle: "70K+ followers through strategic content & community",
      description: "Built and executed a comprehensive social media strategy that generated 70,000+ new followers and 80% brand awareness growth across multiple platforms.",
      fullDescription: "A multi-platform social media growth strategy focusing on community building, engaging content creation, and strategic partnerships to drive massive audience growth.",
      image: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&h=600&fit=crop",
      metrics: JSON.stringify({
        primary: "70K+",
        primaryLabel: "New Followers",
        secondary: "6 months",
        secondaryLabel: "Timeline"
      }),
      results: JSON.stringify([
        "Added 70,000+ new followers across all platforms",
        "Achieved 80% brand awareness growth",
        "Generated 500K+ post impressions monthly",
        "Built engaged community with 12% average engagement rate"
      ]),
      tools: JSON.stringify([
        "Buffer", "Hootsuite", "Canva", "Later", "Sprout Social", "Analytics Tools"
      ]),
      category: "Social Media",
      color: "from-pink-500 to-rose-600",
      challenge: "Low social media presence and engagement were limiting brand visibility and community building efforts.",
      solution: "Developed comprehensive social media strategy with consistent posting, community engagement, and strategic content planning.",
      timeline: JSON.stringify([
        {
          phase: "Strategy Development",
          duration: "2 weeks",
          description: "Created comprehensive social media strategy and content calendar"
        },
        {
          phase: "Content Creation",
          duration: "4 weeks",
          description: "Produced high-quality content and established posting rhythm"
        },
        {
          phase: "Community Building",
          duration: "20 weeks",
          description: "Focused on engagement and audience growth optimization"
        }
      ]),
      icon: "Users",
      order: 3,
      isActive: true
    },
    {
      title: "Conversion Rate Optimization",
      slug: "conversion-rate-optimization",
      subtitle: "5X ROAS through systematic testing & optimization",
      description: "Implemented comprehensive CRO strategy using A/B testing, user research, and data analysis to achieve 5X return on ad spend and 300% conversion improvement.",
      fullDescription: "A data-driven approach to conversion optimization involving systematic testing, user behavior analysis, and iterative improvements across the entire customer journey.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
      metrics: JSON.stringify({
        primary: "5X",
        primaryLabel: "ROAS",
        secondary: "300%",
        secondaryLabel: "Conversion Increase"
      }),
      results: JSON.stringify([
        "Achieved 5X return on advertising spend",
        "Improved conversion rates by 300% across key funnels",
        "Reduced customer acquisition cost by 40%",
        "Generated additional $500K in revenue through optimizations"
      ]),
      tools: JSON.stringify([
        "Google Optimize", "Hotjar", "Mixpanel", "Google Analytics", "Unbounce"
      ]),
      category: "Conversion Optimization",
      color: "from-orange-500 to-red-600",
      challenge: "Low conversion rates and high customer acquisition costs were limiting growth potential and profitability.",
      solution: "Implemented systematic A/B testing program with user research insights to optimize the entire conversion funnel.",
      timeline: JSON.stringify([
        {
          phase: "Analysis & Research",
          duration: "2 weeks",
          description: "Conducted user research and identified optimization opportunities"
        },
        {
          phase: "Testing Implementation",
          duration: "8 weeks",
          description: "Set up testing framework and launched initial experiments"
        },
        {
          phase: "Optimization & Scale",
          duration: "12 weeks",
          description: "Continuously tested and optimized based on results"
        }
      ]),
      icon: "TrendingUp",
      order: 4,
      isActive: true
    }
  ]

  for (const study of caseStudies) {
    await prisma.caseStudy.create({ data: study })
  }

  // Seed Experience Entries
  console.log('💼 Seeding experience entries...')
  const experiences = [
    {
      title: "Marketing Manager",
      company: "Suretree Systems",
      period: "Aug 2023 - Present",
      type: "Full-time",
      category: "work",
      achievements: JSON.stringify([
        "Implemented AI-powered initiatives boosting team productivity by 20%",
        "Increased organic traffic by 200% in 4 months through AI-enhanced content strategies",
        "Reduced unqualified leads by 40% using HubSpot-based lead scoring system",
        "Increased conversion rates by 30% through performance tracking and optimization",
      ]),
      metrics: "20% Productivity Boost",
      icon: "zap",
      color: "from-primary to-blue-600",
      order: 1,
      isActive: true
    },
    {
      title: "Head, Integrated Communications",
      company: "Household of David",
      period: "Sep 2023 - Present",
      type: "Leadership",
      category: "work",
      achievements: JSON.stringify([
        "Delivered 80% brand awareness growth via PR and content strategy during organizational pivot",
        "Led team of 60+ volunteers creating multimedia content aligned with brand mission",
        "Grew social audience by 70,000+ followers in 6 months through engagement optimization",
      ]),
      metrics: "80% Brand Growth",
      icon: "trending-up",
      color: "from-accent to-purple-600",
      order: 2,
      isActive: true
    },
    {
      title: "Product Marketing Lead",
      company: "Suretree Systems",
      period: "Nov 2022 - Jul 2023",
      type: "Full-time",
      category: "work",
      achievements: JSON.stringify([
        "Planned and executed multi-channel campaigns across Meta, LinkedIn, Twitter, Google",
        "Achieved aggressive demand generation targets through data-driven strategies",
        "Developed product messaging and positioning for key features",
        "Coordinated with product and engineering teams for seamless marketing execution",
      ]),
      metrics: "Multi-Channel Growth",
      icon: "target",
      color: "from-green-500 to-emerald-600",
      order: 3,
      isActive: true
    },
    {
      title: "Head, Social Media & Communications",
      company: "Household of David",
      period: "Sep 2022 - Aug 2023",
      type: "Leadership",
      category: "work",
      achievements: JSON.stringify([
        "Achieved 60% engagement growth and expanded followership by 75%",
        "Added 50,000+ new followers across digital channels in one year",
        "Led team producing high-quality weekly newsletters and multimedia content",
        "Monitored trends and audience behavior to optimize campaign execution",
      ]),
      metrics: "50K+ Followers",
      icon: "trending-up",
      color: "from-blue-500 to-indigo-600",
      order: 4,
      isActive: true
    },
    {
      title: "Senior Campaign Manager",
      company: "Suretree Systems",
      period: "Jul 2022 - Nov 2022",
      type: "Full-time",
      category: "work",
      achievements: JSON.stringify([
        "Achieved 733% growth in email subscribers (3,000 to 25,000 in 3 months)",
        "Scaled product users from 100 to 10,000+ in 2 months via integrated strategy",
        "Increased platform registrations from 150 to 3,000+ in one month",
        "Managed campaign budgets while reducing customer acquisition costs (CAC)",
      ]),
      metrics: "733% Email Growth",
      icon: "zap",
      color: "from-orange-500 to-red-500",
      order: 5,
      isActive: true
    },
    {
      title: "Growth Marketing Lead",
      company: "Sogital Digital Agency",
      period: "Jun 2020 - Jan 2022",
      type: "Full-time",
      category: "work",
      achievements: JSON.stringify([
        "Designed chatbot-driven funnel generating 4,500+ qualified leads in 3 months",
        "Delivered 5X ROAS for three clients through full-funnel growth tactics",
        "Used marketing analytics to build culture of data-driven experimentation",
        "Provided strategic marketing consulting to B2B and B2C clients",
      ]),
      metrics: "5X ROAS",
      icon: "target",
      color: "from-purple-500 to-pink-600",
      order: 6,
      isActive: true
    },
    {
      title: "Digital Strategist & Content Manager",
      company: "Household of David",
      period: "Jun 2020 - Jan 2022",
      type: "Full-time",
      category: "work",
      achievements: JSON.stringify([
        "Led digital campaigns for 3 major conferences generating 5,000+ leads each",
        "Achieved 68%+ physical attendance, 20,000+ online attendees per event",
        "Generated post-event reach exceeding 500,000 across digital channels",
        "Developed brand communications and content strategies for audience engagement",
      ]),
      metrics: "500K+ Reach",
      icon: "trending-up",
      color: "from-cyan-500 to-blue-600",
      order: 7,
      isActive: true
    },
    {
      title: "Senior Digital Marketing Executive",
      company: "Polo Limited",
      period: "Oct 2019 - Jan 2020",
      type: "Full-time",
      category: "work",
      achievements: JSON.stringify([
        "Managed luxury brand campaigns for Rolex, Gucci, Cartier, and Swarovski",
        "Generated and qualified 600+ luxury leads in 7 months (5X growth)",
        "Achieved 100X ROAS through targeted digital marketing activities",
        "Improved email open rates by 40% and click-through rates by 30%",
      ]),
      metrics: "100X ROAS",
      icon: "zap",
      color: "from-yellow-500 to-orange-600",
      order: 8,
      isActive: true
    },
    {
      title: "Digital Marketing Strategist",
      company: "TOY Media Agency",
      period: "Jun 2018 - Aug 2019",
      type: "Full-time",
      category: "work",
      achievements: JSON.stringify([
        "Served as strategic advisor aligning digital marketing with business goals",
        "Developed tailored campaign strategies for multiple clients",
        "Ensured alignment with audience segments and performance objectives",
        "Maximized ROI and brand impact through strategic planning",
      ]),
      metrics: "Strategic Growth",
      icon: "target",
      color: "from-teal-500 to-green-600",
      order: 9,
      isActive: true
    },
    // Education entries
    {
      title: "Masters in Sales & Marketing",
      company: "Rome Business School",
      period: "2024 - 2026",
      type: "Master's Degree",
      category: "education",
      achievements: JSON.stringify([
        "Advanced coursework in strategic marketing and sales management",
        "Focus on digital transformation and AI in marketing",
        "International business perspective and global market analysis",
      ]),
      metrics: "In Progress",
      icon: "graduation-cap",
      color: "from-primary to-blue-600",
      order: 10,
      isActive: true
    },
    {
      title: "Product Marketing Diploma",
      company: "AltSchool Africa",
      period: "2024",
      type: "Certification",
      category: "education",
      achievements: JSON.stringify([
        "Specialized in product positioning and go-to-market strategies",
        "Completed advanced coursework in user research and market analysis",
        "Developed expertise in product-led growth methodologies",
      ]),
      metrics: "Product Marketing",
      icon: "graduation-cap",
      color: "from-green-500 to-emerald-600",
      order: 11,
      isActive: true
    },
    {
      title: "Blockchain Revolution Certificate",
      company: "INSEAD",
      period: "2022",
      type: "Certification",
      category: "education",
      achievements: JSON.stringify([
        "Gained expertise in blockchain technology and business applications",
        "Studied cryptocurrency markets and decentralized finance (DeFi)",
        "Completed capstone project on blockchain in marketing",
      ]),
      metrics: "Blockchain Expert",
      icon: "graduation-cap",
      color: "from-blue-500 to-indigo-600",
      order: 12,
      isActive: true
    },
    {
      title: "B.Eng Mechanical Engineering",
      company: "University of Nigeria",
      period: "2012 - 2016",
      type: "Bachelor's Degree",
      category: "education",
      achievements: JSON.stringify([
        "Strong foundation in analytical thinking and problem-solving",
        "Developed project management and technical skills",
        "Graduated with focus on systems optimization",
      ]),
      metrics: "Engineering Foundation",
      icon: "graduation-cap",
      color: "from-gray-500 to-slate-600",
      order: 13,
      isActive: true
    }
  ]

  for (const experience of experiences) {
    await prisma.experienceEntry.create({ data: experience })
  }

  // Seed Skill Categories
  console.log('🎯 Seeding skill categories...')
  const skillCategories = [
    {
      title: "Leadership & Strategy",
      description: "Executive leadership and strategic planning capabilities",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      skills: JSON.stringify([
        { name: "Cross-functional Team Leadership", proficiency: 95 },
        { name: "Stakeholder Management", proficiency: 90 },
        { name: "Budget Management", proficiency: 85 },
        { name: "Retention Strategy", proficiency: 88 }
      ]),
      order: 1,
      isActive: true
    },
    {
      title: "AI & Automation",
      description: "Leveraging artificial intelligence for marketing excellence",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      skills: JSON.stringify([
        { name: "Generative AI", proficiency: 95 },
        { name: "ChatGPT, Claude, etc", proficiency: 90 },
        { name: "Marketing Automation", proficiency: 88 },
        { name: "Prompt Engineering", proficiency: 85 }
      ]),
      order: 2,
      isActive: true
    },
    {
      title: "Brand & Communications",
      description: "Building and managing compelling brand narratives",
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      skills: JSON.stringify([
        { name: "Brand Strategy", proficiency: 92 },
        { name: "Public Relations", proficiency: 88 },
        { name: "Content Strategy", proficiency: 90 },
        { name: "Crisis Communication", proficiency: 85 }
      ]),
      order: 3,
      isActive: true
    },
    {
      title: "Growth Marketing",
      description: "Data-driven growth strategies and execution",
      color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      skills: JSON.stringify([
        { name: "Growth Marketing", proficiency: 95 },
        { name: "GTM Strategy", proficiency: 90 },
        { name: "Customer Acquisition", proficiency: 88 },
        { name: "Product Positioning", proficiency: 85 }
      ]),
      order: 4,
      isActive: true
    },
    {
      title: "Analytics & Optimization",
      description: "Performance measurement and continuous improvement",
      color: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      skills: JSON.stringify([
        { name: "Marketing Analytics", proficiency: 90 },
        { name: "Performance Tracking", proficiency: 88 },
        { name: "A/B Testing", proficiency: 85 },
        { name: "Data Visualization", proficiency: 82 }
      ]),
      order: 5,
      isActive: true
    },
    {
      title: "Campaign Management",
      description: "End-to-end campaign planning and execution",
      color: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      skills: JSON.stringify([
        { name: "Integrated Marketing Campaigns", proficiency: 92 },
        { name: "Partnership Development", proficiency: 88 },
        { name: "Event Marketing", proficiency: 85 },
        { name: "CRM", proficiency: 90 }
      ]),
      order: 6,
      isActive: true
    }
  ]

  for (const category of skillCategories) {
    await prisma.skillCategory.create({ data: category })
  }

  // Seed Tools
  console.log('🛠️ Seeding tools...')
  const tools = [
    // Marketing & Analytics
    { name: "HubSpot", description: "CRM and Marketing Platform", logoUrl: "https://cdn.simpleicons.org/hubspot", category: "Marketing", color: "#ff7a59", order: 1 },
    { name: "Google Analytics", description: "Web Analytics", logoUrl: "https://cdn.simpleicons.org/googleanalytics", category: "Analytics", color: "#e37400", order: 2 },
    { name: "Salesforce", description: "CRM Platform", logoUrl: "https://cdn.simpleicons.org/salesforce", category: "CRM", color: "#00a1e0", order: 3 },
    { name: "Mailchimp", description: "Email Marketing", logoUrl: "https://cdn.simpleicons.org/mailchimp", category: "Email", color: "#ffe01b", order: 4 },
    { name: "SEMrush", description: "SEO & Marketing", logoUrl: "https://cdn.simpleicons.org/semrush", category: "SEO", color: "#ff642d", order: 5 },
    
    // Social Media
    { name: "Buffer", description: "Social Media Management", logoUrl: "https://cdn.simpleicons.org/buffer", category: "Social", color: "#168eea", order: 6 },
    { name: "Hootsuite", description: "Social Media Management", logoUrl: "https://cdn.simpleicons.org/hootsuite", category: "Social", color: "#143d59", order: 7 },
    
    // Design & Content
    { name: "Canva", description: "Design Platform", logoUrl: "https://cdn.simpleicons.org/canva", category: "Design", color: "#00c4cc", order: 8 },
    { name: "Figma", description: "Design Tool", logoUrl: "https://cdn.simpleicons.org/figma", category: "Design", color: "#f24e1e", order: 9 },
    
    // AI & Automation
    { name: "ChatGPT", description: "AI Assistant", logoUrl: "https://cdn.simpleicons.org/openai", category: "AI", color: "#412991", order: 10 },
    { name: "Zapier", description: "Automation Platform", logoUrl: "https://cdn.simpleicons.org/zapier", category: "Automation", color: "#ff4a00", order: 11 },
    
    // Development & Tools
    { name: "Notion", description: "Productivity Platform", logoUrl: "https://cdn.simpleicons.org/notion", category: "Productivity", color: "#000000", order: 12 },
    { name: "Slack", description: "Team Communication", logoUrl: "https://cdn.simpleicons.org/slack", category: "Communication", color: "#4a154b", order: 13 },
    { name: "Zoom", description: "Video Conferencing", logoUrl: "https://cdn.simpleicons.org/zoom", category: "Communication", color: "#2d8cff", order: 14 },
    { name: "Airtable", description: "Database Platform", logoUrl: "https://cdn.simpleicons.org/airtable", category: "Database", color: "#18bfff", order: 15 },
    { name: "Typeform", description: "Form Builder", logoUrl: "https://cdn.simpleicons.org/typeform", category: "Forms", color: "#262627", order: 16 }
  ]

  for (const tool of tools) {
    await prisma.tool.create({
      data: {
        ...tool,
        isActive: true
      }
    })
  }

  // Seed sample projects (empty initially, to be managed via admin)
  console.log('🚀 Seeding initial projects...')
  const projects = [
    {
      title: "AI Marketing Automation Suite",
      slug: "ai-marketing-automation-suite",
      description: "Comprehensive marketing automation platform leveraging AI for personalized campaigns and lead nurturing.",
      technologies: JSON.stringify(["Next.js", "TypeScript", "OpenAI API", "HubSpot API", "PostgreSQL"]),
      githubUrl: "https://github.com/example/ai-marketing-suite",
      liveUrl: "https://ai-marketing-suite.demo.com",
      category: "AI Tools",
      order: 1,
      isActive: true
    },
    {
      title: "Growth Analytics Dashboard",
      slug: "growth-analytics-dashboard",
      description: "Real-time dashboard for tracking marketing performance across multiple channels and campaigns.",
      technologies: JSON.stringify(["React", "D3.js", "Node.js", "Google Analytics API", "Chart.js"]),
      githubUrl: "https://github.com/example/growth-dashboard",
      liveUrl: "https://growth-dashboard.demo.com",
      category: "Analytics",
      order: 2,
      isActive: true
    }
  ]

  for (const project of projects) {
    await prisma.project.create({ data: project })
  }

  console.log('✅ Database seeding completed successfully!')
  console.log(`
  📊 Seeded:
  - ${caseStudies.length} case studies
  - ${experiences.length} experience entries  
  - ${skillCategories.length} skill categories
  - ${tools.length} tools
  - ${projects.length} projects
  - 1 hero section content
  `)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })