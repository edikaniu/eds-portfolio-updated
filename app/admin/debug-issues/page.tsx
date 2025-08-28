"use client"

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WysiwygEditor } from '@/components/ui/wysiwyg-editor'
import { 
  Bug,
  Database,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'

interface CaseStudy {
  id: string
  title: string
  slug: string
  category: string
  isActive: boolean
  createdAt: string
}

export default function DebugIssuesPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [caseStudiesData, setCaseStudiesData] = useState<{
    success: boolean
    data?: CaseStudy[]
    error?: string
  } | null>(null)
  
  const [editorContent, setEditorContent] = useState('<p>Test content with <strong>bold text</strong> and <em>italic text</em>.</p>')
  const [renderedOutput, setRenderedOutput] = useState('')

  // Test case studies API
  const testCaseStudiesAPI = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/case-studies?includeInactive=true')
      const data = await response.json()
      
      setCaseStudiesData({
        success: data.success,
        data: data.data,
        error: data.success ? undefined : data.message
      })
    } catch (error) {
      setCaseStudiesData({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Test rich text editor output
  const testRichTextOutput = () => {
    setRenderedOutput(editorContent)
  }

  useEffect(() => {
    testCaseStudiesAPI()
  }, [])

  return (
    <AdminLayout title="Debug Issues">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Bug className="h-8 w-8 text-red-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Debug Issues</h1>
            <p className="text-gray-600">Investigate case studies and rich text editor issues</p>
          </div>
        </div>

        {/* Case Studies API Test */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold">Case Studies API Test</h2>
                <p className="text-sm text-gray-600">Testing /api/admin/case-studies endpoint</p>
              </div>
            </div>
            <Button onClick={testCaseStudiesAPI} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Test API
            </Button>
          </div>

          {caseStudiesData && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {caseStudiesData.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  Status: {caseStudiesData.success ? 'SUCCESS' : 'FAILED'}
                </span>
              </div>

              {caseStudiesData.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Error:</span>
                  </div>
                  <p className="text-red-700 mt-1">{caseStudiesData.error}</p>
                </div>
              )}

              {caseStudiesData.data && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Data Retrieved Successfully</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total case studies:</span> {caseStudiesData.data.length}
                    </div>
                    <div>
                      <span className="font-medium">Active case studies:</span>{' '}
                      {caseStudiesData.data.filter(cs => cs.isActive).length}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-green-800 mb-2">Case Studies Found:</h4>
                    <div className="space-y-2">
                      {caseStudiesData.data.slice(0, 5).map(cs => (
                        <div key={cs.id} className="flex items-center gap-2 text-xs">
                          <Badge variant={cs.isActive ? "default" : "secondary"}>
                            {cs.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <span className="font-medium">{cs.title}</span>
                          <span className="text-gray-500">({cs.category})</span>
                        </div>
                      ))}
                      {caseStudiesData.data.length > 5 && (
                        <div className="text-xs text-gray-500">
                          ...and {caseStudiesData.data.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Rich Text Editor Test */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-6 w-6 text-purple-600" />
            <div>
              <h2 className="text-lg font-semibold">Rich Text Editor Test</h2>
              <p className="text-sm text-gray-600">Testing WYSIWYG editor HTML output</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Editor Content:
              </label>
              <WysiwygEditor
                value={editorContent}
                onChange={setEditorContent}
                height={200}
                placeholder="Edit content to test rendering..."
              />
            </div>

            {/* Test Button */}
            <Button onClick={testRichTextOutput} className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Test HTML Rendering
            </Button>

            {/* Raw HTML Output */}
            {editorContent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raw HTML Output:
                </label>
                <div className="bg-gray-50 border rounded-lg p-4 font-mono text-sm">
                  <pre className="whitespace-pre-wrap">{editorContent}</pre>
                </div>
              </div>
            )}

            {/* Rendered Output */}
            {renderedOutput && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rendered Output (how it appears on frontend):
                </label>
                <div className="bg-white border rounded-lg p-4">
                  <div 
                    dangerouslySetInnerHTML={{ __html: renderedOutput }}
                    className="prose prose-sm max-w-none"
                  />
                </div>
              </div>
            )}

            {/* Analysis */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Analysis</span>
              </div>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>• If you see HTML tags like &lt;p&gt; in the rendered output, there's an encoding issue</p>
                <p>• The editor should produce clean HTML that renders properly with dangerouslySetInnerHTML</p>
                <p>• Check if content is being double-encoded when saved to database</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 text-blue-800 mb-3">
            <CheckCircle className="h-5 w-5" />
            <h3 className="font-semibold">Debugging Instructions</h3>
          </div>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>Case Studies Issue:</strong> If the API test shows 0 case studies or fails, check:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Database connection and migration status</li>
              <li>Admin portal authentication working correctly</li>
              <li>API endpoint returning proper data format</li>
            </ul>
            
            <p className="pt-2"><strong>Rich Text Editor Issue:</strong> If HTML tags appear in rendered output:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Content is being HTML-encoded when saved</li>
              <li>Check blog/case study save API endpoints</li>
              <li>Verify TinyMCE configuration is correct</li>
            </ul>
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}