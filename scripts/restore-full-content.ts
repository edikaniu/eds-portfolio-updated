import { prisma } from '../lib/prisma'

async function restoreFullContent() {
  console.log('🔄 Starting full content restoration...')
  
  try {
    // Clear existing content
    await prisma.caseStudy.deleteMany()
    await prisma.project.deleteMany()
    console.log('🗑️ Cleared existing content')
    
    // Restore all case studies
    const caseStudies = [
      {
        slug: "ai-marketing-transformation",
        title: "AI-Powered Marketing Transformation",
        subtitle: "Revolutionizing Marketing Workflows with AI",
        description: "Implemented comprehensive AI automation across marketing operations, resulting in significant productivity gains and workflow optimization.",
        fullDescription: "This groundbreaking AI transformation project revolutionized how marketing teams approach their daily operations across multiple client organizations. By implementing a comprehensive suite of AI tools and automation platforms, we fundamentally changed how marketing professionals create content, analyze data, and execute campaigns.",
        category: "AI & Automation",
        color: "from-accent to-purple-600",
        icon: "Bot",
        challenge: "Marketing teams across multiple organizations were spending 70% of their time on repetitive, manual tasks like data entry, report generation, and basic content formatting. This left minimal time for strategic thinking, creative work, and high-impact initiatives that drive real business growth.",
        solution: "Developed and implemented a comprehensive AI automation framework that included intelligent content generation, automated reporting systems, smart workflow optimization, and AI-enhanced processes across all marketing channels. The solution focused on maintaining quality while dramatically improving efficiency.",
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
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop"
      },
      {
        slug: "user-growth-campaign",
        title: "10,000+ User Growth Campaign",
        subtitle: "Explosive User Acquisition Strategy",
        description: "Executed a comprehensive growth campaign that scaled user base from 100 to over 10,000 users through strategic PPC, email automation, and social media marketing.",
        fullDescription: "This explosive user growth campaign was designed to rapidly scale a fintech startup's user base through a sophisticated multi-channel approach. The strategy combined data-driven PPC campaigns, advanced email automation sequences, and targeted social media marketing to create a powerful user acquisition engine.",
        category: "Growth Marketing",
        color: "from-primary to-blue-600",
        icon: "TrendingUp",
        challenge: "The fintech startup had a solid product with strong product-market fit but struggled with user acquisition, having only 100 active users despite being in the market for 6 months. They needed rapid, sustainable growth while maintaining quality users and optimizing acquisition costs.",
        solution: "Developed an integrated growth strategy combining paid advertising across multiple channels, content marketing, email automation, and social proof to create multiple touchpoints and conversion opportunities throughout the entire customer journey.",
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
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
      },
      {
        slug: "email-list-growth",
        title: "Email List Explosion",
        subtitle: "733% Email Subscriber Growth",
        description: "Developed and executed a strategic email marketing campaign that grew the subscriber base from 3,000 to 25,000 subscribers in just 3 months.",
        fullDescription: "This comprehensive email marketing transformation focused on building a highly engaged subscriber base through strategic lead magnets, optimized opt-in forms, and compelling content offers. The campaign utilized advanced segmentation, personalization, and automation to not only grow the list exponentially but also maintain high engagement rates and drive significant revenue growth through email marketing.",
        category: "Email Marketing",
        color: "from-green-500 to-emerald-600",
        icon: "Mail",
        challenge: "The existing email list of 3,000 subscribers had very low engagement rates with minimal revenue contribution. Most subscribers were inactive, open rates were below 18%, and the company was struggling to grow their list organically while maintaining quality subscribers.",
        solution: "Implemented a comprehensive email marketing strategy with targeted lead magnets, segmented campaigns, automated sequences, and optimized opt-in forms designed to attract, engage, and convert subscribers while maintaining high deliverability and engagement rates.",
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
        image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=600&h=400&fit=crop"
      },
      {
        slug: "organic-traffic-growth",
        title: "Organic Traffic Surge",
        subtitle: "200% Organic Growth Strategy",
        description: "Implemented AI-enhanced content distribution strategy that resulted in a 200% increase in organic traffic within 4 months.",
        fullDescription: "This comprehensive organic growth strategy leveraged AI-enhanced content creation and distribution to dramatically increase organic search traffic and engagement. The campaign focused on creating high-quality, SEO-optimized content that resonated with target audiences while utilizing AI tools to scale content production without sacrificing quality.",
        category: "SEO & Content",
        color: "from-orange-500 to-red-500",
        icon: "Search",
        challenge: "The website had minimal organic visibility with low search rankings and limited content strategy. Organic traffic was stagnant, and the company was heavily dependent on paid advertising for lead generation, resulting in high customer acquisition costs.",
        solution: "Developed a comprehensive SEO and content strategy that combined AI-enhanced content creation with technical optimization, strategic keyword targeting, and systematic content distribution to build sustainable organic growth.",
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
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"
      },
      {
        slug: "fintech-user-acquisition",
        title: "Scaling User Acquisition for Fintech Startup",
        subtitle: "10,000% User Growth in 2 Months",
        description: "A fintech startup needed to scale from 100 to 10,000+ users while maintaining product-market fit and optimizing customer acquisition costs.",
        fullDescription: "This comprehensive growth campaign was designed to rapidly scale Suretree Systems' user base through a multi-channel approach. The strategy combined data-driven PPC campaigns, sophisticated email automation sequences, and targeted social media marketing to create a powerful user acquisition engine.",
        category: "Growth Marketing",
        color: "from-blue-500 to-blue-700",
        icon: "TrendingUp",
        challenge: "Suretree Systems had a solid product but struggled with user acquisition, having only 100 active users despite being in the market for 6 months. The challenge was to rapidly scale the user base while maintaining product-market fit and optimizing customer acquisition costs.",
        solution: "Developed an integrated growth strategy combining paid advertising, content marketing, email automation, and social proof to create multiple touchpoints and conversion opportunities across the entire customer journey.",
        metrics: JSON.stringify({
          primary: "10,000%",
          primaryLabel: "User Growth",
          secondary: "2 months",
          secondaryLabel: "Achievement Timeline"
        }),
        results: JSON.stringify([
          "Achieved 10,000% user growth (100 to 10,000+ users) in 2 months",
          "Reduced customer acquisition cost by 25% through optimized targeting",
          "Improved conversion rate by 30% with data-driven UX improvements",
          "Increased user retention by 40% through enhanced onboarding",
          "Generated 300% increase in monthly recurring revenue",
          "Built automated nurture sequences converting 35% of leads"
        ]),
        tools: JSON.stringify(["Google Ads", "Meta Ads", "HubSpot", "A/B Testing", "Analytics", "Email Automation"]),
        timeline: JSON.stringify([
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
        ]),
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
      },
      {
        slug: "email-marketing-growth",
        title: "Email Marketing Transformation",
        subtitle: "733% Email List Growth",
        description: "A B2B SaaS company struggled with low email engagement and needed to dramatically increase their subscriber base and revenue from email marketing.",
        fullDescription: "This email marketing transformation project focused on building a highly engaged subscriber base through strategic lead magnets, optimized opt-in forms, and compelling content offers. The campaign utilized advanced segmentation, personalization, and automation to not only grow the list but also maintain high engagement rates and drive significant revenue growth through email marketing.",
        category: "Email Marketing",
        color: "from-green-500 to-emerald-600",
        icon: "Mail",
        challenge: "The existing email list of 3,000 subscribers had low engagement rates and minimal revenue contribution, with most subscribers being inactive or unengaged. The company needed to dramatically increase both list size and engagement.",
        solution: "Implemented a comprehensive email marketing strategy with targeted lead magnets, segmented campaigns, and automated sequences designed to attract, engage, and convert subscribers while maintaining high deliverability and engagement rates.",
        metrics: JSON.stringify({
          primary: "733%",
          primaryLabel: "Email Growth",
          secondary: "3 months",
          secondaryLabel: "Campaign Duration"
        }),
        results: JSON.stringify([
          "Achieved 733% email list growth (3,000 to 25,000 subscribers) in 3 months",
          "Increased email open rates from 18% to 35%",
          "Improved click-through rates by 150%",
          "Generated $2.2M in revenue attributable to email campaigns",
          "Built 12 automated nurture sequences with 35% conversion rate",
          "Reduced unsubscribe rate to 0.5% through better segmentation"
        ]),
        tools: JSON.stringify(["Mailchimp", "ConvertKit", "Lead Magnets", "Automation", "Canva", "Analytics"]),
        timeline: JSON.stringify([
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
        ]),
        image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=600&h=400&fit=crop"
      },
      {
        slug: "ai-content-automation",
        title: "AI-Powered Content & Productivity Boost",
        subtitle: "20% Team Productivity Increase",
        description: "Marketing teams needed to scale content production while maintaining quality and consistency across multiple channels and campaigns.",
        fullDescription: "This comprehensive AI automation initiative involved implementing AI-driven solutions across all marketing operations for multiple clients. By leveraging advanced AI tools and automation platforms, we revolutionized how marketing teams approached content creation, campaign management, and performance optimization.",
        category: "AI & Automation",
        color: "from-purple-500 to-purple-700",
        icon: "Bot",
        challenge: "Marketing teams were spending 70% of their time on repetitive tasks like data entry, report generation, and basic content formatting, leaving little time for strategic initiatives and creative work that drives real business growth.",
        solution: "Implemented a comprehensive AI automation stack that included intelligent content generation, automated reporting, smart workflow optimization, and AI-enhanced processes across all marketing channels and operations.",
        metrics: JSON.stringify({
          primary: "20%",
          primaryLabel: "Productivity Increase",
          secondary: "4 months",
          secondaryLabel: "Implementation Period"
        }),
        results: JSON.stringify([
          "Increased team productivity by 20% through AI automation",
          "Reduced content creation time by 60%",
          "Improved content quality scores by 35%",
          "Generated 200% more content with same team size",
          "Automated 80% of repetitive marketing tasks",
          "Enhanced workflow efficiency across all marketing channels"
        ]),
        tools: JSON.stringify(["ChatGPT", "Claude", "Jasper", "Content Calendar", "Automation", "Analytics"]),
        timeline: JSON.stringify([
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
        ]),
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop"
      },
      {
        slug: "ecommerce-conversion-optimization",
        title: "E-commerce Conversion Rate Optimization",
        subtitle: "55% Conversion Increase",
        description: "An e-commerce platform experienced high traffic but low conversion rates, indicating significant optimization opportunities in the user journey.",
        fullDescription: "This comprehensive conversion rate optimization project involved a systematic analysis of the entire e-commerce funnel, from product discovery to checkout completion. Through advanced analytics, user behavior tracking, and extensive A/B testing, we identified key friction points and implemented strategic improvements that dramatically increased conversion rates.",
        category: "E-commerce",
        color: "from-orange-500 to-orange-700",
        icon: "ShoppingCart",
        challenge: "Despite attracting significant traffic, the e-commerce platform was converting only 1.2% of visitors to customers, well below the industry average. Cart abandonment rates were extremely high at 78%, and mobile performance was particularly poor.",
        solution: "Implemented a data-driven CRO strategy focusing on user experience optimization, mobile responsiveness, trust signals, and checkout flow improvements. Used extensive testing and analytics to validate each optimization.",
        metrics: JSON.stringify({
          primary: "55%",
          primaryLabel: "Conversion Increase",
          secondary: "6 months",
          secondaryLabel: "Optimization Period"
        }),
        results: JSON.stringify([
          "Increased overall conversion rate by 55% across all product categories",
          "Reduced cart abandonment rate by 45% through UX improvements",
          "Improved mobile conversion rate by 65% with responsive optimizations",
          "Generated additional $1.8M in revenue without increasing traffic",
          "Enhanced product page engagement by 40%",
          "Streamlined checkout process reducing steps by 30%"
        ]),
        tools: JSON.stringify(["Google Optimize", "Hotjar", "Google Analytics", "A/B Testing", "Heatmaps", "User Testing"]),
        timeline: JSON.stringify([
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
        ]),
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop"
      },
      {
        slug: "social-media-growth",
        title: "Social Media Growth & Engagement",
        subtitle: "70,000+ Followers in 6 Months",
        description: "A tech brand needed to build awareness and engagement across social platforms to support product launches and community building.",
        fullDescription: "This comprehensive social media growth strategy focused on building an authentic, engaged community across multiple platforms. Through strategic content creation, influencer partnerships, community management, and data-driven optimization, we transformed the brand's social presence from minimal to massive.",
        category: "Social Media",
        color: "from-pink-500 to-pink-700",
        icon: "Users",
        challenge: "The brand had minimal social media presence with only 2,000 followers and extremely low engagement rates. Content was inconsistent, and there was no clear social media strategy or community management approach.",
        solution: "Developed a comprehensive social media strategy including content pillars, posting schedules, community guidelines, influencer partnerships, and engagement tactics designed to build authentic relationships and drive meaningful growth.",
        metrics: JSON.stringify({
          primary: "70K+",
          primaryLabel: "New Followers",
          secondary: "6 months",
          secondaryLabel: "Growth Period"
        }),
        results: JSON.stringify([
          "Grew social media following by 70,000+ followers across all platforms",
          "Increased engagement rate from 2.1% to 8.5%",
          "Generated 4,500+ qualified leads through social campaigns",
          "Achieved 300% increase in brand mention volume",
          "Created 15+ viral content pieces with 100K+ reach each",
          "Built active community with 95% positive sentiment"
        ]),
        tools: JSON.stringify(["Buffer", "Hootsuite", "Canva", "Analytics", "Creator Studio", "Social Listening"]),
        timeline: JSON.stringify([
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
        ]),
        image: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=600&h=400&fit=crop"
      },
      {
        slug: "brand-awareness-campaign",
        title: "Multi-Channel Brand Awareness Campaign",
        subtitle: "85% Brand Recognition Growth",
        description: "A B2B software company needed to increase brand recognition and generate qualified leads in a competitive market segment.",
        fullDescription: "This integrated brand awareness campaign leveraged multiple touchpoints to establish market presence and drive lead generation. Through strategic PR, content marketing, thought leadership, event marketing, and digital advertising, we created a cohesive brand narrative that resonated with target audiences.",
        category: "Brand Marketing",
        color: "from-indigo-500 to-indigo-700",
        icon: "Megaphone",
        challenge: "The B2B software company was virtually unknown in their target market despite having a superior product. They needed to build credibility, establish thought leadership, and generate qualified leads in a crowded, competitive space.",
        solution: "Created an integrated brand awareness strategy combining thought leadership content, strategic PR, industry event participation, and targeted digital advertising to build credibility and establish market presence.",
        metrics: JSON.stringify({
          primary: "85%",
          primaryLabel: "Brand Awareness",
          secondary: "8 months",
          secondaryLabel: "Campaign Period"
        }),
        results: JSON.stringify([
          "Increased brand awareness by 85% in target market segments",
          "Generated 2,800+ qualified leads through integrated campaigns",
          "Achieved 250% increase in organic search traffic",
          "Improved brand sentiment score by 60%",
          "Secured 45+ media mentions and thought leadership features",
          "Established presence at 12 major industry events"
        ]),
        tools: JSON.stringify(["LinkedIn Ads", "Content Marketing", "SEO", "PR", "Event Marketing", "Brand Monitoring"]),
        timeline: JSON.stringify([
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
        ]),
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop"
      }
    ]

    // Create case studies
    for (const caseStudy of caseStudies) {
      await prisma.caseStudy.create({
        data: caseStudy
      })
      console.log(`✅ Created case study: ${caseStudy.title}`)
    }

    // Now restore projects with more variety including tools and workflows
    const projects = [
      {
        slug: "ai-content-automation-workflow",
        title: "AI Content Automation Workflow",
        description: "Developed AI-powered content automation workflow that reduced manual content creation effort by 80% while maintaining quality and brand consistency. Integrated workflow using ChatGPT, Claude APIs, HubSpot, and Zapier to achieve 300% increase in content output and 20% boost in team productivity.",
        category: "AI Automation",
        technologies: JSON.stringify([
          "ChatGPT",
          "Claude AI", 
          "HubSpot",
          "Zapier",
          "API Integration",
          "Content Management"
        ]),
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop&crop=center",
        githubUrl: null,
        liveUrl: null
      },
      {
        slug: "hubspot-lead-scoring-system", 
        title: "HubSpot Lead Scoring System",
        description: "Custom lead scoring algorithm that reduced unqualified leads by 40% and improved sales efficiency. Implemented advanced scoring criteria based on behavioral data, demographics, and engagement patterns to prioritize high-value prospects.",
        category: "Sales Automation", 
        technologies: JSON.stringify([
          "HubSpot",
          "JavaScript",
          "API Integration",
          "Lead Management",
          "CRM Automation"
        ]),
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&crop=center",
        githubUrl: null,
        liveUrl: null
      },
      {
        slug: "email-growth-funnel",
        title: "Email Growth Funnel",
        description: "Multi-stage email automation that achieved 733% subscriber growth in 3 months. Implemented segmented campaigns, lead magnets, and automated nurture sequences resulting in 45% open rates and 35% conversion rates.",
        category: "Email Marketing",
        technologies: JSON.stringify([
          "Email Marketing",
          "ConvertKit",
          "Lead Magnets", 
          "Automation",
          "Segmentation",
          "Analytics"
        ]),
        image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=600&h=400&fit=crop&crop=center",
        githubUrl: null,
        liveUrl: null
      },
      {
        slug: "ai-powered-seo-keyword-tool",
        title: "AI-Powered SEO Keyword Tool", 
        description: "Custom tool for automated keyword research and content optimization using AI. Integrated OpenAI APIs to analyze search intent, competition, and content gaps, resulting in 150% improvement in organic traffic.",
        category: "SEO Tools",
        technologies: JSON.stringify([
          "Python",
          "OpenAI API",
          "SEO Tools",
          "Data Analysis",
          "Content Optimization"
        ]),
        image: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=600&h=400&fit=crop&crop=center",
        githubUrl: null,
        liveUrl: null
      },
      {
        slug: "social-media-automation-suite",
        title: "Social Media Automation Suite",
        description: "Comprehensive social media management workflow that grew followers by 70,000 in 6 months. Automated content scheduling, engagement tracking, and performance analysis across multiple platforms.",
        category: "Social Media",
        technologies: JSON.stringify([
          "Buffer",
          "Canva API", 
          "Analytics",
          "Content Automation",
          "Multi-platform"
        ]),
        image: "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=600&h=400&fit=crop&crop=center",
        githubUrl: null,
        liveUrl: null
      },
      {
        slug: "conversion-rate-optimization-tool",
        title: "Conversion Rate Optimization Tool",
        description: "Built custom CRO analysis tool that identifies conversion bottlenecks and provides actionable optimization recommendations. Achieved 55% conversion improvement for e-commerce clients through data-driven insights.",
        category: "CRO Tools",
        technologies: JSON.stringify([
          "React",
          "Node.js",
          "Google Analytics API",
          "Data Visualization",
          "A/B Testing"
        ]),
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&crop=center",
        githubUrl: null,
        liveUrl: null
      },
      {
        slug: "marketing-roi-calculator",
        title: "Marketing ROI Calculator",
        description: "Interactive tool that helps businesses calculate ROI across different marketing channels. Features campaign tracking, budget optimization, and performance forecasting with real-time analytics integration.",
        category: "Marketing Tools",
        technologies: JSON.stringify([
          "Next.js",
          "TypeScript",
          "Chart.js",
          "API Integration",
          "Financial Modeling"
        ]),
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&crop=center",
        githubUrl: null,
        liveUrl: null
      },
      {
        slug: "lead-qualification-workflow",
        title: "Lead Qualification Workflow",
        description: "Automated lead scoring and qualification system that processes leads in real-time. Integrates with CRM systems to automatically route qualified leads to sales teams, reducing response time by 80%.",
        category: "Sales Automation",
        technologies: JSON.stringify([
          "Salesforce",
          "HubSpot",
          "Zapier",
          "Lead Scoring",
          "Workflow Automation"
        ]),
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&crop=center",
        githubUrl: null,
        liveUrl: null
      }
    ]

    // Create projects
    for (const project of projects) {
      await prisma.project.create({
        data: project
      })
      console.log(`✅ Created project: ${project.title}`)
    }
    
    console.log('🎉 Successfully restored all content!')
  } catch (error) {
    console.error('❌ Error restoring content:', error)
  } finally {
    await prisma.$disconnect()
  }
}

restoreFullContent()