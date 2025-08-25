"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wrench, Workflow, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface Project {
  id: string
  slug: string
  title: string
  description: string
  type: "tool" | "workflow"
  technologies: string[]
  image: string
  status: "Live" | "In Development" | "Completed"
}

interface ProjectsPageClientProps {
  projects: Project[]
}

export function ProjectsPageClient({ projects }: ProjectsPageClientProps) {
  const [filter, setFilter] = useState<"all" | "tool" | "workflow">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  const filteredProjects = projects.filter((project) => (filter === "all" ? true : project.type === filter))

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProjects = filteredProjects.slice(startIndex, endIndex)

  const handleFilterChange = (newFilter: "all" | "tool" | "workflow") => {
    setFilter(newFilter)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  return (
    <>
      {/* Filter Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-12"
      >
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => handleFilterChange("all")}
          className="px-4 sm:px-6 w-full sm:w-auto"
        >
          All Projects ({projects.length})
        </Button>
        <Button
          variant={filter === "tool" ? "default" : "outline"}
          onClick={() => handleFilterChange("tool")}
          className="px-4 sm:px-6 w-full sm:w-auto"
        >
          <Wrench className="w-4 h-4 mr-2" />
          Tools ({projects.filter((p) => p.type === "tool").length})
        </Button>
        <Button
          variant={filter === "workflow" ? "default" : "outline"}
          onClick={() => handleFilterChange("workflow")}
          className="px-4 sm:px-6 w-full sm:w-auto"
        >
          <Workflow className="w-4 h-4 mr-2" />
          Workflows ({projects.filter((p) => p.type === "workflow").length})
        </Button>
      </motion.div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {currentProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Link href={`/project/${project.slug}`}>
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/20 h-full flex flex-col">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant={project.type === "tool" ? "default" : "secondary"}>
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
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs">
                      {project.status}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
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
                  <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-auto">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mb-12">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-10 h-10"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  )
}