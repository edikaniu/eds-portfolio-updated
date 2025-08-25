'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WysiwygEditor } from '@/components/ui/wysiwyg-editor'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Plus, Edit, Trash2, Save, X, FileText, Code, Image, Calendar, Clock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ContentVersioningDashboard } from '@/components/content-versioning-dashboard'
import { ContentSchedulerDashboard } from '@/components/content-scheduler-dashboard'

interface ContentSection {
  id: string
  sectionName: string
  content: string
  metadata: any
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const CONTENT_SECTION_TEMPLATES = {
  'hero': {
    content: '{"headline": "Welcome to My Portfolio", "subheadline": "Full-Stack Developer & Designer", "cta": "View My Work"}',
    metadata: '{"backgroundImage": "", "animationType": "fade"}'
  },
  'about': {
    content: 'Tell visitors about yourself, your background, and what drives your passion for development.',
    metadata: '{"profileImage": "", "skills": [], "interests": []}'
  },
  'services': {
    content: '{"services": [{"title": "Web Development", "description": "Custom web applications", "icon": "code"}]}',
    metadata: '{"layout": "grid", "columns": 3}'
  }
}

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState('sections')
  const [contentSections, setContentSections] = useState<ContentSection[]>([])
  const { toast } = useToast()
  
  const [editingSection, setEditingSection] = useState<string | null>(null)
  
  const [newSection, setNewSection] = useState({
    sectionName: '',
    content: '',
    metadata: ''
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchContentSections()
  }, [])

  const fetchContentSections = async () => {
    try {
      const response = await fetch('/api/admin/content')
      const data = await response.json()
      if (data.success) {
        setContentSections(data.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch content sections",
        variant: "destructive"
      })
    }
  }

  const handleCreateSection = async () => {
    if (!newSection.sectionName || !newSection.content) {
      toast({
        title: "Error",
        description: "Section name and content are required",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSection,
          metadata: newSection.metadata || null
        })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Content section created successfully"
        })
        fetchContentSections()
        setNewSection({ sectionName: '', content: '', metadata: '' })
        setIsDialogOpen(false)
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create content section",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSection = async (section: ContentSection) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: section.id,
          content: section.content,
          metadata: section.metadata
        })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Content section updated successfully"
        })
        fetchContentSections()
        setEditingSection(null)
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update content section",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content section?')) return

    try {
      const response = await fetch(`/api/admin/content?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Content section deleted successfully"
        })
        fetchContentSections()
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete content section",
        variant: "destructive"
      })
    }
  }

  const applySectionTemplate = (template: string) => {
    const templateData = CONTENT_SECTION_TEMPLATES[template as keyof typeof CONTENT_SECTION_TEMPLATES]
    if (templateData) {
      setNewSection({
        ...newSection,
        content: templateData.content,
        metadata: templateData.metadata
      })
    }
  }

  return (
    <AdminLayout title="Content Management">
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 shadow-lg border border-purple-200">
          <h1 className="text-3xl font-bold mb-3 text-purple-900">Enhanced Content Management</h1>
          <p className="text-lg text-purple-700">
            Manage all your portfolio content with advanced editing capabilities
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-1 shadow-sm">
            <TabsTrigger value="sections" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-purple-700 rounded-lg">
              <FileText className="h-4 w-4" />
              Content Sections
            </TabsTrigger>
            <TabsTrigger value="scheduler" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-700 rounded-lg">
              <Calendar className="h-4 w-4" />
              Scheduler
            </TabsTrigger>
            <TabsTrigger value="versions" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-700 rounded-lg">
              <Clock className="h-4 w-4" />
              Versions
            </TabsTrigger>
            <TabsTrigger value="experience" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-indigo-700 rounded-lg">
              <Code className="h-4 w-4" />
              Experience
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-emerald-700 rounded-lg">
              <Image className="h-4 w-4" />
              Skills
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sections" className="space-y-6">
            <div className="flex justify-between items-center bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <div>
                <h2 className="text-xl font-bold text-purple-900">Content Sections</h2>
                <p className="text-sm text-purple-700 mt-1">Manage and edit your website content sections</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                    <Plus className="mr-2 h-4 w-4" />
                    New Section
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Content Section</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Section Name</label>
                      <Input
                        placeholder="e.g., hero, about, services"
                        value={newSection.sectionName}
                        onChange={(e) => setNewSection({...newSection, sectionName: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Template</label>
                      <Select onValueChange={applySectionTemplate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a template (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hero">Hero Section</SelectItem>
                          <SelectItem value="about">About Section</SelectItem>
                          <SelectItem value="services">Services Section</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Content</label>
                      <WysiwygEditor
                        value={newSection.content}
                        onChange={(content) => setNewSection({...newSection, content})}
                        placeholder="Enter section content"
                        height={300}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Metadata (JSON)</label>
                      <Textarea
                        className="min-h-[80px] font-mono"
                        placeholder='{"key": "value"}'
                        value={newSection.metadata}
                        onChange={(e) => setNewSection({...newSection, metadata: e.target.value})}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleCreateSection} disabled={loading}>
                        <Save className="mr-2 h-4 w-4" />
                        Create Section
                      </Button>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6">
              {contentSections.map((section) => (
                <Card key={section.id} className="shadow-lg border-0 bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 pb-4 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900">
                      <FileText className="h-5 w-5 text-gray-600" />
                      {section.sectionName}
                      <Badge variant={section.isActive ? "default" : "secondary"} className={section.isActive ? "bg-green-500 hover:bg-green-600" : "bg-gray-400"}>
                        {section.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingSection(editingSection === section.id ? null : section.id)}
                        className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-200 hover:text-green-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSection(section.id)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {editingSection === section.id ? (
                      <div className="space-y-4">
                        <WysiwygEditor
                          value={section.content}
                          onChange={(content) => {
                            const updated = contentSections.map(s => 
                              s.id === section.id ? {...s, content} : s
                            )
                            setContentSections(updated)
                          }}
                          height={250}
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateSection(section)}
                            disabled={loading}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingSection(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {section.content}
                        </p>
                        {section.metadata && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground">
                              Metadata
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                              {JSON.stringify(section.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Last updated: {new Date(section.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scheduler">
            <ContentSchedulerDashboard />
          </TabsContent>

          <TabsContent value="versions">
            <ContentVersioningDashboard />
          </TabsContent>

          <TabsContent value="experience">
            <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 pb-4">
                <CardTitle className="text-xl font-bold text-blue-900 flex items-center gap-3">
                  <Code className="h-6 w-6 text-blue-600" />
                  Experience Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <Code className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">Experience Interface Coming Soon</p>
                    <p className="text-sm text-gray-600">Advanced experience management with timeline views and skills integration</p>
                    <Badge className="mt-3 bg-blue-100 text-blue-700 hover:bg-blue-200">API Ready</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills">
            <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200 pb-4">
                <CardTitle className="text-xl font-bold text-emerald-900 flex items-center gap-3">
                  <Image className="h-6 w-6 text-emerald-600" />
                  Skills Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <Image className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">Skills Interface Coming Soon</p>
                    <p className="text-sm text-gray-600">Interactive skills management with proficiency levels and categories</p>
                    <Badge className="mt-3 bg-emerald-100 text-emerald-700 hover:bg-emerald-200">API Ready</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}