"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ImageUpload } from '@/components/ui/image-upload'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  Plus,
  Edit,
  Trash2,
  Briefcase,
  Eye,
  Image,
  ExternalLink,
  Loader2,
  Save,
  X,
  Target,
  Calendar
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/admin-layout'

interface CaseStudy {
  id: string
  title: string
  slug: string
  subtitle: string
  description: string
  fullDescription: string
  image: string | null
  metrics: {
    primary: string
    primaryLabel: string
    secondary: string
    secondaryLabel: string
  }
  results: string[]
  tools: string[]
  category: string
  color: string
  icon: string | null
  challenge: string
  solution: string
  timeline: Array<{
    phase: string
    duration: string
    description: string
  }>
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const categories = ["Growth Marketing", "Email Marketing", "AI & Automation", "SEO & Content", "E-commerce", "Social Media", "Brand Marketing"]

export default function CaseStudiesManagementPage() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCaseStudy, setEditingCaseStudy] = useState<CaseStudy | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    subtitle: '',
    description: '',
    fullDescription: '',
    image: '',
    metrics: {
      primary: '',
      primaryLabel: '',
      secondary: '',
      secondaryLabel: ''
    },
    results: [''],
    tools: [''],
    category: '',
    color: 'from-primary to-blue-600',
    icon: 'Bot',
    challenge: '',
    solution: '',
    timeline: [{ phase: '', duration: '', description: '' }],
    order: 0
  })

  useEffect(() => {
    checkAuth()
    loadCaseStudies()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/me')
      const data = await response.json()
      if (!data.success) {
        router.push('/admin/login')
      }
    } catch (error) {
      router.push('/admin/login')
    }
  }

  const loadCaseStudies = async () => {
    try {
      const response = await fetch('/api/admin/case-studies?includeInactive=true')
      const data = await response.json()
      
      if (data.success) {
        setCaseStudies(data.data || [])
      }
    } catch (error) {
      console.error('Error loading case studies:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      subtitle: '',
      description: '',
      fullDescription: '',
      image: '',
      metrics: {
        primary: '',
        primaryLabel: '',
        secondary: '',
        secondaryLabel: ''
      },
      results: [''],
      tools: [''],
      category: '',
      color: 'from-primary to-blue-600',
      icon: 'Bot',
      challenge: '',
      solution: '',
      timeline: [{ phase: '', duration: '', description: '' }],
      order: 0
    })
    setEditingCaseStudy(null)
  }

  const handleEdit = (caseStudy: CaseStudy) => {
    setEditingCaseStudy(caseStudy)
    setFormData({
      title: caseStudy.title,
      slug: caseStudy.slug,
      subtitle: caseStudy.subtitle,
      description: caseStudy.description,
      fullDescription: caseStudy.fullDescription,
      image: caseStudy.image || '',
      metrics: caseStudy.metrics || {
        primary: '',
        primaryLabel: '',
        secondary: '',
        secondaryLabel: ''
      },
      results: caseStudy.results || [''],
      tools: caseStudy.tools || [''],
      category: caseStudy.category,
      color: caseStudy.color,
      icon: caseStudy.icon || 'Bot',
      challenge: caseStudy.challenge,
      solution: caseStudy.solution,
      timeline: caseStudy.timeline || [{ phase: '', duration: '', description: '' }],
      order: caseStudy.order
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/case-studies?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setCaseStudies(caseStudies.map(cs => 
          cs.id === id ? { ...cs, isActive: false } : cs
        ))
      } else {
        console.error('Failed to delete case study:', data.message)
      }
    } catch (error) {
      console.error('Error deleting case study:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const url = editingCaseStudy ? '/api/admin/case-studies' : '/api/admin/case-studies'
      const method = editingCaseStudy ? 'PUT' : 'POST'
      
      const payload: any = {
        ...formData,
        results: formData.results.filter(r => r.trim() !== ''),
        tools: formData.tools.filter(t => t.trim() !== ''),
        timeline: formData.timeline.filter(t => t.phase.trim() !== ''),
        order: Number(formData.order)
      }

      if (editingCaseStudy) {
        payload.id = editingCaseStudy.id
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        if (editingCaseStudy) {
          setCaseStudies(caseStudies.map(cs => 
            cs.id === editingCaseStudy.id ? data.data : cs
          ))
        } else {
          setCaseStudies([...caseStudies, data.data])
        }
        resetForm()
        setShowForm(false)
      } else {
        console.error('Failed to save case study:', data.message)
      }
    } catch (error) {
      console.error('Error saving case study:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addArrayField = (field: 'results' | 'tools' | 'timeline') => {
    if (field === 'timeline') {
      setFormData({
        ...formData,
        timeline: [...formData.timeline, { phase: '', duration: '', description: '' }]
      })
    } else {
      setFormData({
        ...formData,
        [field]: [...formData[field], '']
      })
    }
  }

  const removeArrayField = (field: 'results' | 'tools' | 'timeline', index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index)
    })
  }

  const updateArrayField = (field: 'results' | 'tools', index: number, value: string) => {
    const newArray = [...formData[field]]
    newArray[index] = value
    setFormData({
      ...formData,
      [field]: newArray
    })
  }

  const updateTimelineField = (index: number, subfield: 'phase' | 'duration' | 'description', value: string) => {
    const newTimeline = [...formData.timeline]
    newTimeline[index] = { ...newTimeline[index], [subfield]: value }
    setFormData({
      ...formData,
      timeline: newTimeline
    })
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Case Studies Management">
      <div className="space-y-6">
        {/* Header with stats */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">Total Case Studies</p>
                  <p className="text-3xl font-bold text-blue-900">{caseStudies.length}</p>
                </div>
                <div className="bg-blue-500 rounded-xl p-3">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-700 mb-1">Published</p>
                  <p className="text-3xl font-bold text-green-900">
                    {caseStudies.filter(cs => cs.isActive).length}
                  </p>
                </div>
                <div className="bg-green-500 rounded-xl p-3">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-700 mb-1">Inactive</p>
                  <p className="text-3xl font-bold text-amber-900">
                    {caseStudies.filter(cs => !cs.isActive).length}
                  </p>
                </div>
                <div className="bg-amber-500 rounded-xl p-3">
                  <Edit className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          </div>

          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => { resetForm(); setShowForm(true) }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2.5 text-sm font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Case Study
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
              <DialogHeader className="pb-6 border-b border-gray-100">
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  {editingCaseStudy ? (
                    <>
                      <Edit className="h-6 w-6 text-blue-600" />
                      Edit Case Study
                    </>
                  ) : (
                    <>
                      <Plus className="h-6 w-6 text-blue-600" />
                      Add New Case Study
                    </>
                  )}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Case Study Title"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="subtitle">Subtitle *</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                      placeholder="Short description"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Short Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief description for cards and previews"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="fullDescription">Full Description *</Label>
                  <Textarea
                    id="fullDescription"
                    value={formData.fullDescription}
                    onChange={(e) => setFormData({...formData, fullDescription: e.target.value})}
                    placeholder="Detailed description of the case study"
                    rows={5}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <ImageUpload
                      label="Case Study Image"
                      value={formData.image}
                      onChange={(url) => setFormData({...formData, image: url})}
                      folder="case-studies"
                      maxSize={5}
                      recommendedDimensions={{
                        width: 800,
                        height: 600,
                        aspectRatio: "4:3"
                      }}
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Metrics</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primaryMetric">Primary Metric</Label>
                      <Input
                        id="primaryMetric"
                        value={formData.metrics.primary}
                        onChange={(e) => setFormData({
                          ...formData,
                          metrics: {...formData.metrics, primary: e.target.value}
                        })}
                        placeholder="200%"
                      />
                    </div>
                    <div>
                      <Label htmlFor="primaryLabel">Primary Label</Label>
                      <Input
                        id="primaryLabel"
                        value={formData.metrics.primaryLabel}
                        onChange={(e) => setFormData({
                          ...formData,
                          metrics: {...formData.metrics, primaryLabel: e.target.value}
                        })}
                        placeholder="Growth Increase"
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondaryMetric">Secondary Metric</Label>
                      <Input
                        id="secondaryMetric"
                        value={formData.metrics.secondary}
                        onChange={(e) => setFormData({
                          ...formData,
                          metrics: {...formData.metrics, secondary: e.target.value}
                        })}
                        placeholder="6 months"
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondaryLabel">Secondary Label</Label>
                      <Input
                        id="secondaryLabel"
                        value={formData.metrics.secondaryLabel}
                        onChange={(e) => setFormData({
                          ...formData,
                          metrics: {...formData.metrics, secondaryLabel: e.target.value}
                        })}
                        placeholder="Timeline"
                      />
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">Key Results</Label>
                    <Button type="button" onClick={() => addArrayField('results')} size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Result
                    </Button>
                  </div>
                  {formData.results.map((result, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={result}
                        onChange={(e) => updateArrayField('results', index, e.target.value)}
                        placeholder="Key result achieved"
                      />
                      {formData.results.length > 1 && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeArrayField('results', index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Tools */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">Tools Used</Label>
                    <Button type="button" onClick={() => addArrayField('tools')} size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Tool
                    </Button>
                  </div>
                  {formData.tools.map((tool, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={tool}
                        onChange={(e) => updateArrayField('tools', index, e.target.value)}
                        placeholder="Tool name"
                      />
                      {formData.tools.length > 1 && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeArrayField('tools', index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Challenge & Solution */}
                <div>
                  <Label htmlFor="challenge">Challenge *</Label>
                  <Textarea
                    id="challenge"
                    value={formData.challenge}
                    onChange={(e) => setFormData({...formData, challenge: e.target.value})}
                    placeholder="Describe the challenge or problem"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="solution">Solution *</Label>
                  <Textarea
                    id="solution"
                    value={formData.solution}
                    onChange={(e) => setFormData({...formData, solution: e.target.value})}
                    placeholder="Describe the solution implemented"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="color">Color Theme</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      placeholder="from-primary to-blue-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100 bg-gray-50 -mx-6 px-6 -mb-6 pb-6 mt-8">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => { resetForm(); setShowForm(false) }}
                    className="px-6 py-2.5 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-2.5 font-semibold"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {editingCaseStudy ? 'Update' : 'Create'} Case Study
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Case Studies List */}
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
          {caseStudies.map((caseStudy) => (
            <Card key={caseStudy.id} className="group overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-xl">
              {/* Image Header */}
              <div className="relative h-48 overflow-hidden">
                {caseStudy.image ? (
                  <img 
                    src={caseStudy.image} 
                    alt={caseStudy.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Image className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                
                {/* Status Badge */}
                {!caseStudy.isActive && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium px-2 py-1">
                      Inactive
                    </Badge>
                  </div>
                )}
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <Badge className={`bg-gradient-to-r ${caseStudy.color} text-white text-xs font-medium px-3 py-1 shadow-lg`}>
                    {caseStudy.category}
                  </Badge>
                </div>

                {/* Order Badge */}
                <div className="absolute bottom-3 left-3">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold text-gray-700">
                    {caseStudy.order}
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                {/* Title and Subtitle */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 leading-tight">
                    {caseStudy.title}
                  </h3>
                  <p className="text-sm font-medium text-blue-600 mb-2">
                    {caseStudy.subtitle}
                  </p>
                </div>
                
                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                  {caseStudy.description}
                </p>
                
                {/* Metrics */}
                {caseStudy.metrics && (caseStudy.metrics.primary || caseStudy.metrics.secondary) && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      {caseStudy.metrics.primary && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <div>
                            <div className="font-bold text-gray-900">{caseStudy.metrics.primary}</div>
                            <div className="text-gray-500">{caseStudy.metrics.primaryLabel}</div>
                          </div>
                        </div>
                      )}
                      {caseStudy.metrics.secondary && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <div>
                            <div className="font-bold text-gray-900">{caseStudy.metrics.secondary}</div>
                            <div className="text-gray-500">{caseStudy.metrics.secondaryLabel}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tools */}
                {caseStudy.tools && caseStudy.tools.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {caseStudy.tools.slice(0, 4).map((tool, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                        >
                          {tool}
                        </Badge>
                      ))}
                      {caseStudy.tools.length > 4 && (
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-gray-50 border-gray-200 text-gray-500"
                        >
                          +{caseStudy.tools.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`/case-study/${caseStudy.slug}`, '_blank')}
                      title="View Case Study"
                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(caseStudy)}
                      title="Edit Case Study"
                      className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-200 hover:text-green-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          title="Delete Case Study"
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                            Delete Case Study
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600">
                            Are you sure you want to delete <span className="font-medium">"{caseStudy.title}"</span>? 
                            This will make it inactive and hide it from the public site.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="hover:bg-gray-50">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(caseStudy.id)}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${caseStudy.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-xs text-gray-500">
                      {caseStudy.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {caseStudies.length === 0 && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center p-16">
              <div className="bg-gray-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Briefcase className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No case studies yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                Get started by creating your first case study to showcase your work and achievements.
              </p>
              <Button 
                onClick={() => { resetForm(); setShowForm(true) }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-base font-semibold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Case Study
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}