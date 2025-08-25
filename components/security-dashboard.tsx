'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Shield,
  Smartphone,
  Monitor,
  Key,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
  Download,
  Copy,
  QrCode
} from 'lucide-react'

interface TwoFactorStatus {
  enabled: boolean
  backupCodesCount: number
  lastUsed?: string
}

interface Session {
  id: string
  ipAddress: string
  userAgent: string
  isActive: boolean
  isTwoFactorVerified: boolean
  lastActivity: string
  expiresAt: string
  createdAt: string
  location?: string
  deviceInfo?: {
    browser: string
    os: string
    device: string
  }
}

interface SecuritySetup {
  qrCodeUrl: string
  backupCodes: string[]
}

export function SecurityDashboard() {
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [setupData, setSetupData] = useState<SecuritySetup | null>(null)
  const [verificationToken, setVerificationToken] = useState('')
  const [showBackupCodes, setShowBackupCodes] = useState(false)

  useEffect(() => {
    fetchSecurityData()
  }, [])

  const fetchSecurityData = async () => {
    try {
      const [twoFactorResponse, sessionsResponse] = await Promise.all([
        fetch('/api/admin/security/two-factor'),
        fetch('/api/admin/security/sessions')
      ])

      const twoFactorData = await twoFactorResponse.json()
      const sessionsData = await sessionsResponse.json()

      if (twoFactorData.success) setTwoFactorStatus(twoFactorData.data)
      if (sessionsData.success) setSessions(sessionsData.data.sessions || [])

    } catch (error) {
      console.error('Failed to fetch security data:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupTwoFactor = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/security/two-factor?action=setup')
      const data = await response.json()

      if (data.success) {
        setSetupData(data.data)
      } else {
        throw new Error(data.error?.message || 'Setup failed')
      }
    } catch (error) {
      alert(`Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const verifyAndEnableTwoFactor = async () => {
    if (!verificationToken.trim()) {
      alert('Please enter the verification token from your authenticator app')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/admin/security/two-factor?action=verify-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken })
      })

      const data = await response.json()

      if (data.success) {
        setSetupData(null)
        setVerificationToken('')
        await fetchSecurityData()
        alert('Two-factor authentication enabled successfully!')
      } else {
        throw new Error(data.error?.message || 'Verification failed')
      }
    } catch (error) {
      alert(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const disableTwoFactor = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/admin/security/two-factor', { method: 'DELETE' })
      const data = await response.json()

      if (data.success) {
        await fetchSecurityData()
        alert('Two-factor authentication disabled')
      } else {
        throw new Error(data.error?.message || 'Disable failed')
      }
    } catch (error) {
      alert(`Disable failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const regenerateBackupCodes = async () => {
    if (!confirm('Are you sure you want to regenerate backup codes? Your existing codes will no longer work.')) {
      return
    }

    try {
      const response = await fetch('/api/admin/security/two-factor?action=regenerate-backup-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const data = await response.json()

      if (data.success) {
        setSetupData({ qrCodeUrl: '', backupCodes: data.data.backupCodes })
        setShowBackupCodes(true)
        await fetchSecurityData()
      } else {
        throw new Error(data.error?.message || 'Regeneration failed')
      }
    } catch (error) {
      alert(`Regeneration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const invalidateSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to invalidate this session?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/security/sessions?sessionId=${sessionId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        await fetchSecurityData()
      } else {
        throw new Error(data.error?.message || 'Invalidation failed')
      }
    } catch (error) {
      alert(`Invalidation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const invalidateAllSessions = async () => {
    if (!confirm('Are you sure you want to invalidate all other sessions? You will remain logged in on this device.')) {
      return
    }

    try {
      const response = await fetch('/api/admin/security/sessions?action=invalidate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keepCurrent: true })
      })

      const data = await response.json()

      if (data.success) {
        await fetchSecurityData()
        alert(`${data.data.invalidatedCount} sessions invalidated`)
      } else {
        throw new Error(data.error?.message || 'Invalidation failed')
      }
    } catch (error) {
      alert(`Invalidation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const copyBackupCodes = () => {
    if (setupData?.backupCodes) {
      const codesText = setupData.backupCodes.join('\n')
      navigator.clipboard.writeText(codesText)
      alert('Backup codes copied to clipboard')
    }
  }

  const downloadBackupCodes = () => {
    if (setupData?.backupCodes) {
      const codesText = setupData.backupCodes.join('\n')
      const blob = new Blob([codesText], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'backup-codes.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />
      case 'tablet':
        return <Smartphone className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  if (loading && !twoFactorStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading security settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Security Settings</h1>
          <p className="text-gray-600">Manage your account security and active sessions</p>
        </div>
        <Button onClick={fetchSecurityData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Two-Factor Auth</p>
                <p className="text-2xl font-bold mt-2">
                  {twoFactorStatus?.enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              {twoFactorStatus?.enabled ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold mt-2">{sessions.length}</p>
              </div>
              <Monitor className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Backup Codes</p>
                <p className="text-2xl font-bold mt-2">
                  {twoFactorStatus?.backupCodesCount || 0}
                </p>
                <p className="text-xs text-gray-500">Available</p>
              </div>
              <Key className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="two-factor" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="two-factor" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Two-Factor Authentication
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Active Sessions
          </TabsTrigger>
        </TabsList>

        {/* Two-Factor Authentication */}
        <TabsContent value="two-factor">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <p className="text-sm text-gray-600">
                Add an extra layer of security to your account
              </p>
            </CardHeader>
            <CardContent>
              {!twoFactorStatus?.enabled && !setupData ? (
                // Two-Factor Disabled State
                <div className="text-center py-8">
                  <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Two-Factor Authentication is Disabled</h3>
                  <p className="text-gray-600 mb-6">
                    Enable two-factor authentication to add an extra layer of security to your account.
                  </p>
                  <Button onClick={setupTwoFactor} disabled={loading}>
                    <Shield className="h-4 w-4 mr-2" />
                    Enable Two-Factor Authentication
                  </Button>
                </div>
              ) : setupData ? (
                // Two-Factor Setup State
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Setup Two-Factor Authentication</h3>
                    <p className="text-gray-600 mb-4">
                      Scan the QR code with your authenticator app, then enter the verification code below.
                    </p>
                  </div>

                  {setupData.qrCodeUrl && (
                    <div className="text-center">
                      <div className="inline-block p-4 bg-white rounded-lg border">
                        <img src={setupData.qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                      </div>
                    </div>
                  )}

                  <div className="max-w-md mx-auto">
                    <label className="block text-sm font-medium mb-2">
                      Verification Code
                    </label>
                    <Input
                      type="text"
                      placeholder="000000"
                      value={verificationToken}
                      onChange={(e) => setVerificationToken(e.target.value)}
                      className="text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                  </div>

                  <div className="flex justify-center gap-2">
                    <Button 
                      onClick={verifyAndEnableTwoFactor} 
                      disabled={loading || !verificationToken.trim()}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify & Enable
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSetupData(null)}
                    >
                      Cancel
                    </Button>
                  </div>

                  {setupData.backupCodes.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Key className="h-5 w-5 text-yellow-600" />
                        <h4 className="font-semibold text-yellow-800">Backup Codes</h4>
                      </div>
                      <p className="text-sm text-yellow-700 mb-3">
                        Save these backup codes in a safe place. You can use them to access your account if you lose your device.
                      </p>
                      
                      <div className="bg-white border rounded p-3 font-mono text-sm">
                        {setupData.backupCodes.map((code, index) => (
                          <div key={index} className="mb-1">{code}</div>
                        ))}
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" onClick={copyBackupCodes}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button size="sm" variant="outline" onClick={downloadBackupCodes}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Two-Factor Enabled State
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-green-800">Two-Factor Authentication Enabled</h4>
                        <p className="text-sm text-green-700">
                          Your account is protected with two-factor authentication
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Backup Codes</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          You have {twoFactorStatus?.backupCodesCount || 0} backup codes remaining
                        </p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={regenerateBackupCodes}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate Codes
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Security Settings</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Manage your two-factor authentication settings
                        </p>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={disableTwoFactor}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Disable 2FA
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {showBackupCodes && setupData?.backupCodes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">New Backup Codes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 border rounded p-3 font-mono text-sm mb-4">
                          {setupData.backupCodes.map((code, index) => (
                            <div key={index} className="mb-1">{code}</div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={copyBackupCodes}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                          <Button size="sm" variant="outline" onClick={downloadBackupCodes}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => setShowBackupCodes(false)}
                          >
                            Done
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Sessions */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Active Sessions
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage your active login sessions across different devices
                  </p>
                </div>
                <Button 
                  onClick={invalidateAllSessions}
                  variant="outline"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Invalidate All Others
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <Monitor className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No active sessions found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        {getDeviceIcon(session.deviceInfo?.device || 'desktop')}
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {session.deviceInfo ? 
                                `${session.deviceInfo.browser} on ${session.deviceInfo.os}` : 
                                'Unknown Device'
                              }
                            </span>
                            {session.isTwoFactorVerified && (
                              <Badge variant="default" className="text-xs">
                                2FA Verified
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <span>IP: {session.ipAddress}</span>
                              {session.location && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{session.location}</span>
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Last activity: {formatDate(session.lastActivity)}</span>
                            </div>
                            <div>
                              <span>Expires: {formatDate(session.expiresAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => invalidateSession(session.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}