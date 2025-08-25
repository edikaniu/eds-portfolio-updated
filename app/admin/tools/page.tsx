"use client"

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FormInput, FormField, FormSelect } from '@/components/ui/form-field'
import { ImageUpload } from '@/components/ui/image-upload'
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Wrench,
  Package,
  Hash,
  Eye
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Tool {
  id: string
  name: string
  description: string | null
  logoUrl: string | null
  category: string | null
  color: string | null
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export default function ToolsManagementPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: '',
    category: '',
    color: '#3B82F6',
    order: 0
  })

  useEffect(() => {
    loadTools()
  }, [])

  const loadTools = async () => {
    try {
      const response = await fetch('/api/admin/tools')
      const data = await response.json()
      
      if (data.success) {
        setTools(data.data || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to load tools",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading tools:', error)
      toast({
        title: "Error", 
        description: "Failed to load tools",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Tool name is required",
        variant: "destructive"
      })
      return
    }

    try {
      const url = editingTool 
        ? `/api/admin/tools`
        : '/api/admin/tools'
        
      const method = editingTool ? 'PUT' : 'POST'
      
      const payload = editingTool 
        ? { id: editingTool.id, ...formData }
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: editingTool 
            ? "Tool updated successfully"
            : "Tool created successfully"
        })
        resetForm()
        loadTools()
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save tool",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool)
    setFormData({
      name: tool.name,
      description: tool.description || '',
      logoUrl: tool.logoUrl || '',
      category: tool.category || '',
      color: tool.color || '#3B82F6',
      order: tool.order
    })
    setShowForm(true)
  }

  const handleDelete = async (toolId: string) => {
    if (!confirm('Are you sure you want to delete this tool?')) return

    try {
      const response = await fetch(`/api/admin/tools?id=${toolId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Tool deleted successfully"
        })
        loadTools()
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tool",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      logoUrl: '',
      category: '',
      color: '#3B82F6',
      order: 0
    })
    setEditingTool(null)
    setShowForm(false)
  }

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categories = [...new Set(tools.map(t => t.category).filter(Boolean))]

  if (isLoading) {
    return (
      <AdminLayout title="Tools & Technology">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tools...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Tools & Technology">
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8 shadow-lg border border-orange-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-orange-900 mb-3">Tools & Technology</h1>
              <p className="text-lg text-orange-700">Manage your professional tools and technologies with visual branding.</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 px-6 rounded-lg font-medium">
              <Plus className="h-5 w-5 mr-2" />
              Add New Tool
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Tools</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{tools.length}</p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ All tools</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Wrench className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Categories</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{categories.length}</p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ Tool types</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">With Logos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{tools.filter(t => t.logoUrl).length}</p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ Visual tools</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Eye className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Order Range</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">1-{tools.length}</p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ Display order</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Hash className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {!showForm ? (
          /* Tools List */
          <div className="space-y-6">
            {/* Search */}
            <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search tools and technologies by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 h-12 text-lg rounded-lg border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>
            </Card>

            {/* Tools Grid */}
            <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTools.map((tool) => (
                    <Card key={tool.id} className="p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="flex flex-col items-center text-center space-y-4">
                      {/* Logo */}
                      {tool.logoUrl ? (
                        <div className="w-16 h-16 flex items-center justify-center bg-gray-50 rounded-lg">
                          <img 
                            src={tool.logoUrl} 
                            alt={tool.name}
                            className="w-12 h-12 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
                            }}
                          />
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center hidden">
                            <Wrench className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="w-16 h-16 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: tool.color || '#3B82F6' }}
                        >
                          <Wrench className="h-8 w-8 text-white" />
                        </div>
                      )}

                      {/* Tool Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{tool.name}</h3>
                        {tool.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{tool.description}</p>
                        )}
                        {tool.category && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {tool.category}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(tool)}
                          className="flex-1 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 px-3 border-gray-200 transition-colors"
                          onClick={() => handleDelete(tool.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Order */}
                      <div className="text-xs text-gray-500">Order: {tool.order}</div>
                    </div>
                  </Card>
                ))}
              </div>
                {filteredTools.length === 0 && (
                  <div className="text-center py-16 px-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Wrench className="h-10 w-10 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No tools found</h3>
                    <p className="text-gray-600 mb-6 max-w-sm mx-auto">Get started by adding your first professional tool or technology with visual branding.</p>
                    <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 px-6 rounded-lg font-medium">
                      <Plus className="h-5 w-5 mr-2" />
                      Add Your First Tool
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ) : (
          /* Tool Form */
          <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-8 border-b border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-orange-900">
                    {editingTool ? 'Edit Tool' : 'Add New Tool'}
                  </h2>
                  <p className="text-sm text-orange-700 mt-1">
                    {editingTool ? 'Update tool details and branding' : 'Add a new tool to your technology stack'}
                  </p>
                </div>
                <Button variant="outline" onClick={resetForm} className="h-11 px-6 rounded-lg border-orange-300 text-orange-700 hover:bg-orange-50 font-medium">
                  Cancel
                </Button>
              </div>
            </div>
            <div className="p-8">

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormInput
                  label="Tool Name"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Google Analytics"
                  required
                />
                <FormInput
                  label="Category"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="e.g. Analytics, Design, Marketing"
                />
              </div>

              <FormField label="Description" id="description">
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the tool"
                  rows={3}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </FormField>

              <ImageUpload
                value={formData.logoUrl}
                onChange={(logoUrl) => setFormData({...formData, logoUrl})}
                label="Tool Logo"
                placeholder="Upload logo or enter image URL"
                id="logoUrl"
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField label="Brand Color" id="color">
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      placeholder="#3B82F6"
                      className="flex-1 flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
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
                  min="0"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={resetForm} className="h-11 px-6 rounded-lg border-gray-300 hover:bg-gray-50 font-medium">
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="h-11 px-6 rounded-lg bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                >
                  {editingTool ? 'Update Tool' : 'Create Tool'}
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