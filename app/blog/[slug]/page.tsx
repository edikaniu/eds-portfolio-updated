import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  CalendarDays, 
  Clock, 
  ArrowLeft
} from 'lucide-react'
import { ShareButton } from '@/components/blog/share-button'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
// NEWSLETTER DISABLED - Keeping code for future use
// import { NewsletterCTA, NewsletterPopup } from '@/components/newsletter'

interface BlogPost {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string
  date: string
  readTime: string
  category: string
  tags: string[]
  image: string
  author: string
  metaTitle?: string
  metaDescription?: string
}

// Fallback blog posts data - Complete set matching listings page
const fallbackBlogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'ai-marketing-transformation',
    title: 'How AI is Transforming Marketing: A Practical Guide',
    content: `
      <h2>The AI Marketing Revolution</h2>
      <p>Artificial intelligence is no longer a futuristic concept – it's revolutionizing how we approach marketing today. From personalized customer experiences to predictive analytics, AI is becoming an essential tool for marketers who want to stay competitive.</p>
      
      <h3>Key Areas Where AI is Making an Impact</h3>
      <p>AI-powered marketing is transforming several key areas:</p>
      <ul>
        <li><strong>Customer Segmentation:</strong> AI algorithms can analyze vast amounts of customer data to create more precise segments than traditional methods.</li>
        <li><strong>Content Personalization:</strong> Dynamic content that adapts to individual user preferences and behaviors.</li>
        <li><strong>Predictive Analytics:</strong> Forecasting customer behavior and campaign performance with greater accuracy.</li>
        <li><strong>Automated Campaign Optimization:</strong> Real-time adjustments to campaigns based on performance data.</li>
      </ul>
      
      <h3>Implementing AI in Your Marketing Strategy</h3>
      <p>Start small and scale gradually. Begin with one area like email personalization or customer segmentation, then expand to more complex applications as your team becomes comfortable with the technology.</p>
      
      <p>The key to success is combining AI capabilities with human creativity and strategic thinking. AI handles the data processing and optimization, while humans provide the creative vision and strategic direction.</p>
    `,
    excerpt: 'Discover how artificial intelligence is revolutionizing marketing strategies and learn practical ways to implement AI in your campaigns.',
    date: '2024-01-15',
    readTime: '8 min read',
    category: 'AI & Marketing',
    tags: ['AI', 'Marketing', 'Technology', 'Strategy'],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&crop=center',
    author: 'Edikan Udoibuot'
  },
  {
    id: '2',
    slug: 'growth-hacking-strategies',
    title: '10 Growth Hacking Strategies That Actually Work',
    content: `
      <h2>Proven Growth Hacking Techniques</h2>
      <p>Growth hacking isn't about shortcuts or tricks – it's about finding scalable, repeatable ways to grow your business rapidly. Here are 10 strategies I've used to help scale products from hundreds to thousands of users.</p>
      
      <h3>1. Referral Programs That Drive Results</h3>
      <p>Design referral programs that benefit both the referrer and the referred. The key is making the reward valuable enough to motivate sharing but not so expensive that it hurts your unit economics.</p>
      
      <h3>2. Content Marketing with a Growth Twist</h3>
      <p>Create content that naturally encourages sharing and linking. Interactive content, original research, and actionable guides tend to perform exceptionally well.</p>
      
      <h3>3. Strategic Partnerships</h3>
      <p>Partner with complementary businesses to access new customer bases. Look for win-win opportunities where both parties can provide value to each other's audiences.</p>
      
      <h3>4. Product-Led Growth</h3>
      <p>Build growth mechanisms directly into your product. Features like social sharing, collaborative workflows, or public profiles can turn users into growth drivers.</p>
      
      <h3>5. Data-Driven Experimentation</h3>
      <p>Run continuous A/B tests on everything from landing pages to email subject lines. Small improvements compound over time to create significant growth.</p>
      
      <p>Remember: sustainable growth comes from understanding your customers deeply and providing exceptional value. These tactics work because they're grounded in customer psychology and value creation.</p>
    `,
    excerpt: 'Learn proven growth hacking techniques that helped scale products from 100 to 10,000+ users in just months.',
    date: '2024-01-10',
    readTime: '12 min read',
    category: 'Growth Marketing',
    tags: ['Growth Hacking', 'Marketing', 'Strategy', 'Scaling'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&crop=center',
    author: 'Edikan Udoibuot'
  },
  {
    id: '3',
    slug: 'email-marketing-mastery',
    title: 'Email Marketing Mastery: From 3K to 25K Subscribers',
    content: `
      <h2>The Email Marketing Transformation</h2>
      <p>In just 3 months, I helped transform an email marketing program from 3,000 subscribers with poor engagement to 25,000+ highly engaged subscribers. Here's exactly how we did it.</p>
      
      <h3>Strategy 1: Segmentation Revolution</h3>
      <p>We moved from basic demographic segmentation to behavioral and psychographic segmentation. This allowed us to send highly relevant content to each subscriber segment.</p>
      
      <h3>Strategy 2: Value-First Content</h3>
      <p>Instead of always promoting products, we focused on providing genuine value in every email. Educational content, industry insights, and exclusive tips became the foundation of our strategy.</p>
      
      <h3>Strategy 3: Automation Workflows</h3>
      <p>We implemented sophisticated automation workflows for:</p>
      <ul>
        <li>Welcome sequences that nurture new subscribers</li>
        <li>Re-engagement campaigns for inactive subscribers</li>
        <li>Behavioral triggers based on website activity</li>
        <li>Post-purchase follow-up sequences</li>
      </ul>
      
      <h3>Strategy 4: Interactive Elements</h3>
      <p>Adding polls, surveys, and interactive content to emails significantly increased engagement rates and provided valuable customer insights.</p>
      
      <h3>Results That Matter</h3>
      <p>The transformation resulted in:</p>
      <ul>
        <li>733% increase in subscriber count</li>
        <li>5x improvement in engagement rates</li>
        <li>300% increase in email-driven revenue</li>
        <li>65% reduction in unsubscribe rate</li>
      </ul>
      
      <p>The key lesson: treat your email list as a community, not a broadcasting channel. When you provide consistent value and respect your subscribers' time, remarkable growth follows.</p>
    `,
    excerpt: 'The exact strategies and tactics I used to achieve 733% email list growth in just 3 months.',
    date: '2024-01-05',
    readTime: '15 min read',
    category: 'Email Marketing',
    tags: ['Email Marketing', 'Growth', 'Automation', 'Strategy'],
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop&crop=center',
    author: 'Edikan Udoibuot'
  },
  {
    id: '4',
    slug: 'data-driven-marketing',
    title: 'Building a Data-Driven Marketing Strategy',
    content: `
      <h2>The Power of Data-Driven Marketing</h2>
      <p>Data-driven marketing isn't just a buzzword – it's the foundation of modern successful marketing campaigns. By leveraging analytics and performance data, you can optimize your marketing efforts and achieve remarkable ROI improvements.</p>
      
      <h3>Setting Up Your Data Infrastructure</h3>
      <p>Before you can make data-driven decisions, you need the right infrastructure in place:</p>
      <ul>
        <li><strong>Analytics Setup:</strong> Proper Google Analytics 4 configuration with custom events and conversions</li>
        <li><strong>Attribution Modeling:</strong> Understanding which touchpoints contribute to conversions</li>
        <li><strong>Customer Data Platform:</strong> Unified customer profiles across all touchpoints</li>
        <li><strong>Marketing Mix Modeling:</strong> Understanding the impact of each marketing channel</li>
      </ul>
      
      <h3>Key Metrics That Matter</h3>
      <p>Focus on metrics that align with business objectives:</p>
      <ul>
        <li>Customer Acquisition Cost (CAC) by channel</li>
        <li>Customer Lifetime Value (CLV)</li>
        <li>Marketing Qualified Leads (MQL) conversion rates</li>
        <li>Attribution-based revenue by campaign</li>
      </ul>
      
      <h3>Turning Data Into Action</h3>
      <p>The real value comes from acting on your insights. Create automated alerts for performance thresholds and establish regular review cycles to optimize campaigns based on data trends.</p>
      
      <p>Remember: data should inform decisions, not paralyze them. Start with the basics and build complexity over time as your team becomes more data-literate.</p>
    `,
    excerpt: 'How to leverage analytics and performance data to optimize your marketing campaigns and improve ROI.',
    date: '2024-01-03',
    readTime: '10 min read',
    category: 'Analytics',
    tags: ['Analytics', 'Data', 'Strategy', 'ROI'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center',
    author: 'Edikan Udoibuot'
  },
  {
    id: '5',
    slug: 'conversion-optimization',
    title: 'The Complete Guide to Conversion Rate Optimization',
    content: `
      <h2>Systematic Conversion Rate Optimization</h2>
      <p>Conversion rate optimization (CRO) is both an art and a science. It requires understanding user psychology, data analysis, and systematic testing to improve your conversion rates consistently.</p>
      
      <h3>Foundation: Understanding Your Funnel</h3>
      <p>Before optimizing, map your conversion funnel and identify the biggest drop-off points. Use tools like Google Analytics and heatmap software to understand user behavior patterns.</p>
      
      <h3>Testing Framework</h3>
      <p>Implement a structured approach to A/B testing:</p>
      <ul>
        <li><strong>Hypothesis Formation:</strong> Based on data and user research</li>
        <li><strong>Test Design:</strong> Statistical significance and proper sample sizes</li>
        <li><strong>Implementation:</strong> Clean test setup with proper tracking</li>
        <li><strong>Analysis:</strong> Statistical significance and practical significance</li>
      </ul>
      
      <h3>High-Impact Areas to Test</h3>
      <p>Focus your testing efforts on these high-impact elements:</p>
      <ul>
        <li>Headlines and value propositions</li>
        <li>Call-to-action buttons (copy, color, placement)</li>
        <li>Form optimization (field reduction, multi-step forms)</li>
        <li>Social proof and testimonials</li>
        <li>Page load speed optimization</li>
      </ul>
      
      <h3>Advanced Optimization Techniques</h3>
      <p>Once you've mastered the basics, explore personalization, dynamic content, and AI-powered optimization to achieve even better results.</p>
      
      <p>Success in CRO comes from patience, systematic testing, and a deep understanding of your users. Small improvements compound over time to create significant business impact.</p>
    `,
    excerpt: 'Learn how to systematically improve your conversion rates using data-driven testing and optimization techniques.',
    date: '2024-01-01',
    readTime: '18 min read',
    category: 'Conversion Optimization',
    tags: ['CRO', 'Testing', 'Optimization', 'Analytics'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&crop=center',
    author: 'Edikan Udoibuot'
  },
  {
    id: '6',
    slug: 'social-media-growth',
    title: 'Scaling Social Media: 70K Followers in 6 Months',
    content: `
      <h2>The Social Media Growth Blueprint</h2>
      <p>Growing from 5,000 to 75,000+ followers in just 6 months required a strategic approach that combined content excellence, community building, and smart distribution tactics.</p>
      
      <h3>Content Strategy That Converts</h3>
      <p>The foundation of our growth was valuable, consistent content:</p>
      <ul>
        <li><strong>Educational Content:</strong> How-to guides and industry insights</li>
        <li><strong>Behind-the-Scenes:</strong> Authentic glimpses into our processes</li>
        <li><strong>User-Generated Content:</strong> Leveraging our community for content</li>
        <li><strong>Trending Topics:</strong> Quick reactions to industry news</li>
      </ul>
      
      <h3>Engagement Amplification</h3>
      <p>Growth isn't just about posting – it's about building relationships:</p>
      <ul>
        <li>Responding to every comment within 2 hours</li>
        <li>Engaging with followers' content proactively</li>
        <li>Creating interactive content (polls, Q&As, live sessions)</li>
        <li>Collaborating with other creators and brands</li>
      </ul>
      
      <h3>Strategic Hashtag Research</h3>
      <p>We developed a proprietary hashtag strategy mixing high-volume and niche hashtags to maximize reach while maintaining relevance.</p>
      
      <h3>Results and Lessons</h3>
      <p>The 70,000+ new followers led to:</p>
      <ul>
        <li>400% increase in website traffic from social</li>
        <li>250% improvement in lead generation</li>
        <li>15% of total revenue attributed to social media</li>
      </ul>
      
      <p>The key insight: authentic engagement beats vanity metrics. Focus on building a community, not just an audience.</p>
    `,
    excerpt: 'The proven strategies and tactics I used to grow social media followings by 70,000+ engaged followers.',
    date: '2023-12-28',
    readTime: '14 min read',
    category: 'Social Media',
    tags: ['Social Media', 'Growth', 'Engagement', 'Community'],
    image: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&h=400&fit=crop&crop=center',
    author: 'Edikan Udoibuot'
  },
  {
    id: '7',
    slug: 'marketing-automation-workflows',
    title: 'Building Marketing Automation Workflows That Convert',
    content: `
      <h2>The Science of Marketing Automation</h2>
      <p>Marketing automation workflows are the backbone of scalable growth. When designed properly, they nurture leads automatically while providing personalized experiences at scale.</p>
      
      <h3>Workflow Design Principles</h3>
      <p>Effective automation workflows follow these core principles:</p>
      <ul>
        <li><strong>Trigger-Based Activation:</strong> Workflows triggered by specific user behaviors</li>
        <li><strong>Progressive Profiling:</strong> Gradually collecting more information about leads</li>
        <li><strong>Dynamic Content:</strong> Personalized messages based on user data</li>
        <li><strong>Multi-Channel Integration:</strong> Email, SMS, social, and web experiences</li>
      </ul>
      
      <h3>Essential Workflow Types</h3>
      <p>Every business needs these fundamental workflows:</p>
      <ul>
        <li><strong>Welcome Series:</strong> Onboarding new subscribers or customers</li>
        <li><strong>Lead Nurturing:</strong> Moving prospects through the sales funnel</li>
        <li><strong>Re-engagement:</strong> Winning back inactive subscribers</li>
        <li><strong>Post-Purchase:</strong> Maximizing customer lifetime value</li>
        <li><strong>Abandoned Cart:</strong> Recovering lost e-commerce sales</li>
      </ul>
      
      <h3>Optimization and Testing</h3>
      <p>Continuously improve your workflows through systematic testing of timing, messaging, and triggers. Small improvements in automation can lead to significant revenue gains.</p>
      
      <p>The goal is to create workflows so relevant and valuable that recipients look forward to receiving them. When automation feels personal and helpful, it becomes a powerful growth engine.</p>
    `,
    excerpt: 'Step-by-step guide to creating marketing automation workflows that nurture leads and drive conversions.',
    date: '2023-12-25',
    readTime: '16 min read',
    category: 'Marketing Automation',
    tags: ['Automation', 'Workflows', 'Lead Nurturing', 'Conversion'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center',
    author: 'Edikan Udoibuot'
  },
  {
    id: '8',
    slug: 'customer-retention-strategies',
    title: 'Customer Retention: Turning One-Time Buyers into Loyal Advocates',
    content: `
      <h2>The Economics of Customer Retention</h2>
      <p>Acquiring a new customer costs 5-25x more than retaining an existing one. Yet most businesses focus disproportionately on acquisition. Here's how to build a retention-first growth strategy.</p>
      
      <h3>The Retention Framework</h3>
      <p>Successful retention strategies address four key stages:</p>
      <ul>
        <li><strong>Onboarding Excellence:</strong> Setting expectations and delivering quick wins</li>
        <li><strong>Value Realization:</strong> Helping customers achieve their desired outcomes</li>
        <li><strong>Engagement Maintenance:</strong> Regular touchpoints that provide ongoing value</li>
        <li><strong>Advocacy Development:</strong> Turning satisfied customers into brand ambassadors</li>
      </ul>
      
      <h3>Tactical Retention Strategies</h3>
      <p>Implement these proven retention tactics:</p>
      <ul>
        <li><strong>Personalized Communication:</strong> Targeted messages based on customer behavior</li>
        <li><strong>Loyalty Programs:</strong> Rewards that encourage repeat purchases</li>
        <li><strong>Customer Success Programs:</strong> Proactive support to ensure success</li>
        <li><strong>Community Building:</strong> Creating connections between customers</li>
      </ul>
      
      <h3>Measuring Retention Success</h3>
      <p>Track these key retention metrics:</p>
      <ul>
        <li>Customer Lifetime Value (CLV)</li>
        <li>Churn rate by customer segment</li>
        <li>Net Promoter Score (NPS)</li>
        <li>Repeat purchase rate</li>
        <li>Time to churn</li>
      </ul>
      
      <p>Remember: retention is about relationships, not just transactions. Focus on creating genuine value and emotional connections with your customers.</p>
    `,
    excerpt: 'Proven strategies to increase customer lifetime value and build a community of loyal brand advocates.',
    date: '2023-12-20',
    readTime: '11 min read',
    category: 'Customer Retention',
    tags: ['Retention', 'Customer Success', 'Loyalty', 'CLV'],
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop&crop=center',
    author: 'Edikan Udoibuot'
  },
  {
    id: '9',
    slug: 'performance-marketing-metrics',
    title: 'The Ultimate Guide to Performance Marketing Metrics',
    content: `
      <h2>Metrics That Drive Performance</h2>
      <p>Performance marketing is all about measurable results. But with so many metrics available, knowing which ones to focus on can make the difference between profitable campaigns and wasted spend.</p>
      
      <h3>Foundation Metrics</h3>
      <p>Start with these fundamental performance metrics:</p>
      <ul>
        <li><strong>Return on Ad Spend (ROAS):</strong> Revenue generated per dollar spent</li>
        <li><strong>Customer Acquisition Cost (CAC):</strong> Total cost to acquire one customer</li>
        <li><strong>Customer Lifetime Value (CLV):</strong> Total revenue from a customer relationship</li>
        <li><strong>Conversion Rate:</strong> Percentage of visitors who complete desired actions</li>
      </ul>
      
      <h3>Channel-Specific Metrics</h3>
      <p>Different channels require different measurement approaches:</p>
      <ul>
        <li><strong>Paid Search:</strong> Quality Score, impression share, search impression share</li>
        <li><strong>Social Media:</strong> Engagement rate, reach, frequency, social commerce metrics</li>
        <li><strong>Display Advertising:</strong> Viewability, brand lift, attribution across touchpoints</li>
        <li><strong>Email Marketing:</strong> Deliverability, engagement rates, lifecycle metrics</li>
      </ul>
      
      <h3>Advanced Attribution</h3>
      <p>Move beyond last-click attribution to understand the full customer journey. Multi-touch attribution models provide insights into which channels work together to drive conversions.</p>
      
      <h3>Optimization Framework</h3>
      <p>Create a systematic approach to metric analysis and campaign optimization based on performance thresholds and automated rules.</p>
      
      <p>The key is balancing short-term performance metrics with long-term brand building and customer value creation.</p>
    `,
    excerpt: 'Master the key metrics that matter for performance marketing and learn how to optimize for maximum ROI.',
    date: '2023-12-15',
    readTime: '13 min read',
    category: 'Performance Marketing',
    tags: ['Performance Marketing', 'Metrics', 'ROI', 'Attribution'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&crop=center',
    author: 'Edikan Udoibuot'
  },
  {
    id: '10',
    slug: 'content-marketing-strategy',
    title: 'Content Marketing Strategy: From Planning to Execution',
    content: `
      <h2>Strategic Content Marketing</h2>
      <p>Content marketing isn't just about creating blog posts – it's about building a comprehensive strategy that attracts, engages, and converts your ideal customers through valuable content.</p>
      
      <h3>Content Strategy Foundation</h3>
      <p>Every successful content strategy starts with these elements:</p>
      <ul>
        <li><strong>Audience Research:</strong> Deep understanding of customer needs and pain points</li>
        <li><strong>Content Audit:</strong> Assessment of existing content performance and gaps</li>
        <li><strong>Competitive Analysis:</strong> Understanding the content landscape in your industry</li>
        <li><strong>Content Pillars:</strong> 3-5 core topics that align with business objectives</li>
      </ul>
      
      <h3>Content Planning and Creation</h3>
      <p>Develop a systematic approach to content creation:</p>
      <ul>
        <li><strong>Editorial Calendar:</strong> Strategic planning of content themes and publication dates</li>
        <li><strong>Content Mix:</strong> Balanced approach across formats (blog, video, audio, interactive)</li>
        <li><strong>SEO Integration:</strong> Keyword research and search intent alignment</li>
        <li><strong>Content Workflows:</strong> Efficient processes for ideation, creation, and publication</li>
      </ul>
      
      <h3>Distribution and Amplification</h3>
      <p>Great content needs great distribution:</p>
      <ul>
        <li>Owned channels (website, email, social profiles)</li>
        <li>Earned channels (PR, influencer partnerships, guest posting)</li>
        <li>Paid channels (content promotion, native advertising)</li>
      </ul>
      
      <h3>Measuring Content Success</h3>
      <p>Track metrics that align with your business goals: traffic, engagement, lead generation, and revenue attribution from content efforts.</p>
      
      <p>Remember: successful content marketing requires patience, consistency, and a commitment to providing genuine value to your audience.</p>
    `,
    excerpt: 'Complete framework for developing and executing a content marketing strategy that drives business results.',
    date: '2023-12-12',
    readTime: '17 min read',
    category: 'Content Marketing',
    tags: ['Content Marketing', 'Strategy', 'SEO', 'Distribution'],
    image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=400&fit=crop&crop=center',
    author: 'Edikan Udoibuot'
  },
  {
    id: '11',
    slug: 'influencer-marketing-roi',
    title: 'Maximizing Influencer Marketing ROI: A Data-Driven Approach',
    content: `
      <h2>The Evolution of Influencer Marketing</h2>
      <p>Influencer marketing has matured from celebrity endorsements to strategic partnerships with content creators who have genuine connections with their audiences. Success requires a data-driven approach to identification, partnership, and measurement.</p>
      
      <h3>Influencer Selection Framework</h3>
      <p>Choose influencers based on these criteria:</p>
      <ul>
        <li><strong>Audience Alignment:</strong> Demographics and psychographics match your target market</li>
        <li><strong>Engagement Quality:</strong> High engagement rates with authentic interactions</li>
        <li><strong>Content Quality:</strong> Professional content that aligns with your brand standards</li>
        <li><strong>Brand Safety:</strong> Values alignment and clean online presence</li>
      </ul>
      
      <h3>Campaign Structure and Execution</h3>
      <p>Design campaigns for maximum impact:</p>
      <ul>
        <li><strong>Clear Objectives:</strong> Specific goals beyond just reach and impressions</li>
        <li><strong>Creative Briefs:</strong> Guidelines that maintain brand consistency while allowing creator freedom</li>
        <li><strong>Multi-Touch Campaigns:</strong> Series of touchpoints rather than one-off posts</li>
        <li><strong>Cross-Platform Integration:</strong> Coordinated campaigns across multiple social platforms</li>
      </ul>
      
      <h3>ROI Measurement</h3>
      <p>Track performance across these dimensions:</p>
      <ul>
        <li>Reach and impression metrics</li>
        <li>Engagement rates and sentiment analysis</li>
        <li>Click-through rates and website traffic</li>
        <li>Conversion tracking and revenue attribution</li>
        <li>Brand awareness lift and assisted conversions</li>
      </ul>
      
      <p>The most successful influencer partnerships feel like authentic recommendations rather than paid advertisements. Focus on long-term relationships over one-time campaigns.</p>
    `,
    excerpt: 'Learn how to identify, partner with, and measure the success of influencer marketing campaigns.',
    date: '2023-12-08',
    readTime: '14 min read',
    category: 'Influencer Marketing',
    tags: ['Influencer Marketing', 'ROI', 'Partnerships', 'Social Media'],
    image: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&h=400&fit=crop&crop=center',
    author: 'Edikan Udoibuot'
  },
  {
    id: '12',
    slug: 'paid-advertising-optimization',
    title: 'Paid Advertising Optimization: Beyond Clicks and Impressions',
    content: `
      <h2>Advanced Paid Advertising Strategy</h2>
      <p>Successful paid advertising goes beyond bidding and budgets. It requires sophisticated audience targeting, creative optimization, and performance analysis to achieve profitable growth at scale.</p>
      
      <h3>Audience Strategy</h3>
      <p>Build comprehensive audience strategies across platforms:</p>
      <ul>
        <li><strong>First-Party Data:</strong> Leverage customer data for lookalike and retargeting audiences</li>
        <li><strong>Intent-Based Targeting:</strong> Target users based on search behavior and purchase intent</li>
        <li><strong>Behavioral Segmentation:</strong> Create audiences based on website interaction patterns</li>
        <li><strong>Lifecycle Targeting:</strong> Different messaging for different stages of the customer journey</li>
      </ul>
      
      <h3>Creative Excellence</h3>
      <p>Develop creative strategies that drive performance:</p>
      <ul>
        <li><strong>Creative Testing Framework:</strong> Systematic approach to testing ad variants</li>
        <li><strong>Dynamic Creative Optimization:</strong> Automated testing of creative combinations</li>
        <li><strong>Video-First Approach:</strong> Leveraging video content for higher engagement</li>
        <li><strong>User-Generated Content:</strong> Authentic content that builds trust</li>
      </ul>
      
      <h3>Platform-Specific Optimization</h3>
      <p>Each platform requires unique optimization approaches:</p>
      <ul>
        <li><strong>Google Ads:</strong> Keyword optimization, Quality Score improvement, automation</li>
        <li><strong>Facebook/Instagram:</strong> Creative optimization, audience expansion, campaign objectives</li>
        <li><strong>LinkedIn:</strong> Professional targeting, content format optimization</li>
        <li><strong>TikTok:</strong> Native content creation, trend integration</li>
      </ul>
      
      <h3>Performance Analysis</h3>
      <p>Move beyond surface metrics to understand true campaign performance through cohort analysis, attribution modeling, and lifetime value optimization.</p>
      
      <p>The future of paid advertising lies in automation, machine learning, and first-party data utilization. Stay ahead by embracing these trends while maintaining focus on creative excellence.</p>
    `,
    excerpt: 'Advanced strategies for optimizing paid advertising campaigns across Google, Facebook, and LinkedIn.',
    date: '2023-12-05',
    readTime: '19 min read',
    category: 'Paid Advertising',
    tags: ['Paid Advertising', 'PPC', 'Optimization', 'ROI'],
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop&crop=center',
    author: 'Edikan Udoibuot'
  },
  {
    id: '13',
    slug: 'brand-positioning-strategy',
    title: 'Brand Positioning in a Crowded Market: Stand Out or Fall Behind',
    content: `
      <h2>The Power of Strategic Brand Positioning</h2>
      <p>In today's crowded marketplace, brand positioning isn't just about differentiation – it's about survival. Strong positioning creates mental shortcuts for customers and builds sustainable competitive advantages.</p>
      
      <h3>Positioning Framework</h3>
      <p>Develop your brand position using this strategic framework:</p>
      <ul>
        <li><strong>Market Analysis:</strong> Understanding competitive landscape and market gaps</li>
        <li><strong>Customer Insights:</strong> Deep understanding of customer needs and perceptions</li>
        <li><strong>Brand Architecture:</strong> Clear hierarchy of brand elements and messaging</li>
        <li><strong>Unique Value Proposition:</strong> Compelling reason to choose your brand</li>
      </ul>
      
      <h3>Positioning Strategies</h3>
      <p>Choose from these proven positioning approaches:</p>
      <ul>
        <li><strong>Category Creation:</strong> Defining a new market category</li>
        <li><strong>Attribute-Based:</strong> Owning a specific product attribute or benefit</li>
        <li><strong>Use Case Positioning:</strong> Becoming the go-to solution for specific situations</li>
        <li><strong>Against-the-Leader:</strong> Positioning as the alternative to market leaders</li>
      </ul>
      
      <h3>Implementation and Consistency</h3>
      <p>Successful positioning requires consistent execution across all touchpoints:</p>
      <ul>
        <li>Marketing communications and messaging</li>
        <li>Product development and feature prioritization</li>
        <li>Customer experience and service delivery</li>
        <li>Sales process and channel strategy</li>
      </ul>
      
      <h3>Measuring Positioning Success</h3>
      <p>Track positioning effectiveness through brand awareness studies, customer perception surveys, and competitive analysis over time.</p>
      
      <p>Remember: positioning is not what you do to your product, it's what you do to the mind of your prospect. Focus on clarity, consistency, and credibility.</p>
    `,
    excerpt: 'Strategic framework for developing a unique brand position that resonates with your target audience.',
    date: '2023-12-01',
    readTime: '12 min read',
    category: 'Brand Strategy',
    tags: ['Brand Strategy', 'Positioning', 'Competitive Analysis', 'Marketing'],
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop&crop=center',
    author: 'Edikan Udoibuot'
  },
  {
    id: '14',
    slug: 'marketing-attribution-modeling',
    title: 'Marketing Attribution: Understanding the Customer Journey',
    content: `
      <h2>The Attribution Challenge</h2>
      <p>Modern customers interact with brands across multiple touchpoints before making a purchase. Understanding which marketing efforts contribute to conversions is crucial for optimizing spend and strategy.</p>
      
      <h3>Attribution Model Types</h3>
      <p>Choose the right attribution model for your business:</p>
      <ul>
        <li><strong>First-Touch Attribution:</strong> Credits the first interaction in the customer journey</li>
        <li><strong>Last-Touch Attribution:</strong> Credits the final interaction before conversion</li>
        <li><strong>Multi-Touch Attribution:</strong> Distributes credit across multiple touchpoints</li>
        <li><strong>Time-Decay Attribution:</strong> Gives more credit to recent interactions</li>
        <li><strong>Algorithmic Attribution:</strong> Uses machine learning to assign credit</li>
      </ul>
      
      <h3>Implementation Strategy</h3>
      <p>Build a comprehensive attribution system:</p>
      <ul>
        <li><strong>Data Collection:</strong> Comprehensive tracking across all marketing channels</li>
        <li><strong>Identity Resolution:</strong> Connecting anonymous and known user sessions</li>
        <li><strong>Cross-Device Tracking:</strong> Following customers across multiple devices</li>
        <li><strong>Offline Integration:</strong> Connecting online and offline touchpoints</li>
      </ul>
      
      <h3>Technical Infrastructure</h3>
      <p>The technical foundation of attribution includes:</p>
      <ul>
        <li>Customer Data Platforms (CDP) for unified profiles</li>
        <li>Advanced analytics and reporting tools</li>
        <li>API integrations between marketing platforms</li>
        <li>Data warehousing for historical analysis</li>
      </ul>
      
      <h3>Actionable Insights</h3>
      <p>Turn attribution data into optimization opportunities by identifying high-performing channel combinations, optimal messaging sequences, and budget allocation opportunities.</p>
      
      <p>The goal of attribution is not perfect measurement but better decision-making. Start simple and add complexity as your team's analytical capabilities mature.</p>
    `,
    excerpt: 'Complete guide to attribution modeling and how to track the true impact of your marketing efforts.',
    date: '2023-11-28',
    readTime: '15 min read',
    category: 'Analytics',
    tags: ['Attribution', 'Analytics', 'Customer Journey', 'Measurement'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center',
    author: 'Edikan Udoibuot'
  },
  {
    id: '15',
    slug: 'mobile-marketing-trends',
    title: 'Mobile Marketing Trends: What to Expect in 2024',
    content: `
      <h2>The Mobile-First Reality</h2>
      <p>Mobile devices account for over 60% of digital media consumption, making mobile marketing strategies essential for business success. Here are the trends shaping mobile marketing in 2024.</p>
      
      <h3>Emerging Mobile Technologies</h3>
      <p>New technologies are creating fresh opportunities:</p>
      <ul>
        <li><strong>5G Networks:</strong> Enabling richer mobile experiences and AR/VR applications</li>
        <li><strong>Progressive Web Apps:</strong> App-like experiences without app store downloads</li>
        <li><strong>Voice Commerce:</strong> Shopping through voice assistants and smart speakers</li>
        <li><strong>Augmented Reality:</strong> Interactive product experiences and virtual try-ons</li>
      </ul>
      
      <h3>Mobile-First Content Strategies</h3>
      <p>Adapt your content for mobile consumption:</p>
      <ul>
        <li><strong>Vertical Video Content:</strong> Optimized for mobile viewing preferences</li>
        <li><strong>Micro-Interactions:</strong> Engaging touch-based interactions</li>
        <li><strong>Thumb-Friendly Design:</strong> Interface optimization for one-handed use</li>
        <li><strong>Load Speed Optimization:</strong> Critical for mobile user retention</li>
      </ul>
      
      <h3>Mobile Commerce Evolution</h3>
      <p>Mobile commerce continues to evolve with new features:</p>
      <ul>
        <li>One-click checkout experiences</li>
        <li>Social commerce integration</li>
        <li>Contactless payments and digital wallets</li>
        <li>Live shopping and interactive commerce</li>
      </ul>
      
      <h3>Privacy and Personalization Balance</h3>
      <p>Navigate the tension between personalization and privacy with transparent data practices and value-exchange models.</p>
      
      <p>Success in mobile marketing requires thinking mobile-first, not mobile-adapted. Design experiences specifically for mobile users rather than scaling down desktop experiences.</p>
    `,
    excerpt: 'Stay ahead of the curve with the latest mobile marketing trends and strategies for mobile-first audiences.',
    date: '2023-11-25',
    readTime: '9 min read',
    category: 'Mobile Marketing',
    tags: ['Mobile Marketing', 'Trends', 'Technology', 'Mobile Commerce'],
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop&crop=center',
    author: 'Edikan Udoibuot'
  },
  {
    id: '16',
    slug: 'video-marketing-engagement',
    title: 'Video Marketing: Creating Content That Drives Engagement',
    content: `
      <h2>The Video Marketing Revolution</h2>
      <p>Video content generates 1,200% more shares than text and image content combined. But creating engaging video content requires understanding platform-specific best practices and audience preferences.</p>
      
      <h3>Platform-Specific Video Strategy</h3>
      <p>Optimize video content for each platform:</p>
      <ul>
        <li><strong>YouTube:</strong> Long-form educational and entertainment content with strong SEO</li>
        <li><strong>Instagram:</strong> Stories, Reels, and IGTV for different engagement types</li>
        <li><strong>TikTok:</strong> Short-form, trend-based content with high entertainment value</li>
        <li><strong>LinkedIn:</strong> Professional insights and thought leadership content</li>
      </ul>
      
      <h3>Content Creation Framework</h3>
      <p>Develop video content using this systematic approach:</p>
      <ul>
        <li><strong>Hook Strategy:</strong> Capture attention in the first 3 seconds</li>
        <li><strong>Storytelling Structure:</strong> Clear beginning, middle, and end with emotional arc</li>
        <li><strong>Value Delivery:</strong> Educational, entertaining, or inspiring content</li>
        <li><strong>Call-to-Action:</strong> Clear next steps for viewer engagement</li>
      </ul>
      
      <h3>Production Best Practices</h3>
      <p>Create professional video content efficiently:</p>
      <ul>
        <li><strong>Planning and Scripts:</strong> Detailed pre-production for efficient filming</li>
        <li><strong>Visual Consistency:</strong> Cohesive brand elements across all videos</li>
        <li><strong>Audio Quality:</strong> Clear audio is more important than perfect video</li>
        <li><strong>Batch Production:</strong> Efficient workflow for consistent content creation</li>
      </ul>
      
      <h3>Performance Optimization</h3>
      <p>Continuously improve video performance through A/B testing of thumbnails, titles, and opening sequences.</p>
      
      <p>The future of video marketing lies in personalization, interactivity, and live streaming. Experiment with these formats while maintaining focus on value creation.</p>
    `,
    excerpt: 'Proven strategies for creating video content that captures attention and drives meaningful engagement.',
    date: '2023-11-22',
    readTime: '13 min read',
    category: 'Video Marketing',
    tags: ['Video Marketing', 'Content Creation', 'Engagement', 'Social Media'],
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=400&fit=crop&crop=center',
    author: 'Edikan Udoibuot'
  },
  {
    id: '17',
    slug: 'ecommerce-personalization',
    title: 'E-commerce Personalization: Increasing Sales Through Customization',
    content: `
      <h2>The Personalization Imperative</h2>
      <p>80% of consumers are more likely to purchase from brands that offer personalized experiences. E-commerce personalization has evolved from "nice-to-have" to business-critical for competitive success.</p>
      
      <h3>Personalization Framework</h3>
      <p>Implement personalization across key touchpoints:</p>
      <ul>
        <li><strong>Product Recommendations:</strong> AI-powered suggestions based on behavior and preferences</li>
        <li><strong>Dynamic Pricing:</strong> Personalized offers and pricing strategies</li>
        <li><strong>Content Personalization:</strong> Customized landing pages and product descriptions</li>
        <li><strong>Email Customization:</strong> Behavioral triggers and personalized campaigns</li>
      </ul>
      
      <h3>Data Collection Strategy</h3>
      <p>Build comprehensive customer profiles through:</p>
      <ul>
        <li><strong>Behavioral Data:</strong> Browsing patterns, purchase history, engagement metrics</li>
        <li><strong>Demographic Data:</strong> Age, location, income, and lifestyle information</li>
        <li><strong>Preference Data:</strong> Explicitly stated preferences and feedback</li>
        <li><strong>Contextual Data:</strong> Device, time, location, and situational factors</li>
      </ul>
      
      <h3>Technology Implementation</h3>
      <p>The technical foundation includes:</p>
      <ul>
        <li>Customer Data Platforms (CDP) for unified profiles</li>
        <li>Machine learning algorithms for prediction and segmentation</li>
        <li>Real-time personalization engines</li>
        <li>A/B testing platforms for optimization</li>
      </ul>
      
      <h3>Privacy-First Personalization</h3>
      <p>Balance personalization with privacy through transparent data practices, consent management, and value exchange models.</p>
      
      <p>Start with simple personalization tactics like browsing-based recommendations, then gradually increase sophistication as you collect more data and refine your algorithms.</p>
    `,
    excerpt: 'How to implement personalization strategies that increase conversion rates and customer satisfaction.',
    date: '2023-11-18',
    readTime: '16 min read',
    category: 'E-commerce',
    tags: ['E-commerce', 'Personalization', 'AI', 'Customer Experience'],
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop&crop=center',
    author: 'Edikan Udoibuot'
  },
  {
    id: '18',
    slug: 'marketing-technology-stack',
    title: 'Building the Perfect Marketing Technology Stack',
    content: `
      <h2>The Modern MarTech Landscape</h2>
      <p>With over 8,000 marketing technology solutions available, building the right MarTech stack is both critical and challenging. The key is selecting tools that integrate well and grow with your business.</p>
      
      <h3>Core Stack Components</h3>
      <p>Every marketing technology stack needs these foundation elements:</p>
      <ul>
        <li><strong>Customer Data Platform:</strong> Unified customer profiles and data management</li>
        <li><strong>Marketing Automation:</strong> Email marketing, lead nurturing, and workflow automation</li>
        <li><strong>Analytics Platform:</strong> Comprehensive performance measurement and reporting</li>
        <li><strong>Content Management:</strong> Website, blog, and digital asset management</li>
        <li><strong>CRM Integration:</strong> Sales and marketing alignment and lead management</li>
      </ul>
      
      <h3>Selection Criteria</h3>
      <p>Evaluate MarTech solutions based on:</p>
      <ul>
        <li><strong>Integration Capabilities:</strong> API availability and data connectivity</li>
        <li><strong>Scalability:</strong> Ability to handle growing data volumes and complexity</li>
        <li><strong>User Experience:</strong> Ease of use for marketing teams</li>
        <li><strong>Total Cost of Ownership:</strong> Including implementation, training, and maintenance</li>
        <li><strong>Vendor Stability:</strong> Company track record and future roadmap</li>
      </ul>
      
      <h3>Implementation Strategy</h3>
      <p>Deploy your MarTech stack systematically:</p>
      <ul>
        <li><strong>Phased Rollout:</strong> Implement core tools first, add complexity gradually</li>
        <li><strong>Data Architecture:</strong> Plan data flows and integration points</li>
        <li><strong>Team Training:</strong> Comprehensive training for maximum adoption</li>
        <li><strong>Governance Framework:</strong> Clear processes for tool usage and data management</li>
      </ul>
      
      <h3>Optimization and Evolution</h3>
      <p>Regularly audit your stack for redundancy, gaps, and optimization opportunities. The goal is maximum efficiency and effectiveness, not maximum tools.</p>
      
      <p>Remember: the best MarTech stack is the one your team actually uses effectively. Focus on adoption and value creation over feature complexity.</p>
    `,
    excerpt: 'Guide to selecting and integrating marketing tools that work together to drive growth and efficiency.',
    date: '2023-11-15',
    readTime: '20 min read',
    category: 'MarTech',
    tags: ['MarTech', 'Technology', 'Marketing Stack', 'Integration'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&crop=center',
    author: 'Edikan Udoibuot'
  }
]

// Fetch single blog post
async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/blog/${slug}`, {
      next: { revalidate: 3600 } // Revalidate every hour
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        // Try fallback data
        const fallbackPost = fallbackBlogPosts.find(post => post.slug === slug)
        return fallbackPost || null
      }
      throw new Error('Failed to fetch blog post')
    }
    
    const data = await response.json()
    return data.success ? data.data : (fallbackBlogPosts.find(post => post.slug === slug) || null)
  } catch (error) {
    console.error('Error fetching blog post:', error)
    // Return fallback data
    const fallbackPost = fallbackBlogPosts.find(post => post.slug === slug)
    return fallbackPost || null
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)
  
  if (!post) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.'
    }
  }
  
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    }
  }
}


interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  
  if (!post) {
    notFound()
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="py-12 bg-gradient-to-b from-muted/30 to-background mt-16">
        <div className="container mx-auto px-6 lg:px-12 xl:px-16">
          <div className="max-w-4xl mx-auto">
            <Link href="/blog">
              <Button variant="ghost" className="mb-8 -ml-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
            
            <div className="mb-6">
              <Badge variant="secondary" className="mb-4">
                {post.category}
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                {post.title}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8">
                {post.excerpt}
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime}</span>
                  </div>
                  <span>By {post.author}</span>
                </div>
                
                <div className="hidden sm:block">
                  <ShareButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Image */}
      <div className="container mx-auto px-6 lg:px-12 xl:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="relative h-64 md:h-96 overflow-hidden rounded-lg shadow-lg">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="py-16">
        <div className="container mx-auto px-6 lg:px-12 xl:px-16">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: post.content }}
                className="text-foreground leading-relaxed"
              />
            </div>

            {/* NEWSLETTER DISABLED - Keeping code for future use */}
            {/* Newsletter CTA after content */}
            {/* <div className="mt-12">
              <NewsletterCTA 
                variant="inline"
                title="Get More Marketing Insights Like This"
                description="Join 2,000+ marketers who get case studies, growth tactics, and AI marketing strategies delivered weekly."
                showStats={true}
                className="border-2 border-primary/20"
              />
            </div> */}
            
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Mobile Share */}
            <div className="sm:hidden mt-8 pt-8 border-t">
              <ShareButton />
            </div>
            
            {/* Navigation */}
            <div className="mt-16 pt-8 border-t">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <Link href="/blog">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    More Articles
                  </Button>
                </Link>
                
                {/* NEWSLETTER DISABLED - Keeping code for future use */}
                {/* <NewsletterCTA 
                  variant="minimal"
                  title="Join the Newsletter"
                  description="Weekly marketing insights and case studies"
                  showStats={false}
                /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      
      {/* NEWSLETTER DISABLED - Keeping code for future use */}
      {/* Newsletter Popup for blog readers */}
      {/* <NewsletterPopup 
        trigger="scroll"
        scrollPercentage={70}
        title="Enjoying This Marketing Content?"
        description="Get weekly case studies and growth tactics that helped scale 50+ products. Join 2,000+ marketers."
      /> */}
    </div>
  )
}