import dynamic from 'next/dynamic'
import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { Footer } from "@/components/footer"

// Lazy load below-the-fold sections for better performance
const AboutSection = dynamic(() => import("@/components/about-section").then(mod => ({ default: mod.AboutSection })), {
  ssr: true // Keep SSR for SEO
})

const SkillsSection = dynamic(() => import("@/components/skills-section").then(mod => ({ default: mod.SkillsSection })), {
  ssr: true,
  loading: () => <div className="py-24 bg-card/30"><div className="container mx-auto text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div></div>
})

const CaseStudiesSection = dynamic(() => import("@/components/case-studies-section").then(mod => ({ default: mod.CaseStudiesSection })), {
  ssr: true,
  loading: () => <div className="py-24 bg-background"><div className="container mx-auto text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div></div>
})

const ExperienceTimeline = dynamic(() => import("@/components/experience-timeline").then(mod => ({ default: mod.ExperienceTimeline })), {
  ssr: true,
  loading: () => <div className="py-24 bg-background"><div className="container mx-auto text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div></div>
})

const ProjectsSection = dynamic(() => import("@/components/projects-section").then(mod => ({ default: mod.ProjectsSection })), {
  ssr: true,
  loading: () => <div className="py-24 bg-card/30"><div className="container mx-auto text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div></div>
})

const BlogSection = dynamic(() => import("@/components/blog-section").then(mod => ({ default: mod.BlogSection })), {
  ssr: true,
  loading: () => <div className="py-24 bg-background"><div className="container mx-auto text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div></div>
})

const ContactSection = dynamic(() => import("@/components/contact-section").then(mod => ({ default: mod.ContactSection })), {
  ssr: true,
  loading: () => <div className="py-24 bg-card/30"><div className="container mx-auto text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div></div>
})
import { logger } from "@/lib/logger"
import { homeMetadata } from "@/lib/meta-tags"
import { NewsletterCTA, NewsletterPopup } from "@/components/newsletter"

export const metadata = homeMetadata

// Function to fetch blog posts from the API
async function getBlogPosts() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/blog?limit=6`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch blog posts')
    }
    
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    logger.error('Failed to fetch blog posts', error, { context: 'homepage' })
    // Return fallback blog posts
    return [
      {
        id: '1',
        slug: 'ai-marketing-transformation',
        title: 'How AI is Transforming Marketing: A Practical Guide',
        excerpt: 'Discover how artificial intelligence is revolutionizing marketing strategies and learn practical ways to implement AI in your campaigns.',
        date: '2024-01-15',
        readTime: '8 min read',
        category: 'AI & Marketing',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop&crop=center',
        author: 'Edikan Udoibuot'
      },
      {
        id: '2',
        slug: 'growth-hacking-strategies',
        title: '10 Growth Hacking Strategies That Actually Work',
        excerpt: 'Learn proven growth hacking techniques that helped scale products from 100 to 10,000+ users in just months.',
        date: '2024-01-10',
        readTime: '12 min read',
        category: 'Growth Marketing',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop&crop=center',
        author: 'Edikan Udoibuot'
      },
      {
        id: '3',
        slug: 'email-marketing-mastery',
        title: 'Email Marketing Mastery: From 3K to 25K Subscribers',
        excerpt: 'The exact strategies and tactics I used to achieve 733% email list growth in just 3 months.',
        date: '2024-01-05',
        readTime: '15 min read',
        category: 'Email Marketing',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop&crop=center',
        author: 'Edikan Udoibuot'
      }
    ]
  }
}

// Function to fetch projects from the API
async function getProjects() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/projects?limit=6`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch projects')
    }
    
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    logger.error('Failed to fetch projects', error, { context: 'homepage' })
    // Return fallback projects with diverse mix including campaigns
    return [
      {
        id: '1',
        slug: 'ai-marketing-automation-suite',
        title: 'AI Marketing Automation Suite',
        description: 'Comprehensive marketing automation platform leveraging AI for personalized campaigns and lead nurturing.',
        type: 'workflow',
        technologies: ['Next.js', 'TypeScript', 'OpenAI API', 'HubSpot API', 'PostgreSQL'],
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&crop=center',
        status: 'Live'
      },
      {
        id: '2',
        slug: 'growth-analytics-dashboard',
        title: 'Growth Analytics Dashboard',
        description: 'Real-time dashboard for tracking marketing performance across multiple channels and campaigns.',
        type: 'tool',
        technologies: ['React', 'D3.js', 'Node.js', 'Google Analytics API', 'Chart.js'],
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop&crop=center',
        status: 'Live'
      },
      {
        id: '5',
        slug: 'saas-growth-campaign',
        title: 'SaaS Growth Campaign',
        description: 'Multi-channel growth campaign that scaled a B2B SaaS from 100 to 10,000 users through strategic acquisition.',
        type: 'campaign',
        technologies: ['Google Ads', 'Facebook Ads', 'LinkedIn Ads', 'HubSpot', 'Mixpanel', 'Intercom'],
        image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=250&fit=crop&crop=center',
        status: 'Completed'
      },
      {
        id: '3',
        slug: 'email-campaign-optimizer',
        title: 'Email Campaign Optimizer',
        description: 'AI-powered email optimization tool that improves open rates and click-through rates using machine learning.',
        type: 'tool',
        technologies: ['Python', 'Flask', 'TensorFlow', 'SendGrid API', 'React'],
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop&crop=center',
        status: 'Live'
      },
      {
        id: '8',
        slug: 'ecommerce-retention-campaign',
        title: 'E-commerce Retention Campaign',
        description: 'Customer retention campaign that increased repeat purchase rate by 300% through personalized experiences.',
        type: 'campaign',
        technologies: ['Klaviyo', 'Shopify', 'Google Analytics', 'Facebook Pixel', 'Hotjar'],
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop&crop=center',
        status: 'Completed'
      },
      {
        id: '4',
        slug: 'social-media-scheduler',
        title: 'Social Media Scheduler',
        description: 'Advanced social media scheduling platform with AI-powered content suggestions and analytics.',
        type: 'workflow',
        technologies: ['Vue.js', 'Laravel', 'Redis', 'Twitter API', 'Instagram API'],
        image: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=400&h=250&fit=crop&crop=center',
        status: 'In Development'
      }
    ]
  }
}

export default async function Home() {
  const [blogPosts, projects] = await Promise.all([
    getBlogPosts(),
    getProjects()
  ])
  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        <section id="home">
          <HeroSection />
        </section>
        <section id="about">
          <AboutSection />
        </section>
        <section id="skills">
          <SkillsSection />
        </section>
        <section id="projects">
          <ProjectsSection projects={projects} />
        </section>
        <section id="case-studies">
          <CaseStudiesSection />
        </section>
        
        {/* Newsletter CTA after case studies */}
        <section className="py-24 bg-gradient-to-b from-card/30 to-background">
          <div className="container mx-auto px-6 lg:px-12 xl:px-16">
            <NewsletterCTA 
              variant="card"
              title="Get Marketing Insights That Scale"
              description="Join 2,000+ marketers getting weekly case studies, growth tactics, and AI-powered strategies. The marketing insights I don't share publicly."
              showStats={true}
              showBenefits={true}
            />
          </div>
        </section>
        
        <section id="blog">
          <BlogSection posts={blogPosts} />
        </section>
        <section id="experience">
          <ExperienceTimeline />
        </section>
        <section id="contact">
          <ContactSection />
        </section>
      </main>
      <Footer />
      
      {/* Newsletter Popup for homepage visitors */}
      <NewsletterPopup 
        trigger="timer"
        delay={45000}
        title="Ready to Scale Your Marketing?"
        description="Get the strategies that helped scale 50+ products. Weekly case studies, AI tools, and growth tactics delivered every Tuesday."
      />
    </>
  )
}
