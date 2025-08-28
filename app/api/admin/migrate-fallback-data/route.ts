import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

// Comprehensive fallback data for migration
const FALLBACK_DATA = {
  // Blog Posts Data
  blogPosts: [
    {
      title: "AI Marketing Transformation: Complete Implementation Guide",
      slug: "ai-marketing-transformation",
      content: `<h2>The Revolution is Here</h2>
        <p>Artificial Intelligence is reshaping marketing as we know it. This comprehensive guide walks you through implementing AI-powered marketing strategies that deliver measurable results.</p>
        <h3>Key Implementation Areas</h3>
        <ul>
          <li>Customer segmentation using machine learning algorithms</li>
          <li>Predictive analytics for campaign optimization</li>
          <li>Automated content personalization</li>
          <li>Real-time bidding optimization</li>
        </ul>
        <h3>Practical Steps</h3>
        <p>Start with data collection and cleansing. Implement tracking pixels across all customer touchpoints to gather behavioral data. Use tools like Google Analytics 4, Facebook Pixel, and custom event tracking to build comprehensive customer profiles.</p>
        <h3>Results You Can Expect</h3>
        <p>Our clients typically see 40-60% improvement in conversion rates and 25-35% reduction in customer acquisition costs within the first 90 days of implementation.</p>`,
      excerpt: "A comprehensive guide to implementing AI-powered marketing strategies that deliver measurable results and transform your digital marketing approach.",
      imageUrl: "/images/blog/ai-marketing.jpg",
      category: "AI & Marketing",
      author: "Edikan Udoibuot",
      published: true,
      publishedAt: new Date('2024-01-15')
    },
    {
      title: "10 Growth Hacking Strategies That Actually Work",
      slug: "growth-hacking-strategies",
      content: `<h2>Growth Hacking in 2024</h2>
        <p>Growth hacking isn't about quick fixes—it's about sustainable, scalable growth strategies backed by data and creativity.</p>
        <h3>Strategy 1: Viral Coefficient Optimization</h3>
        <p>Focus on increasing your viral coefficient above 1.0. For every customer, you need more than one referral to achieve exponential growth.</p>
        <h3>Strategy 2: Product-Led Growth</h3>
        <p>Embed growth mechanisms directly into your product. Slack's team invitation feature is a perfect example—growth happens naturally through product usage.</p>
        <h3>Strategy 3: Content-to-Conversion Funnels</h3>
        <p>Create content that moves users through awareness, consideration, and decision stages systematically.</p>
        <h3>Real Results</h3>
        <p>These strategies helped our clients achieve 300% user growth and 150% revenue increase within 6 months.</p>`,
      excerpt: "Discover 10 proven growth hacking strategies that drive real results, backed by case studies and actionable implementation guides.",
      imageUrl: "/images/blog/growth-hacking.jpg",
      category: "Growth Marketing",
      author: "Edikan Udoibuot",
      published: true,
      publishedAt: new Date('2024-02-01')
    },
    {
      title: "Email Marketing Mastery: 733% Growth Strategy",
      slug: "email-marketing-mastery",
      content: `<h2>The Email Marketing Renaissance</h2>
        <p>Email marketing remains the highest ROI channel in digital marketing. Here's how to master it in 2024.</p>
        <h3>Segmentation Strategies</h3>
        <p>Move beyond basic demographics. Use behavioral triggers, purchase history, engagement patterns, and psychographic data for precise targeting.</p>
        <h3>Automation Workflows</h3>
        <p>Implement these high-converting sequences:</p>
        <ul>
          <li>Welcome series (5-7 emails)</li>
          <li>Abandoned cart recovery (3 emails)</li>
          <li>Win-back campaigns for inactive subscribers</li>
          <li>Post-purchase upsell sequences</li>
        </ul>
        <h3>The 733% Growth Framework</h3>
        <p>Our proprietary framework combines hyper-personalization, predictive send time optimization, and dynamic content blocks to achieve exceptional growth rates.</p>`,
      excerpt: "Master email marketing with our proven framework that achieved 733% subscriber growth and industry-leading engagement rates.",
      imageUrl: "/images/blog/email-marketing.jpg",
      category: "Email Marketing",
      author: "Edikan Udoibuot",
      published: true,
      publishedAt: new Date('2024-02-15')
    }
  ],

  // Case Studies Data
  caseStudies: [
    {
      title: "SaaS Growth Campaign",
      slug: "saas-growth-campaign",
      subtitle: "From 100 to 10,000 Users in 8 Months",
      description: "Complete growth strategy transformation for B2B SaaS startup",
      fullDescription: "Comprehensive growth marketing strategy that transformed a struggling SaaS startup into a market leader through data-driven campaigns and viral growth mechanisms.",
      image: "/images/case-studies/saas-growth.jpg",
      metrics: JSON.stringify({
        "User Growth": "9,900%",
        "Revenue Growth": "1,200%",
        "CAC Reduction": "67%",
        "Viral Coefficient": "1.8"
      }),
      results: "Achieved 10,000 active users, $500K ARR, and successful Series A funding round of $2.5M",
      tools: JSON.stringify(["HubSpot", "Mixpanel", "Hotjar", "Google Analytics", "Mailchimp", "Zapier"]),
      category: "Growth Marketing",
      color: "#43e97b",
      challenge: "Low user adoption, high churn rate (45%), and inefficient acquisition channels were limiting growth potential.",
      solution: "Implemented product-led growth strategy with viral sharing features, optimized onboarding flow, and built referral program with incentives.",
      timeline: JSON.stringify([
        { phase: "Research & Analysis", duration: "Month 1", activities: ["User research", "Competitor analysis", "Growth audit"] },
        { phase: "Strategy Development", duration: "Month 2", activities: ["Growth framework", "Viral mechanics", "Referral system"] },
        { phase: "Implementation", duration: "Months 3-6", activities: ["Product features", "Campaign launch", "Optimization"] },
        { phase: "Scale & Optimize", duration: "Months 7-8", activities: ["A/B testing", "Channel expansion", "Automation"] }
      ]),
      icon: "TrendingUp"
    },
    {
      title: "E-commerce Retention Campaign",
      slug: "ecommerce-retention-campaign", 
      subtitle: "300% Repeat Purchase Rate Increase",
      description: "Advanced retention strategy boosting customer lifetime value",
      fullDescription: "Developed and executed a comprehensive customer retention strategy that transformed one-time buyers into loyal brand advocates through personalized experiences and strategic touchpoints.",
      image: "/images/case-studies/ecommerce-retention.jpg",
      metrics: JSON.stringify({
        "Repeat Purchases": "+300%",
        "Customer LTV": "+185%",
        "Email Engagement": "+220%",
        "Churn Reduction": "58%"
      }),
      results: "Increased customer lifetime value to $347, achieved 68% repeat purchase rate, and reduced churn by 58%",
      tools: JSON.stringify(["Klaviyo", "Shopify Plus", "Yotpo", "Gorgias", "Google Analytics", "Facebook Pixel"]),
      category: "Customer Retention",
      color: "#f093fb",
      challenge: "High customer acquisition costs with low repeat purchase rates were making the business unsustainable.",
      solution: "Built comprehensive retention ecosystem with personalized email flows, loyalty program, and exceptional customer service experience.",
      timeline: JSON.stringify([
        { phase: "Customer Analysis", duration: "Week 1-2", activities: ["Cohort analysis", "Customer journey mapping", "Retention audit"] },
        { phase: "Strategy Design", duration: "Week 3-4", activities: ["Retention framework", "Email workflows", "Loyalty program"] },
        { phase: "Campaign Launch", duration: "Month 2-3", activities: ["Email automation", "Loyalty rollout", "Service optimization"] },
        { phase: "Optimization", duration: "Month 4-6", activities: ["A/B testing", "Personalization", "Advanced segmentation"] }
      ]),
      icon: "Heart"
    },
    {
      title: "Brand Awareness Campaign",
      slug: "brand-awareness-campaign",
      subtitle: "400% Brand Recognition Increase", 
      description: "Multi-channel brand positioning campaign driving market awareness",
      fullDescription: "Executed integrated brand awareness campaign across digital and traditional channels, establishing strong market presence and brand recognition in competitive landscape.",
      image: "/images/case-studies/brand-awareness.jpg",
      metrics: JSON.stringify({
        "Brand Recognition": "+400%",
        "Share of Voice": "+280%",
        "Website Traffic": "+350%",
        "Social Mentions": "+450%"
      }),
      results: "Achieved 85% brand recognition in target market, increased market share by 12%, and generated $1.2M in attributed revenue",
      tools: JSON.stringify(["Brandwatch", "Sprout Social", "Google Ads", "Facebook Ads", "Canva", "Adobe Creative Suite"]),
      category: "Brand Strategy",
      color: "#4facfe",
      challenge: "New product launch in saturated market with established competitors and low initial brand awareness.",
      solution: "Created distinctive brand narrative with consistent messaging across all touchpoints, leveraging content marketing and strategic partnerships.",
      timeline: JSON.stringify([
        { phase: "Brand Research", duration: "Month 1", activities: ["Market analysis", "Competitor research", "Brand positioning"] },
        { phase: "Creative Development", duration: "Month 2", activities: ["Brand identity", "Content strategy", "Campaign creative"] },
        { phase: "Launch Campaign", duration: "Month 3-5", activities: ["Multi-channel launch", "PR outreach", "Influencer partnerships"] },
        { phase: "Amplification", duration: "Month 6-8", activities: ["Paid media scaling", "Content optimization", "Community building"] }
      ]),
      icon: "Megaphone"
    },
    {
      title: "Influencer Outreach Campaign", 
      slug: "influencer-outreach-campaign",
      subtitle: "2M+ Impressions, 50K New Followers",
      description: "Strategic influencer partnerships driving massive brand exposure",
      fullDescription: "Developed and executed comprehensive influencer marketing strategy, building authentic partnerships that generated massive reach and engagement while maintaining brand authenticity.",
      image: "/images/case-studies/influencer-campaign.jpg",
      metrics: JSON.stringify({
        "Total Impressions": "2.1M",
        "New Followers": "52K",
        "Engagement Rate": "8.7%",
        "Conversion Rate": "3.2%"
      }),
      results: "Generated 2.1M impressions, gained 52K quality followers, and achieved $180K in directly attributed revenue",
      tools: JSON.stringify(["Grin", "AspireIQ", "Later", "Google Analytics", "Instagram Analytics", "TikTok Analytics"]),
      category: "Influencer Marketing",
      color: "#fa709a",
      challenge: "Limited brand awareness among target demographic with need for authentic, engaging content that resonates with younger audience.",
      solution: "Identified and partnered with micro and mid-tier influencers whose audiences perfectly matched target demographics, focusing on authentic storytelling.",
      timeline: JSON.stringify([
        { phase: "Influencer Research", duration: "Week 1-3", activities: ["Audience analysis", "Influencer vetting", "Partnership strategy"] },
        { phase: "Outreach & Negotiation", duration: "Week 4-6", activities: ["Partnership outreach", "Contract negotiation", "Content briefs"] },
        { phase: "Content Creation", duration: "Month 2-3", activities: ["Content production", "Review process", "Publishing schedule"] },
        { phase: "Campaign Optimization", duration: "Month 4", activities: ["Performance tracking", "Audience engagement", "ROI analysis"] }
      ]),
      icon: "Users"
    }
  ],

  // Projects Data  
  projects: [
    {
      title: "AI Marketing Automation Suite",
      slug: "ai-marketing-automation-suite",
      description: "Comprehensive AI-powered marketing automation platform with predictive analytics, dynamic content personalization, and multi-channel campaign orchestration.",
      image: "/images/projects/ai-automation.jpg",
      technologies: JSON.stringify(["Python", "TensorFlow", "React", "Node.js", "PostgreSQL", "Redis", "Docker"]),
      githubUrl: "https://github.com/example/ai-marketing-suite",
      liveUrl: "https://ai-marketing-suite.demo.com",
      category: "tool",
      order: 1
    },
    {
      title: "Growth Analytics Dashboard", 
      slug: "growth-analytics-dashboard",
      description: "Real-time marketing performance dashboard with advanced attribution modeling, cohort analysis, and predictive growth forecasting.",
      image: "/images/projects/analytics-dashboard.jpg",
      technologies: JSON.stringify(["Next.js", "TypeScript", "D3.js", "Chart.js", "Prisma", "PostgreSQL"]),
      githubUrl: "https://github.com/example/growth-analytics",
      liveUrl: "https://growth-dashboard.demo.com",
      category: "tool",
      order: 2
    },
    {
      title: "Email Campaign Optimizer",
      slug: "email-campaign-optimizer", 
      description: "AI-powered email marketing optimization tool with A/B testing, send time optimization, and dynamic content personalization.",
      image: "/images/projects/email-optimizer.jpg",
      technologies: JSON.stringify(["Vue.js", "Python", "FastAPI", "MySQL", "Redis", "Celery"]),
      githubUrl: "https://github.com/example/email-optimizer",
      liveUrl: "https://email-optimizer.demo.com",
      category: "tool",
      order: 3
    },
    {
      title: "Content Automation Workflow",
      slug: "content-automation-workflow",
      description: "Automated content creation and distribution system using AI for content generation, optimization, and multi-channel publishing.",
      image: "/images/projects/content-workflow.jpg", 
      technologies: JSON.stringify(["React", "Node.js", "OpenAI API", "MongoDB", "AWS Lambda", "Zapier"]),
      githubUrl: "https://github.com/example/content-automation",
      liveUrl: "https://content-automation.demo.com",
      category: "workflow",
      order: 4
    }
  ],

  // Skills Categories Data
  skillCategories: [
    {
      title: "Strategic Leadership",
      description: "Leading cross-functional teams and driving organizational growth",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      skills: JSON.stringify([
        { name: "Cross-functional Team Leadership", proficiency: 95 },
        { name: "Stakeholder Management", proficiency: 92 },
        { name: "Budget Management", proficiency: 88 },
        { name: "Retention Strategy", proficiency: 90 }
      ]),
      order: 1
    },
    {
      title: "AI & Marketing Automation",
      description: "Leveraging AI and automation for enhanced marketing performance",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      skills: JSON.stringify([
        { name: "Generative AI", proficiency: 94 },
        { name: "ChatGPT, Claude, etc", proficiency: 96 },
        { name: "Marketing Automation", proficiency: 91 },
        { name: "Prompt Engineering", proficiency: 93 }
      ]),
      order: 2
    },
    {
      title: "Growth Marketing",
      description: "Data-driven growth strategies and customer acquisition",
      color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      skills: JSON.stringify([
        { name: "Growth Marketing", proficiency: 94 },
        { name: "GTM Strategy", proficiency: 91 },
        { name: "Customer Acquisition", proficiency: 93 },
        { name: "Product Positioning", proficiency: 88 }
      ]),
      order: 3
    }
  ],

  // Tools Data
  tools: [
    { name: 'HubSpot', description: 'CRM and Marketing Automation', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/hubspot.svg', category: 'Marketing', color: '#ff7a59', order: 1 },
    { name: 'Google Analytics', description: 'Web Analytics', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googleanalytics.svg', category: 'Analytics', color: '#e37400', order: 2 },
    { name: 'Meta Ads', description: 'Social Media Advertising', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/meta.svg', category: 'Advertising', color: '#0866ff', order: 3 },
    { name: 'LinkedIn Ads', description: 'Professional Network Advertising', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg', category: 'Advertising', color: '#0a66c2', order: 4 },
    { name: 'Google Ads', description: 'Search and Display Advertising', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googleads.svg', category: 'Advertising', color: '#4285f4', order: 5 },
    { name: 'Mailchimp', description: 'Email Marketing Platform', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mailchimp.svg', category: 'Email Marketing', color: '#ffe01b', order: 6 },
    { name: 'Salesforce', description: 'Customer Relationship Management', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/salesforce.svg', category: 'CRM', color: '#00a1e0', order: 7 },
    { name: 'Canva', description: 'Graphic Design Platform', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/canva.svg', category: 'Design', color: '#00c4cc', order: 8 }
  ]
}

// POST - Migrate all fallback data to database
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    // First, test database connection
    await prisma.$queryRaw`SELECT 1 as test`
    
    const results = {
      blogPosts: 0,
      caseStudies: 0, 
      projects: 0,
      skillCategories: 0,
      tools: 0,
      errors: [] as string[]
    }

    // Migrate Blog Posts
    try {
      for (const post of FALLBACK_DATA.blogPosts) {
        await prisma.blogPost.upsert({
          where: { slug: post.slug },
          update: {
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            imageUrl: post.imageUrl,
            category: post.category,
            author: post.author,
            published: post.published,
            publishedAt: post.publishedAt
          },
          create: post
        })
        results.blogPosts++
      }
    } catch (error) {
      results.errors.push(`Blog posts migration error: ${error}`)
    }

    // Migrate Case Studies
    try {
      for (const caseStudy of FALLBACK_DATA.caseStudies) {
        await prisma.caseStudy.upsert({
          where: { slug: caseStudy.slug },
          update: caseStudy,
          create: caseStudy
        })
        results.caseStudies++
      }
    } catch (error) {
      results.errors.push(`Case studies migration error: ${error}`)
    }

    // Migrate Projects
    try {
      for (const project of FALLBACK_DATA.projects) {
        await prisma.project.upsert({
          where: { slug: project.slug },
          update: project,
          create: project
        })
        results.projects++
      }
    } catch (error) {
      results.errors.push(`Projects migration error: ${error}`)
    }

    // Migrate Skill Categories
    try {
      for (const category of FALLBACK_DATA.skillCategories) {
        await prisma.skillCategory.upsert({
          where: { id: `skill-${category.order}` },
          update: category,
          create: {
            id: `skill-${category.order}`,
            ...category
          }
        })
        results.skillCategories++
      }
    } catch (error) {
      results.errors.push(`Skill categories migration error: ${error}`)
    }

    // Migrate Tools
    try {
      for (const tool of FALLBACK_DATA.tools) {
        await prisma.tool.upsert({
          where: { id: `tool-${tool.order}` },
          update: tool,
          create: {
            id: `tool-${tool.order}`,
            ...tool
          }
        })
        results.tools++
      }
    } catch (error) {
      results.errors.push(`Tools migration error: ${error}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Data migration completed successfully',
      data: results
    })

  } catch (error) {
    console.error('Data migration error:', error)
    
    let errorMessage = 'Failed to migrate data'
    let detailedError = error instanceof Error ? error.message : 'Unknown error'
    
    // Provide specific error messages for common issues
    if (detailedError.includes('file:')) {
      errorMessage = 'Database configuration error: SQLite not supported on Vercel'
      detailedError = 'Please set up PostgreSQL database in Vercel dashboard and configure DATABASE_URL environment variable'
    } else if (detailedError.includes('connect ECONNREFUSED')) {
      errorMessage = 'Database connection refused'
      detailedError = 'Cannot connect to database. Please check DATABASE_URL and ensure database is accessible'
    } else if (detailedError.includes('password authentication failed')) {
      errorMessage = 'Database authentication failed'
      detailedError = 'Invalid database credentials in DATABASE_URL'
    } else if (detailedError.includes('database') && detailedError.includes('does not exist')) {
      errorMessage = 'Database does not exist'
      detailedError = 'Please create the database or check DATABASE_URL'
    }
    
    return NextResponse.json(
      { success: false, message: errorMessage, error: detailedError },
      { status: 500 }
    )
  }
})