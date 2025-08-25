'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { AnalyticsDashboard } from '@/components/analytics-dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { 
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Clock,
  Star,
  Activity,
  Database,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
// Simple toast fallback for development
const toast = ({ title, description, variant }: { title?: string; description?: string; variant?: string }) => {
  console.log(`Toast: ${title || ''} ${description || ''}`)
}

interface AnalyticsData {
  overview: {
    totalConversations: number
    avgSatisfactionRating: number
    avgResponseTime: number
    contentSections: number
    caseStudies: number
    knowledgeItems: number
  }
  charts: {
    dailyConversations: Array<{
      date: string
      count: number
      avgRating: number
      avgResponseTime: number
    }>
    knowledgeByCategory: Array<{
      category: string
      count: number
    }>
    responseSourceBreakdown: Array<{
      source: string
      count: number
    }>
  }
  systemHealth: {
    chatbotActive: boolean
    aiEnabled: boolean
    fallbackEnabled: boolean
    knowledgeBaseSize: number
  }
  recentActivity: {
    conversations: Array<{
      id: string
      question: string
      response: string
      source: string
      rating: number | null
      createdAt: string
    }>
    popularQuestions: Array<{
      id: string
      question: string
      usage: number
      category: string
    }>
  }
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/analytics?days=${timeRange}`)
      const data = await response.json()
      if (data.success) {
        setAnalyticsData(data.data)
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch analytics data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getHealthStatus = (isHealthy: boolean) => ({
    icon: isHealthy ? CheckCircle : XCircle,
    color: isHealthy ? 'text-green-600' : 'text-red-600',
    bg: isHealthy ? 'bg-green-50' : 'bg-red-50',
    border: isHealthy ? 'border-green-200' : 'border-red-200'
  })

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  if (loading) {
    return (
      <AdminLayout title="Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading analytics...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!analyticsData) {
    return (
      <AdminLayout title="Analytics">
        <div className="text-center py-8">
          <p className="text-muted-foreground">No analytics data available</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Analytics">
      <Tabs defaultValue="site-analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="site-analytics">Site Analytics</TabsTrigger>
          <TabsTrigger value="chatbot-analytics">Chatbot Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="site-analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="chatbot-analytics">
          <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl p-8 shadow-lg border border-sky-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-sky-900 mb-3">Advanced Analytics Dashboard</h1>
              <p className="text-lg text-sky-700">
                Comprehensive insights into your portfolio performance and user engagement
              </p>
            </div>
            <div className="flex gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40 h-11 border-sky-300 bg-white shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchAnalytics} variant="outline" className="h-11 px-6 rounded-lg border-sky-300 text-sky-700 hover:bg-sky-50 font-medium">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-bold text-blue-900 uppercase tracking-wide">Conversations</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-gray-900">{analyticsData.overview.totalConversations}</div>
              <p className="text-sm text-emerald-600 mt-2 font-medium">
                ↗ Last {timeRange} days
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200 flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-bold text-amber-900 uppercase tracking-wide">Satisfaction</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Star className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-gray-900">
                {analyticsData.overview.avgSatisfactionRating}/5
              </div>
              <p className="text-sm text-emerald-600 mt-2 font-medium">
                ↗ Average rating
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatResponseTime(analyticsData.overview.avgResponseTime)}
              </div>
              <p className="text-xs text-muted-foreground">
                Average response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Knowledge Base</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.knowledgeItems}</div>
              <p className="text-xs text-muted-foreground">
                Active items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Case Studies</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.caseStudies}</div>
              <p className="text-xs text-muted-foreground">
                Published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.contentSections}</div>
              <p className="text-xs text-muted-foreground">
                Sections
              </p>
            </CardContent>
          </Card>
        </div>

        {/* System Health */}
        <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 pb-4">
            <CardTitle className="text-xl font-bold text-green-900 flex items-center gap-3">
              <Activity className="h-6 w-6 text-green-600" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries({
                'Chatbot Active': analyticsData.systemHealth.chatbotActive,
                'AI Enabled': analyticsData.systemHealth.aiEnabled,
                'Fallback Enabled': analyticsData.systemHealth.fallbackEnabled,
                'Knowledge Base': analyticsData.systemHealth.knowledgeBaseSize > 0
              }).map(([label, isHealthy]) => {
                const status = getHealthStatus(isHealthy)
                const StatusIcon = status.icon
                return (
                  <div 
                    key={label}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${status.bg} ${status.border}`}
                  >
                    <StatusIcon className={`h-5 w-5 ${status.color}`} />
                    <div>
                      <p className="font-medium text-sm">{label}</p>
                      <p className={`text-xs ${status.color}`}>
                        {isHealthy ? 'Healthy' : 'Needs attention'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Conversations Trend */}
          <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200 pb-4">
              <CardTitle className="text-xl font-bold text-purple-900 flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
                Daily Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData.charts.dailyConversations.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Last {timeRange} days conversation trend
                  </div>
                  <div className="grid gap-2">
                    {analyticsData.charts.dailyConversations.slice(-7).map((day) => (
                      <div key={day.date} className="flex items-center justify-between">
                        <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{day.count}</span>
                          <div className="h-2 bg-gray-200 rounded-full w-20">
                            <div 
                              className="h-2 bg-blue-600 rounded-full"
                              style={{ width: `${Math.min((day.count / Math.max(...analyticsData.charts.dailyConversations.map(d => d.count))) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No conversation data available</p>
              )}
            </CardContent>
          </Card>

          {/* Response Source Breakdown */}
          <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-indigo-200 pb-4">
              <CardTitle className="text-xl font-bold text-indigo-900 flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
                Response Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData.charts.responseSourceBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {analyticsData.charts.responseSourceBreakdown.map((source) => (
                    <div key={source.source} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={source.source === 'openai' ? 'default' : 'secondary'}>
                          {source.source.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{source.count}</span>
                        <span className="text-xs text-muted-foreground">
                          ({Math.round((source.count / analyticsData.overview.totalConversations) * 100)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No response data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Conversations */}
          <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 pb-4">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <MessageSquare className="h-6 w-6 text-gray-600" />
                Recent Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.recentActivity.conversations.length > 0 ? (
                  analyticsData.recentActivity.conversations.map((conv) => (
                    <div key={conv.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{conv.source}</Badge>
                        {conv.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs">{conv.rating}/5</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Q: {conv.question}</p>
                        <p className="text-xs text-muted-foreground">A: {conv.response}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(conv.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No recent conversations</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Popular Questions */}
          <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-rose-100 border-b border-rose-200 pb-4">
              <CardTitle className="text-xl font-bold text-rose-900 flex items-center gap-3">
                <Star className="h-6 w-6 text-rose-600" />
                Popular Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.recentActivity.popularQuestions.length > 0 ? (
                  analyticsData.recentActivity.popularQuestions.map((question) => (
                    <div key={question.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{question.category}</Badge>
                        <span className="text-sm font-medium">{question.usage} uses</span>
                      </div>
                      <p className="text-sm">{question.question}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No popular questions data</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  )
}