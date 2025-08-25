import { notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Users, Wrench, Workflow } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { prisma } from "@/lib/prisma"
import { generateProjectMetadata } from "@/lib/meta-tags"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  
  const dbProject = await prisma.project.findUnique({
    where: { slug: slug },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      category: true,
      technologies: true,
      createdAt: true,
      updatedAt: true,
    }
  })

  if (!dbProject) {
    return {
      title: 'Project Not Found',
      description: 'The requested project could not be found.',
    }
  }

  // Parse technologies
  let technologies: string[] = []
  try {
    technologies = JSON.parse(dbProject.technologies)
  } catch {
    technologies = dbProject.technologies.split(',').map(tech => tech.trim())
  }

  return generateProjectMetadata({
    ...dbProject,
    category: dbProject.category || 'Tool',
    technologies,
  })
}

interface ProjectDetail {
  id: string
  title: string
  description: string
  type: "tool" | "workflow"
  technologies: string[]
  image: string
  status: "Live" | "In Development" | "Completed"
  overview: string
  challenge: string
  solution: string
  results: string[]
  timeline: string
  team: string
  link?: string
}

interface ProjectPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  
  // Get project from database
  const dbProject = await prisma.project.findUnique({
    where: { slug: slug }
  })

  if (!dbProject) {
    notFound()
  }

  // Parse technologies
  let technologies: string[] = []
  try {
    technologies = JSON.parse(dbProject.technologies)
  } catch {
    technologies = dbProject.technologies.split(',').map(tech => tech.trim())
  }

  // Map database project to original structure
  const project: ProjectDetail = {
    id: dbProject.slug,
    title: dbProject.title,
    description: dbProject.description,
    type: dbProject.category?.toLowerCase().includes('tool') ? "tool" : "workflow",
    technologies: technologies,
    image: dbProject.image || "/placeholder.svg",
    status: "Live",
    overview: dbProject.description,
    challenge: "Manual processes were consuming excessive time and resources, creating bottlenecks in operations and limiting scalability.",
    solution: "Implemented automated solutions and optimized workflows to streamline operations and improve efficiency across all processes.",
    results: [
      "Significant reduction in manual effort",
      "Improved operational efficiency", 
      "Enhanced scalability and performance",
      "Streamlined workflow processes"
    ],
    timeline: "3 months",
    team: "Development Team (3 members)",
    link: dbProject.liveUrl || undefined
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-6 lg:px-12 xl:px-16 max-w-7xl py-12">
          {/* Header */}
          <div className="mb-12">
            <Link href="/projects">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
            </Link>

            <div className="flex flex-wrap items-start gap-3 mb-6">
              <Badge variant={project.type === "tool" ? "default" : "secondary"} className="shrink-0">
                {project.type === "tool" ? (
                  <>
                    <Wrench className="w-3 h-3 mr-1" /> Tool
                  </>
                ) : (
                  <>
                    <Workflow className="w-3 h-3 mr-1" /> Workflow
                  </>
                )}
              </Badge>
              <Badge variant="outline" className="shrink-0">{project.status}</Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 break-words">{project.title}</h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl break-words">{project.description}</p>
          </div>

          {/* Project Image */}
          <div className="mb-12">
            <img
              src={project.image || "/placeholder.svg"}
              alt={project.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Overview */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Project Overview</h2>
                <p className="text-muted-foreground leading-relaxed">{project.overview}</p>
              </div>

              {/* Challenge & Solution */}
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">The Challenge</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{project.challenge}</p>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">The Solution</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{project.solution}</p>
                </Card>
              </div>

              {/* Results */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Key Results</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {project.results.map((result, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm font-medium text-foreground">{result}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Info */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Project Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Timeline</p>
                      <p className="text-sm text-muted-foreground">{project.timeline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Team</p>
                      <p className="text-sm text-muted-foreground">{project.team}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Technologies */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Technologies Used</h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </Card>

              {/* CTA */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Interested in Similar Solutions?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Let's discuss how I can help implement similar tools and workflows for your business.
                </p>
                <Link href="/#contact">
                  <Button className="w-full">Get In Touch</Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}