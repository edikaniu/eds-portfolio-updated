import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ProjectsPageClient } from "@/components/projects-page-client"
import { projectsMetadata } from "@/lib/meta-tags"

export const metadata = projectsMetadata

interface Project {
  id: string
  title: string
  description: string
  type: "tool" | "workflow"
  technologies: string[]
  image: string
  status: "Live" | "In Development" | "Completed"
}

// Function to fetch projects from the API
async function getProjects() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'}/api/projects`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch projects')
    }
    
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error('Error fetching projects:', error)
    // Return fallback data in case of API failure
    return []
  }
}

export default async function ProjectsPage() {
  const allProjects = await getProjects()
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-6 lg:px-12 xl:px-16 max-w-7xl py-12 pt-20">
          {/* Header */}
          <div className="mb-12">
            <Link href="/#projects">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">All Projects</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              A comprehensive collection of tools and workflows I've built to drive growth and optimize marketing
              performance
            </p>
          </div>

          {/* Client-side interactive components */}
          <ProjectsPageClient projects={allProjects} />
        </div>
      </main>
      <Footer />
    </>
  )
}
