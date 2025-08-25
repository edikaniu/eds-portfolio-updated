"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  History,
  GitBranch,
  Download,
  Upload,
  RotateCcw,
  GitBranch as Compare,
  Calendar,
  User,
  FileText,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive
} from 'lucide-react'

interface ContentVersion {
  id: string
  contentType: 'blog' | 'project' | 'case_study'
  contentId: string
  version: number
  title: string
  content: string
  metadata: Record<string, any>
  changes: Array<{
    field: string
    oldValue: any
    newValue: any
    changeType: 'added' | 'modified' | 'removed'
  }>
  createdBy: string
  createdAt: string
  checksum: string
  size: number
  compressed: boolean
}

interface BackupManifest {
  id: string
  timestamp: string
  contentTypes: Array<{
    type: string
    count: number
    size: number
  }>
  totalSize: number
  checksum: string
  compressed: boolean
  metadata: Record<string, any>
}

export function ContentVersioningDashboard() {
  const [versions, setVersions] = useState<ContentVersion[]>([])
  const [backups, setBackups] = useState<BackupManifest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContentType, setSelectedContentType] = useState<string>('')
  const [selectedContentId, setSelectedContentId] = useState<string>('')
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [showBackupDialog, setShowBackupDialog] = useState(false)
  const [restoreTarget, setRestoreTarget] = useState<{ version?: number; backupId?: string }>({})

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedContentType && selectedContentId) {
      fetchVersionHistory()
    }
  }, [selectedContentType, selectedContentId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [backupsResponse] = await Promise.all([
        fetch('/api/admin/backup?limit=10')
      ])

      if (backupsResponse.ok) {
        const backupsData = await backupsResponse.json()
        setBackups(backupsData.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch versioning data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVersionHistory = async () => {
    if (!selectedContentType || !selectedContentId) return

    try {
      const response = await fetch(
        `/api/admin/content/versions?contentType=${selectedContentType}&contentId=${selectedContentId}&limit=20`
      )
      
      if (response.ok) {
        const data = await response.json()
        setVersions(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch version history:', error)
    }
  }

  const createBackup = async () => {
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current-user' }) // Replace with actual user ID
      })

      if (response.ok) {
        await fetchData()
        setShowBackupDialog(false)
      }
    } catch (error) {
      console.error('Failed to create backup:', error)
    }
  }

  const restoreVersion = async () => {
    if (!selectedContentType || !selectedContentId || !restoreTarget.version) return

    try {
      const response = await fetch('/api/admin/content/versions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: selectedContentType,
          contentId: selectedContentId,
          version: restoreTarget.version,
          userId: 'current-user' // Replace with actual user ID
        })
      })

      if (response.ok) {
        await fetchVersionHistory()
        setShowRestoreDialog(false)
        setRestoreTarget({})
      }
    } catch (error) {
      console.error('Failed to restore version:', error)
    }
  }

  const restoreFromBackup = async () => {
    if (!restoreTarget.backupId) return

    try {
      const response = await fetch('/api/admin/backup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backupId: restoreTarget.backupId,
          userId: 'current-user' // Replace with actual user ID
        })
      })

      if (response.ok) {
        await fetchData()
        setShowRestoreDialog(false)
        setRestoreTarget({})
      }
    } catch (error) {
      console.error('Failed to restore from backup:', error)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'added': return <span className="text-green-600">+</span>
      case 'removed': return <span className="text-red-600">-</span>
      case 'modified': return <span className="text-yellow-600">~</span>
      default: return <span>?</span>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Content Versioning</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
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
          <h2 className="text-2xl font-bold">Content Versioning & Backup</h2>
          <p className="text-muted-foreground text-sm">
            Manage content versions, backups, and restore points
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Database className="h-4 w-4" />
                Create Backup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Full Backup</DialogTitle>
                <DialogDescription>
                  This will create a complete backup of all content including blog posts, projects, and case studies.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBackupDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createBackup}>
                  Create Backup
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backups.length}</div>
            <p className="text-xs text-muted-foreground">
              {backups.length > 0 && `Latest: ${new Date(backups[0]?.timestamp).toLocaleDateString()}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(backups.reduce((sum, b) => sum + b.totalSize, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all backups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Versions</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{versions.length}</div>
            <p className="text-xs text-muted-foreground">
              {selectedContentType && selectedContentId ? 'For selected content' : 'Select content to view'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto Backup</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">
              Daily automatic backups
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Version History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History
            </CardTitle>
            <div className="flex gap-2">
              <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Content Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog">Blog Posts</SelectItem>
                  <SelectItem value="project">Projects</SelectItem>
                  <SelectItem value="case_study">Case Studies</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedContentId} onValueChange={setSelectedContentId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select Content" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Sample Content 1</SelectItem>
                  <SelectItem value="2">Sample Content 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {versions.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {versions.map((version) => (
                  <div key={version.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">v{version.version}</Badge>
                        <span className="text-sm font-medium truncate">{version.title}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {version.createdBy}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(version.createdAt).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {formatBytes(version.size)}
                        </div>
                      </div>
                      {version.changes.length > 0 && (
                        <div className="mt-2 text-xs">
                          <span className="font-medium">Changes: </span>
                          {version.changes.slice(0, 3).map((change, i) => (
                            <span key={i} className="inline-flex items-center gap-1 mr-2">
                              {getChangeTypeIcon(change.changeType)}
                              {change.field}
                            </span>
                          ))}
                          {version.changes.length > 3 && (
                            <span className="text-muted-foreground">
                              +{version.changes.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRestoreTarget({ version: version.version })
                          setShowRestoreDialog(true)
                        }}
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Compare className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {selectedContentType && selectedContentId 
                    ? 'No versions found for selected content'
                    : 'Select content to view version history'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Backup History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backup History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {backups.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {backups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                        <span className="text-sm font-medium">
                          {new Date(backup.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                        {backup.contentTypes.map((ct) => (
                          <div key={ct.type} className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {ct.count} {ct.type}
                          </div>
                        ))}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Size: {formatBytes(backup.totalSize)} 
                        {backup.compressed && <span className="ml-2">• Compressed</span>}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRestoreTarget({ backupId: backup.id })
                        setShowRestoreDialog(true)
                      }}
                    >
                      <Upload className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No backups found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Restore Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Confirm Restore
            </DialogTitle>
            <DialogDescription>
              {restoreTarget.version 
                ? `Are you sure you want to restore to version ${restoreTarget.version}? This will create a new version with the restored content.`
                : 'Are you sure you want to restore from this backup? This will replace all current content.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              A backup of current content will be created before restoration.
            </AlertDescription>
          </Alert>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={restoreTarget.version ? restoreVersion : restoreFromBackup}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}