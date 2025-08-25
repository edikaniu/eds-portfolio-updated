'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Shield,
  Clock,
  HardDrive,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Database,
  Settings,
  Activity
} from 'lucide-react'

interface BackupManifest {
  id: string
  type: 'manual' | 'scheduled' | 'pre-update'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  createdAt: string
  size: number
  checksum: string
  metadata: {
    recordCount: number
    tables: string[]
    includeMedia: boolean
    includeSystemData: boolean
  }
}

interface BackupStatistics {
  totalBackups: number
  totalSize: number
  oldestBackup: string | null
  newestBackup: string | null
  successRate: number
}

interface RecoveryPoint {
  id: string
  timestamp: string
  type: 'full' | 'incremental'
  size: number
  description: string
  integrity: 'verified' | 'unverified' | 'corrupted'
}

export function BackupRecoveryDashboard() {
  const [backups, setBackups] = useState<BackupManifest[]>([])
  const [statistics, setStatistics] = useState<BackupStatistics | null>(null)
  const [recoveryPoints, setRecoveryPoints] = useState<RecoveryPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [restoring, setRestoring] = useState('')

  // Backup settings
  const [backupSettings, setBackupSettings] = useState({
    schedule: 'daily',
    retention: 30,
    includeMedia: true,
    includeSystemData: true,
    compression: true
  })

  useEffect(() => {
    fetchBackupData()
  }, [])

  const fetchBackupData = async () => {
    try {
      const [historyResponse, statsResponse, recoveryResponse] = await Promise.all([
        fetch('/api/admin/backup/system?action=history'),
        fetch('/api/admin/backup/system?action=statistics'),
        fetch('/api/admin/backup/system?action=recovery-points')
      ])

      const historyData = await historyResponse.json()
      const statsData = await statsResponse.json()
      const recoveryData = await recoveryResponse.json()

      if (historyData.success) setBackups(historyData.data)
      if (statsData.success) setStatistics(statsData.data)
      if (recoveryData.success) setRecoveryPoints(recoveryData.data)

    } catch (error) {
      console.error('Failed to fetch backup data:', error)
    } finally {
      setLoading(false)
    }
  }

  const createBackup = async () => {
    setCreating(true)
    try {
      const response = await fetch('/api/admin/backup/system?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'manual',
          ...backupSettings
        })
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchBackupData()
      } else {
        throw new Error(data.error?.message || 'Backup creation failed')
      }

    } catch (error) {
      alert(`Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setCreating(false)
    }
  }

  const restoreFromBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to restore from this backup? This will overwrite current data.')) {
      return
    }

    setRestoring(backupId)
    try {
      const response = await fetch('/api/admin/backup/system?action=restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backupId,
          createPreRestoreBackup: true,
          validateIntegrity: true
        })
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchBackupData()
        alert('Restore completed successfully')
      } else {
        throw new Error(data.error?.message || 'Restore failed')
      }

    } catch (error) {
      alert(`Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setRestoring('')
    }
  }

  const deleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/backup/system?backupId=${backupId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchBackupData()
      } else {
        throw new Error(data.error?.message || 'Delete failed')
      }

    } catch (error) {
      alert(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const updateBackupSchedule = async () => {
    try {
      const response = await fetch('/api/admin/backup/system?action=schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupSettings)
      })

      const data = await response.json()
      
      if (data.success) {
        alert('Backup schedule updated successfully')
      } else {
        throw new Error(data.error?.message || 'Schedule update failed')
      }

    } catch (error) {
      alert(`Schedule update failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getBackupTypeColor = (type: string) => {
    switch (type) {
      case 'manual':
        return 'bg-blue-100 text-blue-800'
      case 'scheduled':
        return 'bg-green-100 text-green-800'
      case 'pre-update':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getIntegrityColor = (integrity: string) => {
    switch (integrity) {
      case 'verified':
        return 'text-green-500'
      case 'corrupted':
        return 'text-red-500'
      default:
        return 'text-yellow-500'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading backup data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Backup & Recovery</h1>
          <p className="text-gray-600">Automated backups and disaster recovery</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchBackupData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={createBackup} disabled={creating}>
            {creating ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Create Backup
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Backups</p>
                  <p className="text-2xl font-bold mt-2">{statistics.totalBackups}</p>
                </div>
                <Database className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Size</p>
                  <p className="text-2xl font-bold mt-2">{formatSize(statistics.totalSize)}</p>
                </div>
                <HardDrive className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold mt-2">{statistics.successRate}%</p>
                </div>
                <Activity className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Backup</p>
                  <p className="text-sm font-bold mt-2">
                    {statistics.newestBackup 
                      ? new Date(statistics.newestBackup).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="backups" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="backups" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Backup History
          </TabsTrigger>
          <TabsTrigger value="recovery" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Recovery Points
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Backup History */}
        <TabsContent value="backups">
          <Card>
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
              <p className="text-sm text-gray-600">
                Recent backups with restore and management options
              </p>
            </CardHeader>
            <CardContent>
              {backups.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No backups found</p>
                  <p className="text-sm text-gray-400">Create your first backup to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {backups.map((backup) => (
                    <div
                      key={backup.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getBackupTypeColor(backup.type)}>
                            {backup.type}
                          </Badge>
                          <span className="font-medium">{formatDate(backup.createdAt)}</span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Size: {formatSize(backup.size)} • Records: {backup.metadata.recordCount}</p>
                          <p>Tables: {backup.metadata.tables.length} • Media: {backup.metadata.includeMedia ? 'Yes' : 'No'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => restoreFromBackup(backup.id)}
                          disabled={restoring === backup.id}
                          size="sm"
                          variant="outline"
                        >
                          {restoring === backup.id ? (
                            <>
                              <Clock className="h-4 w-4 mr-1 animate-spin" />
                              Restoring...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-1" />
                              Restore
                            </>
                          )}
                        </Button>
                        
                        <Button
                          onClick={() => deleteBackup(backup.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recovery Points */}
        <TabsContent value="recovery">
          <Card>
            <CardHeader>
              <CardTitle>Recovery Points</CardTitle>
              <p className="text-sm text-gray-600">
                Available recovery points with integrity status
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recoveryPoints.map((point) => (
                  <div
                    key={point.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${getIntegrityColor(point.integrity)}`}>
                        {point.integrity === 'verified' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : point.integrity === 'corrupted' ? (
                          <AlertTriangle className="h-5 w-5" />
                        ) : (
                          <Clock className="h-5 w-5" />
                        )}
                      </div>
                      
                      <div>
                        <p className="font-medium">{point.description}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(point.timestamp)} • {formatSize(point.size)}
                        </p>
                      </div>
                    </div>

                    <Badge 
                      variant={point.integrity === 'verified' ? 'default' : 'secondary'}
                      className={point.integrity === 'corrupted' ? 'bg-red-100 text-red-800' : ''}
                    >
                      {point.integrity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Backup Settings</CardTitle>
              <p className="text-sm text-gray-600">
                Configure automatic backups and retention policies
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Backup Schedule</label>
                    <select
                      value={backupSettings.schedule}
                      onChange={(e) => setBackupSettings(prev => ({ ...prev, schedule: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Retention (days)</label>
                    <input
                      type="number"
                      value={backupSettings.retention}
                      onChange={(e) => setBackupSettings(prev => ({ ...prev, retention: parseInt(e.target.value) }))}
                      className="w-full p-2 border rounded-md"
                      min="1"
                      max="365"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Backup Options</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={backupSettings.includeMedia}
                          onChange={(e) => setBackupSettings(prev => ({ ...prev, includeMedia: e.target.checked }))}
                        />
                        <span className="text-sm">Include media files</span>
                      </label>
                      
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={backupSettings.includeSystemData}
                          onChange={(e) => setBackupSettings(prev => ({ ...prev, includeSystemData: e.target.checked }))}
                        />
                        <span className="text-sm">Include system data</span>
                      </label>
                      
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={backupSettings.compression}
                          onChange={(e) => setBackupSettings(prev => ({ ...prev, compression: e.target.checked }))}
                        />
                        <span className="text-sm">Enable compression</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={updateBackupSchedule} className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Update Backup Schedule
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}