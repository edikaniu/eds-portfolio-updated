"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus,
  Upload,
  FileText,
  Globe,
  Settings,
  BarChart3,
  MessageSquare,
  Trash2,
  Edit,
  Eye,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/admin-layout'

interface KnowledgeBase {
  id: string
  title: string
  content: string
  sourceType: string
  category: string
  isActive: boolean
  createdAt: string
}

interface ChatbotQuestion {
  id: string
  questionText: string
  icon: string
  category: string
  isActive: boolean
  usageCount: number
}

interface AISettings {
  isActive: boolean
  modelName: string
  temperature: number
  maxTokens: number
  fallbackEnabled: boolean
  costLimit: number
  hasApiKey: boolean
}

export default function ChatbotManagementPage() {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase[]>([])
  const [questions, setQuestions] = useState<ChatbotQuestion[]>([])
  const [aiSettings, setAiSettings] = useState<AISettings>({
    isActive: false,
    modelName: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 1000,
    fallbackEnabled: true,
    costLimit: 100,
    hasApiKey: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("knowledge")
  const router = useRouter()

  // Knowledge Base Form State
  const [newKnowledge, setNewKnowledge] = useState({
    title: '',
    content: '',
    category: '',
    sourceType: 'manual'
  })

  // Question Form State
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    icon: 'MessageSquare',
    category: 'general'
  })

  // AI Settings Form State
  const [aiFormData, setAiFormData] = useState({
    apiKey: '',
    modelName: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 1000,
    isActive: false,
    fallbackEnabled: true,
    costLimit: 100
  })

  // Edit states
  const [editingKnowledge, setEditingKnowledge] = useState<string | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)

  // File upload state
  const [uploadUrl, setUploadUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')

  useEffect(() => {
    checkAuth()
    loadData()
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

  const loadData = async () => {
    try {
      // Load knowledge base
      const knowledgeResponse = await fetch('/api/admin/chatbot/knowledge')
      const knowledgeData = await knowledgeResponse.json()
      
      if (knowledgeData.success) {
        setKnowledgeBase(knowledgeData.data.items || [])
      }

      // Load questions
      const questionsResponse = await fetch('/api/admin/chatbot/questions')
      const questionsData = await questionsResponse.json()
      
      if (questionsData.success) {
        setQuestions(questionsData.data || [])
      }

      // Load AI settings
      const settingsResponse = await fetch('/api/admin/chatbot/settings')
      const settingsData = await settingsResponse.json()
      
      if (settingsData.success) {
        setAiSettings(settingsData.data)
        setAiFormData({
          apiKey: '',
          modelName: settingsData.data.modelName || 'gpt-3.5-turbo',
          temperature: settingsData.data.temperature || 0.7,
          maxTokens: settingsData.data.maxTokens || 1000,
          isActive: settingsData.data.isActive || false,
          fallbackEnabled: settingsData.data.fallbackEnabled || true,
          costLimit: settingsData.data.costLimit || 100
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddKnowledge = async () => {
    if (!newKnowledge.title || !newKnowledge.content) return

    try {
      const response = await fetch('/api/admin/chatbot/knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newKnowledge),
      })

      const data = await response.json()

      if (data.success) {
        setKnowledgeBase([...knowledgeBase, data.data])
        setNewKnowledge({
          title: '',
          content: '',
          category: '',
          sourceType: 'manual'
        })
      } else {
        console.error('Failed to add knowledge:', data.message)
      }
    } catch (error) {
      console.error('Error adding knowledge:', error)
    }
  }

  const handleAddQuestion = async () => {
    if (!newQuestion.questionText) return

    try {
      const response = await fetch('/api/admin/chatbot/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuestion),
      })

      const data = await response.json()

      if (data.success) {
        setQuestions([...questions, data.data])
        setNewQuestion({
          questionText: '',
          icon: 'MessageSquare',
          category: 'general'
        })
      } else {
        console.error('Failed to add question:', data.message)
      }
    } catch (error) {
      console.error('Error adding question:', error)
    }
  }

  const handleSaveAISettings = async () => {
    if (!aiFormData.apiKey && !aiSettings.hasApiKey) {
      alert('Please enter an OpenAI API key')
      return
    }

    try {
      const response = await fetch('/api/admin/chatbot/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          openaiApiKey: aiFormData.apiKey,
          modelName: aiFormData.modelName,
          temperature: aiFormData.temperature,
          maxTokens: aiFormData.maxTokens,
          isActive: aiFormData.isActive,
          fallbackEnabled: aiFormData.fallbackEnabled,
          costLimit: aiFormData.costLimit
        }),
      })

      const data = await response.json()

      if (data.success) {
        setAiSettings({ ...data.data, hasApiKey: true })
        setAiFormData({ ...aiFormData, apiKey: '' })
        alert('AI settings updated successfully!')
      } else {
        console.error('Failed to save AI settings:', data.message)
        alert('Failed to save AI settings: ' + data.message)
      }
    } catch (error) {
      console.error('Error saving AI settings:', error)
      alert('Error saving AI settings')
    }
  }

  const handleDisconnectAI = async () => {
    if (!confirm('Are you sure you want to disconnect OpenAI integration?')) return

    try {
      const response = await fetch('/api/admin/chatbot/settings', {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setAiSettings({ ...aiSettings, isActive: false, hasApiKey: false })
        setAiFormData({ ...aiFormData, isActive: false, apiKey: '' })
        alert('OpenAI integration disconnected successfully!')
      }
    } catch (error) {
      console.error('Error disconnecting AI:', error)
      alert('Error disconnecting AI')
    }
  }

  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge item?')) return

    try {
      const response = await fetch(`/api/admin/chatbot/knowledge?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setKnowledgeBase(knowledgeBase.filter(item => item.id !== id))
        alert('Knowledge item deleted successfully!')
      } else {
        console.error('Failed to delete knowledge item:', data.message)
        alert('Failed to delete knowledge item: ' + data.message)
      }
    } catch (error) {
      console.error('Error deleting knowledge item:', error)
      alert('Error deleting knowledge item')
    }
  }

  const handleEditKnowledge = (item: KnowledgeBase) => {
    setNewKnowledge({
      title: item.title,
      content: item.content,
      category: item.category,
      sourceType: item.sourceType
    })
    setEditingKnowledge(item.id)
  }

  const handleUpdateKnowledge = async () => {
    if (!editingKnowledge || !newKnowledge.title || !newKnowledge.content) return

    try {
      const response = await fetch('/api/admin/chatbot/knowledge', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingKnowledge,
          ...newKnowledge
        }),
      })

      const data = await response.json()

      if (data.success) {
        setKnowledgeBase(knowledgeBase.map(item => 
          item.id === editingKnowledge ? data.data : item
        ))
        setNewKnowledge({
          title: '',
          content: '',
          category: '',
          sourceType: 'manual'
        })
        setEditingKnowledge(null)
        alert('Knowledge item updated successfully!')
      } else {
        console.error('Failed to update knowledge item:', data.message)
        alert('Failed to update knowledge item: ' + data.message)
      }
    } catch (error) {
      console.error('Error updating knowledge item:', error)
      alert('Error updating knowledge item')
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      const response = await fetch(`/api/admin/chatbot/questions?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setQuestions(questions.filter(q => q.id !== id))
        alert('Question deleted successfully!')
      } else {
        console.error('Failed to delete question:', data.message)
        alert('Failed to delete question: ' + data.message)
      }
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Error deleting question')
    }
  }

  const handleEditQuestion = (question: ChatbotQuestion) => {
    setNewQuestion({
      questionText: question.questionText,
      icon: question.icon,
      category: question.category
    })
    setEditingQuestion(question.id)
  }

  const handleUpdateQuestion = async () => {
    if (!editingQuestion || !newQuestion.questionText) return

    try {
      const response = await fetch('/api/admin/chatbot/questions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingQuestion,
          ...newQuestion
        }),
      })

      const data = await response.json()

      if (data.success) {
        setQuestions(questions.map(q => 
          q.id === editingQuestion ? data.data : q
        ))
        setNewQuestion({
          questionText: '',
          icon: 'MessageSquare',
          category: 'general'
        })
        setEditingQuestion(null)
        alert('Question updated successfully!')
      } else {
        console.error('Failed to update question:', data.message)
        alert('Failed to update question: ' + data.message)
      }
    } catch (error) {
      console.error('Error updating question:', error)
      alert('Error updating question')
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress('Processing files...')

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress(`Processing ${file.name} (${i + 1}/${files.length})`)

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/admin/chatbot/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (data.success) {
          // Add the new knowledge items to the state
          if (data.data && Array.isArray(data.data)) {
            setKnowledgeBase(prev => [...prev, ...data.data])
          }
        } else {
          console.error(`Failed to upload ${file.name}:`, data.message)
          alert(`Failed to upload ${file.name}: ${data.message}`)
        }
      }

      setUploadProgress('Upload completed!')
      setTimeout(() => {
        setUploadProgress('')
      }, 2000)
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Error uploading files')
      setUploadProgress('')
    } finally {
      setIsUploading(false)
      // Clear the input
      event.target.value = ''
    }
  }

  const handleScrapeUrl = async () => {
    if (!uploadUrl.trim()) {
      alert('Please enter a URL')
      return
    }

    setIsUploading(true)
    setUploadProgress('Scraping URL content...')

    try {
      const response = await fetch('/api/admin/chatbot/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: uploadUrl }),
      })

      const data = await response.json()

      if (data.success) {
        // Add the new knowledge item to the state
        if (data.data) {
          setKnowledgeBase(prev => [...prev, data.data])
        }
        setUploadUrl('')
        setUploadProgress('URL scraped successfully!')
        setTimeout(() => {
          setUploadProgress('')
        }, 2000)
      } else {
        console.error('Failed to scrape URL:', data.message)
        alert('Failed to scrape URL: ' + data.message)
        setUploadProgress('')
      }
    } catch (error) {
      console.error('Error scraping URL:', error)
      alert('Error scraping URL')
      setUploadProgress('')
    } finally {
      setIsUploading(false)
    }
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
    <AdminLayout title="Chatbot Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-8 shadow-lg border border-teal-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-teal-900 mb-3">Chatbot Management</h1>
              <p className="text-lg text-teal-700">Manage your AI-powered chatbot with knowledge base and intelligent responses.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-lg border ${aiSettings.hasApiKey && aiSettings.isActive ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-amber-100 border-amber-300 text-amber-800'}`}>
                <span className="text-sm font-semibold">
                  {aiSettings.hasApiKey && aiSettings.isActive ? '✓ AI Connected' : '⚠ AI Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Knowledge Items</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{knowledgeBase.length}</p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ Training data</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Predefined Questions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{questions.length}</p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ Quick responses</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Conversations</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">248</p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ User interactions</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">AI Integration</p>
                <p className={`text-lg font-bold mt-2 ${aiSettings.hasApiKey && aiSettings.isActive ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {aiSettings.hasApiKey && aiSettings.isActive ? 'Connected' : 'Disconnected'}
                </p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ {aiSettings.hasApiKey && aiSettings.isActive ? 'OpenAI ready' : 'Setup required'}</p>
              </div>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${aiSettings.hasApiKey && aiSettings.isActive ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-amber-500 to-amber-600'}`}>
                <Settings className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-1 shadow-sm">
            <TabsTrigger value="knowledge" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-teal-700 rounded-lg">Knowledge Base</TabsTrigger>
            <TabsTrigger value="questions" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-emerald-700 rounded-lg">Questions</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-purple-700 rounded-lg">AI Settings</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-700 rounded-lg">Analytics</TabsTrigger>
          </TabsList>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Knowledge Form */}
              <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-6 border-b border-teal-200">
                  <h3 className="text-xl font-bold text-teal-900 flex items-center gap-3">
                    <Plus className="h-6 w-6 text-teal-600" />
                    Add Knowledge
                  </h3>
                </div>
                <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-gray-900 font-medium">Title</Label>
                    <Input
                      id="title"
                      value={newKnowledge.title}
                      onChange={(e) => setNewKnowledge({...newKnowledge, title: e.target.value})}
                      placeholder="Knowledge item title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-gray-900 font-medium">Category</Label>
                    <Input
                      id="category"
                      value={newKnowledge.category}
                      onChange={(e) => setNewKnowledge({...newKnowledge, category: e.target.value})}
                      placeholder="e.g., experience, skills"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content" className="text-gray-900 font-medium">Content</Label>
                    <Textarea
                      id="content"
                      value={newKnowledge.content}
                      onChange={(e) => setNewKnowledge({...newKnowledge, content: e.target.value})}
                      placeholder="Enter the knowledge content..."
                      rows={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Button 
                      onClick={editingKnowledge ? handleUpdateKnowledge : handleAddKnowledge} 
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {editingKnowledge ? 'Update Knowledge' : 'Add Knowledge'}
                    </Button>
                    {editingKnowledge && (
                      <Button 
                        onClick={() => {
                          setEditingKnowledge(null)
                          setNewKnowledge({
                            title: '',
                            content: '',
                            category: '',
                            sourceType: 'manual'
                          })
                        }}
                        variant="outline" 
                        className="w-full"
                      >
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </div>
                </div>
              </Card>

              {/* File Upload */}
              <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-blue-200">
                  <h3 className="text-xl font-bold text-blue-900 flex items-center gap-3">
                    <Upload className="h-6 w-6 text-blue-600" />
                    Upload Files
                  </h3>
                </div>
                <div className="p-6">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="text-sm text-primary font-medium">Upload files</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          className="sr-only" 
                          multiple 
                          accept=".pdf,.doc,.docx,.txt,.md"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">PDF, DOC, TXT, MD up to 10MB</p>
                    </div>
                  </div>

                  {uploadProgress && (
                    <div className="text-center">
                      <p className="text-sm text-blue-600">{uploadProgress}</p>
                      {isUploading && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className="bg-blue-600 h-2 rounded-full animate-pulse w-1/2"></div>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="url" className="text-gray-900 font-medium">Or Add URL</Label>
                    <Input
                      id="url"
                      placeholder="https://example.com/content"
                      value={uploadUrl}
                      onChange={(e) => setUploadUrl(e.target.value)}
                      disabled={isUploading}
                    />
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleScrapeUrl}
                    disabled={isUploading || !uploadUrl.trim()}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    {isUploading ? 'Scraping...' : 'Scrape URL'}
                  </Button>
                </div>
                </div>
              </Card>

              {/* Knowledge List */}
              <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <FileText className="h-6 w-6 text-gray-600" />
                    Knowledge Items
                  </h3>
                </div>
                <div className="p-6">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {knowledgeBase.map((item) => (
                    <div key={item.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-500">{item.category}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {item.content.substring(0, 100)}...
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <Button variant="ghost" size="sm" title="View details">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditKnowledge(item)}
                            title="Edit knowledge"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteKnowledge(item.id)}
                            title="Delete knowledge"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Question Form */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Predefined Question</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="questionText" className="text-gray-900 font-medium">Question Text</Label>
                    <Input
                      id="questionText"
                      value={newQuestion.questionText}
                      onChange={(e) => setNewQuestion({...newQuestion, questionText: e.target.value})}
                      placeholder="What would you like to know?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="questionCategory" className="text-gray-900 font-medium">Category</Label>
                    <Input
                      id="questionCategory"
                      value={newQuestion.category}
                      onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
                      placeholder="e.g., general, skills, experience"
                    />
                  </div>

                  <div className="space-y-2">
                    <Button 
                      onClick={editingQuestion ? handleUpdateQuestion : handleAddQuestion} 
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {editingQuestion ? 'Update Question' : 'Add Question'}
                    </Button>
                    {editingQuestion && (
                      <Button 
                        onClick={() => {
                          setEditingQuestion(null)
                          setNewQuestion({
                            questionText: '',
                            icon: 'MessageSquare',
                            category: 'general'
                          })
                        }}
                        variant="outline" 
                        className="w-full"
                      >
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Questions List */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Questions</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {questions.map((question) => (
                    <div key={question.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{question.questionText}</h4>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-500">{question.category}</span>
                            <span className="text-xs text-gray-400">{question.usageCount} uses</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditQuestion(question)}
                            title="Edit question"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteQuestion(question.id)}
                            title="Delete question"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* AI Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">OpenAI Integration</h3>
              <div className="space-y-4">
                <div className={`${aiSettings.hasApiKey && aiSettings.isActive ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-4`}>
                  <div className="flex">
                    {aiSettings.hasApiKey && aiSettings.isActive ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                    )}
                    <div className="ml-3">
                      <h4 className={`text-sm font-medium ${aiSettings.hasApiKey && aiSettings.isActive ? 'text-green-800' : 'text-yellow-800'}`}>
                        {aiSettings.hasApiKey && aiSettings.isActive ? 'AI Integration Connected' : 'AI Integration Not Connected'}
                      </h4>
                      <p className={`text-sm mt-1 ${aiSettings.hasApiKey && aiSettings.isActive ? 'text-green-700' : 'text-yellow-700'}`}>
                        {aiSettings.hasApiKey && aiSettings.isActive 
                          ? 'Your chatbot is powered by OpenAI for intelligent responses'
                          : 'Connect your OpenAI API key to enable intelligent responses'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="apiKey" className="text-gray-900 font-medium">OpenAI API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder={aiSettings.hasApiKey ? "••••••••••••••••" : "sk-..."}
                      value={aiFormData.apiKey}
                      onChange={(e) => setAiFormData({...aiFormData, apiKey: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="model" className="text-gray-900 font-medium">Model</Label>
                    <select 
                      id="model"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      value={aiFormData.modelName}
                      onChange={(e) => setAiFormData({...aiFormData, modelName: e.target.value})}
                    >
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="temperature" className="text-gray-900 font-medium">Temperature ({aiFormData.temperature})</Label>
                    <input
                      id="temperature"
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={aiFormData.temperature}
                      onChange={(e) => setAiFormData({...aiFormData, temperature: parseFloat(e.target.value)})}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Focused</span>
                      <span>Creative</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="maxTokens" className="text-gray-900 font-medium">Max Tokens</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      min="100"
                      max="4000"
                      value={aiFormData.maxTokens}
                      onChange={(e) => setAiFormData({...aiFormData, maxTokens: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      id="enableAI"
                      type="checkbox"
                      checked={aiFormData.isActive}
                      onChange={(e) => setAiFormData({...aiFormData, isActive: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="enableAI" className="text-gray-900 font-medium">Enable AI-powered responses</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="fallback"
                      type="checkbox"
                      checked={aiFormData.fallbackEnabled}
                      onChange={(e) => setAiFormData({...aiFormData, fallbackEnabled: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="fallback" className="text-gray-900 font-medium">Fallback to knowledge base if AI fails</Label>
                  </div>

                  <div>
                    <Label htmlFor="costLimit" className="text-gray-900 font-medium">Cost Limit ($)</Label>
                    <Input
                      id="costLimit"
                      type="number"
                      min="0"
                      step="0.01"
                      value={aiFormData.costLimit}
                      onChange={(e) => setAiFormData({...aiFormData, costLimit: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>


                <div className="flex space-x-3">
                  <Button onClick={handleSaveAISettings} className="flex-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save AI Settings
                  </Button>
                  {aiSettings.hasApiKey && (
                    <Button onClick={handleDisconnectAI} variant="outline" className="text-red-600 hover:text-red-700">
                      Disconnect
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Questions</h3>
                <div className="space-y-3">
                  {questions.map((question) => (
                    <div key={question.id} className="flex justify-between items-center">
                      <span className="text-sm">{question.questionText}</span>
                      <span className="text-sm font-medium">{question.usageCount}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Sources</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Local Knowledge</span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">OpenAI Generated</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}