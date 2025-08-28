"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wrench, Workflow, Target, ArrowRight } from "lucide-react"
import Link from "next/link"

interface Project {
  id: string
  slug: string
  title: string
  description: string
  type: "tool" | "workflow" | "campaign"
  technologies: string[]
  image?: string
  status: "Live" | "In Development" | "Completed"
}

interface ProjectsSectionProps {
  projects?: Project[]
}

export function ProjectsSection({ projects = [] }: ProjectsSectionProps) {
  const [filter, setFilter] = useState<"all" | "tool" | "workflow" | "campaign">("all")
  const [isVisible, setIsVisible] = useState(false)

  const filteredProjects = projects.filter((project) =>
    filter === "all" ? true : project.type === filter,
  )

  const displayedProjects = filteredProjects.slice(0, 6)

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6 lg:px-12 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          onViewportEnter={() => setIsVisible(true)}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Projects</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Explore the workflows and tools I've built to drive growth and optimize marketing performance
          </p>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className="px-6"
            >
              All Projects
            </Button>
            <Button
              variant={filter === "tool" ? "default" : "outline"}
              onClick={() => setFilter("tool")}
              className="px-6"
            >
              <Wrench className="w-4 h-4 mr-2" />
              Tools
            </Button>
            <Button
              variant={filter === "workflow" ? "default" : "outline"}
              onClick={() => setFilter("workflow")}
              className="px-6"
            >
              <Workflow className="w-4 h-4 mr-2" />
              Workflows
            </Button>
            <Button
              variant={filter === "campaign" ? "default" : "outline"}
              onClick={() => setFilter("campaign")}
              className="px-6"
            >
              <Target className="w-4 h-4 mr-2" />
              Campaigns
            </Button>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {displayedProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={`/project/${project.slug}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/20 h-full">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant={project.type === "tool" ? "default" : project.type === "workflow" ? "secondary" : "destructive"}>
                        {project.type === "tool" ? (
                          <>
                            <Wrench className="w-3 h-3 mr-1" /> Tool
                          </>
                        ) : project.type === "workflow" ? (
                          <>
                            <Workflow className="w-3 h-3 mr-1" /> Workflow
                          </>
                        ) : (
                          <>
                            <Target className="w-3 h-3 mr-1" /> Campaign
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-grow line-clamp-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.technologies.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto font-medium text-primary hover:text-primary/80"
                      >
                        View Details
                      </Button>
                      <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Projects Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <Link href="/projects">
            <Button variant="outline" size="lg" className="px-8 bg-transparent">
              View All Projects
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
