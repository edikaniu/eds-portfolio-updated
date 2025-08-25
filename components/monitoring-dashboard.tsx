'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  HardDrive,
  Memory,
  RefreshCw,
  Server,
  TrendingUp,
  XCircle
} from 'lucide-react'

interface HealthCheck {
  name: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  responseTime?: number
  error?: string
  metadata?: Record<string, any>
}

interface SystemMetrics {
  timestamp: string
  memory?: {
    heapUsed: number
    heapTotal: number
    external: number
    rss: number
  }
  uptime: number
  healthChecks: HealthCheck[]
}

interface Alert {
  type: string
  severity: 'warning' | 'critical'
  message: string
  value: any
  threshold: any
}

interface MonitoringData {
  status: 'healthy' | 'unhealthy' | 'degraded'
  metrics: SystemMetrics
  summary: {
    totalChecks: number
    healthyChecks: number
    unhealthyChecks: number
    degradedChecks: number
  }
}

export function MonitoringDashboard() {
  const [data, setData] = useState<MonitoringData | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchMonitoringData()
    
    if (autoRefresh) {
      const interval = setInterval(fetchMonitoringData, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchMonitoringData = async () => {
    try {
      const [healthResponse, alertsResponse] = await Promise.all([
        fetch('/api/admin/monitoring?type=health'),
        fetch('/api/admin/monitoring?type=alerts')
      ])

      const healthData = await healthResponse.json()
      const alertsData = await alertsResponse.json()

      if (healthData.success) {
        setData(healthData.data)
      }

      if (alertsData.success) {
        setAlerts(alertsData.data)
      }

      setError('')
    } catch (err) {
      setError('Failed to fetch monitoring data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'unhealthy':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const formatBytes = (bytes: number) => {
    return `${Math.round(bytes / 1024 / 1024)}MB`
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60))
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((seconds % (60 * 60)) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading monitoring data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-gray-600">Real-time system health and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
          >
            <Activity className="h-4 w-4 mr-2" />
            Auto Refresh
          </Button>
          <Button onClick={fetchMonitoringData} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status Overview */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusIcon(data.status)}
                    <span className="font-semibold capitalize">{data.status}</span>
                  </div>
                </div>
                <Server className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold mt-2">{formatUptime(data.metrics.uptime)}</p>
                </div>
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Health Checks</p>
                  <p className="text-2xl font-bold mt-2">
                    {data.summary.healthyChecks}/{data.summary.totalChecks}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                  <p className="text-2xl font-bold mt-2">{alerts.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    alert.severity === 'critical' 
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm opacity-75">
                        Type: {alert.type} | Value: {alert.value} | Threshold: {alert.threshold}
                      </p>
                    </div>
                    <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {alert.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Checks Details */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle>Health Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.metrics.healthChecks.map((check, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {check.name === 'database' && <Database className="h-5 w-5" />}
                      {check.name === 'memory' && <Memory className="h-5 w-5" />}
                      {check.name === 'disk' && <HardDrive className="h-5 w-5" />}
                      {!['database', 'memory', 'disk'].includes(check.name) && <Activity className="h-5 w-5" />}
                      <div>
                        <h3 className="font-semibold capitalize">{check.name}</h3>
                        {check.responseTime && (
                          <p className="text-sm opacity-75">Response time: {check.responseTime}ms</p>
                        )}
                        {check.error && (
                          <p className="text-sm opacity-75">Error: {check.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={check.status === 'healthy' ? 'default' : check.status === 'degraded' ? 'secondary' : 'destructive'}
                      >
                        {check.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {check.metadata && (
                    <div className="mt-3 text-sm">
                      {check.name === 'memory' && check.metadata.heapUsed && (
                        <div>
                          <p>Memory Usage: {formatBytes(check.metadata.heapUsed)} / {formatBytes(check.metadata.heapTotal)}</p>
                          <Progress 
                            value={(check.metadata.heapUsed / check.metadata.heapTotal) * 100} 
                            className="mt-2"
                          />
                        </div>
                      )}
                      {check.name !== 'memory' && (
                        <pre className="text-xs bg-black/10 p-2 rounded">
                          {JSON.stringify(check.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}