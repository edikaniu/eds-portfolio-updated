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
    return []
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
    return []
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
