"use client"

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FormInput, FormField } from '@/components/ui/form-field'
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Code,
  Settings,
  Star
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { WysiwygEditor } from '@/components/ui/wysiwyg-editor'
import { ImageUpload } from '@/components/ui/image-upload'
import { Pagination } from '@/components/ui/pagination'

interface Project {
  id: string
  title: string
  description: string
  image: string | null
  technologies: string // JSON string
  githubUrl: string | null
  liveUrl: string | null
  category: string | null
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export default function ProjectManagementPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProjects, setTotalProjects] = useState(0)
  const { toast } = useToast()
  const projectsPerPage = 9

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    technologies: '',
    githubUrl: '',
    liveUrl: '',
    category: '',
    order: 0,
    isActive: true
  })

  useEffect(() => {
    loadProjects()
  }, [currentPage, searchTerm])

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: projectsPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
      })
      
      const response = await fetch(`/api/admin/projects?${queryParams}`)
      const data = await response.json()
      
      if (data.success) {
        setProjects(data.data || [])
        if (data.pagination) {
          setTotalPages(data.pagination.pages)
          setTotalProjects(data.pagination.total)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to load projects",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading projects:', error)
      toast({
        title: "Error", 
        description: "Failed to load projects",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Title and description are required",
        variant: "destructive"
      })
      return
    }

    try {
      const projectData = {
        ...formData,
        technologies: formData.technologies ? JSON.stringify(formData.technologies.split(',').map(t => t.trim())) : '[]'
      }

      const url = editingProject 
        ? `/api/admin/projects`
        : '/api/admin/projects'
        
      const method = editingProject ? 'PUT' : 'POST'
      
      if (editingProject) {
        (projectData as any).id = editingProject.id
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: editingProject ? "Project updated successfully" : "Project created successfully"
        })
        resetForm()
        loadProjects()
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save project",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setFormData({
      title: project.title,
      description: project.description,
      image: project.image || '',
      technologies: project.technologies ? JSON.parse(project.technologies).join(', ') : '',
      githubUrl: project.githubUrl || '',
      liveUrl: project.liveUrl || '',
      category: project.category || '',
      order: project.order,
      isActive: project.isActive
    })
    setShowForm(true)
  }

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const response = await fetch(`/api/admin/projects?id=${projectId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Project deleted successfully"
        })
        loadProjects()
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete project",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      technologies: '',
      githubUrl: '',
      liveUrl: '',
      category: '',
      order: 0,
      isActive: true
    })
    setEditingProject(null)
    setShowForm(false)
  }

  // Projects are now filtered server-side via API

  if (isLoading) {
    return (
      <AdminLayout title="Project Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading projects...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Project Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-8 shadow-lg border border-cyan-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-cyan-900 mb-3">Project Management</h1>
              <p className="text-lg text-cyan-700">Create, edit, and manage your portfolio projects with enhanced tools.</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 px-6 rounded-lg font-medium">
              <Plus className="h-5 w-5 mr-2" />
              Add New Project
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{projects.length}</p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ All projects</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Code className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{projects.filter(p => p.isActive).length}</p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ Live projects</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Eye className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Categories</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{new Set(projects.map(p => p.category).filter(Boolean)).size}</p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ Project types</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Star className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Technologies</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{new Set(projects.flatMap(p => p.technologies ? JSON.parse(p.technologies) : [])).size}</p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ Tech stack</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Settings className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {!showForm ? (
          /* Projects List */
          <div className="space-y-4">
            {/* Search */}
            <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search projects by title, category, or description..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-12 pr-4 h-12 text-lg rounded-lg border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>
            </Card>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="shadow-lg border-0 bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
                        {project.category && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mb-2">
                            {project.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(project)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(project.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                    
                    {project.technologies && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-700 mb-2">Technologies:</p>
                        <div className="flex flex-wrap gap-1">
                          {JSON.parse(project.technologies).slice(0, 3).map((tech: string, index: number) => (
                            <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              {tech}
                            </span>
                          ))}
                          {JSON.parse(project.technologies).length > 3 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              +{JSON.parse(project.technologies).length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                              GitHub
                            </Button>
                          </a>
                        )}
                        {project.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                              Live
                            </Button>
                          </a>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        project.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {project.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {projects.length === 0 && (
              <div className="text-center py-12">
                <Code className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No projects found</p>
                <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalProjects}
              itemsPerPage={projectsPerPage}
            />
          </div>
        ) : (
          /* Project Form */
          <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 p-8 border-b border-cyan-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-cyan-900">
                    {editingProject ? 'Edit Project' : 'Create New Project'}
                  </h2>
                  <p className="text-sm text-cyan-700 mt-1">
                    {editingProject ? 'Update your project details' : 'Showcase your latest work'}
                  </p>
                </div>
                <Button variant="outline" onClick={resetForm} className="h-11 px-6 rounded-lg border-cyan-300 text-cyan-700 hover:bg-cyan-50 font-medium">
                  Cancel
                </Button>
              </div>
            </div>
            <div className="p-8">

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormInput
                  label="Title"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter project title"
                  required
                />
                <FormInput
                  label="Category"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="e.g. Web App, Tool, Workflow"
                />
              </div>

              <FormField label="Description" id="description" required>
                <WysiwygEditor
                  value={formData.description}
                  onChange={(description) => setFormData({...formData, description})}
                  placeholder="Describe your project..."
                  height={250}
                  className="mt-2"
                />
              </FormField>

              <FormInput
                label="Technologies"
                id="technologies"
                name="technologies"
                value={formData.technologies}
                onChange={(e) => setFormData({...formData, technologies: e.target.value})}
                placeholder="React, Next.js, TypeScript, etc. (comma-separated)"
              />

              <ImageUpload
                label="Project Featured Image"
                value={formData.image}
                onChange={(url) => setFormData({...formData, image: url})}
                folder="projects"
                maxSize={3}
                recommendedDimensions={{
                  width: 600,
                  height: 400,
                  aspectRatio: "3:2"
                }}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormInput
                  label="GitHub URL"
                  id="githubUrl"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
                  placeholder="https://github.com/username/repo"
                />
                <FormInput
                  label="Live URL"
                  id="liveUrl"
                  name="liveUrl"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData({...formData, liveUrl: e.target.value})}
                  placeholder="https://project-demo.com"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormInput
                  label="Display Order"
                  id="order"
                  name="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
                <FormField label="Status" id="isActive">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active (visible on website)</label>
                  </div>
                </FormField>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={resetForm} className="h-11 px-6 rounded-lg border-gray-300 hover:bg-gray-50 font-medium">
                  Cancel
                </Button>
                <Button type="submit" className="h-11 px-6 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium">
                  {editingProject ? 'Update Project' : 'Create Project'}
                </Button>
              </div>
            </form>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}