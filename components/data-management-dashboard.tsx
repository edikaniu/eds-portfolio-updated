'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Download,
  Upload,
  Database,
  FileJson,
  Archive,
  Table,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive,
  Shield,
  Zap
} from 'lucide-react'

interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: Array<{
    table: string
    record: any
    error: string
  }>
  message: string
}

export function DataManagementDashboard() {
  const [exportLoading, setExportLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  
  // Export options
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'zip'>('json')
  const [includeMedia, setIncludeMedia] = useState(false)
  const [includeSystemData, setIncludeSystemData] = useState(false)
  const [compression, setCompression] = useState(true)
  const [selectedTables, setSelectedTables] = useState<string[]>([])

  // Import options
  const [overwrite, setOverwrite] = useState(false)
  const [validateData, setValidateData] = useState(true)
  const [createBackup, setCreateBackup] = useState(true)
  const [skipErrors, setSkipErrors] = useState(false)

  const availableTables = [
    'AdminUser', 'ContentSection', 'BlogPost', 'Project', 'CaseStudy',
    'ExperienceEntry', 'SkillCategory', 'Tool', 'MediaFile', 'NavigationItem',
    'SocialLink', 'FooterSection', 'ContactInfo', 'SiteSettings'
  ]

  const handleExport = async () => {
    setExportLoading(true)
    try {
      const params = new URLSearchParams({
        format: exportFormat,
        includeMedia: includeMedia.toString(),
        includeSystemData: includeSystemData.toString(),
        compression: compression.toString()
      })

      if (selectedTables.length > 0) {
        params.set('tables', selectedTables.join(','))
      }

      const response = await fetch(`/api/admin/data/export?${params}`, {
        method: 'GET'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Export failed')
      }

      // Get filename from headers
      const contentDisposition = response.headers.get('content-disposition')
      const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || 
        `export-${new Date().toISOString().split('T')[0]}.${exportFormat}`

      // Download file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setExportLoading(false)
    }
  }

  const handleImport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setImportLoading(true)
    setImportProgress(0)
    setImportResult(null)

    const formData = new FormData(event.currentTarget)
    formData.append('overwrite', overwrite.toString())
    formData.append('validateData', validateData.toString())
    formData.append('createBackup', createBackup.toString())
    formData.append('skipErrors', skipErrors.toString())

    // Simulate progress
    const progressInterval = setInterval(() => {
      setImportProgress(prev => Math.min(prev + Math.random() * 20, 90))
    }, 500)

    try {
      const response = await fetch('/api/admin/data/import', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      setImportProgress(100)

      if (result.success) {
        setImportResult(result.data)
      } else {
        throw new Error(result.error?.message || 'Import failed')
      }

    } catch (error) {
      setImportResult({
        success: false,
        imported: 0,
        skipped: 0,
        errors: [{ table: 'system', record: '', error: error instanceof Error ? error.message : 'Unknown error' }],
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      clearInterval(progressInterval)
      setImportLoading(false)
      setTimeout(() => setImportProgress(0), 3000)
    }
  }

  const toggleTable = (table: string) => {
    setSelectedTables(prev =>
      prev.includes(table)
        ? prev.filter(t => t !== table)
        : [...prev, table]
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Data Management</h1>
          <p className="text-gray-600">Export and import your portfolio data</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Database className="h-4 w-4" />
            Full System Backup
          </Badge>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Export Formats</p>
                <p className="text-2xl font-bold mt-2">3</p>
                <p className="text-xs text-gray-500">JSON, CSV, ZIP</p>
              </div>
              <Download className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Tables</p>
                <p className="text-2xl font-bold mt-2">{availableTables.length}</p>
                <p className="text-xs text-gray-500">Available for export</p>
              </div>
              <Table className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security</p>
                <p className="text-2xl font-bold mt-2">100%</p>
                <p className="text-xs text-gray-500">Admin protected</p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="export" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import Data
          </TabsTrigger>
        </TabsList>

        {/* Export Tab */}
        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Portfolio Data
              </CardTitle>
              <p className="text-sm text-gray-600">
                Download your complete portfolio data in various formats
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Export Format */}
              <div className="space-y-2">
                <Label>Export Format</Label>
                <div className="flex gap-2">
                  {(['json', 'csv', 'zip'] as const).map((format) => (
                    <Button
                      key={format}
                      variant={exportFormat === format ? 'default' : 'outline'}
                      onClick={() => setExportFormat(format)}
                      className="flex items-center gap-2"
                    >
                      {format === 'json' && <FileJson className="h-4 w-4" />}
                      {format === 'csv' && <Table className="h-4 w-4" />}
                      {format === 'zip' && <Archive className="h-4 w-4" />}
                      {format.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Export Options */}
              <div className="space-y-3">
                <Label>Export Options</Label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={includeMedia}
                      onChange={(e) => setIncludeMedia(e.target.checked)}
                    />
                    <span className="text-sm">Include media files metadata</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={includeSystemData}
                      onChange={(e) => setIncludeSystemData(e.target.checked)}
                    />
                    <span className="text-sm">Include system data (chatbot, settings)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={compression}
                      onChange={(e) => setCompression(e.target.checked)}
                    />
                    <span className="text-sm">Enable compression</span>
                  </label>
                </div>
              </div>

              {/* Table Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Tables to Export</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTables(selectedTables.length === availableTables.length ? [] : availableTables)}
                  >
                    {selectedTables.length === availableTables.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableTables.map((table) => (
                    <Button
                      key={table}
                      variant={selectedTables.includes(table) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleTable(table)}
                      className="justify-start h-auto p-2"
                    >
                      <span className="text-xs">{table}</span>
                    </Button>
                  ))}
                </div>
                {selectedTables.length === 0 && (
                  <p className="text-sm text-gray-500">All tables will be exported</p>
                )}
              </div>

              <Button
                onClick={handleExport}
                disabled={exportLoading}
                className="w-full"
              >
                {exportLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Portfolio Data
              </CardTitle>
              <p className="text-sm text-gray-600">
                Upload and restore your portfolio data from a backup file
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleImport} className="space-y-6">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="file">Select Import File</Label>
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    accept=".json,.zip"
                    required
                    disabled={importLoading}
                  />
                  <p className="text-xs text-gray-500">
                    Supported formats: JSON, ZIP (max 100MB)
                  </p>
                </div>

                {/* Import Options */}
                <div className="space-y-3">
                  <Label>Import Options</Label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={overwrite}
                        onChange={(e) => setOverwrite(e.target.checked)}
                      />
                      <span className="text-sm">Overwrite existing records</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={validateData}
                        onChange={(e) => setValidateData(e.target.checked)}
                      />
                      <span className="text-sm">Validate data before import</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={createBackup}
                        onChange={(e) => setCreateBackup(e.target.checked)}
                      />
                      <span className="text-sm">Create backup before import</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={skipErrors}
                        onChange={(e) => setSkipErrors(e.target.checked)}
                      />
                      <span className="text-sm">Skip errors and continue</span>
                    </label>
                  </div>
                </div>

                {/* Progress Bar */}
                {importLoading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Importing data...</span>
                      <span>{Math.round(importProgress)}%</span>
                    </div>
                    <Progress value={importProgress} className="w-full" />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={importLoading}
                  className="w-full"
                >
                  {importLoading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Data
                    </>
                  )}
                </Button>
              </form>

              {/* Import Results */}
              {importResult && (
                <div className="mt-6 p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    {importResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    <h3 className="font-semibold">
                      {importResult.success ? 'Import Completed' : 'Import Failed'}
                    </h3>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p><strong>Imported:</strong> {importResult.imported} records</p>
                    <p><strong>Skipped:</strong> {importResult.skipped} records</p>
                    <p><strong>Errors:</strong> {importResult.errors.length}</p>
                    <p className="text-gray-600">{importResult.message}</p>
                  </div>

                  {importResult.errors.length > 0 && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium">
                        View Errors ({importResult.errors.length})
                      </summary>
                      <div className="mt-2 space-y-1 text-xs bg-gray-50 p-2 rounded max-h-40 overflow-y-auto">
                        {importResult.errors.map((error, index) => (
                          <div key={index} className="text-red-600">
                            <strong>{error.table}:</strong> {error.error}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}