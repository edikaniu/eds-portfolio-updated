import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { SkillsSection } from "@/components/skills-section"
import { CaseStudiesSection } from "@/components/case-studies-section"
import { ExperienceTimeline } from "@/components/experience-timeline"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { ProjectsSection } from "@/components/projects-section"
import { BlogSection } from "@/components/blog-section"
import { logger } from "@/lib/logger"
import { homeMetadata } from "@/lib/meta-tags"

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
    // Return fallback projects
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
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&crop=center',
        status: 'Live'
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
    </>
  )
}
