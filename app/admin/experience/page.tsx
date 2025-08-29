"use client"

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FormInput, FormSelect, FormField } from '@/components/ui/form-field'
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Briefcase,
  Calendar,
  Building,
  Award
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { WysiwygEditor } from '@/components/ui/wysiwyg-editor'
import { Pagination } from '@/components/ui/pagination'

interface ExperienceEntry {
  id: string
  title: string
  company: string
  period: string
  type: string
  category: string
  achievements: string[]
  metrics: string | null
  icon: string | null
  color: string | null
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export default function ExperienceManagementPage() {
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingExperience, setEditingExperience] = useState<ExperienceEntry | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalExperiences, setTotalExperiences] = useState(0)
  const { toast } = useToast()
  const experiencesPerPage = 9

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    period: '',
    type: 'work',
    category: 'professional',
    achievements: [] as string[],
    metrics: '',
    icon: '',
    color: '#3B82F6',
    order: 0
  })

  useEffect(() => {
    loadExperiences()
  }, [currentPage, searchTerm])

  const loadExperiences = async () => {
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: experiencesPerPage.toString(),
        includeInactive: 'true',
        ...(searchTerm && { search: searchTerm })
      })
      
      const response = await fetch(`/api/admin/experience?${queryParams}`)
      const data = await response.json()
      
      if (data.success) {
        setExperiences(data.data || [])
        if (data.pagination) {
          setTotalPages(data.pagination.pages)
          setTotalExperiences(data.pagination.total)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to load experience entries",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading experiences:', error)
      toast({
        title: "Error", 
        description: "Failed to load experience entries",
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
    
    if (!formData.title || !formData.company || !formData.period) {
      toast({
        title: "Validation Error",
        description: "Title, company, and period are required",
        variant: "destructive"
      })
      return
    }

    try {
      const experienceData = {
        ...formData,
        achievements: formData.achievements.filter(a => a.trim() !== '')
      }

      const url = '/api/admin/experience'
      const method = editingExperience ? 'PUT' : 'POST'
      
      if (editingExperience) {
        (experienceData as any).id = editingExperience.id
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(experienceData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: editingExperience ? "Experience updated successfully" : "Experience created successfully"
        })
        resetForm()
        loadExperiences()
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save experience entry",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (experience: ExperienceEntry) => {
    setEditingExperience(experience)
    setFormData({
      title: experience.title,
      company: experience.company,
      period: experience.period,
      type: experience.type,
      category: experience.category,
      achievements: experience.achievements || [],
      metrics: experience.metrics || '',
      icon: experience.icon || '',
      color: experience.color || '#3B82F6',
      order: experience.order
    })
    setShowForm(true)
  }

  const handleDelete = async (experienceId: string) => {
    if (!confirm('Are you sure you want to delete this experience entry?')) return

    try {
      const response = await fetch(`/api/admin/experience?id=${experienceId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Experience entry deleted successfully"
        })
        loadExperiences()
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete experience entry",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      period: '',
      type: 'work',
      category: 'professional',
      achievements: [],
      metrics: '',
      icon: '',
      color: '#3B82F6',
      order: 0
    })
    setEditingExperience(null)
    setShowForm(false)
  }

  const addAchievement = () => {
    setFormData(prev => ({
      ...prev,
      achievements: [...prev.achievements, '']
    }))
  }

  const updateAchievement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.map((ach, i) => i === index ? value : ach)
    }))
  }

  const removeAchievement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }))
  }

  // Experiences are now filtered server-side via API

  if (isLoading) {
    return (
      <AdminLayout title="Experience Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading experience entries...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Experience Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-8 shadow-lg border border-emerald-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-emerald-900 mb-3">Experience Management</h1>
              <p className="text-lg text-emerald-700">Manage your professional experience and career timeline with precision.</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 px-6 rounded-lg font-medium">
              <Plus className="h-5 w-5 mr-2" />
              Add Experience
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Entries</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{experiences.length}</p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ Career milestones</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Work Experience</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{experiences.filter(e => e.type === 'work').length}</p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ Professional roles</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Education</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{experiences.filter(e => e.type === 'education').length}</p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ Academic achievements</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Award className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{experiences.filter(e => e.isActive).length}</p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ Displayed entries</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {!showForm ? (
          /* Experience List */
          <div className="space-y-4">
            {/* Search */}
            <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search experience entries by title, company, or category..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-12 pr-4 h-12 text-lg rounded-lg border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>
            </Card>

            {/* Experience Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiences.map((experience) => (
                <Card key={experience.id} className="shadow-lg border-0 bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: experience.color || '#3B82F6' }}
                          />
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            {experience.type} • {experience.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{experience.title}</h3>
                        <p className="text-sm text-gray-600 mb-1">{experience.company}</p>
                        <p className="text-xs text-gray-500">{experience.period}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(experience)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(experience.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {experience.achievements && experience.achievements.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-700 mb-2">Key Achievements:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {experience.achievements.slice(0, 2).map((achievement, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              <span className="line-clamp-2">{achievement}</span>
                            </li>
                          ))}
                          {experience.achievements.length > 2 && (
                            <li className="text-xs text-gray-500">
                              +{experience.achievements.length - 2} more achievements
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    {experience.metrics && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-700 mb-1">Metrics:</p>
                        <p className="text-sm text-gray-600">{experience.metrics}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Order: {experience.order}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        experience.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {experience.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {experiences.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No experience entries found</p>
                <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Experience
                </Button>
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalExperiences}
              itemsPerPage={experiencesPerPage}
            />
          </div>
        ) : (
          /* Experience Form */
          <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-8 border-b border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-emerald-900">
                    {editingExperience ? 'Edit Experience Entry' : 'Add New Experience Entry'}
                  </h2>
                  <p className="text-sm text-emerald-700 mt-1">
                    {editingExperience ? 'Update your experience details' : 'Add a new milestone to your career journey'}
                  </p>
                </div>
                <Button variant="outline" onClick={resetForm} className="h-11 px-6 rounded-lg border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-medium">
                  Cancel
                </Button>
              </div>
            </div>
            <div className="p-8">

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormInput
                  label="Job Title / Role"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Marketing Manager, Software Engineer, etc."
                  required
                />
                <FormInput
                  label="Company / Institution"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  placeholder="Company name or educational institution"
                  required
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <FormInput
                  label="Period"
                  id="period"
                  name="period"
                  value={formData.period}
                  onChange={(e) => setFormData({...formData, period: e.target.value})}
                  placeholder="Jan 2020 - Present"
                  required
                />
                <FormSelect
                  label="Type"
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  options={[
                    { value: "work", label: "Work" },
                    { value: "education", label: "Education" },
                    { value: "volunteer", label: "Volunteer" },
                    { value: "certification", label: "Certification" }
                  ]}
                />
                <FormSelect
                  label="Category"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  options={[
                    { value: "professional", label: "Professional" },
                    { value: "academic", label: "Academic" },
                    { value: "personal", label: "Personal" },
                    { value: "freelance", label: "Freelance" }
                  ]}
                />
              </div>

              <FormField label="Key Achievements" id="achievements">
                <div className="space-y-2">
                  {formData.achievements.map((achievement, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={achievement}
                        onChange={(e) => updateAchievement(index, e.target.value)}
                        placeholder="Describe a key achievement or responsibility"
                        className="flex-1 flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm"
                        onClick={() => removeAchievement(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addAchievement}>
                    Add Achievement
                  </Button>
                </div>
              </FormField>

              <FormField label="Metrics/Results" id="metrics">
                <WysiwygEditor
                  value={formData.metrics}
                  onChange={(metrics) => setFormData({...formData, metrics})}
                  placeholder="Quantifiable results, KPIs achieved, etc."
                  height={200}
                  className="mt-2"
                />
              </FormField>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <FormField label="Color" id="color">
                  <input
                    id="color"
                    name="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </FormField>
                <FormInput
                  label="Icon (Lucide icon name)"
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  placeholder="briefcase, graduation-cap, etc."
                />
                <FormInput
                  label="Display Order"
                  id="order"
                  name="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={resetForm} className="h-11 px-6 rounded-lg border-gray-300 hover:bg-gray-50 font-medium">
                  Cancel
                </Button>
                <Button type="submit" className="h-11 px-6 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium">
                  {editingExperience ? 'Update Experience' : 'Add Experience'}
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