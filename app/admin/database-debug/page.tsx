"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Server,
  Settings,
  Info
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/admin-layout'

interface DatabaseDiagnostics {
  timestamp: string
  environment: string
  databaseUrl: {
    exists: boolean
    protocol: string
    length: number
    host: string
  }
  neonVars: {
    pgUrl: boolean
    pgPrismaUrl: boolean
    pgNonPooling: boolean
  }
  connectionTest: {
    status: string
    message: string
    guidance?: string
  }
  tableCheck: {
    status: string
    count?: number
    tables?: any[]
    message?: string
  }
  schemaInfo: {
    status: string
    info?: any[]
    message?: string
  }
}

export default function DatabaseDebugPage() {
  const [diagnostics, setDiagnostics] = useState<DatabaseDiagnostics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const runDiagnostics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/debug-database', {
        method: 'GET',
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success) {
        setDiagnostics(data.data)
        setLastUpdated(new Date().toLocaleString())
      } else {
        console.error('Diagnostics failed:', data.message)
      }
    } catch (error) {
      console.error('Error running diagnostics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-yellow-50 border-yellow-200'
    }
  }

  return (
    <AdminLayout title="Database Diagnostics">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 shadow-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-900">Database Diagnostics</h1>
                <p className="text-blue-700">Debug Neon PostgreSQL connection and schema</p>
              </div>
            </div>
            <Button 
              onClick={runDiagnostics} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
          {lastUpdated && (
            <p className="text-sm text-blue-600 mt-2">Last updated: {lastUpdated}</p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Running database diagnostics...</p>
          </Card>
        )}

        {/* Diagnostics Results */}
        {diagnostics && !isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Environment & Config */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold">Environment Configuration</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Environment:</span>
                  <Badge variant="outline">{diagnostics.environment}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">DATABASE_URL:</span>
                  <Badge variant={diagnostics.databaseUrl.exists ? "default" : "destructive"}>
                    {diagnostics.databaseUrl.exists ? 'Set' : 'Missing'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Protocol:</span>
                  <Badge variant={diagnostics.databaseUrl.protocol === 'postgresql' ? "default" : "destructive"}>
                    {diagnostics.databaseUrl.protocol}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Host:</span>
                  <span className="text-sm font-mono">{diagnostics.databaseUrl.host}</span>
                </div>
              </div>
            </Card>

            {/* Neon Variables */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Server className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold">Neon Environment Variables</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">POSTGRES_URL:</span>
                  <Badge variant={diagnostics.neonVars.pgUrl ? "default" : "secondary"}>
                    {diagnostics.neonVars.pgUrl ? 'Set' : 'Missing'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">POSTGRES_PRISMA_URL:</span>
                  <Badge variant={diagnostics.neonVars.pgPrismaUrl ? "default" : "secondary"}>
                    {diagnostics.neonVars.pgPrismaUrl ? 'Set' : 'Missing'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">POSTGRES_URL_NON_POOLING:</span>
                  <Badge variant={diagnostics.neonVars.pgNonPooling ? "default" : "secondary"}>
                    {diagnostics.neonVars.pgNonPooling ? 'Set' : 'Missing'}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Connection Test */}
            <Card className={`p-6 ${getStatusColor(diagnostics.connectionTest?.status || 'unknown')}`}>
              <div className="flex items-center gap-3 mb-4">
                {getStatusIcon(diagnostics.connectionTest?.status || 'unknown')}
                <h3 className="text-lg font-semibold">Database Connection</h3>
              </div>
              <p className="text-sm mb-2">{diagnostics.connectionTest?.message}</p>
              {diagnostics.connectionTest?.guidance && (
                <div className="bg-white bg-opacity-50 rounded-lg p-3 mt-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{diagnostics.connectionTest.guidance}</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Table Check */}
            <Card className={`p-6 ${getStatusColor(diagnostics.tableCheck?.status || 'unknown')}`}>
              <div className="flex items-center gap-3 mb-4">
                {getStatusIcon(diagnostics.tableCheck?.status || 'unknown')}
                <h3 className="text-lg font-semibold">Database Tables</h3>
              </div>
              {diagnostics.tableCheck?.status === 'success' ? (
                <div>
                  <p className="text-sm mb-2">Found {diagnostics.tableCheck.count} tables</p>
                  {diagnostics.tableCheck.tables && diagnostics.tableCheck.tables.length > 0 ? (
                    <div className="max-h-32 overflow-y-auto">
                      <div className="text-xs space-y-1">
                        {diagnostics.tableCheck.tables.map((table: any, index: number) => (
                          <div key={index} className="font-mono text-gray-600">
                            {table.table_name}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">No tables found - need to run Prisma schema migration</p>
                  )}
                </div>
              ) : (
                <p className="text-sm">{diagnostics.tableCheck?.message}</p>
              )}
            </Card>
          </div>
        )}

        {/* Action Cards */}
        {diagnostics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Next Steps</h4>
              <div className="text-sm space-y-2">
                {diagnostics.connectionTest?.status === 'success' ? (
                  diagnostics.tableCheck?.count === 0 ? (
                    <p className="text-amber-700">✅ Database connected, but tables are missing. Run the data migration to create tables and populate data.</p>
                  ) : (
                    <p className="text-green-700">✅ Database is ready! You can run the data migration to populate content.</p>
                  )
                ) : (
                  <p className="text-red-700">❌ Database connection failed. Check environment variables and Neon database status.</p>
                )}
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => window.open('/admin/data-migration', '_blank')}
                  className="w-full justify-start"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Go to Data Migration
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}