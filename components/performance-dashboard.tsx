"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Activity,
  Zap, 
  Clock, 
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  Wifi,
  WifiOff,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3,
  Target,
  Globe
} from 'lucide-react'
// import { usePerformanceMonitoring } from '@/lib/performance-monitoring'

interface PerformanceMetric {
  url: string
  timestamp: string
  webVitals: Array<{
    name: string
    value: number
    rating: 'good' | 'needs-improvement' | 'poor'
  }>
  resources: {
    total: number
    totalSize: number
    compressed: number
    critical: number
  }
  navigation: {
    loadTime: number
    firstByte: number
    domContentLoaded: number
  }
  userAgent: string
  viewport: {
    width: number
    height: number
  }
}

interface PerformanceSummary {
  averageScore: number
  webVitals: Record<string, {
    average: number
    good: number
    poor: number
  }>
  commonIssues: Array<{
    metric: string
    frequency: number
    percentage: number
  }>
  deviceBreakdown: Record<string, number>
  connectionBreakdown: Record<string, number>
  totalMetrics: number
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [summary, setSummary] = useState<PerformanceSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('24')
  const [selectedUrl, setSelectedUrl] = useState<string>('')
  const [refreshing, setRefreshing] = useState(false)

  // const { webVitals, score: currentScore } = usePerformanceMonitoring()
  const webVitals = {}
  const currentScore = 0

  useEffect(() => {
    fetchPerformanceData()
  }, [timeRange, selectedUrl])

  const fetchPerformanceData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        hours: timeRange,
        limit: '100'
      })
      
      if (selectedUrl) {
        params.append('url', selectedUrl)
      }

      const response = await fetch(`/api/admin/performance?${params}`)
      const data = await response.json()

      if (data.success) {
        setMetrics(data.data.metrics || [])
        setSummary(data.data.summary)
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchPerformanceData()
    setRefreshing(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-200'
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600'
      case 'needs-improvement': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const formatValue = (name: string, value: number) => {
    if (name === 'CLS') return value.toFixed(3)
    return `${Math.round(value)}ms`
  }

  const getUniqueUrls = () => {
    const urls = [...new Set(metrics.map(m => m.url))]
    return urls.slice(0, 10) // Limit to 10 most recent URLs
  }

  if (loading && metrics.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-20"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-12"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground text-sm">
            Real-time performance monitoring and Core Web Vitals tracking
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedUrl} onValueChange={setSelectedUrl}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Pages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Pages</SelectItem>
              {getUniqueUrls().map(url => (
                <SelectItem key={url} value={url}>
                  {url.length > 30 ? `...${url.slice(-30)}` : url}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last Hour</SelectItem>
              <SelectItem value="24">Last 24h</SelectItem>
              <SelectItem value="168">Last Week</SelectItem>
              <SelectItem value="720">Last Month</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Current Performance Alert */}
      {currentScore > 0 && (
        <Alert className={currentScore < 70 ? 'border-red-200 bg-red-50' : currentScore < 90 ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            <strong>Current Page Performance:</strong> {currentScore}/100
            {currentScore < 70 && ' - Needs immediate attention'}
            {currentScore >= 70 && currentScore < 90 && ' - Could be improved'}
            {currentScore >= 90 && ' - Excellent performance'}
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(summary?.averageScore || 0)}`}>
              {summary?.averageScore || 0}/100
            </div>
            <Badge className={`text-xs mt-1 ${getScoreBadge(summary?.averageScore || 0)}`}>
              {summary?.averageScore >= 90 ? 'Excellent' : 
               summary?.averageScore >= 70 ? 'Good' : 'Needs Work'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalMetrics || 0}</div>
            <p className="text-xs text-muted-foreground">
              Performance measurements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summary?.commonIssues?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Common performance issues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages Monitored</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getUniqueUrls().length}</div>
            <p className="text-xs text-muted-foreground">
              Unique pages tracked
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Web Vitals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Core Web Vitals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(summary?.webVitals || {}).map(([name, data]) => (
              <div key={name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{name}</span>
                    {currentScore > 0 && webVitals[name as keyof typeof webVitals] && (
                      <Badge variant="outline" className={getRatingColor(webVitals[name as keyof typeof webVitals].rating)}>
                        {formatValue(name, webVitals[name as keyof typeof webVitals].value)}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatValue(name, data.average)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-green-600">Good</span>
                      <span>{Math.round((data.good / (data.good + data.poor || 1)) * 100)}%</span>
                    </div>
                    <Progress value={(data.good / (data.good + data.poor || 1)) * 100} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Device Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(summary?.deviceBreakdown || {}).map(([device, count]) => {
              const total = summary?.totalMetrics || 1
              const percentage = (count / total) * 100
              
              const IconComponent = device === 'mobile' ? Smartphone : 
                                 device === 'tablet' ? Tablet : Monitor
              
              return (
                <div key={device} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <span className="text-sm capitalize">{device}</span>
                    </div>
                    <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Common Issues & Connection Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Common Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary?.commonIssues && summary.commonIssues.length > 0 ? (
              <div className="space-y-4">
                {summary.commonIssues.map((issue, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {issue.metric.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Affects {issue.percentage}% of page loads
                      </p>
                    </div>
                    <Badge variant="outline" className="text-red-600">
                      {issue.frequency} occurrences
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No common issues detected</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Connection Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(summary?.connectionBreakdown || {}).map(([connection, count]) => {
              const total = summary?.totalMetrics || 1
              const percentage = (count / total) * 100
              
              const getConnectionIcon = (conn: string) => {
                if (conn.includes('slow') || conn === '2g') return <WifiOff className="h-4 w-4 text-red-500" />
                if (conn === '3g') return <Wifi className="h-4 w-4 text-yellow-500" />
                return <Wifi className="h-4 w-4 text-green-500" />
              }
              
              return (
                <div key={connection} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getConnectionIcon(connection)}
                      <span className="text-sm uppercase">{connection}</span>
                    </div>
                    <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
            
            {Object.keys(summary?.connectionBreakdown || {}).length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No connection data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.slice(0, 10).map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">
                      {new URL(metric.url).pathname}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {new Date(metric.timestamp).toLocaleTimeString()}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {metric.webVitals.slice(0, 3).map((vital) => (
                      <Badge 
                        key={vital.name} 
                        variant="outline" 
                        className={`text-xs ${getRatingColor(vital.rating)}`}
                      >
                        {vital.name}: {formatValue(vital.name, vital.value)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getScoreColor(
                    metric.webVitals.reduce((sum, v) => {
                      let score = 100
                      if (v.rating === 'needs-improvement') score = 60
                      if (v.rating === 'poor') score = 30
                      return sum + score
                    }, 0) / metric.webVitals.length
                  )}`}>
                    {Math.round(metric.webVitals.reduce((sum, v) => {
                      let score = 100
                      if (v.rating === 'needs-improvement') score = 60
                      if (v.rating === 'poor') score = 30
                      return sum + score
                    }, 0) / metric.webVitals.length)}
                  </div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
              </div>
            ))}
            
            {metrics.length === 0 && (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No performance data available for the selected time range
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}