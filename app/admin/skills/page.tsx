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
  Code,
  Star,
  Target,
  TrendingUp
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { WysiwygEditor } from '@/components/ui/wysiwyg-editor'
import { Pagination } from '@/components/ui/pagination'

interface Skill {
  name: string
  proficiency: number
}

interface SkillCategory {
  id: string
  title: string
  description: string
  color: string
  skills: Skill[]
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export default function SkillsManagementPage() {
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCategories, setTotalCategories] = useState(0)
  const { toast } = useToast()
  const categoriesPerPage = 9

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: '#3B82F6',
    skills: [] as Skill[],
    order: 0
  })

  useEffect(() => {
    loadSkillCategories()
  }, [currentPage, searchTerm])

  const loadSkillCategories = async () => {
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: categoriesPerPage.toString(),
        includeInactive: 'true',
        ...(searchTerm && { search: searchTerm })
      })
      
      const response = await fetch(`/api/admin/skills?${queryParams}`)
      const data = await response.json()
      
      if (data.success) {
        setSkillCategories(data.data || [])
        if (data.pagination) {
          setTotalPages(data.pagination.pages)
          setTotalCategories(data.pagination.total)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to load skill categories",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading skill categories:', error)
      toast({
        title: "Error", 
        description: "Failed to load skill categories",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
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
      const categoryData = {
        ...formData,
        skills: formData.skills.filter(s => s.name.trim() !== '' && s.proficiency > 0)
      }

      const url = '/api/admin/skills'
      const method = editingCategory ? 'PUT' : 'POST'
      
      if (editingCategory) {
        (categoryData as any).id = editingCategory.id
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: editingCategory ? "Skill category updated successfully" : "Skill category created successfully"
        })
        resetForm()
        loadSkillCategories()
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save skill category",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (category: SkillCategory) => {
    setEditingCategory(category)
    setFormData({
      title: category.title,
      description: category.description,
      color: category.color,
      skills: category.skills || [],
      order: category.order
    })
    setShowForm(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this skill category?')) return

    try {
      const response = await fetch(`/api/admin/skills?id=${categoryId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Skill category deleted successfully"
        })
        loadSkillCategories()
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete skill category",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      color: '#3B82F6',
      skills: [],
      order: 0
    })
    setEditingCategory(null)
    setShowForm(false)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, { name: '', proficiency: 0 }]
    }))
  }

  const updateSkill = (index: number, field: 'name' | 'proficiency', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      )
    }))
  }

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  // Categories are now filtered server-side via API

  const totalSkills = skillCategories.reduce((total, category) => total + category.skills.length, 0)
  const averageProficiency = skillCategories.reduce((total, category) => {
    const categoryAvg = category.skills.reduce((sum, skill) => sum + skill.proficiency, 0) / category.skills.length
    return total + (isNaN(categoryAvg) ? 0 : categoryAvg)
  }, 0) / skillCategories.length

  if (isLoading) {
    return (
      <AdminLayout title="Skills Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading skill categories...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Skills Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl p-8 shadow-lg border border-violet-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-violet-900 mb-3">Skills Management</h1>
              <p className="text-lg text-violet-700">Organize your technical and professional skills with proficiency tracking.</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 px-6 rounded-lg font-medium">
              <Plus className="h-5 w-5 mr-2" />
              Add Skill Category
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Categories</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{skillCategories.length}</p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ Skill groups</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Code className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Skills</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalSkills}</p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ Documented abilities</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Star className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Avg. Proficiency</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{Math.round(averageProficiency || 0)}%</p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ Skill mastery</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Categories</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{skillCategories.filter(c => c.isActive).length}</p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ Visible skills</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {!showForm ? (
          /* Skill Categories List */
          <div className="space-y-4">
            {/* Search */}
            <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-violet-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search skill categories and individual skills..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-12 pr-4 h-12 text-lg rounded-lg border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>
            </Card>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skillCategories.map((category) => (
                <Card key={category.id} className="shadow-lg border-0 bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {category.skills && category.skills.length > 0 && (
                      <div className="space-y-3">
                        {category.skills.map((skill, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                              <span className="text-sm text-gray-500">{skill.proficiency}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${skill.proficiency}%`,
                                  backgroundColor: category.color 
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {category.skills.length} skill{category.skills.length !== 1 ? 's' : ''} • Order: {category.order}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        category.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {skillCategories.length === 0 && (
              <div className="text-center py-12">
                <Code className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No skill categories found</p>
                <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Skill Category
                </Button>
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalCategories}
              itemsPerPage={categoriesPerPage}
            />
          </div>
        ) : (
          /* Skill Category Form */
          <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-violet-50 to-violet-100 p-8 border-b border-violet-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-violet-900">
                    {editingCategory ? 'Edit Skill Category' : 'Add New Skill Category'}
                  </h2>
                  <p className="text-sm text-violet-700 mt-1">
                    {editingCategory ? 'Update your skill category and proficiency levels' : 'Create a new skill category with proficiency tracking'}
                  </p>
                </div>
                <Button variant="outline" onClick={resetForm} className="h-11 px-6 rounded-lg border-violet-300 text-violet-700 hover:bg-violet-50 font-medium">
                  Cancel
                </Button>
              </div>
            </div>
            <div className="p-8">

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormInput
                  label="Category Title"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Programming Languages, Design Tools"
                  required
                />
                <FormField label="Category Color" id="color">
                  <input
                    id="color"
                    name="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </FormField>
              </div>

              <FormField label="Description" id="description" required>
                <WysiwygEditor
                  value={formData.description}
                  onChange={(description) => setFormData({...formData, description})}
                  placeholder="Brief description of this skill category"
                  height={200}
                  className="mt-2"
                />
              </FormField>

              <FormField label="Skills" id="skills">
                <div className="space-y-3">
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => updateSkill(index, 'name', e.target.value)}
                        placeholder="Skill name"
                        className="flex-1 flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={skill.proficiency}
                          onChange={(e) => updateSkill(index, 'proficiency', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="w-16 flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm"
                        onClick={() => removeSkill(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addSkill}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                  </Button>
                </div>
              </FormField>

              <FormInput
                label="Display Order"
                id="order"
                name="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                placeholder="0"
              />

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={resetForm} className="h-11 px-6 rounded-lg border-gray-300 hover:bg-gray-50 font-medium">
                  Cancel
                </Button>
                <Button type="submit" className="h-11 px-6 rounded-lg bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium">
                  {editingCategory ? 'Update Category' : 'Create Category'}
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