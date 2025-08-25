'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  Search,
  Download,
  Filter,
  RefreshCw,
  Eye,
  User,
  AlertTriangle,
  Shield,
  Clock,
  TrendingUp,
  Database,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface AuditEvent {
  id: string
  action: string
  resource: string
  resourceId?: string
  userId?: string
  userEmail?: string
  ipAddress?: string
  timestamp: string
  success: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  metadata?: Record<string, any>
  errorMessage?: string
}

interface AuditSummary {
  totalEvents: number
  recentActivity: number
  topActions: Array<{ action: string; count: number }>
  topUsers: Array<{ userId: string; userEmail?: string; count: number }>
  failureRate: number
  criticalEvents: number
}

interface TimelineData {
  date: string
  events: number
  failures: number
  critical: number
}

export function AuditLogDashboard() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [summary, setSummary] = useState<AuditSummary | null>(null)
  const [timeline, setTimeline] = useState<TimelineData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    userId: '',
    success: '',
    severity: '',
    dateFrom: '',
    dateTo: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null)

  useEffect(() => {
    fetchAuditData()
  }, [])

  const fetchAuditData = async () => {
    try {
      const [eventsResponse, summaryResponse, timelineResponse] = await Promise.all([
        fetch('/api/admin/audit?action=events&limit=50'),
        fetch('/api/admin/audit?action=summary&days=30'),
        fetch('/api/admin/audit?action=timeline&days=7')
      ])

      const eventsData = await eventsResponse.json()
      const summaryData = await summaryResponse.json()
      const timelineData = await timelineResponse.json()

      if (eventsData.success) setEvents(eventsData.data.events)
      if (summaryData.success) setSummary(summaryData.data)
      if (timelineData.success) setTimeline(timelineData.data)

    } catch (error) {
      console.error('Failed to fetch audit data:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchEvents = async () => {
    if (!searchQuery.trim()) {
      fetchAuditData()
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/audit?action=search&query=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (data.success) {
        setEvents(data.data)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        action: 'events',
        limit: '50'
      })

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (key === 'action') params.set('filterAction', value)
          else params.set(key, value)
        }
      })

      const response = await fetch(`/api/admin/audit?${params}`)
      const data = await response.json()

      if (data.success) {
        setEvents(data.data.events)
      }
    } catch (error) {
      console.error('Filter failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportAudit = async (format: 'json' | 'csv') => {
    try {
      const params = new URLSearchParams({
        action: 'export',
        format
      })

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (key === 'action') params.set('filterAction', value)
          else params.set(key, value)
        }
      })

      const response = await fetch(`/api/admin/audit?${params}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-export-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading audit data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Audit Log</h1>
          <p className="text-gray-600">System activity monitoring and compliance tracking</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button onClick={() => exportAudit('csv')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={fetchAuditData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold mt-2">{summary.totalEvents.toLocaleString()}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                  <p className="text-2xl font-bold mt-2">{summary.recentActivity}</p>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failure Rate</p>
                  <p className="text-2xl font-bold mt-2">{summary.failureRate.toFixed(1)}%</p>
                  <Progress value={summary.failureRate} className="w-full h-2 mt-2" />
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Events</p>
                  <p className="text-2xl font-bold mt-2">{summary.criticalEvents}</p>
                </div>
                <Shield className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search audit events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchEvents()}
              />
              <Button onClick={searchEvents}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Action</label>
                  <Input
                    placeholder="Filter by action"
                    value={filters.action}
                    onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Resource</label>
                  <select
                    value={filters.resource}
                    onChange={(e) => setFilters(prev => ({ ...prev, resource: e.target.value }))}
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="">All resources</option>
                    <option value="blog">Blog</option>
                    <option value="project">Project</option>
                    <option value="user">User</option>
                    <option value="security">Security</option>
                    <option value="system">System</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Severity</label>
                  <select
                    value={filters.severity}
                    onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="">All severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Success</label>
                  <select
                    value={filters.success}
                    onChange={(e) => setFilters(prev => ({ ...prev, success: e.target.value }))}
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="">All</option>
                    <option value="true">Success</option>
                    <option value="false">Failed</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button onClick={applyFilters} size="sm">
                  Apply Filters
                </Button>
                <Button 
                  onClick={() => {
                    setFilters({
                      action: '', resource: '', userId: '', success: '', severity: '', dateFrom: '', dateTo: ''
                    })
                    fetchAuditData()
                  }}
                  size="sm" 
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Analysis
          </TabsTrigger>
        </TabsList>

        {/* Events List */}
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Events</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No audit events found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {event.success ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span className="font-medium">{event.action}</span>
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <span className="font-medium">Resource:</span> {event.resource}
                            {event.resourceId && <span> (ID: {event.resourceId})</span>}
                          </p>
                          <p>
                            <span className="font-medium">User:</span>{' '}
                            {event.userEmail || event.userId || 'System'}
                          </p>
                          <p>
                            <span className="font-medium">Time:</span> {formatTimestamp(event.timestamp)}
                          </p>
                          {event.errorMessage && (
                            <p className="text-red-600">
                              <span className="font-medium">Error:</span> {event.errorMessage}
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedEvent(event)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <p className="text-sm text-gray-600">Daily activity over the last 7 days</p>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No timeline data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {timeline.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-600 mt-1">
                          <span>Events: {day.events}</span>
                          <span className="text-red-600">Failures: {day.failures}</span>
                          <span className="text-orange-600">Critical: {day.critical}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Progress value={(day.events / Math.max(...timeline.map(d => d.events))) * 100} className="w-20 h-2" />
                          <span className="text-sm text-gray-500">{day.events}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis */}
        <TabsContent value="analysis">
          {summary && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {summary.topActions.map((action, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{action.action}</span>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(action.count / summary.topActions[0].count) * 100} 
                            className="w-20 h-2" 
                          />
                          <span className="text-sm text-gray-500">{action.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Users */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {summary.topUsers.map((user, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">
                            {user.userEmail || user.userId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(user.count / summary.topUsers[0].count) * 100} 
                            className="w-20 h-2" 
                          />
                          <span className="text-sm text-gray-500">{user.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Event Details</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Action:</span>
                    <p className="mt-1">{selectedEvent.action}</p>
                  </div>
                  <div>
                    <span className="font-medium">Resource:</span>
                    <p className="mt-1">{selectedEvent.resource}</p>
                  </div>
                  <div>
                    <span className="font-medium">Timestamp:</span>
                    <p className="mt-1">{formatTimestamp(selectedEvent.timestamp)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Severity:</span>
                    <Badge className={getSeverityColor(selectedEvent.severity)} size="sm">
                      {selectedEvent.severity}
                    </Badge>
                  </div>
                </div>

                {selectedEvent.metadata && (
                  <div>
                    <span className="font-medium text-sm">Metadata:</span>
                    <pre className="mt-1 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                      {JSON.stringify(selectedEvent.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}